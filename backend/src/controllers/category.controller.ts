import { Request, Response, NextFunction } from 'express';
import { CategoryService } from '../services/category.service';
import { sendSuccess } from '../utils/response.helper';

export class CategoryController {
  private categoryService = new CategoryService();

  constructor() {
    this.getCategories = this.getCategories.bind(this);
    this.createCategory = this.createCategory.bind(this);
    this.updateCategory = this.updateCategory.bind(this);
    this.deleteCategory = this.deleteCategory.bind(this);
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user?.role === 'TENANT' && req.query.tenantOnly === 'true' ? req.user.id : undefined;
      const categories = await this.categoryService.getCategories(tenantId);
      sendSuccess(res, 200, { message: 'Categories fetched', data: categories });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await this.categoryService.createCategory(req.user!.id, { name: req.body.name });
      sendSuccess(res, 201, { message: 'Category created', data: category });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const category = await this.categoryService.updateCategory(id, req.user!.id, { name: req.body.name });
      sendSuccess(res, 200, { message: 'Category updated', data: category });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await this.categoryService.deleteCategory(id, req.user!.id);
      sendSuccess(res, 200, { message: 'Category deleted' });
    } catch (error) {
      next(error);
    }
  }
}
