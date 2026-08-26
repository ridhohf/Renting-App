import { Router } from 'express';
import { AuthRouter } from './auth.router';
import { UserRouter } from './user.router';
import { CategoryRouter } from './category.router';
import { PropertyRouter } from './property.router';
import { RoomRouter } from './room.router';
import { PeakSeasonRouter } from './peak-season.router';
import { AvailabilityRouter } from './availability.router';
import { OrderRouter } from './order.router';
import { ReviewRouter } from './review.router';
import { ReportRouter } from './report.router';

export class MainRouter {
  private router: Router;
  private authRouter: AuthRouter;
  private userRouter: UserRouter;
  private categoryRouter: CategoryRouter;
  private propertyRouter: PropertyRouter;
  private roomRouter: RoomRouter;
  private peakSeasonRouter: PeakSeasonRouter;
  private availabilityRouter: AvailabilityRouter;
  private orderRouter: OrderRouter;
  private reviewRouter: ReviewRouter;
  private reportRouter: ReportRouter;

  constructor() {
    this.router = Router();
    this.authRouter = new AuthRouter();
    this.userRouter = new UserRouter();
    this.categoryRouter = new CategoryRouter();
    this.propertyRouter = new PropertyRouter();
    this.roomRouter = new RoomRouter();
    this.peakSeasonRouter = new PeakSeasonRouter();
    this.availabilityRouter = new AvailabilityRouter();
    this.orderRouter = new OrderRouter();
    this.reviewRouter = new ReviewRouter();
    this.reportRouter = new ReportRouter();

    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use('/api/auth', this.authRouter.getRouter());
    this.router.use('/api/users', this.userRouter.getRouter());
    this.router.use('/api/categories', this.categoryRouter.getRouter());
    this.router.use('/api/properties', this.propertyRouter.getRouter());
    this.router.use('/api/rooms', this.roomRouter.getRouter());
    this.router.use('/api/peak-seasons', this.peakSeasonRouter.getRouter());
    this.router.use('/api/availability', this.availabilityRouter.getRouter());
    this.router.use('/api/orders', this.orderRouter.getRouter());
    this.router.use('/api/reviews', this.reviewRouter.getRouter());
    this.router.use('/api/reports', this.reportRouter.getRouter());
  }

  public getRouter(): Router {
    return this.router;
  }
}
