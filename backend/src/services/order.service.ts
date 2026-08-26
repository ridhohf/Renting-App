import prisma from '../config/prisma';
import { AppError } from '../utils/app.error';
import { generateOrderNumber } from '../utils/generate-order.helper';
import { uploadToCloudinary } from '../utils/cloudinary.helper';
import { sendMail } from '../utils/mailer.helper';
import { validateRoomAvailability, calculateTotalPrice } from '../helpers/order-validation.helper';

export class OrderService {
  async createOrder(userId: number, data: any) {
    const checkInDate = new Date(data.checkInDate);
    const checkOutDate = new Date(data.checkOutDate);

    if (checkInDate >= checkOutDate) throw new AppError('Check-out must be after check-in', 400);

    const room = await validateRoomAvailability(data.roomId, checkInDate, checkOutDate, data.guestCount);
    const { totalPrice, totalNights } = calculateTotalPrice(room, checkInDate, checkOutDate);

    const orderNumber = generateOrderNumber();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    return prisma.order.create({
      data: {
        userId,
        propertyId: data.propertyId,
        roomId: data.roomId,
        checkInDate,
        checkOutDate,
        guestCount: data.guestCount,
        paymentMethod: data.paymentMethod,
        totalAmount: totalPrice,
        totalNights,
        orderNumber,
        expiresAt,
        status: 'WAITING_PAYMENT',
      },
    });
  }

  async getUserOrders(userId: number, query: any) {
    const { page = 1, limit = 10, status, search } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId };
    if (status) where.status = status;
    if (search) where.orderNumber = { contains: search, mode: 'insensitive' };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: Number(limit),
        include: { property: true, room: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);
    return { orders, meta: this.buildPaginationMeta(page, limit, total) };
  }

  async getOrderById(id: number, userId: number) {
    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: { property: true, room: true },
    });
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

  async cancelOrder(orderId: number, userId: number) {
    const order = await this.getOrderById(orderId, userId);
    if (order.status !== 'WAITING_PAYMENT') throw new AppError('Cannot cancel at this stage', 400);

    return prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED', cancelledBy: 'USER' },
    });
  }

  async getTenantOrders(tenantId: number, query: any) {
    const { page = 1, limit = 10, status, search } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { property: { tenantId } };
    if (status) where.status = status;
    if (search) where.orderNumber = { contains: search, mode: 'insensitive' };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: Number(limit),
        include: { property: true, room: true, user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);
    return { orders, meta: this.buildPaginationMeta(page, limit, total) };
  }

  async confirmPayment(orderId: number, tenantId: number) {
    const order = await this.findTenantOrder(orderId, tenantId);
    if (order.status !== 'WAITING_CONFIRMATION') throw new AppError('Invalid status', 400);

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'PROCESSED' },
    });
    const html = `<p>Hi ${order.user.name}, your booking #${order.orderNumber} has been confirmed!</p>`;
    await sendMail({ to: order.user.email, subject: 'Booking Confirmed', html });
    return updated;
  }

  async rejectPayment(orderId: number, tenantId: number) {
    const order = await this.findTenantOrder(orderId, tenantId);
    if (order.status !== 'WAITING_CONFIRMATION') throw new AppError('Invalid status', 400);

    return prisma.order.update({
      where: { id: orderId },
      data: { status: 'WAITING_PAYMENT', paymentProofUrl: null },
    });
  }

  async cancelOrderByTenant(orderId: number, tenantId: number) {
    const order = await this.findTenantOrder(orderId, tenantId);
    if (order.status !== 'WAITING_PAYMENT') throw new AppError('Cannot cancel at this stage', 400);

    return prisma.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED', cancelledBy: 'TENANT' },
    });
  }

  private async findTenantOrder(orderId: number, tenantId: number) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, property: { tenantId } },
      include: { user: true },
    });
    if (!order) throw new AppError('Order not found', 404);
    return order;
  }

  private buildPaginationMeta(page: any, limit: any, total: number) {
    return { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) };
  }
}
