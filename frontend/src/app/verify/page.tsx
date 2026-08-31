'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { verifyEmailAndSetPassword } from '@/services/auth.service';
import { Sparkles, Lock, CheckCircle2, ArrowRight } from 'lucide-react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter');
      return;
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok');
      return;
    }
    if (!token) {
      setError('Token verifikasi tidak valid atau tidak ditemukan');
      return;
    }

    setLoading(true);
    try {
      await verifyEmailAndSetPassword(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Verifikasi gagal atau token telah kedaluwarsa (1 jam)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90dvh] pt-28 pb-16 px-4 flex items-center justify-center bg-warm-mesh">
      <div className="w-full max-w-md">
        <div className="double-bezel">
          <div className="double-bezel-inner p-6 sm:p-8">
            <div className="text-center space-y-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-warm-terracotta/10 text-warm-terracotta flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-warm-dark">
                Verifikasi & Buat Password
              </h1>
              <p className="text-xs text-warm-muted">
                {success
                  ? 'Akun Anda berhasil diverifikasi'
                  : 'Masukkan kata sandi baru untuk mengaktifkan akun Anda'}
              </p>
            </div>

            {success ? (
              <div className="space-y-5 text-center py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-warm-dark">Akun Aktif!</h3>
                  <p className="text-xs text-warm-muted leading-relaxed">
                    Email berhasil diverifikasi dan kata sandi Anda telah tersimpan dengan aman. Silakan masuk untuk melanjutkan.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/auth/login"
                    className="w-full py-3 rounded-full bg-warm-terracotta hover:bg-warm-terracottaHover text-white text-xs font-bold shadow-cozy-md flex items-center justify-center gap-2 transition-all"
                  >
                    Masuk ke Akun Sekarang
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs border border-red-100">
                    {error}
                  </div>
                )}

                {/* New Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-warm-dark block">Kata Sandi Baru</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-warm-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Minimal 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-warm-border rounded-xl text-xs text-warm-dark focus:outline-none focus:ring-1 focus:ring-warm-terracotta shadow-cozy-sm"
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-warm-dark block">Ulangi Kata Sandi</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-warm-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Ketik ulang kata sandi"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-warm-border rounded-xl text-xs text-warm-dark focus:outline-none focus:ring-1 focus:ring-warm-terracotta shadow-cozy-sm"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full bg-warm-terracotta hover:bg-warm-terracottaHover text-white text-xs font-bold shadow-cozy-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Kata Sandi & Verifikasi'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 text-center text-xs text-warm-muted">Memuat...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
