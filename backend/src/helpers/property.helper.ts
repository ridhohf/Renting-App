import { calculateRoomPrice, getLowestRoomPrice, toDateString, getDailyRate } from '../utils/price.helper';

export function filterAvailableProperties(properties: any[], checkIn: Date, checkOut: Date): any[] {
  return properties
    .map((p) => {
      const availableRooms = p.rooms.filter((room: any) => isRoomAvailable(room, checkIn, checkOut));
      if (availableRooms.length === 0) return null;
      return { ...p, rooms: availableRooms, lowestPrice: getLowestRoomPrice(availableRooms, checkIn, checkOut) };
    })
    .filter(Boolean);
}

function isRoomAvailable(room: any, checkIn: Date, checkOut: Date): boolean {
  const inStr = toDateString(checkIn);
  const outStr = toDateString(checkOut);
  const isBlocked = room.unavailabilities?.some((u: any) => {
    return inStr < toDateString(u.endDate) && outStr > toDateString(u.startDate);
  });
  if (isBlocked) return false;
  const activeOrders = room.orders?.filter((o: any) => {
    return o.status !== 'CANCELLED' && inStr < toDateString(o.checkOutDate) && outStr > toDateString(o.checkInDate);
  });
  return (activeOrders?.length || 0) < (room.totalUnits || 1);
}

export function sortProperties(items: any[], sortBy?: string, sortOrder: string = 'asc'): any[] {
  const order = sortOrder === 'desc' ? -1 : 1;
  if (sortBy === 'price') {
    return [...items].sort((a, b) => (a.lowestPrice - b.lowestPrice) * order);
  }
  if (sortBy === 'name') {
    return [...items].sort((a, b) => a.name.localeCompare(b.name) * order);
  }
  return items;
}

export function buildCalendarData(rooms: any[], month: number, year: number, orders: any[]) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const calendar: any = {};
  for (const room of rooms) {
    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(buildRoomDay(room, new Date(year, month - 1, d), orders));
    }
    calendar[room.id] = { roomId: room.id, roomName: room.name, days };
  }
  return calendar;
}

function buildRoomDay(room: any, date: Date, orders: any[]) {
  const dayStr = toDateString(date);
  const isBlocked = room.unavailabilities?.some((u: any) => dayStr >= toDateString(u.startDate) && dayStr <= toDateString(u.endDate));
  const booked = orders.filter((o: any) => o.roomId === room.id && dayStr >= toDateString(o.checkInDate) && dayStr < toDateString(o.checkOutDate)).length;
  const isAvailable = !isBlocked && booked < (room.totalUnits || 1);
  return { date: dayStr, isAvailable, price: getDailyRate(Number(room.basePrice), date, room.peakSeasonRates), isBooked: !isAvailable };
}
