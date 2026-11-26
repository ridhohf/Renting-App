import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role, User } from '../generated/prisma';
import { ENV } from '../config/env.config';
import { AppError } from '../utils/app.error';
import { sendMail } from '../utils/mailer.helper';
import { AuthEmailHelper } from '../utils/auth-email.helper';

const ONE_HOUR_MS = 3600000;

export class AuthService {
  private sanitizeUser(user: User) {
    const { passwordHash, verificationToken, resetToken, ...safe } = user;
    return safe;
  }

  private signAuthToken(user: User): string {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, ENV.JWT_SECRET, { expiresIn: '7d' });
  }

  async register(data: { email: string; name: string; role: Role }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError('Email already exists', 400);
    const user = await prisma.user.create({ data: { ...data, isVerified: false } });
    const token = jwt.sign({ id: user.id }, ENV.JWT_VERIFICATION_SECRET, { expiresIn: '1h' });
    const expiry = new Date(Date.now() + ONE_HOUR_MS);
    const updated = await prisma.user.update({ where: { id: user.id }, data: { verificationToken: token, verificationTokenExpiry: expiry } });
    const html = AuthEmailHelper.buildVerificationEmail(user.name, `${ENV.CLIENT_URL}/verify?token=${token}`);
    await sendMail({ to: user.email, subject: 'Verify Email', html });
    return this.sanitizeUser(updated);
  }

  async verifyAndSetPassword(token: string, password?: string) {
    const payload = jwt.verify(token, ENV.JWT_VERIFICATION_SECRET) as { id: number };
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || user.verificationToken !== token) throw new AppError('Invalid or expired token', 400);
    if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) throw new AppError('Verification token expired', 400);
    if (!user.passwordHash && user.provider === 'EMAIL' && !password) throw new AppError('Password is required', 400);
    const data: Record<string, unknown> = { isVerified: true, verificationToken: null, verificationTokenExpiry: null };
    if (password) data.passwordHash = await bcrypt.hash(password, 10);
    const updated = await prisma.user.update({ where: { id: user.id }, data });
    return this.sanitizeUser(updated);
  }

  async login(email: string, pass: string, role?: Role) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError('User not found', 404);
    if (role && user.role !== role) throw new AppError(`Please login using the ${user.role.toLowerCase()} portal`, 403);
    if (user.provider === 'GOOGLE') throw new AppError('Please use Google login for this account', 400);
    if (!user.isVerified || !user.passwordHash) throw new AppError('Account is not verified yet. Check your email.', 403);
    if (!(await bcrypt.compare(pass, user.passwordHash))) throw new AppError('Invalid credentials', 401);
    return { token: this.signAuthToken(user), user: this.sanitizeUser(user) };
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.provider === 'GOOGLE') throw new AppError('Invalid request for this email', 400);
    const token = jwt.sign({ id: user.id }, ENV.JWT_RESET_SECRET, { expiresIn: '1h' });
    const expiry = new Date(Date.now() + ONE_HOUR_MS);
    await prisma.user.update({ where: { id: user.id }, data: { resetToken: token, resetTokenExpiry: expiry } });
    const html = AuthEmailHelper.buildResetPasswordEmail(user.name, `${ENV.CLIENT_URL}/reset-password?token=${token}`);
    await sendMail({ to: user.email, subject: 'Reset Password', html });
    return { message: 'Reset email sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const payload = jwt.verify(token, ENV.JWT_RESET_SECRET) as { id: number };
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || user.resetToken !== token) throw new AppError('Invalid reset token', 400);
    if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) throw new AppError('Reset token expired', 400);
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const updated = await prisma.user.update({ where: { id: user.id }, data: { passwordHash, resetToken: null, resetTokenExpiry: null } });
    return this.sanitizeUser(updated);
  }

  async resendVerification(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.isVerified) throw new AppError('Already verified or not found', 400);
    const token = jwt.sign({ id: user.id }, ENV.JWT_VERIFICATION_SECRET, { expiresIn: '1h' });
    const expiry = new Date(Date.now() + ONE_HOUR_MS);
    await prisma.user.update({ where: { id: user.id }, data: { verificationToken: token, verificationTokenExpiry: expiry } });
    const html = AuthEmailHelper.buildVerificationEmail(user.name, `${ENV.CLIENT_URL}/verify?token=${token}`);
    await sendMail({ to: user.email, subject: 'Verify Email', html });
    return { message: 'Verification email resent' };
  }

  async googleLogin(googleToken: string, role: Role = 'USER', enforceRole?: Role) {
    const profile = await this.verifyGoogleToken(googleToken);
    let user = await prisma.user.findUnique({ where: { email: profile.email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email: profile.email, name: profile.name || 'User', provider: 'GOOGLE', isVerified: true, role },
      });
    } else if (enforceRole && user.role !== enforceRole) {
      throw new AppError(`Please login using the ${user.role.toLowerCase()} portal`, 403);
    }
    return { token: this.signAuthToken(user), user: this.sanitizeUser(user) };
  }

  private async verifyGoogleToken(token: string): Promise<{ email: string; name?: string }> {
    const idRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
    if (idRes.ok) return this.parseGoogleIdToken(await idRes.json());
    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!userRes.ok) throw new AppError('Invalid Google token', 401);
    const info = (await userRes.json()) as { email?: string; name?: string };
    if (!info.email) throw new AppError('Invalid Google account info', 400);
    return { email: info.email, name: info.name };
  }

  private parseGoogleIdToken(data: { email?: string; name?: string; aud?: string }): { email: string; name?: string } {
    if (!data.email) throw new AppError('Invalid Google token payload', 400);
    if (ENV.GOOGLE_CLIENT_ID && data.aud !== ENV.GOOGLE_CLIENT_ID) {
      throw new AppError('Google token audience mismatch', 401);
    }
    return { email: data.email, name: data.name };
  }
}
