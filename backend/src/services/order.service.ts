import prisma from '../config/prisma';
import { AppError } from '../utils/app.error';
import { generateOrderNumber } from '../utils/generate-order.helper';
import { uploadToCloudinary } from '../utils/cloudinary.helper';
import { sendMail } from '../utils/mailer.helper';
import { buildConfirmationEmail } from '../utils/order-email.helper';
import { validateRoomAvailability, calculateTotalPrice } from '../helpers/order-validation.helper';

export class OrderService {
  async createOrder(userId: number, data: any) {
    await this.verifyUserVerified(userId);
    const { inDate, outDate } = this.parseBookingDates(data.checkInDate, data.checkOutDate);
    const room = await validateRoomAvailability(data.roomId, inDate, outDate, data.guestCount);
    const { totalPrice, totalNights } = calculateTotalPrice(room, inDate, outDate);
    return this.insertOrder(userId, data, inDate, outDate, totalPrice, totalNights);
  }

  private parseBookingDates(checkIn: string, checkOut: string) {
    const inDate = new Date(checkIn), outDate = new Date(checkOut);
    if (inDate >= outDate) throw new AppError('Check-out must be after check-in', 400);
    return { inDate, outDate };
  }

  private insertOrder(userId: number, d: any, inDate: Date, outDate: Date, total: number, nights: number) {
    return prisma.order.create({
      data: {
        userId, propertyId: d.propertyId, roomId: d.roomId, checkInDate: inDate, checkOutDate: outDate,
        guestCount: d.guestCount, paymentMethod: d.paymentMethod, totalAmount: total, totalNights: nights,
        orderNumber: generateOrderNumber(), expiresAt: new Date(Date.now() + 3600000), status: 'WAITING_PAYMENT',
      },
    });
  }

  private async verifyUserVerified(userId: number): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isVerified) throw new AppError('Unverified users cannot create orders', 403);
  }

  async getUserOrders(userId: number, query: any) {
    const { page = 1, limit = 10 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where = this.buildUserOrderWhere(userId, query);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({ where, skip, take: Number(limit), include: { property: true, room: true }, orderBy: { createdAt: 'desc' } }),
      prisma.order.count({ where }),
    ]);
    return { orders, meta: this.buildPaginationMeta(page, limit, total) };
  }

  private buildUserOrderWhere(userId: number, query: any) {
    const where: any = { userId };
    if (query.status) where.status = query.status;
    if (query.search) where.orderNumber = { contains: query.search, mode: 'insensitive' };
    if (query.startDate && query.endDate) {
      where.checkInDate = { gte: new Date(query.startDate), lte: new Date(query.endDate) };
    }
    return where;
  }

  async getOrderById(id: number, userId: number) {
    const order = await prisma.order.findFirst({ where: { id, userId }, include: { property: true, room: true } });
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
      data: { paymentProofUrl: imageUrl, paymentProofUploadedAt: new Date(), status: 'WAITING_CONFIRMATION' },
    });
  }

  async processPaymentGateway(orderId: number, userId: number) {
    const order = await this.getOrderById(orderId, userId);
    if (order.status !== 'WAITING_PAYMENT') throw new AppError('Order cannot be processed', 400);
    if (new Date() > order.expiresAt) throw new AppError('Payment deadline has expired', 400);

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PROCESSED', paymentMethod: 'PAYMENT_GATEWAY' },
      include: { property: true, room: true, user: true },
    });
    await sendMail({ to: updated.user.email, subject: 'Booking Confirmed', html: buildConfirmationEmail(updated) });
    return updated;
  }

  async cancelOrder(orderId: number, userId: number) {
    const order = await this.getOrderById(orderId, userId);
    if (order.status !== 'WAITING_PAYMENT') throw new AppError('Cannot cancel at this stage', 400);
    return prisma.order.update({ where: { id: orderId }, data: { status: 'CANCELLED', cancelledBy: 'USER' } });
  }

  async getTenantOrders(tenantId: number, query: any) {
    const { page = 1, limit = 10, status, search } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const where: any = { property: { tenantId } };
    if (status) where.status = status;
    if (search) where.orderNumber = { contains: search, mode: 'insensitive' };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({ where, skip, take: Number(limit), include: { property: true, room: true, user: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.order.count({ where }),
    ]);
    return { orders, meta: this.buildPaginationMeta(page, limit, total) };
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
    return prisma.order.update({ where: { id: orderId }, data: { status: 'WAITING_PAYMENT', paymentProofUrl: null } });
  }

  async cancelOrderByTenant(orderId: number, tenantId: number) {
    const order = await this.findTenantOrder(orderId, tenantId);
    if (order.status !== 'WAITING_PAYMENT') throw new AppError('Cannot cancel at this stage', 400);
    return prisma.order.update({ where: { id: orderId }, data: { status: 'CANCELLED', cancelledBy: 'TENANT' } });
  }

  private async findTenantOrder(orderId: number, tenantId: number) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, property: { tenantId } },
      include: { user: true, property: true, room: true },
    });
    if (!order) throw new AppError('Order not found', 404);
    return order;
  }

  private buildPaginationMeta(page: any, limit: any, total: number) {
    return { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) };
  }
}
