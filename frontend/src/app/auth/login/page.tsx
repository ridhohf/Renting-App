'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { loginUser } from '@/services/auth.service';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginUser(email, password);
      login(data.token, data.user);

      if (data.user.role === 'TENANT') {
        router.push('/tenant/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Email atau kata sandi tidak valid.');
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
                Masuk ke <span className="text-warm-terracotta">StayInn</span>
              </h1>
              <p className="text-xs text-warm-muted">
                Masukkan email dan kata sandi untuk mengakses akun Anda
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs border border-red-100">
                  {error}
                </div>
              )}

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-warm-dark block">Alamat Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-warm-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-warm-border rounded-xl text-xs text-warm-dark focus:outline-none focus:ring-1 focus:ring-warm-terracotta shadow-cozy-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-warm-dark block">Kata Sandi</label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[11px] font-semibold text-warm-terracotta hover:underline"
                  >
                    Lupa Kata Sandi?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-warm-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-warm-border rounded-xl text-xs text-warm-dark focus:outline-none focus:ring-1 focus:ring-warm-terracotta shadow-cozy-sm"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-full bg-warm-terracotta hover:bg-warm-terracottaHover text-white text-xs font-bold shadow-cozy-md flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {loading ? 'Memverifikasi...' : 'Masuk Sekarang'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Bottom Register Link */}
            <div className="mt-6 pt-4 border-t border-warm-borderSubtle text-center text-xs text-warm-muted">
              Belum memiliki akun?{' '}
              <Link href="/auth/register" className="font-bold text-warm-terracotta hover:underline">
                Daftar akun baru
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
