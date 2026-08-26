import { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service';
import { sendSuccess } from '../utils/response.helper';
import { AppError } from '../utils/app.error';

export class ReviewController {
  private reviewService = new ReviewService();

  constructor() {
    this.createReview = this.createReview.bind(this);
    this.getPropertyReviews = this.getPropertyReviews.bind(this);
    this.replyReview = this.replyReview.bind(this);
    this.getUserReviews = this.getUserReviews.bind(this);
  }

  async createReview(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Number((req as any).user.id);
      const { orderId, rating, comment } = req.body;
      const data = await this.reviewService.createReview(userId, { orderId: Number(orderId), rating: Number(rating), comment });
      sendSuccess(res, 201, { message: 'Review created', data });
    } catch (error) {
      next(error);
    }
  }

  async getPropertyReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const propertyId = req.query.propertyId as string;
      if (!propertyId) throw new AppError('propertyId is required', 400);
      const { page, limit, sortBy, sortOrder } = req.query;
      const result = await this.reviewService.getPropertyReviews(Number(propertyId), {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        sortBy: sortBy as string,
        sortOrder: sortOrder as string,
      });
      sendSuccess(res, 200, { message: 'Property reviews retrieved', data: result.reviews, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }

  async replyReview(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = Number((req as any).user.id);
      const { id } = req.params;
      const { reply } = req.body;
      const data = await this.reviewService.replyReview(Number(id), tenantId, reply);
      sendSuccess(res, 200, { message: 'Review replied', data });
    } catch (error) {
      next(error);
    }
  }

  async getUserReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = Number((req as any).user.id);
      const { page, limit } = req.query;
      const result = await this.reviewService.getUserReviews(userId, {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      });
      sendSuccess(res, 200, { message: 'User reviews retrieved', data: result.reviews, meta: result.meta });
    } catch (error) {
      next(error);
    }
  }
}
