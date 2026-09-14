import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { AppError } from '../utils/app.error';

const GENERAL_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
const PAYMENT_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

function generalImageFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  if (GENERAL_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only .jpg, .jpeg, .png, and .gif files are allowed', 400));
  }
}

function paymentProofFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
  if (PAYMENT_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Payment proof must be .jpg or .png format', 400));
  }
}

export const uploadImage = multer({
  storage: diskStorage,
  fileFilter: generalImageFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

export const uploadPaymentProof = multer({
  storage: diskStorage,
  fileFilter: paymentProofFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});
