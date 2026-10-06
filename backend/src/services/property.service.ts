import prisma from '../config/prisma';
import { Prisma } from '../generated/prisma';
import { AppError } from '../utils/app.error';
import { uploadPropertyImages, replacePropertyImages, deleteImagesFromCloudinary } from '../utils/property-image.helper';
import { filterAvailableProperties, sortProperties, buildCalendarData, getMonthRange } from '../helpers/property.helper';

export class PropertyService {
  async getPublicProperties(query: any) {
    const { page = 1, limit = 10, sortBy, sortOrder } = query;
    const { checkIn, checkOut } = this.parseSearchDates(query);
    const properties = await this.fetchCatalogProperties(query);
    const available = filterAvailableProperties(properties, checkIn, checkOut, Number(query.guestCount) || 1);
    const sorted = sortProperties(available, sortBy, sortOrder);
    return this.paginateResults(sorted, Number(page) || 1, Number(limit) || 10);
  }

  private parseSearchDates(query: any) {
    const checkIn = query.checkIn ? new Date(query.checkIn) : new Date();
    const checkOut = query.checkOut ? new Date(query.checkOut) : new Date(checkIn.getTime() + 86400000);
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) throw new AppError('Invalid date format', 400);
    if (checkIn >= checkOut) throw new AppError('checkOut must be after checkIn', 400);
    return { checkIn, checkOut };
  }

  private fetchCatalogProperties(query: any) {
    const orders = { where: { status: { not: 'CANCELLED' as const } }, select: { status: true, checkInDate: true, checkOutDate: true } };
    return prisma.property.findMany({
      where: this.buildWhereClause(query),
      include: { images: true, category: true, rooms: { include: { peakSeasonRates: true, unavailabilities: true, orders } } },
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
    const properties = items.slice(skip, skip + limit);
    return { properties, meta: this.buildMeta(page, limit, items.length) };
  }

  private buildMeta(page: number, limit: number, total: number) {
    return { page, limit, total, totalPages: Math.ceil(total / limit) };
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
    if (month < 1 || month > 12) throw new AppError('Month must be between 1 and 12', 400);
    const prop = await prisma.property.findUnique({
      where: { slug },
      include: { rooms: { include: { peakSeasonRates: true, unavailabilities: true } } },
    });
    if (!prop) throw new AppError('Property not found', 404);
    const orders = await this.fetchCalendarOrders(prop.rooms.map((r) => r.id), month, year);
    return buildCalendarData(prop.rooms, month, year, orders);
  }

  private fetchCalendarOrders(roomIds: number[], month: number, year: number) {
    const { start, end } = getMonthRange(month, year);
    return prisma.order.findMany({
      where: { roomId: { in: roomIds }, status: { not: 'CANCELLED' }, checkInDate: { lte: end }, checkOutDate: { gt: start } },
      select: { roomId: true, checkInDate: true, checkOutDate: true },
    });
  }

  async getTenantProperties(tenantId: number, query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const where = this.buildTenantWhere(tenantId, query);
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where, orderBy: this.buildTenantOrderBy(query), skip: (page - 1) * limit, take: limit,
        include: { images: true, category: true, rooms: { include: { images: true } } },
      }),
      prisma.property.count({ where }),
    ]);
    return { properties, meta: this.buildMeta(page, limit, total) };
  }

  private buildTenantWhere(tenantId: number, query: any) {
    const where: any = { tenantId };
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };
    if (query.categoryId) where.categoryId = Number(query.categoryId);
    return where;
  }

  private buildTenantOrderBy(query: any): Prisma.PropertyOrderByWithRelationInput {
    const dir: Prisma.SortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
    return query.sortBy === 'name' ? { name: dir } : { createdAt: dir };
  }

  async createProperty(tenantId: number, data: any, imageFiles: Express.Multer.File[]) {
    if (!imageFiles?.length) throw new AppError('At least one property picture is required', 400);
    await this.verifyCategoryOwnership(Number(data.categoryId), tenantId);
    const slug = await this.generateSlug(data.name);
    const property = await prisma.property.create({
      data: {
        name: data.name, slug, description: data.description, categoryId: Number(data.categoryId),
        tenantId, address: data.address, city: data.city, province: data.province || '',
        latitude: data.latitude ?? null, longitude: data.longitude ?? null,
      },
    });
    await uploadPropertyImages(property.id, imageFiles);
    return property;
  }

  private async verifyCategoryOwnership(categoryId: number, tenantId: number): Promise<void> {
    const category = await prisma.propertyCategory.findUnique({ where: { id: categoryId } });
    if (!category || category.tenantId !== tenantId) throw new AppError('Category not found or unauthorized', 404);
  }

  private async generateSlug(name: string): Promise<string> {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await prisma.property.findFirst({ where: { slug } });
    return existing ? `${slug}-${Math.random().toString(36).substring(2, 6)}` : slug;
  }

  private async findOwnedProperty(id: number, tenantId: number) {
    const prop = await prisma.property.findUnique({ where: { id }, include: { images: true, _count: { select: { orders: true } } } });
    if (!prop || prop.tenantId !== tenantId) throw new AppError('Not found or unauthorized', 404);
    return prop;
  }

  async updateProperty(id: number, tenantId: number, data: any, imageFiles: Express.Multer.File[] = []) {
    await this.findOwnedProperty(id, tenantId);
    if (data.categoryId) await this.verifyCategoryOwnership(Number(data.categoryId), tenantId);
    const { name, description, categoryId, address, city, province, latitude, longitude } = data;
    const updated = await prisma.property.update({
      where: { id },
      data: { name, description, categoryId, address, city, province, latitude, longitude },
    });
    if (imageFiles.length) await replacePropertyImages(id, imageFiles);
    return updated;
  }

  async deleteProperty(id: number, tenantId: number) {
    const prop = await this.findOwnedProperty(id, tenantId);
    if (prop._count.orders > 0) throw new AppError('Cannot delete property that already has orders', 400);
    await deleteImagesFromCloudinary(prop.images);
    return prisma.property.delete({ where: { id } });
  }
}
