import prisma from '../config/prisma';
import { Prisma } from '../generated/prisma';
import { buildCalendarData } from '../helpers/property.helper';
import { toDateString, toUtcDate } from '../utils/price.helper';

export class ReportService {
  async getSalesReport(tenantId: number, query: { startDate?: string; endDate?: string; sortBy?: string; sortOrder?: string }) {
    const orders = await prisma.order.findMany({
      where: this.buildSalesWhere(tenantId, query),
      orderBy: this.buildSalesOrderBy(query),
      include: { room: { include: { property: true } }, user: { select: { id: true, name: true, email: true } } },
    });
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    return { summary: { totalRevenue, totalOrders: orders.length }, orders, byProperty: this.aggregateSalesByProperty(orders), byUser: this.aggregateSalesByUser(orders) };
  }

  private buildSalesWhere(tenantId: number, q: any): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = { room: { property: { tenantId } }, status: { in: ['PROCESSED', 'COMPLETED'] } };
    if (q.startDate || q.endDate) {
      where.createdAt = {
        ...(q.startDate && { gte: toUtcDate(q.startDate) }),
        ...(q.endDate && { lte: new Date(`${toDateString(q.endDate)}T23:59:59.999Z`) }),
      };
    }
    return where;
  }

  private buildSalesOrderBy(q: any): Prisma.OrderOrderByWithRelationInput {
    const dir = q.sortOrder === 'asc' ? 'asc' : 'desc';
    const isTotal = ['totalAmount', 'totalPrice', 'total', 'revenue'].includes(q.sortBy);
    return isTotal ? { totalAmount: dir } : { createdAt: dir };
  }

  private aggregateSalesByProperty(orders: any[]) {
    const map = new Map<number, { propertyId: number; propertyName: string; totalRevenue: number; orderCount: number }>();
    for (const o of orders) {
      const p = o.room.property;
      const cur = map.get(p.id) || { propertyId: p.id, propertyName: p.name, totalRevenue: 0, orderCount: 0 };
      cur.totalRevenue += Number(o.totalAmount);
      cur.orderCount += 1;
      map.set(p.id, cur);
    }
    return Array.from(map.values());
  }

  private aggregateSalesByUser(orders: any[]) {
    const map = new Map<number, { userId: number; userName: string; userEmail: string; totalSpent: number; orderCount: number }>();
    for (const o of orders) {
      const u = o.user;
      const cur = map.get(u.id) || { userId: u.id, userName: u.name, userEmail: u.email, totalSpent: 0, orderCount: 0 };
      cur.totalSpent += Number(o.totalAmount);
      cur.orderCount += 1;
      map.set(u.id, cur);
    }
    return Array.from(map.values());
  }

  async getPropertyReport(tenantId: number, propertyId: number, month: number, year: number) {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, tenantId },
      include: { rooms: { include: { peakSeasonRates: { orderBy: { createdAt: 'desc' } }, unavailabilities: true } } },
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
        checkInDate: { lte: new Date(Date.UTC(year, month, 0)) },
        checkOutDate: { gte: new Date(Date.UTC(year, month - 1, 1)) },
      },
    });
  }
}
