import { ENV } from '../config/env.config';
import { AppError } from './app.error';

export interface GoogleProfile {
  email: string;
  name: string;
  picture?: string;
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
  if (!res.ok) throw new AppError('Invalid Google token', 401);
  const payload: any = await res.json();
  if (ENV.GOOGLE_CLIENT_ID && payload.aud !== ENV.GOOGLE_CLIENT_ID) throw new AppError('Google token audience mismatch', 401);
  if (payload.email_verified !== 'true' && payload.email_verified !== true) throw new AppError('Google email is not verified', 401);
  return { email: payload.email, name: payload.name || 'User', picture: payload.picture };
}
