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
    this.router.use(JwtVerify.verifyToken(ENV.JWT_SECRET), RoleGuard.allow('TENANT'));
    this.router.get('/', this.categoryController.getCategories);
    this.router.post('/', this.categoryController.createCategory);
    this.router.put('/:id', this.categoryController.updateCategory);
    this.router.delete('/:id', this.categoryController.deleteCategory);
  }

  getRouter(): Router {
    return this.router;
  }
}
