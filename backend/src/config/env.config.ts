import 'dotenv/config';

export const ENV = {
  PORT: Number(process.env.PORT) || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',

  DATABASE_URL: process.env.DATABASE_URL!,

  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_VERIFICATION_SECRET: process.env.JWT_VERIFICATION_SECRET || process.env.JWT_SECRET!,
  JWT_RESET_SECRET: process.env.JWT_RESET_SECRET || process.env.JWT_SECRET!,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,

  SMTP_HOST: process.env.SMTP_HOST!,
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER!,
  SMTP_PASS: process.env.SMTP_PASS!,
  SMTP_FROM: process.env.SMTP_FROM!,

  OPENCAGE_API_KEY: process.env.OPENCAGE_API_KEY!,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
};
