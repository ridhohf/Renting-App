import prisma from '../config/prisma';
import { AppError } from '../utils/app.error';

export class CategoryService {
  async getCategories(tenantId: number) {
    return prisma.propertyCategory.findMany({ where: { tenantId } });
  }

  async createCategory(tenantId: number, data: { name: string }) {
    return prisma.propertyCategory.create({
      data: { name: data.name, tenantId }
    });
  }

  async updateCategory(id: number, tenantId: number, data: { name: string }) {
    const category = await prisma.propertyCategory.findUnique({ where: { id } });
    if (!category || category.tenantId !== tenantId) {
      throw new AppError('Category not found or unauthorized', 404);
    }
    return prisma.propertyCategory.update({
      where: { id },
      data: { name: data.name }
    });
  }

  async deleteCategory(id: number, tenantId: number) {
    const category = await prisma.propertyCategory.findUnique({
      where: { id },
      include: { _count: { select: { properties: true } } }
    });
    if (!category || category.tenantId !== tenantId) {
      throw new AppError('Category not found or unauthorized', 404);
    }
    if (category._count.properties > 0) {
      throw new AppError('Cannot delete category with associated properties', 400);
    }
    return prisma.propertyCategory.delete({ where: { id } });
  }
}
