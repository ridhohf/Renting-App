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
      const { orderId, rating, comment } = req.body;
      const data = await this.reviewService.createReview(req.user!.id, { orderId: Number(orderId), rating: Number(rating), comment });
      sendSuccess(res, 201, { message: 'Review created', data });
    } catch (error) { next(error); }
  }

  async getPropertyReviews(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.query.propertyId) throw new AppError('propertyId is required', 400);
      const result = await this.reviewService.getPropertyReviews(Number(req.query.propertyId), req.query as any);
      sendSuccess(res, 200, { message: 'Property reviews retrieved', data: result.reviews, meta: result.meta });
    } catch (error) { next(error); }
  }

  async replyReview(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.reviewService.replyReview(Number(req.params.id), req.user!.id, req.body.reply);
      sendSuccess(res, 200, { message: 'Review replied', data });
    } catch (error) { next(error); }
  }

  async getUserReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.reviewService.getUserReviews(req.user!.id, req.query as any);
      sendSuccess(res, 200, { message: 'User reviews retrieved', data: result.reviews, meta: result.meta });
    } catch (error) { next(error); }
  }
}
