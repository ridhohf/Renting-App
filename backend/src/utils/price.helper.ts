export function toDateString(date: Date | string): string {
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  return new Date(date).toISOString().slice(0, 10);
}

export function toUtcDate(date: Date | string): Date {
  const str = toDateString(date);
  return new Date(`${str}T00:00:00.000Z`);
}

function applyAdjustment(base: number, type: string, value: number): number {
  if (type === 'PERCENTAGE') return base * (1 + value / 100);
  return base + value;
}

export function getDailyRate(base: number, date: Date, rates: any[] = []): number {
  const day = toDateString(date);
  const rate = rates.find((r) => day >= toDateString(r.startDate) && day <= toDateString(r.endDate));
  if (!rate) return base;
  return applyAdjustment(base, rate.adjustmentType, Number(rate.adjustmentValue));
}

export function calculateRoomPrice(basePrice: number, checkIn: Date, checkOut: Date, peakRates: any[] = []): number {
  let total = 0;
  const curr = toUtcDate(checkIn);
  const end = toUtcDate(checkOut);
  while (curr < end) {
    total += getDailyRate(Number(basePrice), curr, peakRates);
    curr.setUTCDate(curr.getUTCDate() + 1);
  }
  return total;
}

export function getLowestRoomPrice(rooms: any[], checkIn: Date, checkOut: Date): number {
  if (!rooms?.length) return 0;
  const start = toUtcDate(checkIn);
  const end = toUtcDate(checkOut);
  const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
  const prices = rooms.map((room) => calculateRoomPrice(room.basePrice, start, end, room.peakSeasonRates) / nights);
  return Math.min(...prices);
}
