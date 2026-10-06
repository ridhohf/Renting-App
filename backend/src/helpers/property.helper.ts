import { getLowestRoomPrice, toDateString, getDailyRate } from '../utils/price.helper';

export function filterAvailableProperties(properties: any[], checkIn: Date, checkOut: Date, guests = 1): any[] {
  return properties
    .map((p) => {
      const availableRooms = p.rooms.filter((room: any) => room.capacity >= guests && isRoomAvailable(room, checkIn, checkOut));
      if (availableRooms.length === 0) return null;
      const lowestPrice = getLowestRoomPrice(availableRooms, checkIn, checkOut);
      return { ...p, rooms: availableRooms.map(toPublicRoom), lowestPrice };
    })
    .filter(Boolean);
}

function toPublicRoom(room: any) {
  const { orders, unavailabilities, peakSeasonRates, ...publicRoom } = room;
  return publicRoom;
}

export function isBlockedByUnavailability(unavailabilities: any[] = [], checkIn: Date, checkOut: Date): boolean {
  const inStr = toDateString(checkIn);
  const outStr = toDateString(checkOut);
  return unavailabilities.some((u: any) => inStr <= toDateString(u.endDate) && outStr > toDateString(u.startDate));
}

function isRoomAvailable(room: any, checkIn: Date, checkOut: Date): boolean {
  if (isBlockedByUnavailability(room.unavailabilities, checkIn, checkOut)) return false;
  const inStr = toDateString(checkIn);
  const outStr = toDateString(checkOut);
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

export function getMonthRange(month: number, year: number) {
  return { start: new Date(Date.UTC(year, month - 1, 1)), end: new Date(Date.UTC(year, month, 0)) };
}

export function buildCalendarData(rooms: any[], month: number, year: number, orders: any[]) {
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const calendar: any = {};
  for (const room of rooms) {
    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(buildRoomDay(room, new Date(Date.UTC(year, month - 1, d)), orders));
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
