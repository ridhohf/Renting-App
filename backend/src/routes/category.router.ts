import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { JwtVerify } from '../middlewares/jwt-verify.middleware';
import { RoleGuard } from '../middlewares/role.middleware';
import { ENV } from '../config/env.config';

export class CategoryRouter {
  private router: Router;
  private categoryController: CategoryController;

  constructor() {
    this.categoryController = new CategoryController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    const optionalAuth = JwtVerify.optionalVerifyToken(ENV.JWT_SECRET);
    const tenantAuth = [JwtVerify.verifyToken(ENV.JWT_SECRET), RoleGuard.allow('TENANT')];

    this.router.get('/', optionalAuth, this.categoryController.getCategories);
    this.router.post('/', tenantAuth, this.categoryController.createCategory);
    this.router.put('/:id', tenantAuth, this.categoryController.updateCategory);
    this.router.delete('/:id', tenantAuth, this.categoryController.deleteCategory);
  }

  getRouter(): Router {
    return this.router;
  }
}
