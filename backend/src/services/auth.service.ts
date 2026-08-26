import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.config';
import { AppError } from '../utils/app.error';
import { sendMail } from '../utils/mailer.helper';
import { AuthEmailHelper } from '../utils/auth-email.helper';

export class AuthService {
  async register(data: { email: string; name: string; role: any }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError('Email already exists', 400);
    const user = await prisma.user.create({ data: { ...data, isVerified: false } });
    const token = jwt.sign({ id: user.id }, ENV.JWT_VERIFICATION_SECRET, { expiresIn: '1h' });
    await prisma.user.update({ where: { id: user.id }, data: { verificationToken: token } });
    const verifyUrl = `${ENV.CLIENT_URL}/verify?token=${token}`;
    const html = AuthEmailHelper.buildVerificationEmail(user.name, verifyUrl);
    console.log(`\n🔑 [DEV VERIFICATION LINK]: ${verifyUrl}`);
    console.log(`🔑 [DEV VERIFICATION TOKEN]: ${token}\n`);
    await sendMail({ to: user.email, subject: 'Verify Email', html });
    return { ...user, verificationToken: token };
  }

  async verifyAndSetPassword(token: string, password: string) {
    const payload = jwt.verify(token, ENV.JWT_VERIFICATION_SECRET) as any;
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || user.isVerified || user.verificationToken !== token) {
      throw new AppError('Invalid or expired token', 400);
    }
    const passwordHash = await bcrypt.hash(password, 10);
    return prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, isVerified: true, verificationToken: null },
    });
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('User not found', 404);
    if (user.provider === 'GOOGLE' || !user.passwordHash) {
      throw new AppError('Use social login for this account', 400);
    }
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) throw new AppError('Invalid credentials', 401);
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, ENV.JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash, ...userData } = user;
    return { token, user: userData };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.provider === 'GOOGLE') throw new AppError('Invalid request for this email', 400);
    const token = jwt.sign({ id: user.id }, ENV.JWT_RESET_SECRET, { expiresIn: '1h' });
    await prisma.user.update({ where: { id: user.id }, data: { resetToken: token } });
    const resetUrl = `${ENV.CLIENT_URL}/reset-password?token=${token}`;
    const html = AuthEmailHelper.buildResetPasswordEmail(user.name, resetUrl);
    console.log(`\n🔑 [DEV RESET PASSWORD LINK]: ${resetUrl}`);
    console.log(`🔑 [DEV RESET TOKEN]: ${token}\n`);
    await sendMail({ to: user.email, subject: 'Reset Password', html });
    return { message: 'Reset email sent', resetToken: token };
  }

  async resetPassword(token: string, newPassword: string) {
    const payload = jwt.verify(token, ENV.JWT_RESET_SECRET) as any;
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || user.resetToken !== token) throw new AppError('Invalid reset token', 400);
    const passwordHash = await bcrypt.hash(newPassword, 10);
    return prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null },
    });
  }

  async resendVerification(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.isVerified) throw new AppError('Already verified or not found', 400);
    const token = jwt.sign({ id: user.id }, ENV.JWT_VERIFICATION_SECRET, { expiresIn: '1h' });
    await prisma.user.update({ where: { id: user.id }, data: { verificationToken: token } });
    const verifyUrl = `${ENV.CLIENT_URL}/verify?token=${token}`;
    const html = AuthEmailHelper.buildVerificationEmail(user.name, verifyUrl);
    await sendMail({ to: user.email, subject: 'Verify Email', html });
    return { message: 'Verification email resent' };
  }

  async googleLogin(googleToken: string) {
    const payload: any = jwt.decode(googleToken);
    if (!payload || !payload.email) throw new AppError('Invalid Google token', 400);
    let user = await prisma.user.findUnique({ where: { email: payload.email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: payload.email, name: payload.name, provider: 'GOOGLE', isVerified: true, role: 'USER' },
      });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, ENV.JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash, ...userData } = user;
    return { token, user: userData };
  }
}

