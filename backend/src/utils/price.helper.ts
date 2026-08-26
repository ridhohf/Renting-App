export function calculateRoomPrice(basePrice: number, checkIn: Date, checkOut: Date, peakSeasonRates: any[]): number {
  let totalPrice = 0;
  const base = Number(basePrice);
  let currentDate = new Date(checkIn);

  while (currentDate < checkOut) {
    totalPrice += getDailyRate(base, currentDate, peakSeasonRates);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return totalPrice;
}

function getDailyRate(base: number, date: Date, rates: any[]): number {
  const rate = rates.find((r) => date >= r.startDate && date <= r.endDate);
  if (!rate) return base;

  if (rate.adjustmentType === 'PERCENTAGE') {
    return base * (1 + Number(rate.adjustmentValue) / 100);
  }
  return base + Number(rate.adjustmentValue);
}

export function getLowestRoomPrice(rooms: any[], checkIn: Date, checkOut: Date): number {
  if (!rooms || rooms.length === 0) return 0;
  const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86400000));
  const prices = rooms.map((room) =>
    calculateRoomPrice(room.basePrice, checkIn, checkOut, room.peakSeasonRates || []) / nights,
  );
  return Math.min(...prices);
}

