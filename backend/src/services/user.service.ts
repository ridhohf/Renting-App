import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../generated/prisma';
import { ENV } from '../config/env.config';
import { AppError } from '../utils/app.error';
import { sendMail } from '../utils/mailer.helper';
import { uploadToCloudinary, deleteFromCloudinary, removeLocalTempFile } from '../utils/cloudinary.helper';
import { AuthEmailHelper } from '../utils/auth-email.helper';

export class UserService {
  private sanitizeUser(user: User) {
    const { passwordHash, verificationToken, resetToken, ...safe } = user;
    return safe;
  }

  async getProfile(userId: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);
    return this.sanitizeUser(user);
  }

  async updateProfile(userId: number, data: { name: string }) {
    const user = await prisma.user.update({ where: { id: userId }, data: { name: data.name } });
    return this.sanitizeUser(user);
  }

  async updateAvatar(userId: number, filePath: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      await removeLocalTempFile(filePath);
      throw new AppError('User not found', 404);
    }
    if (user.avatarUrl) await deleteFromCloudinary(user.avatarUrl);
    const imageUrl = await uploadToCloudinary(filePath, 'avatars');
    const updated = await prisma.user.update({ where: { id: userId }, data: { avatarUrl: imageUrl } });
    return this.sanitizeUser(updated);
  }

  async changePassword(userId: number, oldPass: string, newPass: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) throw new AppError('Invalid user or social login', 400);
    if (!(await bcrypt.compare(oldPass, user.passwordHash))) throw new AppError('Incorrect old password', 401);
    const passwordHash = await bcrypt.hash(newPass, 10);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { message: 'Password changed successfully' };
  }

  async changeEmail(userId: number, newEmail: string) {
    await this.checkEmailAvailability(newEmail);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);
    const token = jwt.sign({ id: userId, email: newEmail }, ENV.JWT_VERIFICATION_SECRET, { expiresIn: '1h' });
    const expiry = new Date(Date.now() + 3600000);
    await prisma.user.update({ where: { id: userId }, data: { email: newEmail, isVerified: false, verificationToken: token, verificationTokenExpiry: expiry } });
    await this.sendEmailVerificationMail(user.name, newEmail, token);
    return { message: 'Please check your new email to verify' };
  }

  private async checkEmailAvailability(email: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email already in use', 400);
  }

  private async sendEmailVerificationMail(name: string, email: string, token: string) {
    const html = AuthEmailHelper.buildVerificationEmail(name, `${ENV.CLIENT_URL}/verify?token=${token}`);
    await sendMail({ to: email, subject: 'Verify New Email', html });
  }
}
