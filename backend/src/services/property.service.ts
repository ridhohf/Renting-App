import prisma from '../config/prisma';
import { AppError } from '../utils/app.error';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.helper';
import { filterAvailableProperties, sortProperties, buildCalendarData } from '../helpers/property.helper';

export class PropertyService {
  async getPublicProperties(query: any) {
    const { page = 1, limit = 10, sortBy, sortOrder } = query;
    const checkIn = query.checkIn ? new Date(query.checkIn) : new Date();
    const checkOut = query.checkOut ? new Date(query.checkOut) : new Date(Date.now() + 86400000);
    const properties = await this.fetchCatalogProperties(query);
    const available = filterAvailableProperties(properties, checkIn, checkOut);
    const sorted = sortProperties(available, sortBy, sortOrder);
    return this.paginateResults(sorted, Number(page), Number(limit));
  }

  private fetchCatalogProperties(query: any) {
    return prisma.property.findMany({
      where: this.buildWhereClause(query),
      include: {
        images: true, category: true,
        rooms: { include: { peakSeasonRates: true, unavailabilities: true, orders: true } },
      },
    });
  }

  private buildWhereClause(query: any) {
    const where: any = {};
    if (query.city) where.city = { contains: query.city, mode: 'insensitive' };
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };
    if (query.categoryId) where.categoryId = Number(query.categoryId);
    return where;
  }

  private paginateResults(items: any[], page: number, limit: number) {
    const skip = (page - 1) * limit;
    const total = items.length;
    const properties = items.slice(skip, skip + limit);
    return { properties, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getCities() {
    const properties = await prisma.property.findMany({ select: { city: true }, distinct: ['city'] });
    return properties.map((p) => p.city);
  }

  async getPropertyBySlug(slug: string) {
    const property = await prisma.property.findUnique({
      where: { slug },
      include: {
        images: true, category: true,
        rooms: { include: { images: true, peakSeasonRates: true, unavailabilities: true } },
        reviews: { include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
      },
    });
    if (!property) throw new AppError('Property not found', 404);
    const avgRating = property.reviews.length ? property.reviews.reduce((s, r) => s + r.rating, 0) / property.reviews.length : 0;
    return { ...property, avgRating };
  }

  async getPropertyCalendar(slug: string, month: number, year: number) {
    const prop = await prisma.property.findUnique({
      where: { slug },
      include: { rooms: { include: { peakSeasonRates: true, unavailabilities: true } } },
    });
    if (!prop) throw new AppError('Property not found', 404);
    const orders = await this.fetchCalendarOrders(prop.rooms.map((r) => r.id), month, year);
    return buildCalendarData(prop.rooms, month, year, orders);
  }

  private fetchCalendarOrders(roomIds: number[], month: number, year: number) {
    return prisma.order.findMany({
      where: {
        roomId: { in: roomIds },
        status: { in: ['PROCESSED', 'COMPLETED', 'WAITING_PAYMENT', 'WAITING_CONFIRMATION'] },
        checkInDate: { lte: new Date(year, month, 0) },
        checkOutDate: { gte: new Date(year, month - 1, 1) },
      },
    });
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
    return existing ? `${slug}-${Math.random().toString(36).substring(2, 6)}` : slug;
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
