import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { JwtVerify } from '../middlewares/jwt-verify.middleware';
import { RoleGuard } from '../middlewares/role.middleware';
import { ENV } from '../config/env.config';

export class ReportRouter {
  private router: Router;
  private reportController: ReportController;

  constructor() {
    this.reportController = new ReportController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use(JwtVerify.verifyToken(ENV.JWT_SECRET), RoleGuard.allow('TENANT'));
    this.router.get('/sales', this.reportController.getSalesReport);
    this.router.get('/property', this.reportController.getPropertyReport);
  }

  getRouter(): Router {
    return this.router;
  }
}
