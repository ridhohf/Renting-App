'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/services/auth.service';
import { UserRole } from '@/types';
import { Sparkles, Mail, User as UserIcon, CheckCircle2, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>('USER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successEmail, setSuccessEmail] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerUser({ name, email, role });
      setSuccessEmail(email);
    } catch (err: any) {
      setError(err.message || 'Registrasi gagal, periksa data Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90dvh] pt-28 pb-16 px-4 flex items-center justify-center bg-warm-mesh">
      <div className="w-full max-w-md">
        <div className="double-bezel">
          <div className="double-bezel-inner p-6 sm:p-8">
            {/* Header */}
            <div className="text-center space-y-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-warm-terracotta/10 text-warm-terracotta flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-warm-dark">
                Daftar ke <span className="text-warm-terracotta">StayInn</span>
              </h1>
              <p className="text-xs text-warm-muted">
                {successEmail
                  ? 'Verifikasi email telah dikirimkan ke akun Anda'
                  : 'Pilih tipe akun dan masukkan data untuk memulai'}
              </p>
            </div>

            {successEmail ? (
              <div className="space-y-5 text-center py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-warm-dark">Cek Email Anda</h3>
                  <p className="text-xs text-warm-muted leading-relaxed">
                    Kami telah mengirimkan tautan verifikasi ke <b>{successEmail}</b>. Silakan buka email Anda untuk mengatur kata sandi dan mengaktifkan akun.
                  </p>
                </div>

                <div className="pt-2">
                  <Link
                    href="/auth/login"
                    className="w-full py-2.5 rounded-full bg-warm-sand text-warm-dark text-xs font-bold block hover:bg-warm-border transition-colors"
                  >
                    Kembali ke Halaman Masuk
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Role Switcher Pills */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-warm-sand/80 rounded-2xl border border-warm-borderSubtle">
                  <button
                    type="button"
                    onClick={() => setRole('USER')}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
                      role === 'USER'
                        ? 'bg-white text-warm-terracotta shadow-cozy-sm'
                        : 'text-warm-muted hover:text-warm-dark'
                    }`}
                  >
                    Penyewa (Tamu)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('TENANT')}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
                      role === 'TENANT'
                        ? 'bg-white text-warm-terracotta shadow-cozy-sm'
                        : 'text-warm-muted hover:text-warm-dark'
                    }`}
                  >
                    Pemilik (Tenant Host)
                  </button>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs border border-red-100">
                    {error}
                  </div>
                )}

                {/* Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-warm-dark block">Nama Lengkap</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-warm-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Nama lengkap Anda"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-warm-border rounded-xl text-xs text-warm-dark focus:outline-none focus:ring-1 focus:ring-warm-terracotta shadow-cozy-sm"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-warm-dark block">Alamat Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-warm-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="alamat@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-warm-border rounded-xl text-xs text-warm-dark focus:outline-none focus:ring-1 focus:ring-warm-terracotta shadow-cozy-sm"
                    />
                  </div>
                  <p className="text-[10px] text-warm-muted">
                    Tautan pembuatan kata sandi akan dikirimkan ke email Anda.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full bg-warm-terracotta hover:bg-warm-terracottaHover text-white text-xs font-bold shadow-cozy-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  {loading ? 'Mengirim Verifikasi...' : 'Daftar & Kirim Verifikasi'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Bottom Login Link */}
            <div className="mt-6 pt-4 border-t border-warm-borderSubtle text-center text-xs text-warm-muted">
              Sudah memiliki akun?{' '}
              <Link href="/auth/login" className="font-bold text-warm-terracotta hover:underline">
                Masuk di sini
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
