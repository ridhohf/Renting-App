import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { JwtVerify } from '../middlewares/jwt-verify.middleware';
import { RoleGuard } from '../middlewares/role.middleware';
import { ENV } from '../config/env.config';

export class ReviewRouter {
  private router: Router;
  private reviewController: ReviewController;

  constructor() {
    this.reviewController = new ReviewController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.reviewController.getPropertyReviews);
    
    this.router.post('/', 
      JwtVerify.verifyToken(ENV.JWT_SECRET), 
      RoleGuard.allow('USER'), 
      this.reviewController.createReview
    );
    
    this.router.get('/user', 
      JwtVerify.verifyToken(ENV.JWT_SECRET), 
      RoleGuard.allow('USER'), 
      this.reviewController.getUserReviews
    );
    
    this.router.patch('/:id/reply', 
      JwtVerify.verifyToken(ENV.JWT_SECRET), 
      RoleGuard.allow('TENANT'), 
      this.reviewController.replyReview
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
