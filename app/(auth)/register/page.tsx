'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiAlertCircle, FiArrowRight, FiCheck } from 'react-icons/fi';
import { authApi } from '@/lib/api/auth';
import { useAuth } from '@/contexts/AuthContext';

const STEPS = ['Akun', 'Data Diri', 'Target'];

const TARGET_OPTIONS = [
  { value: 'menurunkan_berat_badan',   label: '📉 Menurunkan Berat Badan' },
  { value: 'menstabilkan_berat_badan', label: '⚖️ Menstabilkan Berat Badan' },
  { value: 'menaikkan_berat_badan',    label: '📈 Menaikkan Berat Badan' },
];
const AKTIVITAS_OPTIONS = [
  { value: 'ringan', label: 'Ringan — jarang olahraga' },
  { value: 'sedang', label: 'Sedang — 3–5x per minggu' },
  { value: 'berat',  label: 'Berat — aktif setiap hari' },
];

interface FormData {
  nama: string; email: string; password: string;
  gender: string; beratBadan: string; tinggiBadan: string; tanggalLahir: string;
  target: string; jenisKegiatan: string;
}

const inputCls = "w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-border bg-surface-2 text-text-primary text-sm font-[inherit] outline-none transition-all duration-150 placeholder:text-text-muted focus:border-primary focus:shadow-[0_0_0_3px_rgba(63,185,80,0.12)] focus:bg-surface";
const labelCls = "text-[13px] font-medium text-text-secondary";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm]       = useState<FormData>({
    nama: '', email: '', password: '',
    gender: 'pria', beratBadan: '', tinggiBadan: '', tanggalLahir: '',
    target: 'menstabilkan_berat_badan', jenisKegiatan: 'sedang',
  });

  const update = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const validateStep = (): string | null => {
    if (step === 0) {
      if (!form.nama.trim())        return 'Nama wajib diisi.';
      if (!form.email.trim())       return 'Email wajib diisi.';
      if (form.password.length < 6) return 'Password minimal 6 karakter.';
    }
    if (step === 1) {
      if (!form.beratBadan)   return 'Berat badan wajib diisi.';
      if (!form.tinggiBadan)  return 'Tinggi badan wajib diisi.';
      if (!form.tanggalLahir) return 'Tanggal lahir wajib diisi.';
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setStep(s => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) { next(); return; }
    setLoading(true); setError('');
    try {
      const res = await authApi.register({
        nama: form.nama.trim(), email: form.email.trim(), password: form.password,
        gender: form.gender,
        beratBadan: parseFloat(form.beratBadan), tinggiBadan: parseFloat(form.tinggiBadan),
        tanggalLahir: form.tanggalLahir, target: form.target, jenisKegiatan: form.jenisKegiatan,
      });
      login(res.data.token, res.data.data);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Terjadi kesalahan, coba lagi.');
    } finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in">
      {/* Mobile logo */}
      <div className="flex md:hidden items-center gap-2.5 mb-7">
        <div className="w-[34px] h-[34px] rounded-lg bg-primary-light border border-primary/30 flex items-center justify-center text-[17px]">🥗</div>
        <span className="text-[17px] font-bold text-primary">Macra</span>
      </div>

      <div className="mb-7">
        <h2 className="text-2xl font-bold tracking-[-0.5px] text-text-primary mb-1.5">Buat akun baru</h2>
        <p className="text-sm text-text-secondary">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-primary font-medium no-underline hover:underline">Masuk di sini →</Link>
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex gap-1.5 mb-7 items-center">
        {STEPS.map((label, i) => (
          <div key={label} className={`flex items-center gap-1.5 ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
            <div className="flex items-center gap-[7px] shrink-0">
              <div className={[
                'w-[26px] h-[26px] rounded-full text-[12px] font-bold flex items-center justify-center transition-all duration-200',
                i < step  ? 'bg-primary text-bg border border-transparent' :
                i === step ? 'bg-primary-light text-primary border border-primary/40' :
                             'bg-surface-2 text-text-muted border border-transparent',
              ].join(' ')}>
                {i < step ? <FiCheck size={12} /> : i + 1}
              </div>
              <span className={`text-xs font-medium ${i === step ? 'text-primary' : 'text-text-muted'}`}>{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px transition-colors duration-300 ${i < step ? 'bg-primary' : 'bg-border'}`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-lemak/25 bg-lemak/8 text-lemak text-sm mb-[18px]">
          <FiAlertCircle size={15} className="shrink-0" />{error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {step === 0 && (
          <>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-nama" className={labelCls}>Nama Lengkap</label>
              <input id="reg-nama" name="nama" type="text" className={inputCls} placeholder="Nama kamu" value={form.nama} onChange={update} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-email" className={labelCls}>Email</label>
              <input id="reg-email" name="email" type="email" className={inputCls} placeholder="nama@email.com" value={form.email} onChange={update} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-password" className={labelCls}>Password</label>
              <input id="reg-password" name="password" type="password" className={inputCls} placeholder="Minimal 6 karakter" value={form.password} onChange={update} />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-gender" className={labelCls}>Jenis Kelamin</label>
              <select id="reg-gender" name="gender" className={`${inputCls} form-select`} value={form.gender} onChange={update}>
                <option value="pria">Pria</option>
                <option value="wanita">Wanita</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-berat" className={labelCls}>Berat (kg)</label>
                <input id="reg-berat" name="beratBadan" type="number" step="0.1" min="20" max="300" className={inputCls} placeholder="70" value={form.beratBadan} onChange={update} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="reg-tinggi" className={labelCls}>Tinggi (cm)</label>
                <input id="reg-tinggi" name="tinggiBadan" type="number" step="0.1" min="100" max="250" className={inputCls} placeholder="170" value={form.tinggiBadan} onChange={update} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-lahir" className={labelCls}>Tanggal Lahir</label>
              <input id="reg-lahir" name="tanggalLahir" type="date" className={inputCls} value={form.tanggalLahir} onChange={update} max={new Date().toISOString().split('T')[0]} />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-target" className={labelCls}>Target Kesehatan</label>
              <select id="reg-target" name="target" className={`${inputCls} form-select`} value={form.target} onChange={update}>
                {TARGET_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="reg-aktivitas" className={labelCls}>Tingkat Aktivitas</label>
              <select id="reg-aktivitas" name="jenisKegiatan" className={`${inputCls} form-select`} value={form.jenisKegiatan} onChange={update}>
                {AKTIVITAS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Summary card */}
            <div className="p-4 rounded-xl bg-primary-light border border-primary/20 mt-1">
              <div className="text-[12px] font-semibold text-primary mb-2.5 tracking-[0.3px]">RINGKASAN PROFIL</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[12px] text-text-muted">
                <span>👤 {form.nama}</span>
                <span>⚖️ {form.beratBadan}kg / {form.tinggiBadan}cm</span>
                <span>🎯 {TARGET_OPTIONS.find(t => t.value === form.target)?.label}</span>
                <span>🏃 {AKTIVITAS_OPTIONS.find(a => a.value === form.jenisKegiatan)?.label.split(' — ')[0]}</span>
              </div>
            </div>
          </>
        )}

        <div className="flex gap-2.5 mt-1.5">
          {step > 0 && (
            <button type="button" onClick={() => setStep(s => s - 1)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-none bg-transparent cursor-pointer text-sm text-text-muted font-[inherit] transition-all hover:bg-surface-2 hover:text-text-primary">
              ← Kembali
            </button>
          )}
          {step < 2 ? (
            <button key="btn-next" type="button" id={`reg-next-${step}`}
              onClick={next}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-bg text-sm font-medium font-[inherit] border-none cursor-pointer transition-all hover:bg-primary-hover hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(63,185,80,0.3)] active:translate-y-0">
              Lanjut <FiArrowRight size={14} />
            </button>
          ) : (
            <button key="btn-submit" type="submit" id="reg-submit" disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-bg text-sm font-medium font-[inherit] border-none cursor-pointer transition-all hover:bg-primary-hover hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(63,185,80,0.3)] active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none">
              {loading ? <><span className="spinner" />Mendaftarkan...</> : <>Daftar Sekarang 🎉</>}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
