import cloudinary from '../config/cloudinary';

export async function uploadToCloudinary(
  filePath: string,
  folder: string,
): Promise<string> {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: `renting-app/${folder}`,
    resource_type: 'image',
  });
  return result.secure_url;
}

export async function deleteFromCloudinary(
  imageUrl: string,
): Promise<void> {
  const publicId = extractPublicId(imageUrl);
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
}

function extractPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
  return match ? match[1] : null;
}
