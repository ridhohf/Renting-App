import prisma from '../config/prisma';
import { Prisma } from '../generated/prisma';
import { buildCalendarData, getMonthRange } from '../helpers/property.helper';

type SalesQuery = { startDate?: string; endDate?: string; sortBy?: string; sortOrder?: string; page?: string; limit?: string };

export class ReportService {
  async getSalesReport(tenantId: number, query: SalesQuery) {
    const where = this.buildSalesWhere(tenantId, query);
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const [allOrders, orders] = await Promise.all([
      prisma.order.findMany({ where, include: { property: true, user: { select: { id: true, name: true, email: true } } } }),
      this.fetchPagedSales(where, query, page, limit),
    ]);
    const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const meta = { page, limit, total: allOrders.length, totalPages: Math.ceil(allOrders.length / limit) };
    return { summary: { totalRevenue, totalOrders: allOrders.length }, orders, meta, ...this.buildAggregates(allOrders, query) };
  }

  private fetchPagedSales(where: Prisma.OrderWhereInput, query: SalesQuery, page: number, limit: number) {
    return prisma.order.findMany({
      where, orderBy: this.buildSalesOrderBy(query), skip: (page - 1) * limit, take: limit,
      include: {
        property: { select: { id: true, name: true } }, room: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  private buildAggregates(allOrders: any[], query: SalesQuery) {
    const dir = query.sortOrder === 'asc' ? 1 : -1;
    return {
      byProperty: this.aggregateSalesByProperty(allOrders).sort((a, b) => (a.totalRevenue - b.totalRevenue) * dir),
      byUser: this.aggregateSalesByUser(allOrders).sort((a, b) => (a.totalSpent - b.totalSpent) * dir),
    };
  }

  private buildSalesWhere(tenantId: number, q: SalesQuery): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = { property: { tenantId }, status: { in: ['PROCESSED', 'COMPLETED'] } };
    if (q.startDate && q.endDate) {
      const end = new Date(q.endDate);
      end.setUTCHours(23, 59, 59, 999);
      where.createdAt = { gte: new Date(q.startDate), lte: end };
    }
    return where;
  }

  private buildSalesOrderBy(q: SalesQuery): Prisma.OrderOrderByWithRelationInput {
    const dir = q.sortOrder === 'asc' ? 'asc' : 'desc';
    return q.sortBy === 'totalAmount' || q.sortBy === 'totalPrice' ? { totalAmount: dir } : { createdAt: dir };
  }

  private aggregateSalesByProperty(orders: any[]) {
    const map = new Map<number, { propertyId: number; propertyName: string; totalRevenue: number; orderCount: number }>();
    for (const o of orders) {
      const p = o.property;
      const cur = map.get(p.id) || { propertyId: p.id, propertyName: p.name, totalRevenue: 0, orderCount: 0 };
      cur.totalRevenue += Number(o.totalAmount);
      cur.orderCount += 1;
      map.set(p.id, cur);
    }
    return Array.from(map.values());
  }

  private aggregateSalesByUser(orders: any[]) {
    const map = new Map<number, { userId: number; userName: string; totalSpent: number; orderCount: number }>();
    for (const o of orders) {
      const u = o.user;
      const cur = map.get(u.id) || { userId: u.id, userName: u.name, totalSpent: 0, orderCount: 0 };
      cur.totalSpent += Number(o.totalAmount);
      cur.orderCount += 1;
      map.set(u.id, cur);
    }
    return Array.from(map.values());
  }

  async getPropertyReport(tenantId: number, propertyId: number, month: number, year: number) {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, tenantId },
      include: { rooms: { include: { peakSeasonRates: true, unavailabilities: true } } },
    });
    if (!property) return null;
    const orders = await this.fetchMonthlyOrders(property.rooms.map((r) => r.id), month, year);
    return buildCalendarData(property.rooms, month, year, orders);
  }

  private fetchMonthlyOrders(roomIds: number[], month: number, year: number) {
    const { start, end } = getMonthRange(month, year);
    return prisma.order.findMany({
      where: { roomId: { in: roomIds }, status: { not: 'CANCELLED' }, checkInDate: { lte: end }, checkOutDate: { gt: start } },
      select: { roomId: true, checkInDate: true, checkOutDate: true },
    });
  }
}
