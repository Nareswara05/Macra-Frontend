'use client';

import { useEffect, useState } from 'react';
import { FiUser, FiSave, FiCheck, FiAlertCircle, FiEdit2 } from 'react-icons/fi';
import { authApi, type UpdateProfilePayload } from '@/lib/api/auth';
import { dashboardApi } from '@/lib/api/dashboard';
import { useAuth } from '@/contexts/AuthContext';
import type { User } from '@/types';

const TARGET_OPTIONS = [
  { value: 'menurunkan_berat_badan', label: 'Menurunkan Berat Badan', emoji: '📉' },
  { value: 'menstabilkan_berat_badan', label: 'Menstabilkan Berat Badan', emoji: '⚖️' },
  { value: 'menaikkan_berat_badan', label: 'Menaikkan Berat Badan', emoji: '📈' },
];
const AKTIVITAS_OPTIONS = [
  { value: 'ringan', label: 'Ringan', hint: 'Jarang olahraga' },
  { value: 'sedang', label: 'Sedang', hint: '3–5x per minggu' },
  { value: 'berat', label: 'Berat', hint: 'Aktif setiap hari' },
];

function InfoRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-border-light">
      <span className="text-xs text-text-muted">{label}</span>
      <span className="text-[13px] font-semibold" style={{ color: color || '#e6edf3' }}>{value}</span>
    </div>
  );
}

function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Kurus', color: 'var(--c-protein)' };
  if (bmi < 25) return { label: 'Normal', color: 'var(--primary)' };
  if (bmi < 30) return { label: 'Overweight', color: 'var(--c-kalori)' };
  return { label: 'Obesitas', color: 'var(--c-lemak)' };
}

const inputCls = "w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-border bg-surface-2 text-text-primary text-sm font-[inherit] outline-none transition-all duration-150 placeholder:text-text-muted focus:border-primary focus:shadow-[0_0_0_3px_rgba(63,185,80,0.12)] focus:bg-surface";
const labelCls = "text-[13px] font-medium text-text-secondary flex items-center gap-1.5";

