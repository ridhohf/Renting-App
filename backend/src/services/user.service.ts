import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/app.error';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary.helper';
import { AuthService, sanitizeUser } from './auth.service';

export class UserService {
  private authService = new AuthService();

  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);
    return sanitizeUser(user);
  }

  async updateProfile(userId: number, data: { name: string }) {
    const user = await prisma.user.update({ where: { id: userId }, data: { name: data.name } });
    return sanitizeUser(user);
  }

  async updateAvatar(userId: number, filePath: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);
    const imageUrl = await uploadToCloudinary(filePath, 'avatars');
    const updated = await prisma.user.update({ where: { id: userId }, data: { avatarUrl: imageUrl } });
    if (user.avatarUrl?.includes('res.cloudinary.com')) await deleteFromCloudinary(user.avatarUrl);
    return sanitizeUser(updated);
  }

  async changePassword(userId: number, oldPass: string, newPass: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) throw new AppError('Password change is not available for social login accounts', 400);
    const isValid = await bcrypt.compare(oldPass, user.passwordHash);
    if (!isValid) throw new AppError('Incorrect old password', 401);

    const passwordHash = await bcrypt.hash(newPass, 10);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { message: 'Password changed successfully' };
  }

  async changeEmail(userId: number, newEmail: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);
    if (user.provider === 'GOOGLE') throw new AppError('Email change is not available for social login accounts', 400);
    await this.checkEmailAvailability(newEmail);

    await prisma.user.update({ where: { id: userId }, data: { email: newEmail, isVerified: false } });
    await this.authService.sendVerification(userId, user.name, newEmail);
    return { message: 'Please check your new email to verify' };
  }

  private async checkEmailAvailability(email: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email already in use', 400);
  }
}
