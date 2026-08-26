import prisma from '../config/prisma';
import { AppError } from '../utils/app.error';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.helper';
import { getLowestRoomPrice } from '../utils/price.helper';

export class PropertyService {
  async getPublicProperties(query: any) {
    const { page = 1, limit = 10, sortBy, sortOrder } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = this.buildWhereClause(query);

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: { images: true, category: true, rooms: { include: { peakSeasonRates: true } } },
        skip, take,
        orderBy: sortBy === 'name' ? { name: sortOrder || 'asc' } : undefined,
      }),
      prisma.property.count({ where }),
    ]);

    const result = this.mapWithLowestPrice(properties, query);
    if (sortBy === 'price') this.sortByPrice(result, sortOrder);

    return { properties: result, meta: { page: Number(page), limit: take, total, totalPages: Math.ceil(total / take) } };
  }

  private buildWhereClause(query: any) {
    const where: any = {};
    if (query.city) where.city = { contains: query.city, mode: 'insensitive' };
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };
    if (query.categoryId) where.categoryId = Number(query.categoryId);
    return where;
  }

  private mapWithLowestPrice(properties: any[], query: any) {
    const checkIn = query.checkIn ? new Date(query.checkIn) : new Date();
    const checkOut = query.checkOut ? new Date(query.checkOut) : new Date(Date.now() + 86400000);
    return properties.map((p) => ({
      ...p,
      lowestPrice: getLowestRoomPrice(p.rooms, checkIn, checkOut),
    }));
  }

  private sortByPrice(result: any[], sortOrder: string) {
    result.sort((a, b) =>
      sortOrder === 'desc' ? b.lowestPrice - a.lowestPrice : a.lowestPrice - b.lowestPrice,
    );
  }

  async getPropertyBySlug(slug: string) {
    const property = await prisma.property.findUnique({
      where: { slug },
      include: { images: true, category: true, rooms: { include: { images: true } }, reviews: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } } },
    });
    if (!property) throw new AppError('Property not found', 404);
    const avgRating = this.calculateAvgRating(property.reviews);
    return { ...property, avgRating };
  }

  private calculateAvgRating(reviews: { rating: number }[]) {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }

  async getTenantProperties(tenantId: number, query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where: { tenantId },
        include: { images: true, _count: { select: { rooms: true } } },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.property.count({ where: { tenantId } }),
    ]);
    return { properties, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async createProperty(tenantId: number, data: any, imageFiles: Express.Multer.File[]) {
    const slug = await this.generateSlug(data.name);
    const property = await prisma.property.create({
      data: {
        name: data.name, slug, description: data.description, categoryId: Number(data.categoryId),
        tenantId, address: data.address, city: data.city, province: data.province || '',
        latitude: data.latitude ? Number(data.latitude) : null,
        longitude: data.longitude ? Number(data.longitude) : null,
      },
    });
    await this.uploadPropertyImages(property.id, imageFiles);
    return property;
  }

  private async generateSlug(name: string): Promise<string> {
    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await prisma.property.findFirst({ where: { slug } });
    if (existing) slug += '-' + Math.random().toString(36).substring(2, 6);
    return slug;
  }

  private async uploadPropertyImages(propertyId: number, files: Express.Multer.File[]) {
    if (!files?.length) return;
    for (let i = 0; i < files.length; i++) {
      const imageUrl = await uploadToCloudinary(files[i].path, 'properties');
      await prisma.propertyImage.create({ data: { propertyId, imageUrl, sortOrder: i } });
    }
  }

  async updateProperty(id: number, tenantId: number, data: any) {
    const prop = await prisma.property.findUnique({ where: { id } });
    if (!prop || prop.tenantId !== tenantId) throw new AppError('Not found or unauthorized', 404);
    return prisma.property.update({
      where: { id },
      data: { name: data.name, description: data.description, categoryId: Number(data.categoryId) },
    });
  }

  async deleteProperty(id: number, tenantId: number) {
    const prop = await prisma.property.findUnique({ where: { id }, include: { images: true } });
    if (!prop || prop.tenantId !== tenantId) throw new AppError('Not found or unauthorized', 404);
    for (const img of prop.images) await deleteFromCloudinary(img.imageUrl);
    return prisma.property.delete({ where: { id } });
  }
}