export default function ProfilePage() {
  const { updateUser } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    gender: 'pria', beratBadan: '', tinggiBadan: '',
    tanggalLahir: '', target: 'menstabilkan_berat_badan', jenisKegiatan: 'sedang',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await dashboardApi.getDashboard();
        const u = res.data.data.user;
        setUserData(u);
        setForm({
          gender: u.gender || 'pria', beratBadan: String(u.beratBadan || ''),
          tinggiBadan: String(u.tinggiBadan || ''), tanggalLahir: u.tanggalLahir || '',
          target: u.target || 'menstabilkan_berat_badan', jenisKegiatan: u.jenisKegiatan || 'sedang',
        });
      } catch { setError('Gagal memuat profil.'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError(''); setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      const payload: UpdateProfilePayload = {
        gender: form.gender, beratBadan: parseFloat(form.beratBadan),
        tinggiBadan: parseFloat(form.tinggiBadan), tanggalLahir: form.tanggalLahir,
        target: form.target, jenisKegiatan: form.jenisKegiatan,
      };
      const res = await authApi.updateProfile(payload);
      setUserData(res.data.data);
      updateUser(res.data.data);
      setSuccess('Profil berhasil diperbarui!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || 'Gagal memperbarui profil.');
    } finally { setSaving(false); }
  };

  const ageFromDob = (dob: string) => {
    if (!dob) return '-';
    return `${Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} tahun`;
  };

  const bmiVal = userData ? parseFloat((userData.beratBadan / Math.pow(userData.tinggiBadan / 100, 2)).toFixed(1)) : 0;
  const bmiCat = bmiVal ? getBMICategory(bmiVal) : null;
  const targetInfo = TARGET_OPTIONS.find(t => t.value === userData?.target);
  const aktivitasInfo = AKTIVITAS_OPTIONS.find(a => a.value === userData?.jenisKegiatan);
  const initial = (userData?.nama || userData?.email || 'U').charAt(0).toUpperCase();

  if (loading) return (
    <div className="p-6 md:p-8 flex flex-col gap-[18px]">
      <div className="skeleton h-[28px] w-[160px]" />
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-5 mt-2">
        <div className="flex flex-col gap-3.5">
          <div className="skeleton h-[200px] rounded-2xl" />
          <div className="skeleton h-[220px] rounded-2xl" />
        </div>
        <div className="skeleton h-[460px] rounded-2xl" />
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <h1 className="text-2xl font-bold tracking-[-0.4px] text-text-primary flex items-center gap-2 mb-7">
        <FiUser size={21} className="text-primary" /> Profil Saya
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-5 items-start">
        {/* Left */}
        <div className="flex flex-col gap-3.5">
          {/* Avatar card */}
          <div className="bg-surface rounded-2xl border border-border p-7 text-center">
            {/* Avatar with glow */}
            <div className="relative w-[72px] h-[72px] mx-auto mb-4 flex items-center justify-center">
              <div
                className="absolute inset-[-8px] rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(63,185,80,0.15) 0%, transparent 70%)' }}
              />
              <div className="w-[72px] h-[72px] rounded-full bg-primary-light border-2 border-primary/35 text-primary flex items-center justify-center text-3xl font-bold">
                {initial}
              </div>
            </div>
            <div className="text-[17px] font-bold text-text-primary mb-1">
              {userData?.nama || 'Pengguna'}
            </div>
            <div className="text-xs text-text-muted mb-4">{userData?.email}</div>
            {targetInfo && (
              <div className="inline-flex items-center gap-1.2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-primary/25 bg-primary/10 text-primary">
                {targetInfo.emoji} {targetInfo.label}
              </div>
            )}
          </div>

          {/* Body stats */}
          <div className="bg-surface rounded-2xl border border-border py-[18px] px-5">
            <div className="text-[11px] font-semibold tracking-[0.8px] uppercase text-text-muted mb-2">Data Fisik</div>
            <InfoRow label="Usia" value={ageFromDob(userData?.tanggalLahir || '')} />
            <InfoRow label="Berat Badan" value={`${userData?.beratBadan} kg`} />
            <InfoRow label="Tinggi Badan" value={`${userData?.tinggiBadan} cm`} />
            <InfoRow label="BMI" value={bmiVal ? `${bmiVal} — ${bmiCat?.label}` : '-'} color={bmiCat?.color} />
            <InfoRow label="Jenis Kelamin" value={userData?.gender?.toLowerCase() === 'pria' ? 'Pria 👨' : 'Wanita 👩'} />
            <div className="flex justify-between items-center pt-2.5">
              <span className="text-xs text-text-muted">Tingkat Aktivitas</span>
              <span className="text-[13px] font-semibold text-text-primary">
                {aktivitasInfo?.label}
                <span className="text-[11px] text-text-muted font-normal ml-1">({aktivitasInfo?.hint})</span>
              </span>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="bg-surface rounded-2xl border border-border py-[22px] px-6">
          <div className="text-[15px] font-semibold mb-5 flex items-center gap-2 text-text-primary">
            <div className="w-7 h-7 rounded-[7px] bg-primary-light border border-primary/25 flex items-center justify-center">
              <FiEdit2 size={13} className="text-primary" />
            </div>
            Edit Profil
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-lemak/25 bg-lemak/8 text-lemak text-sm mb-4">
              <FiAlertCircle size={15} className="shrink-0" />{error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-primary/25 bg-primary/8 text-primary text-sm mb-4">
              <FiCheck size={15} className="shrink-0" />{success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls} htmlFor="pf-gender">Jenis Kelamin</label>
              <select id="pf-gender" name="gender" className={`${inputCls} form-select`} value={form.gender} onChange={handleChange}>
                <option value="pria">Pria</option>
                <option value="wanita">Wanita</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls} htmlFor="pf-berat">Berat Badan (kg)</label>
                <input id="pf-berat" name="beratBadan" type="number" step="0.1" min="20" max="300"
                  className={inputCls} value={form.beratBadan} onChange={handleChange} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls} htmlFor="pf-tinggi">Tinggi Badan (cm)</label>
                <input id="pf-tinggi" name="tinggiBadan" type="number" step="0.1" min="100" max="250"
                  className={inputCls} value={form.tinggiBadan} onChange={handleChange} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelCls} htmlFor="pf-lahir">Tanggal Lahir</label>
              <input id="pf-lahir" name="tanggalLahir" type="date" className={inputCls}
                value={form.tanggalLahir} onChange={handleChange} max={new Date().toISOString().split('T')[0]} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelCls} htmlFor="pf-target">Target Kesehatan</label>
              <select id="pf-target" name="target" className={`${inputCls} form-select`} value={form.target} onChange={handleChange}>
                {TARGET_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.emoji} {o.label}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelCls} htmlFor="pf-aktivitas">Tingkat Aktivitas</label>
              <select id="pf-aktivitas" name="jenisKegiatan" className={`${inputCls} form-select`} value={form.jenisKegiatan} onChange={handleChange}>
                {AKTIVITAS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label} — {o.hint}</option>)}
              </select>
            </div>

            <button id="pf-save" type="submit" disabled={saving} className="mt-1.5 w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-[26px] py-3 rounded-xl bg-primary text-bg text-[15px] font-medium border-none cursor-pointer transition-all hover:bg-primary-hover hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(63,185,80,0.3)] active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none min-w-[170px]">
              {saving ? <><span className="spinner" />Menyimpan...</> : <><FiSave size={14} /> Simpan Perubahan</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
