import prisma from '../config/prisma';
import { Prisma } from '../generated/prisma';
import { AppError } from '../utils/app.error';

export class ReviewService {
  async createReview(userId: number, data: { orderId: number; rating: number; comment: string }) {
    const order = await prisma.order.findUnique({ where: { id: data.orderId }, include: { room: { include: { property: true } } } });
    if (!order) throw new AppError('Order not found', 404);
    this.validateReviewEligibility(order, userId);
    await this.checkDuplicateReview(data.orderId);

    return prisma.review.create({
      data: { userId, propertyId: order.room.property.id, orderId: data.orderId, rating: data.rating, comment: data.comment },
    });
  }

  private validateReviewEligibility(order: any, userId: number): void {
    if (order.userId !== userId) throw new AppError('Forbidden', 403);
    if (!['PROCESSED', 'COMPLETED'].includes(order.status)) throw new AppError('Order status does not allow review', 400);
    if (new Date(order.checkOutDate) >= new Date()) throw new AppError('Can only review after checkout', 400);
  }

  private async checkDuplicateReview(orderId: number): Promise<void> {
    const existing = await prisma.review.findUnique({ where: { orderId } });
    if (existing) throw new AppError('Review already exists for this order', 400);
  }

  async getPropertyReviews(propertyId: number, query: { page?: number; limit?: number; sortBy?: string; sortOrder?: string }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const orderBy = this.buildReviewOrderBy(query.sortBy, query.sortOrder);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({ where: { propertyId }, skip, take: limit, orderBy, include: { user: { select: { name: true, avatarUrl: true } } } }),
      prisma.review.count({ where: { propertyId } }),
    ]);
    return { reviews, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  private buildReviewOrderBy(sortBy?: string, sortOrder?: string): Prisma.ReviewOrderByWithRelationInput {
    const dir = sortOrder === 'asc' ? 'asc' : 'desc';
    return sortBy === 'rating' ? { rating: dir } : { createdAt: dir };
  }

  async replyReview(reviewId: number, tenantId: number, reply: string) {
    const review = await prisma.review.findUnique({ where: { id: reviewId }, include: { property: true } });
    if (!review) throw new AppError('Review not found', 404);
    if (review.property.tenantId !== tenantId) throw new AppError('Forbidden', 403);
    if (review.reply) throw new AppError('Review already replied', 400);

    return prisma.review.update({ where: { id: reviewId }, data: { reply, repliedAt: new Date() } });
  }

  async getUserReviews(userId: number, query: { page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({ where: { userId }, skip, take: limit, include: { property: { select: { name: true } } }, orderBy: { createdAt: 'desc' } }),
      prisma.review.count({ where: { userId } }),
    ]);
    return { reviews, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}
