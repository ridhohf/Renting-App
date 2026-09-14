import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { JwtVerify } from '../middlewares/jwt-verify.middleware';
import { RoleGuard } from '../middlewares/role.middleware';
import { ENV } from '../config/env.config';
import { Validator } from '../middlewares/validator.middleware';
import { createReviewSchema, replyReviewSchema } from '../validations/review.validation';

export class ReviewRouter {
  private router = Router();
  private controller = new ReviewController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    const auth = JwtVerify.verifyToken(ENV.JWT_SECRET);
    this.router.get('/', this.controller.getPropertyReviews);
    this.router.get('/user', auth, RoleGuard.allow('USER'), this.controller.getUserReviews);
    this.router.post('/', auth, RoleGuard.allow('USER'), Validator.validate(createReviewSchema), this.controller.createReview);
    this.router.post('/:id/reply', auth, RoleGuard.allow('TENANT'), Validator.validate(replyReviewSchema), this.controller.replyReview);
  }

  getRouter(): Router {
    return this.router;
  }
}
