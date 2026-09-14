import prisma from '../config/prisma';
import { AppError } from '../utils/app.error';
import { PeakSeasonRate } from '../generated/prisma';

export class PeakSeasonService {
  private async verifyOwnership(roomId: number, tenantId: number): Promise<void> {
    const room = await prisma.room.findUnique({ where: { id: roomId }, include: { property: true } });
    if (!room || room.property.tenantId !== tenantId) throw new AppError('Room not found or unauthorized', 404);
  }

  private async verifyPeakSeasonOwnership(id: number, tenantId: number): Promise<void> {
    const peak = await prisma.peakSeasonRate.findUnique({ where: { id }, include: { room: { include: { property: true } } } });
    if (!peak || peak.room.property.tenantId !== tenantId) throw new AppError('Peak season not found or unauthorized', 404);
  }

  private validateDates(start?: string, end?: string): void {
    if (start && end && new Date(start) >= new Date(end)) {
      throw new AppError('Start date must be before end date', 400);
    }
  }

  async getPeakSeasons(roomId: number, tenantId: number): Promise<PeakSeasonRate[]> {
    await this.verifyOwnership(roomId, tenantId);
    return prisma.peakSeasonRate.findMany({ where: { roomId } });
  }

  async createPeakSeason(roomId: number, tenantId: number, data: any): Promise<PeakSeasonRate> {
    await this.verifyOwnership(roomId, tenantId);
    this.validateDates(data.startDate, data.endDate);
    return prisma.peakSeasonRate.create({
      data: {
        roomId, startDate: new Date(data.startDate), endDate: new Date(data.endDate),
        adjustmentType: data.adjustmentType, adjustmentValue: data.adjustmentValue, reason: data.reason,
      },
    });
  }

  async updatePeakSeason(id: number, tenantId: number, data: any): Promise<PeakSeasonRate> {
    await this.verifyPeakSeasonOwnership(id, tenantId);
    this.validateDates(data.startDate, data.endDate);
    return prisma.peakSeasonRate.update({
      where: { id },
      data: {
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.adjustmentType && { adjustmentType: data.adjustmentType }),
        ...(data.adjustmentValue !== undefined && { adjustmentValue: data.adjustmentValue }),
        ...(data.reason !== undefined && { reason: data.reason }),
      },
    });
  }

  async deletePeakSeason(id: number, tenantId: number): Promise<void> {
    await this.verifyPeakSeasonOwnership(id, tenantId);
    await prisma.peakSeasonRate.delete({ where: { id } });
  }
}
