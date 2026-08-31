import api from '@/lib/api';
import { User, UserRole } from '@/types';

export interface RegisterData {
  name: string;
  email: string;
  role: UserRole;
}

export async function registerUser(data: RegisterData) {
  const res = await api.post('/auth/register', data);
  return res.data;
}

export async function verifyEmailAndSetPassword(token: string, password: string) {
  const res = await api.post('/auth/verify', { token, password });
  return res.data;
}

export async function loginUser(email: string, password: string) {
  const res = await api.post('/auth/login', { email, password });
  return res.data?.data as { token: string; user: User };
}

export async function forgotPassword(email: string) {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data;
}

export async function resetPassword(token: string, password: string) {
  const res = await api.post('/auth/reset-password', { token, password });
  return res.data;
}

export async function resendVerificationEmail(email: string) {
  const res = await api.post('/auth/resend-verification', { email });
  return res.data;
}

export async function updateUserProfile(data: { name?: string }) {
  const res = await api.patch('/users/profile', data);
  return res.data?.data as User;
}

export async function uploadUserAvatar(file: File) {
  const formData = new FormData();
  formData.append('avatar', file);
  const res = await api.patch('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data?.data as User;
}

export async function changeUserPassword(oldPassword: string, newPassword: string) {
  const res = await api.patch('/users/password', { oldPassword, newPassword });
  return res.data;
}

export async function changeUserEmail(email: string) {
  const res = await api.patch('/users/email', { email });
  return res.data;
}
