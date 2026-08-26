import prisma from '../config/prisma';
import { Prisma } from '../generated/prisma';

export class ReportService {
  async getSalesReport(tenantId: number, query: { startDate?: string; endDate?: string; sortBy?: string; sortOrder?: string }) {
    const where: Prisma.OrderWhereInput = {
      room: { property: { tenantId } },
      status: { in: ['PROCESSED', 'COMPLETED'] },
    };
    
    if (query.startDate && query.endDate) {
      where.createdAt = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    }

    const orderBy: Prisma.OrderOrderByWithRelationInput = {};
    if (query.sortBy === 'totalAmount' || query.sortBy === 'totalPrice') {
      orderBy.totalAmount = query.sortOrder === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.createdAt = query.sortOrder === 'asc' ? 'asc' : 'desc';
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy,
      include: {
        room: { include: { property: true } },
        user: true,
      },
    });

    const byProperty = this.aggregateSalesByProperty(orders);
    const byUser = this.aggregateSalesByUser(orders);

    return { orders, byProperty, byUser };
  }

  private aggregateSalesByProperty(orders: any[]) {
    const map = new Map<number, { propertyName: string; totalRevenue: number; orderCount: number }>();
    for (const o of orders) {
      const p = o.room.property;
      const current = map.get(p.id) || { propertyName: p.name, totalRevenue: 0, orderCount: 0 };
      current.totalRevenue += Number(o.totalAmount);
      current.orderCount += 1;
      map.set(p.id, current);
    }
    return Array.from(map.values());
  }

  private aggregateSalesByUser(orders: any[]) {
    const map = new Map<number, { userName: string; totalSpent: number; orderCount: number }>();
    for (const o of orders) {
      const u = o.user;
      const current = map.get(u.id) || { userName: u.name, totalSpent: 0, orderCount: 0 };
      current.totalSpent += Number(o.totalAmount);
      current.orderCount += 1;
      map.set(u.id, current);
    }
    return Array.from(map.values());
  }

  async getPropertyReport(tenantId: number, propertyId: number, month: number, year: number) {
    const property = await prisma.property.findFirst({
      where: { id: propertyId, tenantId },
      include: { rooms: true },
    });
    if (!property) return null;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const orders = await prisma.order.findMany({
      where: {
        roomId: { in: property.rooms.map((r) => r.id) },
        status: { in: ['PROCESSED', 'COMPLETED'] },
        checkInDate: { lte: endDate },
        checkOutDate: { gte: startDate },
      },
    });

    return this.buildCalendarData(property.rooms, month, year, orders);
  }

  private buildCalendarData(rooms: any[], month: number, year: number, orders: any[]) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const calendar: any = {};
    for (const room of rooms) {
      calendar[room.id] = { roomName: room.name, days: [] };
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const isBooked = orders.some((o) => o.roomId === room.id && new Date(o.checkInDate) <= date && new Date(o.checkOutDate) > date);
        calendar[room.id].days.push({
          date: date.toISOString().split('T')[0],
          isAvailable: !isBooked,
          price: room.basePrice,
          isBooked,
        });
      }
    }
    return calendar;
  }
}
