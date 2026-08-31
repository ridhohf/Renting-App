'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import { 
  updateUserProfile, 
  uploadUserAvatar, 
  changeUserPassword, 
  changeUserEmail 
} from '@/services/auth.service';
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Camera, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, refreshProfile, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
    if (user) {
      setName(user.name);
      setNewEmail(user.email);
    }
  }, [user, isLoading, router]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setMessage({ type: 'error', text: 'Ukuran foto maksimal 1MB' });
      return;
    }
    setAvatarLoading(true);
    setMessage(null);
    try {
      await uploadUserAvatar(file);
      await refreshProfile();
      setMessage({ type: 'success', text: 'Foto profil berhasil diperbarui!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal mengunggah foto profil' });
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setMessage(null);
    try {
      await updateUserProfile({ name });
      await refreshProfile();
      setMessage({ type: 'success', text: 'Nama profil berhasil diperbarui!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal memperbarui profil' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Kata sandi baru minimal 6 karakter' });
      return;
    }
    setPasswordLoading(true);
    setMessage(null);
    try {
      await changeUserPassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setMessage({ type: 'success', text: 'Kata sandi berhasil diubah!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal mengubah kata sandi' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailLoading(true);
    setMessage(null);
    try {
      await changeUserEmail(newEmail);
      setMessage({ type: 'success', text: 'Tautan verifikasi email baru telah dikirimkan ke email Anda!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Gagal mengajukan perubahan email' });
    } finally {
      setEmailLoading(false);
    }
  };

  if (isLoading || !user) {
    return <div className="min-h-screen pt-32 text-center text-xs text-warm-muted">Memuat data profil...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-20">
      {/* Page Header */}
      <div className="mb-8 space-y-2">
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-warm-dark">
          Pengaturan Akun & Profil
        </h1>
        <p className="text-xs sm:text-sm text-warm-muted">
          Kelola informasi pribadi, keamanan kata sandi, dan foto profil Anda.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs mb-6 flex items-center gap-2.5 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Col: Avatar Card */}
        <div className="double-bezel h-fit">
          <div className="double-bezel-inner p-6 text-center space-y-4">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full overflow-hidden bg-warm-sand ring-4 ring-warm-sand shadow-cozy-md">
              {user.avatarUrl ? (
                <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-warm-terracotta text-white font-serif text-3xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}

              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-warm-dark/50 opacity-0 hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity"
              >
                <Camera className="w-6 h-6" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleAvatarChange}
                disabled={avatarLoading}
                className="hidden"
              />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-warm-dark">{user.name}</h3>
              <p className="text-xs text-warm-muted truncate">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold bg-warm-terracotta/10 text-warm-terracotta uppercase tracking-wider">
                {user.role}
              </span>
            </div>

            <p className="text-[10px] text-warm-muted">
              Klik foto untuk mengganti avatar (Maks. 1MB, format .jpg/.png/.gif)
            </p>
          </div>
        </div>

        {/* Right Col: Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Info Form */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-6 space-y-4">
              <h3 className="font-serif text-base font-bold text-warm-dark flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-warm-terracotta" />
                Informasi Personal
              </h3>

              <form onSubmit={handleUpdateName} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-warm-dark block mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 text-xs bg-white border border-warm-border rounded-xl text-warm-dark focus:outline-none focus:ring-1 focus:ring-warm-terracotta"
                  />
                </div>
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-5 py-2 rounded-full bg-warm-terracotta text-white text-xs font-bold shadow-cozy-sm hover:bg-warm-terracottaHover transition-all disabled:opacity-50"
                >
                  {profileLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </form>
            </div>
          </div>

          {/* Email Update Form */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-6 space-y-4">
              <h3 className="font-serif text-base font-bold text-warm-dark flex items-center gap-2">
                <Mail className="w-4 h-4 text-warm-terracotta" />
                Ganti Email Akun
              </h3>

              <form onSubmit={handleChangeEmail} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-warm-dark block mb-1">Email Baru</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-4 py-2 text-xs bg-white border border-warm-border rounded-xl text-warm-dark focus:outline-none focus:ring-1 focus:ring-warm-terracotta"
                  />
                  <p className="text-[10px] text-warm-muted mt-1">
                    Mengubah email memerlukan verifikasi ulang melalui tautan yang dikirim ke email baru.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={emailLoading}
                  className="px-5 py-2 rounded-full bg-warm-sand text-warm-dark hover:bg-warm-border text-xs font-bold transition-all disabled:opacity-50"
                >
                  {emailLoading ? 'Mengirim...' : 'Kirim Verifikasi Email Baru'}
                </button>
              </form>
            </div>
          </div>

          {/* Password Change Form */}
          <div className="double-bezel">
            <div className="double-bezel-inner p-6 space-y-4">
              <h3 className="font-serif text-base font-bold text-warm-dark flex items-center gap-2">
                <Lock className="w-4 h-4 text-warm-terracotta" />
                Ubah Kata Sandi
              </h3>

              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-warm-dark block mb-1">Kata Sandi Saat Ini</label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-2 text-xs bg-white border border-warm-border rounded-xl text-warm-dark focus:outline-none focus:ring-1 focus:ring-warm-terracotta"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-warm-dark block mb-1">Kata Sandi Baru</label>
                  <input
                    type="password"
                    required
                    placeholder="Minimal 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 text-xs bg-white border border-warm-border rounded-xl text-warm-dark focus:outline-none focus:ring-1 focus:ring-warm-terracotta"
                  />
                </div>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2 rounded-full bg-warm-terracotta text-white text-xs font-bold shadow-cozy-sm hover:bg-warm-terracottaHover transition-all disabled:opacity-50"
                >
                  {passwordLoading ? 'Mengubah...' : 'Perbarui Kata Sandi'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
