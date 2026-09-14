import fs from 'fs';
import cloudinary from '../config/cloudinary';

export async function uploadToCloudinary(filePath: string, folder: string): Promise<string> {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `renting-app/${folder}`,
      resource_type: 'image',
    });
    return result.secure_url;
  } finally {
    await removeLocalTempFile(filePath);
  }
}

async function removeLocalTempFile(filePath: string): Promise<void> {
  try {
    if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
  } catch {
    // Ignore error if temp file cleanup fails
  }
}

export async function deleteFromCloudinary(imageUrl: string): Promise<void> {
  const publicId = extractPublicId(imageUrl);
  if (publicId) await cloudinary.uploader.destroy(publicId);
}

function extractPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
  return match ? match[1] : null;
}
