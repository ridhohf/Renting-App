import prisma from '../config/prisma';
import { Prisma } from '../generated/prisma';
import { AppError } from '../utils/app.error';
import { uploadToCloudinary, deleteFromCloudinary, removeLocalTempFiles } from '../utils/cloudinary.helper';
import { geocodeLocation } from '../utils/geocode.helper';
import { toUtcDate } from '../utils/price.helper';
import { filterAvailableProperties, sortProperties, buildCalendarData } from '../helpers/property.helper';

export class PropertyService {
  async getPublicProperties(query: any) {
    const { page = 1, limit = 10, sortBy, sortOrder } = query;
    const { checkIn, checkOut } = this.parseSearchDates(query.checkIn, query.checkOut);
    const guestCount = query.guestCount || query.guests ? Number(query.guestCount || query.guests) : undefined;
    const properties = await this.fetchCatalogProperties(query);
    const available = filterAvailableProperties(properties, checkIn, checkOut, guestCount);
    return this.paginateResults(sortProperties(available, sortBy, sortOrder), Number(page), Number(limit));
  }

  private parseSearchDates(rawIn?: string, rawOut?: string) {
    const checkIn = rawIn ? toUtcDate(rawIn) : toUtcDate(new Date());
    const defaultOut = new Date(checkIn.getTime() + 86400000);
    const checkOut = rawOut ? toUtcDate(rawOut) : defaultOut;
    if (checkIn >= checkOut) throw new AppError('Check-out must be after check-in', 400);
    return { checkIn, checkOut };
  }

  private fetchCatalogProperties(query: any) {
    return prisma.property.findMany({
      where: this.buildWhereClause(query),
      include: {
        images: true, category: true,
        rooms: { include: { peakSeasonRates: { orderBy: { createdAt: 'desc' } }, unavailabilities: true, orders: true } },
      },
    });
  }

  private buildWhereClause(query: any) {
    const where: Prisma.PropertyWhereInput = {};
    if (query.city) where.city = { contains: String(query.city), mode: 'insensitive' };
    if (query.search) where.name = { contains: String(query.search), mode: 'insensitive' };
    if (query.categoryId) where.categoryId = Number(query.categoryId);
    return where;
  }

  private paginateResults(items: any[], page: number, limit: number) {
    const skip = (page - 1) * limit;
    const total = items.length;
    return { properties: items.slice(skip, skip + limit), meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getCities() {
    const properties = await prisma.property.findMany({ select: { city: true }, distinct: ['city'] });
    return properties.map((p) => p.city);
  }

  async getPropertyBySlug(slug: string) {
    const property = await prisma.property.findUnique({
      where: { slug },
      include: {
        images: true, category: true, tenant: { select: { id: true, name: true, avatarUrl: true } },
        rooms: { include: { images: true, peakSeasonRates: { orderBy: { createdAt: 'desc' } }, unavailabilities: true } },
        reviews: { orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, name: true, avatarUrl: true } } } },
      },
    });
    if (!property) throw new AppError('Property not found', 404);
    const avgRating = property.reviews.length ? property.reviews.reduce((s, r) => s + r.rating, 0) / property.reviews.length : 0;
    return { ...property, avgRating };
  }

  async getPropertyCalendar(slug: string, month: number, year: number) {
    const prop = await prisma.property.findUnique({
      where: { slug },
      include: { rooms: { include: { peakSeasonRates: { orderBy: { createdAt: 'desc' } }, unavailabilities: true } } },
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
        checkInDate: { lte: new Date(Date.UTC(year, month, 0)) },
        checkOutDate: { gte: new Date(Date.UTC(year, month - 1, 1)) },
      },
    });
  }

  async getTenantProperties(tenantId: number, query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const where: Prisma.PropertyWhereInput = { ...this.buildWhereClause(query), tenantId };
    const orderBy: Prisma.PropertyOrderByWithRelationInput = query.sortBy === 'name'
      ? { name: query.sortOrder === 'asc' ? 'asc' : 'desc' }
      : { createdAt: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    const [properties, total] = await Promise.all([
      prisma.property.findMany({ where, orderBy, include: { images: true, category: true, rooms: { include: { images: true } }, _count: { select: { rooms: true } } }, skip: (page - 1) * limit, take: limit }),
      prisma.property.count({ where }),
    ]);
    return { properties, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async createProperty(tenantId: number, data: any, imageFiles: Express.Multer.File[]) {
    try {
      await this.ensureCategoryExists(Number(data.categoryId));
      const slug = await this.generateSlug(data.name);
      const coords = await this.resolveCoords(data);
      const property = await prisma.property.create({ data: this.buildCreateData(tenantId, data, slug, coords) });
      await this.uploadPropertyImages(property.id, imageFiles);
      return property;
    } catch (error) {
      await removeLocalTempFiles(imageFiles);
      throw error;
    }
  }

  private buildCreateData(tenantId: number, data: any, slug: string, coords: { latitude: number | null; longitude: number | null }) {
    return {
      name: data.name, slug, description: data.description, categoryId: Number(data.categoryId),
      tenantId, address: data.address, city: data.city, province: data.province || '',
      latitude: coords.latitude, longitude: coords.longitude,
    };
  }

  private async resolveCoords(data: any) {
    if (data.latitude !== undefined && data.longitude !== undefined) {
      return { latitude: Number(data.latitude), longitude: Number(data.longitude) };
    }
    return geocodeLocation(data.city, data.province);
  }

  private async ensureCategoryExists(categoryId: number) {
    const cat = await prisma.propertyCategory.findUnique({ where: { id: categoryId } });
    if (!cat) throw new AppError('Property category not found', 404);
  }

  private async generateSlug(name: string): Promise<string> {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
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

  async updateProperty(id: number, tenantId: number, data: any, imageFiles: Express.Multer.File[] = []) {
    try {
      const prop = await prisma.property.findUnique({ where: { id } });
      if (!prop || prop.tenantId !== tenantId) throw new AppError('Not found or unauthorized', 404);
      if (data.categoryId !== undefined) await this.ensureCategoryExists(Number(data.categoryId));
      const updated = await prisma.property.update({ where: { id }, data: this.buildUpdateData(data) });
      await this.uploadPropertyImages(id, imageFiles);
      return updated;
    } catch (error) {
      await removeLocalTempFiles(imageFiles);
      throw error;
    }
  }

  private buildUpdateData(data: any): Prisma.PropertyUncheckedUpdateInput {
    return {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.categoryId !== undefined && { categoryId: Number(data.categoryId) }),
      ...(data.address !== undefined && { address: data.address }),
      ...(data.city !== undefined && { city: data.city }),
      ...(data.province !== undefined && { province: data.province }),
      ...(data.latitude !== undefined && { latitude: Number(data.latitude) }),
      ...(data.longitude !== undefined && { longitude: Number(data.longitude) }),
    };
  }

  async deleteProperty(id: number, tenantId: number) {
    const prop = await prisma.property.findUnique({ where: { id }, include: { images: true } });
    if (!prop || prop.tenantId !== tenantId) throw new AppError('Not found or unauthorized', 404);
    const orderCount = await prisma.order.count({ where: { propertyId: id } });
    if (orderCount > 0) throw new AppError('Cannot delete property with existing orders', 400);
    for (const img of prop.images) await deleteFromCloudinary(img.imageUrl);
    return prisma.property.delete({ where: { id } });
  }
}
