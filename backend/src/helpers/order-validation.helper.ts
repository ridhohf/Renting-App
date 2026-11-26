import prisma from '../config/prisma';
import { AppError } from '../utils/app.error';
import { calculateRoomPrice, toDateString } from '../utils/price.helper';

export async function validateRoomAvailability(
  propertyId: number,
  roomId: number,
  checkIn: Date,
  checkOut: Date,
  guests: number,
) {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { unavailabilities: true, peakSeasonRates: true },
  });
  if (!room || room.propertyId !== propertyId) throw new AppError('Room not found in this property', 404);
  if (room.capacity < guests) throw new AppError('Room capacity is insufficient', 400);
  checkUnavailability(room.unavailabilities, checkIn, checkOut);
  await checkBookingCapacity(roomId, room.totalUnits, checkIn, checkOut);
  return room;
}

function checkUnavailability(unavailabilities: { startDate: Date; endDate: Date }[], checkIn: Date, checkOut: Date): void {
  const inStr = toDateString(checkIn);
  const outStr = toDateString(checkOut);
  const isUnavailable = unavailabilities.some((u) => {
    return inStr <= toDateString(u.endDate) && outStr > toDateString(u.startDate);
  });
  if (isUnavailable) throw new AppError('Room is unavailable for these dates', 400);
}

async function checkBookingCapacity(roomId: number, units: number, checkIn: Date, checkOut: Date): Promise<void> {
  const count = await prisma.order.count({
    where: {
      roomId,
      status: { notIn: ['CANCELLED'] },
      checkInDate: { lt: checkOut },
      checkOutDate: { gt: checkIn },
    },
  });
  if (count >= units) throw new AppError('Room fully booked for these dates', 400);
}

export function calculateTotalPrice(room: any, checkIn: Date, checkOut: Date) {
  const totalNights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000));
  const totalPrice = calculateRoomPrice(room.basePrice, checkIn, checkOut, room.peakSeasonRates);
  return { totalPrice, totalNights };
}
