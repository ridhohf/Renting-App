import prisma from '../config/prisma';
import { AppError } from '../utils/app.error';

export async function validateRoomAvailability(
  roomId: number,
  checkInDate: Date,
  checkOutDate: Date,
  guestCount: number,
) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { unavailabilities: true, peakSeasonRates: true },
  });

  if (!room) throw new AppError('Room not found', 404);
  if (room.capacity < guestCount) throw new AppError('Room capacity is insufficient', 400);

  checkUnavailability(room.unavailabilities, checkInDate, checkOutDate);
  await checkBookingCapacity(roomId, room.totalUnits, checkInDate, checkOutDate);

  return room;
}

function checkUnavailability(
  unavailabilities: { startDate: Date; endDate: Date }[],
  checkIn: Date,
  checkOut: Date,
): void {
  const isUnavailable = unavailabilities.some(
    (u) => checkIn < u.endDate && checkOut > u.startDate,
  );
  if (isUnavailable) throw new AppError('Room is unavailable for these dates', 400);
}

async function checkBookingCapacity(
  roomId: number,
  totalUnits: number,
  checkIn: Date,
  checkOut: Date,
): Promise<void> {
  const activeOrders = await prisma.order.count({
    where: {
      roomId,
      status: { notIn: ['CANCELLED'] },
      checkInDate: { lt: checkOut },
      checkOutDate: { gt: checkIn },
    },
  });
  if (activeOrders >= totalUnits) throw new AppError('Room fully booked for these dates', 400);
}

export function calculateTotalPrice(room: any, checkInDate: Date, checkOutDate: Date) {
  const totalNights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24),
  );
  let totalPrice = 0;

  for (let i = 0; i < totalNights; i++) {
    totalPrice += getDailyPrice(room, checkInDate, i);
  }
  return { totalPrice, totalNights };
}

function getDailyPrice(room: any, checkInDate: Date, dayIndex: number): number {
  const currentDate = new Date(checkInDate.getTime() + dayIndex * 24 * 3600 * 1000);
  let dailyPrice = Number(room.basePrice);

  const peak = room.peakSeasonRates?.find(
    (ps: any) => currentDate >= ps.startDate && currentDate < ps.endDate,
  );

  if (!peak) return dailyPrice;

  if (peak.adjustmentType === 'NOMINAL') {
    dailyPrice += Number(peak.adjustmentValue);
  } else if (peak.adjustmentType === 'PERCENTAGE') {
    dailyPrice += dailyPrice * (Number(peak.adjustmentValue) / 100);
  }
  return dailyPrice;
}
