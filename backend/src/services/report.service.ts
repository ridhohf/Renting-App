import prisma from '../config/prisma';
import { Prisma } from '../generated/prisma';
import { buildCalendarData } from '../helpers/property.helper';

export class ReportService {
  async getSalesReport(tenantId: number, query: { startDate?: string; endDate?: string; sortBy?: string; sortOrder?: string }) {
    const where = this.buildSalesWhere(tenantId, query);
    const orderBy = this.buildSalesOrderBy(query);
    const orders = await prisma.order.findMany({
      where, orderBy,
      include: { room: { include: { property: true } }, user: true },
    });
    return { orders, byProperty: this.aggregateSalesByProperty(orders), byUser: this.aggregateSalesByUser(orders) };
  }

  private buildSalesWhere(tenantId: number, q: any): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = { room: { property: { tenantId } }, status: { in: ['PROCESSED', 'COMPLETED'] } };
    if (q.startDate && q.endDate) {
      where.createdAt = { gte: new Date(q.startDate), lte: new Date(q.endDate) };
    }
    return where;
  }

  private buildSalesOrderBy(q: any): Prisma.OrderOrderByWithRelationInput {
    const dir = q.sortOrder === 'asc' ? 'asc' : 'desc';
    return q.sortBy === 'totalAmount' || q.sortBy === 'totalPrice' ? { totalAmount: dir } : { createdAt: dir };
  }

  private aggregateSalesByProperty(orders: any[]) {
    const map = new Map<number, { propertyName: string; totalRevenue: number; orderCount: number }>();
    for (const o of orders) {
      const p = o.room.property;
      const cur = map.get(p.id) || { propertyName: p.name, totalRevenue: 0, orderCount: 0 };
      cur.totalRevenue += Number(o.totalAmount);
      cur.orderCount += 1;
      map.set(p.id, cur);
    }
    return Array.from(map.values());
  }

  private aggregateSalesByUser(orders: any[]) {
    const map = new Map<number, { userName: string; totalSpent: number; orderCount: number }>();
    for (const o of orders) {
      const u = o.user;
      const cur = map.get(u.id) || { userName: u.name, totalSpent: 0, orderCount: 0 };
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
    return prisma.order.findMany({
      where: {
        roomId: { in: roomIds },
        status: { in: ['PROCESSED', 'COMPLETED', 'WAITING_PAYMENT', 'WAITING_CONFIRMATION'] },
        checkInDate: { lte: new Date(year, month, 0) },
        checkOutDate: { gte: new Date(year, month - 1, 1) },
      },
    });
  }
}
