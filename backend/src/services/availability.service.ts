import prisma from '../config/prisma';
import { AppError } from '../utils/app.error';
import { RoomUnavailability } from '../generated/prisma';

export class AvailabilityService {
  private async verifyOwnership(roomId: number, tenantId: number): Promise<void> {
    const room = await prisma.room.findUnique({ where: { id: roomId }, include: { property: true } });
    if (!room || room.property.tenantId !== tenantId) throw new AppError('Room not found or unauthorized', 404);
  }

  private async verifyUnavailabilityOwnership(id: number, tenantId: number): Promise<void> {
    const item = await prisma.roomUnavailability.findUnique({ where: { id }, include: { room: { include: { property: true } } } });
    if (!item || item.room.property.tenantId !== tenantId) throw new AppError('Unavailability not found or unauthorized', 404);
  }

  private validateDates(start?: string, end?: string): void {
    if (start && end && new Date(start) > new Date(end)) {
      throw new AppError('Start date must be on or before end date', 400);
    }
  }

  async getUnavailabilities(roomId: number, tenantId: number): Promise<RoomUnavailability[]> {
    await this.verifyOwnership(roomId, tenantId);
    return prisma.roomUnavailability.findMany({ where: { roomId } });
  }

  async createUnavailability(roomId: number, tenantId: number, data: any): Promise<RoomUnavailability> {
    await this.verifyOwnership(roomId, tenantId);
    this.validateDates(data.startDate, data.endDate);
    return prisma.roomUnavailability.create({
      data: { roomId, startDate: new Date(data.startDate), endDate: new Date(data.endDate), reason: data.reason },
    });
  }

  async updateUnavailability(id: number, tenantId: number, data: any): Promise<RoomUnavailability> {
    await this.verifyUnavailabilityOwnership(id, tenantId);
    this.validateDates(data.startDate, data.endDate);
    return prisma.roomUnavailability.update({
      where: { id },
      data: {
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.reason !== undefined && { reason: data.reason }),
      },
    });
  }

  async deleteUnavailability(id: number, tenantId: number): Promise<void> {
    await this.verifyUnavailabilityOwnership(id, tenantId);
    await prisma.roomUnavailability.delete({ where: { id } });
  }
}
