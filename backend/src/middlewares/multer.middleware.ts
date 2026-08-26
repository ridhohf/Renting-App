import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { AppError } from '../utils/app.error';

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
];

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

function imageFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only .jpg, .jpeg, .png, and .gif files are allowed', 400));
  }
}

export const uploadImage = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, 'uploads/'),
    filename: (_req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
  fileFilter: imageFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});
