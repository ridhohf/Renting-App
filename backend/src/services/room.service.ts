import prisma from '../config/prisma';
import { AppError } from '../utils/app.error';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.helper';

export class RoomService {
  async getRoomsByProperty(propertyId: number) {
    return prisma.room.findMany({
      where: { propertyId },
      include: { images: true }
    });
  }

  async getRoomById(id: number) {
    const room = await prisma.room.findUnique({
      where: { id },
      include: { images: true, peakSeasonRates: true, unavailabilities: true }
    });
    if (!room) throw new AppError('Room not found', 404);
    return room;
  }

  async createRoom(propertyId: number, tenantId: number, data: any, imageFiles: any[]) {
    const prop = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!prop || prop.tenantId !== tenantId) throw new AppError('Property not found or unauthorized', 404);

    const room = await prisma.room.create({
      data: {
        propertyId,
        name: data.name,
        description: data.description,
        capacity: Number(data.capacity),
        basePrice: Number(data.basePrice),
        totalUnits: Number(data.totalUnits)
      }
    });

    if (imageFiles && imageFiles.length > 0) {
      for (let i = 0; i < imageFiles.length; i++) {
        const imageUrl = await uploadToCloudinary(imageFiles[i].path, 'rooms');
        await prisma.roomImage.create({
          data: { roomId: room.id, imageUrl, sortOrder: i }
        });
      }
    }
    return room;
  }

  async updateRoom(id: number, tenantId: number, data: any) {
    const room = await prisma.room.findUnique({ where: { id }, include: { property: true } });
    if (!room || room.property.tenantId !== tenantId) throw new AppError('Not found or unauthorized', 404);
    
    return prisma.room.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        capacity: Number(data.capacity),
        basePrice: Number(data.basePrice),
        totalUnits: Number(data.totalUnits)
      }
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
