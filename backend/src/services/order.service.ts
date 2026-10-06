import prisma from '../config/prisma';
import { Prisma } from '../generated/prisma';
import { AppError } from '../utils/app.error';
import { generateOrderNumber } from '../utils/generate-order.helper';
import { uploadToCloudinary } from '../utils/cloudinary.helper';
import { sendMail } from '../utils/mailer.helper';
import { buildConfirmationEmail } from '../utils/order-email.helper';
import { validateRoomAvailability, calculateTotalPrice } from '../helpers/order-validation.helper';

const PAYMENT_WINDOW_MS = 60 * 60 * 1000;
const DETAIL_INCLUDE = { property: true, room: true, user: { select: { id: true, name: true, email: true } } };

export class OrderService {
  async createOrder(userId: number, data: any) {
    await this.verifyUserVerified(userId);
    const { inDate, outDate } = this.parseBookingDates(data.checkInDate, data.checkOutDate);
    const room = await validateRoomAvailability(data.roomId, inDate, outDate, data.guestCount);
    const { totalPrice, totalNights } = calculateTotalPrice(room, inDate, outDate);
    return this.insertOrder(userId, { ...data, propertyId: room.propertyId }, inDate, outDate, totalPrice, totalNights);
  }

  private parseBookingDates(checkIn: string, checkOut: string) {
    const inDate = new Date(checkIn), outDate = new Date(checkOut);
    if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) throw new AppError('Invalid date format', 400);
    if (inDate >= outDate) throw new AppError('Check-out must be after check-in', 400);
    if (inDate.toISOString().slice(0, 10) < new Date().toISOString().slice(0, 10)) {
      throw new AppError('Check-in date cannot be in the past', 400);
    }
    return { inDate, outDate };
  }

  private insertOrder(userId: number, d: any, inDate: Date, outDate: Date, total: number, nights: number) {
    return prisma.order.create({
      data: {
        userId, propertyId: d.propertyId, roomId: d.roomId, checkInDate: inDate, checkOutDate: outDate,
        guestCount: d.guestCount, paymentMethod: d.paymentMethod || 'MANUAL_TRANSFER', totalAmount: total,
        totalNights: nights, orderNumber: generateOrderNumber(), expiresAt: new Date(Date.now() + PAYMENT_WINDOW_MS),
      },
    });
  }

  private async verifyUserVerified(userId: number): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isVerified) throw new AppError('Unverified users cannot create orders', 403);
  }

  async getUserOrders(userId: number, query: any) {
    return this.findPaginatedOrders({ userId, ...this.buildOrderFilters(query) }, query);
  }

  async getTenantOrders(tenantId: number, query: any) {
    return this.findPaginatedOrders({ property: { tenantId }, ...this.buildOrderFilters(query) }, query);
  }

  private async findPaginatedOrders(where: any, query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const dir: Prisma.SortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
    const orderBy: Prisma.OrderOrderByWithRelationInput = ['checkInDate', 'totalAmount'].includes(query.sortBy)
      ? { [query.sortBy]: dir } : { createdAt: dir };
    const [orders, total] = await Promise.all([
      prisma.order.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit, include: DETAIL_INCLUDE }),
      prisma.order.count({ where }),
    ]);
    return { orders, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  private buildOrderFilters(query: any) {
    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.search) where.orderNumber = { contains: query.search, mode: 'insensitive' };
    if (query.startDate && query.endDate) {
      where.checkInDate = { gte: new Date(query.startDate), lte: new Date(query.endDate) };
    }
    return where;
  }

  async getOrderById(id: number, userId: number) {
    const order = await prisma.order.findFirst({ where: { id, userId }, include: DETAIL_INCLUDE });
    if (!order) throw new AppError('Order not found', 404);
    return order;
  }

  async uploadPaymentProof(orderId: number, userId: number, filePath: string) {
    const order = await this.getOrderById(orderId, userId);
    if (order.status !== 'WAITING_PAYMENT') throw new AppError('Order not waiting for payment', 400);
    if (new Date() > order.expiresAt) throw new AppError('Payment period has expired', 400);

    const imageUrl = await uploadToCloudinary(filePath, 'payment-proofs');
    return prisma.order.update({
      where: { id: orderId },
      data: { paymentProofUrl: imageUrl, paymentProofUploadedAt: new Date(), status: 'WAITING_CONFIRMATION', paymentMethod: 'MANUAL_TRANSFER' },
    });
  }

  async processPaymentGateway(orderId: number, userId: number) {
    const order = await this.getOrderById(orderId, userId);
    if (order.status !== 'WAITING_PAYMENT') throw new AppError('Order cannot be processed', 400);
    if (new Date() > order.expiresAt) throw new AppError('Payment deadline has expired', 400);

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PROCESSED', paymentMethod: 'PAYMENT_GATEWAY' },
      include: DETAIL_INCLUDE,
    });
    await sendMail({ to: updated.user.email, subject: 'Booking Confirmed', html: buildConfirmationEmail(updated) });
    return updated;
  }

  async cancelOrder(orderId: number, userId: number) {
    const order = await this.getOrderById(orderId, userId);
    if (order.status !== 'WAITING_PAYMENT') throw new AppError('Cannot cancel at this stage', 400);
    return prisma.order.update({ where: { id: orderId }, data: { status: 'CANCELLED', cancelledBy: 'USER' } });
  }

  async confirmPayment(orderId: number, tenantId: number) {
    const order = await this.findTenantOrder(orderId, tenantId);
    if (order.status !== 'WAITING_CONFIRMATION') throw new AppError('Invalid status for confirmation', 400);

    const updated = await prisma.order.update({ where: { id: orderId }, data: { status: 'PROCESSED' } });
    await sendMail({ to: order.user.email, subject: 'Booking Confirmed', html: buildConfirmationEmail(order) });
    return updated;
  }

  async rejectPayment(orderId: number, tenantId: number) {
    const order = await this.findTenantOrder(orderId, tenantId);
    if (order.status !== 'WAITING_CONFIRMATION') throw new AppError('Invalid status for rejection', 400);
    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'WAITING_PAYMENT', paymentProofUrl: null, paymentProofUploadedAt: null,
        expiresAt: new Date(Date.now() + PAYMENT_WINDOW_MS),
      },
    });
  }

  async cancelOrderByTenant(orderId: number, tenantId: number, reason?: string) {
    const order = await this.findTenantOrder(orderId, tenantId);
    if (order.status !== 'WAITING_PAYMENT') throw new AppError('Cannot cancel at this stage', 400);
    return prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED', cancelledBy: 'TENANT', cancelReason: reason || null },
    });
  }

  private async findTenantOrder(orderId: number, tenantId: number) {
    const order = await prisma.order.findFirst({ where: { id: orderId, property: { tenantId } }, include: DETAIL_INCLUDE });
    if (!order) throw new AppError('Order not found', 404);
    return order;
  }
}
