export function toDateString(date: Date | string): string {
  return new Date(date).toISOString().slice(0, 10);
}

function applyAdjustment(base: number, type: string, value: number): number {
  if (type === 'PERCENTAGE') return base * (1 + value / 100);
  return base + value;
}

export function getDailyRate(base: number, date: Date, rates: any[] = []): number {
  const day = toDateString(date);
  const rate = rates.find((r) => {
    return day >= toDateString(r.startDate) && day <= toDateString(r.endDate);
  });
  if (!rate) return base;
  return applyAdjustment(base, rate.adjustmentType, Number(rate.adjustmentValue));
}

export function calculateRoomPrice(basePrice: number, checkIn: Date, checkOut: Date, peakRates: any[] = []): number {
  let total = 0;
  const curr = new Date(checkIn);
  while (curr < checkOut) {
    total += getDailyRate(Number(basePrice), curr, peakRates);
    curr.setDate(curr.getDate() + 1);
  }
  return total;
}

export function getLowestRoomPrice(rooms: any[], checkIn: Date, checkOut: Date): number {
  if (!rooms?.length) return 0;
  const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86400000));
  const prices = rooms.map((room) => {
    return calculateRoomPrice(room.basePrice, checkIn, checkOut, room.peakSeasonRates) / nights;
  });
  return Math.min(...prices);
}
