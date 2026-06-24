'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  FiActivity, FiZap, FiPlus, FiCheck, FiAlertCircle,
  FiTrendingDown, FiList,
} from 'react-icons/fi';
import { dashboardApi, type TambahAktivitasPayload } from '@/lib/api/dashboard';
import type { AktivitasEntry, KonsumsiHariIni } from '@/types';

const today = new Date().toISOString().split('T')[0];

const QUICK_TEMPLATES = [
  { nama: 'Jogging 30 mnt',  kal: '250' },
  { nama: 'Bersepeda 1 jam', kal: '450' },
  { nama: 'Gym 1 jam',       kal: '400' },
  { nama: 'Jalan kaki',      kal: '150' },
  { nama: 'Renang 45 mnt',   kal: '500' },
  { nama: 'Yoga',            kal: '180' },
];

const inputCls = "w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-border bg-surface-2 text-text-primary text-sm font-[inherit] outline-none transition-all duration-150 placeholder:text-text-muted focus:border-primary focus:shadow-[0_0_0_3px_rgba(63,185,80,0.12)] focus:bg-surface";
const labelCls = "text-[13px] font-medium text-text-secondary flex items-center gap-1.5";

export default function AktivitasPage() {
  const [todayList, setTodayList]   = useState<AktivitasEntry[]>([]);
  const [konsumsi, setKonsumsi]     = useState<KonsumsiHariIni | null>(null);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState<{ type: 'success'|'error'; msg: string } | null>(null);
  const [form, setForm]             = useState({ namaAktivitas: '', kalori: '' });

  const [aiLoading, setAiLoading]   = useState(false);
  const [aiResult, setAiResult]     = useState<{ activityName: string; calories: number; risks: string[] } | null>(null);
  const [showModal, setShowModal]   = useState(false);

  const showToast = (type: 'success'|'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAiAnalyze = async () => {
    if (!form.namaAktivitas.trim()) {
      showToast('error', 'Masukkan nama aktivitas terlebih dahulu.');
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'analyze-activity', activityName: form.namaAktivitas })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAiResult(json.data);
        setShowModal(true);
      } else {
        showToast('error', json.error || 'Gagal menganalisis aktivitas.');
      }
    } catch {
      showToast('error', 'Terjadi kesalahan saat menghubungi MacraAI.');
    } finally {
      setAiLoading(false);
    }
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [hist, dash] = await Promise.all([
        dashboardApi.getHistoryAktivitas(),
        dashboardApi.getDashboard(),
      ]);
      setTodayList(hist.data.data.filter(a => a.tanggal === today));
      setKonsumsi(dash.data.data.konsumsiHariIni);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.namaAktivitas.trim()) { showToast('error', 'Nama aktivitas wajib diisi.'); return; }
    const kal = parseFloat(form.kalori);
    if (!kal || kal <= 0) { showToast('error', 'Kalori terbakar harus lebih dari 0.'); return; }

    const payload: TambahAktivitasPayload = { namaAktivitas: form.namaAktivitas.trim(), kalori: kal };
    setSubmitting(true);
    try {
      const res = await dashboardApi.tambahAktivitas(payload);
      setTodayList(prev => [res.data.data, ...prev]);
      setKonsumsi(res.data.konsumsiHariIni);
      setForm({ namaAktivitas: '', kalori: '' });
      showToast('success', `"${res.data.data.namaAktivitas}" — ${kal} kal terbakar!`);
    } catch { showToast('error', 'Gagal mencatat aktivitas.'); }
    finally { setSubmitting(false); }
  };

  const totalBurned = todayList.reduce((s, a) => s + a.kalori, 0);

  return (
    <div className={`p-6 md:p-8 animate-fade-in ${showModal ? 'h-screen overflow-y-hidden' : 'overflow-y-auto'}`}>
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-[-0.4px] text-text-primary flex items-center gap-2 mb-1">
          <FiActivity size={21} className="text-burned" /> Catat Aktivitas
        </h1>
        <p className="text-[13px] text-text-muted">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {toast && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm mb-4 border ${
          toast.type === 'success' 
            ? 'border-primary/25 bg-primary/8 text-primary' 
            : 'border-lemak/25 bg-lemak/8 text-lemak'
        }`}>
          {toast.type === 'success' ? <FiCheck size={15} className="shrink-0" /> : <FiAlertCircle size={15} className="shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-[22px]">
        {[
          { label: 'Kalori Terbakar',  value: Math.round(konsumsi?.kaloriTerbakar ?? totalBurned), unit: 'kal', color: 'var(--c-burned)', bg: 'var(--c-burned-bg)', border: 'rgba(34,211,238,0.2)', Icon: FiTrendingDown },
          { label: 'Kalori Masuk',     value: Math.round(konsumsi?.kalori ?? 0),    unit: 'kal', color: 'var(--c-kalori)', bg: 'var(--c-kalori-bg)', border: 'rgba(255,146,43,0.2)',  Icon: FiZap },
          { label: 'Sesi Hari Ini',    value: todayList.length, unit: 'sesi', color: 'var(--primary)', bg: 'var(--primary-light)', border: 'rgba(63,185,80,0.2)', Icon: FiActivity },
        ].map(({ label, value, unit, color, bg, border, Icon }) => (
          <div key={label} className="bg-surface rounded-xl border p-5 md:p-6 flex items-center gap-4" style={{ borderColor: border }}>
            <div className="w-[38px] h-[38px] rounded-lg shrink-0 flex items-center justify-center" style={{ background: bg, color }}>
              <Icon size={18} />
            </div>
            <div>
              <div className="text-[11px] text-text-muted mb-0.5">{label}</div>
              <div className="text-xl font-bold leading-none" style={{ color }}>
                {loading ? '—' : value}
                <span className="text-xs font-normal text-text-muted ml-1">{unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-5 items-start">
        {/* Form */}
        <div className="bg-surface rounded-2xl border border-border p-6 md:p-8">
          <div className="text-[15px] font-semibold mb-5 flex items-center gap-2 text-text-primary">
            <div className="w-7 h-7 rounded-[7px] bg-burned-bg border border-burned/20 flex items-center justify-center">
              <FiPlus size={14} className="text-burned" />
            </div>
            Tambah Aktivitas
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls} htmlFor="akt-nama">Nama Aktivitas</label>
              <div className="flex gap-2">
                <input id="akt-nama" type="text" className={inputCls}
                  placeholder="Contoh: Jogging Sore"
                  value={form.namaAktivitas}
                  onChange={e => setForm(p => ({ ...p, namaAktivitas: e.target.value }))} />
                <button
                  type="button"
                  onClick={handleAiAnalyze}
                  disabled={aiLoading || !form.namaAktivitas.trim()}
                  className="px-3 md:px-4 bg-primary-light border border-primary/20 text-primary rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer hover:bg-primary-mid/20 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {aiLoading ? (
                    <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-primary/20 border-t-primary animate-spin" />
                  ) : '🪄 Analisis AI'}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className={labelCls} htmlFor="akt-kalori" style={{ color: 'var(--c-burned)' }}>
                <FiTrendingDown size={13} /> Kalori Terbakar (kal)
              </label>
              <input id="akt-kalori" type="number" step="1" min="0" className={inputCls}
                placeholder="Contoh: 300"
                value={form.kalori}
                onChange={e => setForm(p => ({ ...p, kalori: e.target.value }))}
                style={{ borderColor: form.kalori ? 'var(--c-burned)' : undefined }} />
              <span className="text-xs text-text-muted">Estimasi kalori yang terbakar selama aktivitas</span>
            </div>

            {/* Quick templates */}
            <div>
              <div className="text-[11px] text-text-muted mb-2.5 tracking-[0.3px] uppercase font-semibold">
                Template Cepat
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {QUICK_TEMPLATES.map(t => (
                  <button key={t.nama} type="button"
                    onClick={() => setForm({ namaAktivitas: t.nama, kalori: t.kal })}
                    className="px-3 py-1.5 rounded-full border border-border bg-transparent text-xs cursor-pointer text-text-secondary transition-all hover:border-burned hover:text-burned hover:bg-burned/5"
                  >
                    {t.nama} · {t.kal}kal
                  </button>
                ))}
              </div>
            </div>

            <button id="akt-submit" type="submit" disabled={submitting} className="mt-1 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-burned-bg border border-burned/20 text-burned text-[15px] font-medium cursor-pointer transition-all hover:bg-burned/18 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none">
              {submitting
                ? <><span className="spinner spinner-teal" />Menyimpan...</>
                : <><FiPlus size={15} /> Simpan Aktivitas</>
              }
            </button>
          </form>
        </div>

        {/* Today list */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FiList size={14} className="text-text-muted" />
            <div className="text-[11px] font-semibold tracking-[0.8px] uppercase text-text-muted">
              Aktivitas Hari Ini
              {todayList.length > 0 && <span className="text-burned font-bold ml-1.5">({todayList.length})</span>}
            </div>
          </div>

          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="skeleton h-[68px] rounded-xl mb-2" />)
          ) : todayList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 md:py-20 px-6 gap-3 text-center bg-surface border border-dashed border-border-light rounded-2xl">
              <FiActivity size={32} className="text-text-muted" />
              <p className="text-sm text-text-muted">Belum ada aktivitas hari ini.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {todayList.map(entry => (
                <div 
                  key={entry.id} 
                  className="bg-surface rounded-xl border border-border-light py-4 px-5 flex items-center gap-4 transition-colors duration-150 hover:border-burned/30"
                >
                  <div className="w-[38px] h-[38px] rounded-lg shrink-0 bg-burned-bg border border-burned/20 flex items-center justify-center">
                    <FiActivity size={17} className="text-burned" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-text-primary overflow-hidden text-ellipsis whitespace-nowrap">{entry.namaAktivitas}</div>
                    <div className="text-[11px] text-text-muted mt-0.5">{entry.tanggal}</div>
                  </div>
                  <div className="inline-flex items-center gap-1.2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-burned/20 bg-burned/10 text-burned shrink-0">
                    <FiTrendingDown size={10} /> {entry.kalori.toFixed(0)} kal
                  </div>
                </div>
              ))}

              {totalBurned > 0 && (
                <div className="py-3 px-4 rounded-xl bg-burned/6 border border-burned/20 flex justify-between items-center">
                  <span className="text-[13px] font-semibold text-burned">Total terbakar hari ini</span>
                  <span className="text-[16px] font-bold text-burned flex items-center gap-1">
                    <FiTrendingDown size={14} />
                    {totalBurned.toFixed(0)} kal
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && aiResult && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-surface border border-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in">
            {/* Header */}
            <div className="p-6 border-b border-border-light flex justify-between items-center bg-primary-light/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center text-primary text-sm">🪄</div>
                <div>
                  <h3 className="font-bold text-text-primary text-sm">Rekomendasi MacraAI</h3>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-text-muted hover:text-text-primary text-xs cursor-pointer bg-transparent border-none"
              >
                Tutup
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col gap-4">
              <div>
                <div className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.8px] mb-1">Aktivitas Terdeteksi</div>
                <div className="text-[15px] font-bold text-text-primary">{aiResult.activityName}</div>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.8px] mb-1">Estimasi Kalori Terbakar</div>
                <div className="text-xl font-bold text-burned flex items-center gap-1.5">
                  <FiTrendingDown size={18} />
                  {aiResult.calories} <span className="text-xs font-normal text-text-muted">kalori / jam</span>
                </div>
              </div>

              <div className="p-4 bg-lemak-bg/5 border border-lemak/15 rounded-xl">
                <div className="text-[11px] font-semibold text-lemak uppercase tracking-[0.8px] mb-2 flex items-center gap-1">
                  <FiAlertCircle size={12} /> Resiko Olahraga Berlebihan
                </div>
                <ul className="text-xs text-text-secondary list-disc pl-4 space-y-1.5 leading-relaxed">
                  {aiResult.risks.map((risk, idx) => (
                    <li key={idx}>{risk}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 bg-surface-2 border-t border-border-light flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setForm({ namaAktivitas: aiResult.activityName, kalori: aiResult.calories.toString() });
                  setShowModal(false);
                  showToast('success', 'Data dimasukkan ke form.');
                }}
                className="flex-1 py-2.5 rounded-lg border border-border bg-surface hover:bg-surface-3 text-text-primary text-xs font-semibold cursor-pointer transition-colors"
              >
                Masukkan ke Form
              </button>
              <button
                type="button"
                onClick={async () => {
                  setSubmitting(true);
                  setShowModal(false);
                  try {
                    const res = await dashboardApi.tambahAktivitas({
                      namaAktivitas: aiResult.activityName,
                      kalori: aiResult.calories
                    });
                    setTodayList(prev => [res.data.data, ...prev]);
                    setKonsumsi(res.data.konsumsiHariIni);
                    setForm({ namaAktivitas: '', kalori: '' });
                    showToast('success', `"${aiResult.activityName}" — ${aiResult.calories} kal dicatat!`);
                  } catch {
                    showToast('error', 'Gagal mencatat aktivitas.');
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="flex-1 py-2.5 rounded-lg bg-primary text-bg hover:bg-primary-hover text-xs font-semibold cursor-pointer transition-colors shadow-lg shadow-primary-light"
              >
                Catat Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
