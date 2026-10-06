import prisma from '../config/prisma';
import { uploadToCloudinary, deleteFromCloudinary } from './cloudinary.helper';

export async function uploadPropertyImages(propertyId: number, files?: Express.Multer.File[]): Promise<void> {
  if (!files?.length) return;
  for (let i = 0; i < files.length; i++) {
    const imageUrl = await uploadToCloudinary(files[i].path, 'properties');
    await prisma.propertyImage.create({ data: { propertyId, imageUrl, sortOrder: i } });
  }
}

export async function replacePropertyImages(propertyId: number, files: Express.Multer.File[]): Promise<void> {
  const oldImages = await prisma.propertyImage.findMany({ where: { propertyId } });
  await uploadPropertyImages(propertyId, files);
  await prisma.propertyImage.deleteMany({ where: { id: { in: oldImages.map((img) => img.id) } } });
  for (const img of oldImages) await deleteFromCloudinary(img.imageUrl);
}

export async function deleteImagesFromCloudinary(images: { imageUrl: string }[]): Promise<void> {
  for (const img of images) await deleteFromCloudinary(img.imageUrl);
}
