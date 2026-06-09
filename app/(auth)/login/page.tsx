'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMail, FiLock, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import { authApi } from '@/lib/api/auth';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Email dan password wajib diisi.'); return; }
    setLoading(true);
    try {
      const res = await authApi.login(form);
      login(res.data.token, res.data.data);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Email atau password salah.');
    } finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in">
      {/* Mobile logo */}
      <div className="flex md:hidden items-center gap-2.5 mb-9">
        <div className="w-9 h-9 rounded-[9px] bg-primary-light border border-primary/30 flex items-center justify-center text-[18px]">🥗</div>
        <span className="text-[18px] font-bold text-primary">Macra</span>
      </div>

      <div className="mb-8">
        <h2 className="text-[26px] font-bold tracking-[-0.5px] text-text-primary mb-2">Masuk ke akun</h2>
        <p className="text-sm text-text-secondary">
          Belum punya akun?{' '}
          <Link href="/register" className="text-primary font-medium no-underline hover:underline">
            Daftar sekarang →
          </Link>
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-lemak/25 bg-lemak/8 text-lemak text-sm mb-5">
          <FiAlertCircle size={15} className="shrink-0" />{error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-email" className="flex items-center gap-1.5 text-[13px] font-medium text-text-secondary">
            <FiMail size={13} /> Email
          </label>
          <input
            id="login-email" name="email" type="email"
            placeholder="nama@email.com"
            value={form.email} onChange={handleChange} autoComplete="email"
            className="w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-border bg-surface-2 text-text-primary text-sm font-[inherit] outline-none transition-all duration-150 placeholder:text-text-muted focus:border-primary focus:shadow-[0_0_0_3px_rgba(63,185,80,0.12)] focus:bg-surface"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-password" className="flex items-center gap-1.5 text-[13px] font-medium text-text-secondary">
            <FiLock size={13} /> Password
          </label>
          <input
            id="login-password" name="password" type="password"
            placeholder="••••••••"
            value={form.password} onChange={handleChange} autoComplete="current-password"
            className="w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-border bg-surface-2 text-text-primary text-sm font-[inherit] outline-none transition-all duration-150 placeholder:text-text-muted focus:border-primary focus:shadow-[0_0_0_3px_rgba(63,185,80,0.12)] focus:bg-surface"
          />
        </div>

        <button
          id="login-submit" type="submit"
          disabled={loading}
          className="mt-2 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-bg text-[15px] font-medium font-[inherit] border-none cursor-pointer transition-all duration-150 hover:bg-primary-hover hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(63,185,80,0.3)] active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none"
        >
          {loading
            ? <><span className="spinner" />Memproses...</>
            : <>Masuk <FiArrowRight size={15} /></>
          }
        </button>
      </form>
    </div>
  );
}
