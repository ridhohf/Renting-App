'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/services/auth.service';
import { Sparkles, Mail, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim email reset kata sandi.');
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
                Lupa Kata Sandi?
              </h1>
              <p className="text-xs text-warm-muted">
                {success
                  ? 'Tautan reset telah dikirim ke email Anda'
                  : 'Masukkan email akun Anda untuk menerima tautan pemulihan'}
              </p>
            </div>

            {success ? (
              <div className="space-y-5 text-center py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-warm-dark">Cek Email Anda</h3>
                  <p className="text-xs text-warm-muted leading-relaxed">
                    Kami telah mengirimkan instruksi pemulihan ke <b>{email}</b>. Silakan periksa kotak masuk atau folder spam email Anda.
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
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs border border-red-100">
                    {error}
                  </div>
                )}

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
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full bg-warm-terracotta hover:bg-warm-terracottaHover text-white text-xs font-bold shadow-cozy-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? 'Mengirim...' : 'Kirim Tautan Reset'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-warm-borderSubtle text-center text-xs text-warm-muted">
              Ingat kata sandi Anda?{' '}
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
