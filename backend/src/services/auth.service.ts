import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role, User } from '../generated/prisma';
import { ENV } from '../config/env.config';
import { AppError } from '../utils/app.error';
import { sendMail } from '../utils/mailer.helper';
import { AuthEmailHelper } from '../utils/auth-email.helper';
import { verifyGoogleIdToken } from '../utils/google-auth.helper';

export function sanitizeUser(user: User) {
  const { passwordHash, verificationToken, verificationTokenExpiry, resetToken, resetTokenExpiry, ...safe } = user;
  return safe;
}

export class AuthService {
  async register(data: { email: string; name: string; role: Role }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError('Email already exists', 400);
    const user = await prisma.user.create({ data: { ...data, isVerified: false } });
    await this.sendVerification(user.id, user.name, user.email);
    return sanitizeUser(user);
  }

  async verifyAndSetPassword(token: string, password?: string) {
    const payload = jwt.verify(token, ENV.JWT_VERIFICATION_SECRET) as any;
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || user.verificationToken !== token) throw new AppError('Invalid or already used token', 400);
    if (!user.passwordHash && !password) throw new AppError('Password is required to complete verification', 400);

    const updateData: any = { isVerified: true, verificationToken: null, verificationTokenExpiry: null };
    if (password) updateData.passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { id: user.id }, data: updateData });
  }

  async login(email: string, pass: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('Invalid email or password', 401);
    if (user.provider === 'GOOGLE' && !user.passwordHash) throw new AppError('Please use Google login for this account', 400);
    if (!user.isVerified || !user.passwordHash) {
      throw new AppError('Account is not verified yet. Please check your email to set your password.', 403);
    }
    const isValid = await bcrypt.compare(pass, user.passwordHash);
    if (!isValid) throw new AppError('Invalid email or password', 401);
    return this.buildAuthResponse(user);
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.provider === 'GOOGLE') throw new AppError('Reset password is only available for email accounts', 400);
    const token = jwt.sign({ id: user.id }, ENV.JWT_RESET_SECRET, { expiresIn: '1h' });
    await prisma.user.update({ where: { id: user.id }, data: { resetToken: token, resetTokenExpiry: new Date(Date.now() + 3600000) } });
    const html = AuthEmailHelper.buildResetPasswordEmail(user.name, `${ENV.CLIENT_URL}/reset-password?token=${token}`);
    await sendMail({ to: user.email, subject: 'Reset Password', html });
    return { message: 'Reset email sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const payload = jwt.verify(token, ENV.JWT_RESET_SECRET) as any;
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || user.resetToken !== token) throw new AppError('Invalid or already used reset token', 400);
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash, resetToken: null, resetTokenExpiry: null } });
  }

  async resendVerification(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.isVerified) throw new AppError('Already verified or not found', 400);
    await this.sendVerification(user.id, user.name, user.email);
    return { message: 'Verification email resent' };
  }

  async sendVerification(userId: number, name: string, email: string): Promise<void> {
    const token = jwt.sign({ id: userId, email }, ENV.JWT_VERIFICATION_SECRET, { expiresIn: '1h' });
    const expiry = new Date(Date.now() + 3600000);
    await prisma.user.update({ where: { id: userId }, data: { verificationToken: token, verificationTokenExpiry: expiry } });
    const html = AuthEmailHelper.buildVerificationEmail(name, `${ENV.CLIENT_URL}/verify?token=${token}`);
    await sendMail({ to: email, subject: 'Verify Email', html });
  }

  async googleLogin(idToken: string, role: Role = 'USER') {
    const profile = await verifyGoogleIdToken(idToken);
    let user = await prisma.user.findUnique({ where: { email: profile.email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: profile.email, name: profile.name, avatarUrl: profile.picture, provider: 'GOOGLE', isVerified: true, role },
      });
    }
    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: User) {
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, ENV.JWT_SECRET, { expiresIn: ENV.JWT_EXPIRES_IN as any });
    return { token, user: sanitizeUser(user) };
  }
}
