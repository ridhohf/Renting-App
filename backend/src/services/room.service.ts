import prisma from '../config/prisma';
import { AppError } from '../utils/app.error';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.helper';

export class RoomService {
  async getRoomsByProperty(propertyId: number) {
    return prisma.room.findMany({ where: { propertyId }, include: { images: true } });
  }

  async getRoomById(id: number) {
    const room = await prisma.room.findUnique({
      where: { id },
      include: { images: true, peakSeasonRates: true, unavailabilities: true },
    });
    if (!room) throw new AppError('Room not found', 404);
    return room;
  }

  async createRoom(propertyId: number, tenantId: number, data: any, imageFiles: Express.Multer.File[]) {
    await this.verifyPropertyOwnership(propertyId, tenantId);
    const room = await prisma.room.create({
      data: {
        propertyId, name: data.name, description: data.description,
        capacity: Number(data.capacity), basePrice: Number(data.basePrice),
        totalUnits: Number(data.totalUnits || 1),
      },
    });
    await this.uploadRoomImages(room.id, imageFiles);
    return room;
  }

  private async verifyPropertyOwnership(propertyId: number, tenantId: number) {
    const prop = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!prop || prop.tenantId !== tenantId) throw new AppError('Property not found or unauthorized', 404);
  }

  private async uploadRoomImages(roomId: number, files?: Express.Multer.File[]) {
    if (!files?.length) return;
    for (let i = 0; i < files.length; i++) {
      const imageUrl = await uploadToCloudinary(files[i].path, 'rooms');
      await prisma.roomImage.create({ data: { roomId, imageUrl, sortOrder: i } });
    }
  }

  async updateRoom(id: number, tenantId: number, data: any) {
    const room = await prisma.room.findUnique({ where: { id }, include: { property: true } });
    if (!room || room.property.tenantId !== tenantId) throw new AppError('Not found or unauthorized', 404);

    return prisma.room.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.capacity && { capacity: Number(data.capacity) }),
        ...(data.basePrice && { basePrice: Number(data.basePrice) }),
        ...(data.totalUnits && { totalUnits: Number(data.totalUnits) }),
      },
    });
  }

  async deleteRoom(id: number, tenantId: number) {
    const room = await prisma.room.findUnique({ where: { id }, include: { property: true, images: true } });
    if (!room || room.property.tenantId !== tenantId) throw new AppError('Not found or unauthorized', 404);

    for (const img of room.images) {
      if (img.imageUrl) await deleteFromCloudinary(img.imageUrl);
    }
    return prisma.room.delete({ where: { id } });
  }
}
