'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  FiShoppingBag, FiZap, FiTarget, FiPackage, FiDroplet, FiFeather,
  FiPlus, FiCheck, FiAlertCircle, FiList,
} from 'react-icons/fi';
import { dashboardApi, type TambahKonsumsiPayload } from '@/lib/api/dashboard';
import type { DashboardData, MakananEntry } from '@/types';

const NUTRISI_FIELDS = [
  { key: 'kalori' as const, label: 'Kalori', unit: 'kal', Icon: FiZap, color: 'var(--c-kalori)', bg: 'var(--c-kalori-bg)' },
  { key: 'protein' as const, label: 'Protein', unit: 'g', Icon: FiTarget, color: 'var(--c-protein)', bg: 'var(--c-protein-bg)' },
  { key: 'karbo' as const, label: 'Karbohidrat', unit: 'g', Icon: FiPackage, color: 'var(--c-karbo)', bg: 'var(--c-karbo-bg)' },
  { key: 'lemak' as const, label: 'Lemak', unit: 'g', Icon: FiDroplet, color: 'var(--c-lemak)', bg: 'var(--c-lemak-bg)' },
  { key: 'serat' as const, label: 'Serat', unit: 'g', Icon: FiFeather, color: 'var(--c-serat)', bg: 'var(--c-serat-bg)' },
];

const today = new Date().toISOString().split('T')[0];

const inputCls = "w-full px-3.5 py-2.5 rounded-lg border-[1.5px] border-border bg-surface-2 text-text-primary text-sm font-[inherit] outline-none transition-all duration-150 placeholder:text-text-muted focus:border-primary focus:shadow-[0_0_0_3px_rgba(63,185,80,0.12)] focus:bg-surface";
const labelCls = "text-[13px] font-medium text-text-secondary flex items-center gap-1.5";

export default function KonsumsiPage() {
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [history, setHistory] = useState<MakananEntry[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [form, setForm] = useState<Record<string, string>>({
    namaMakanan: '', kalori: '', protein: '', karbo: '', lemak: '', serat: '',
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    foodName: string;
    portion: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAiAnalyze = async () => {
    if (!form.namaMakanan.trim()) {
      showToast('error', 'Masukkan nama makanan terlebih dahulu.');
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'analyze-food', foodName: form.namaMakanan })
      });
      const json = await res.json();
      if (json.success && json.data) {
        setAiResult(json.data);
        setShowModal(true);
      } else {
        showToast('error', json.error || 'Gagal menganalisis kandungan makanan.');
      }
    } catch {
      showToast('error', 'Terjadi kesalahan saat menghubungi MacraAI.');
    } finally {
      setAiLoading(false);
    }
  };

  const loadAll = useCallback(async () => {
    setLoadingPage(true);
    try {
      const [dash, hist] = await Promise.all([
        dashboardApi.getDashboard(),
        dashboardApi.getHistoryMakanan(),
      ]);
      setDashData(dash.data.data);
      setHistory(hist.data.data.filter(m => m.tanggal === today));
    } catch { setError('Gagal memuat data.'); }
    finally { setLoadingPage(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.namaMakanan.trim()) { showToast('error', 'Nama makanan wajib diisi.'); return; }
    const payload: TambahKonsumsiPayload = { namaMakanan: form.namaMakanan.trim() };
    NUTRISI_FIELDS.forEach(({ key }) => {
      const v = parseFloat(form[key]);
      if (!isNaN(v) && v > 0) (payload as any)[key] = v;
    });
    setSubmitting(true);
    try {
      const res = await dashboardApi.tambahKonsumsi(payload);
      setHistory(prev => [res.data.data, ...prev]);
      setDashData(prev => prev ? { ...prev, konsumsiHariIni: res.data.konsumsiHariIni } : prev);
      setForm({ namaMakanan: '', kalori: '', protein: '', karbo: '', lemak: '', serat: '' });
      showToast('success', `"${res.data.data.namaMakanan}" berhasil dicatat!`);
    } catch { showToast('error', 'Gagal mencatat. Coba lagi.'); }
    finally { setSubmitting(false); }
  };

  const ki = dashData?.konsumsiHariIni;
  const kb = dashData?.kebutuhanNutrisi;

  return (
    <div className={`p-6 md:p-8 animate-fade-in ${showModal ? 'h-screen overflow-y-hidden' : 'overflow-y-auto'}`}>
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-[-0.4px] text-text-primary flex items-center gap-2 mb-1">
          <FiShoppingBag size={21} className="text-primary" /> Catat Makanan
        </h1>
        <p className="text-[13px] text-text-muted">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-lemak/25 bg-lemak/8 text-lemak text-sm mb-4">
          <FiAlertCircle size={15} className="shrink-0" />{error}
        </div>
      )}
      {toast && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm mb-4 border ${toast.type === 'success'
            ? 'border-primary/25 bg-primary/8 text-primary'
            : 'border-lemak/25 bg-lemak/8 text-lemak'
          }`}>
          {toast.type === 'success' ? <FiCheck size={15} className="shrink-0" /> : <FiAlertCircle size={15} className="shrink-0" />}
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-5 items-start">
        {/* Form */}
        <div className="bg-surface rounded-2xl border border-border py-[22px] px-6">
          <div className="text-[15px] font-semibold mb-5 flex items-center gap-2 text-text-primary">
            <div className="w-7 h-7 rounded-[7px] bg-primary-light border border-primary/25 flex items-center justify-center">
              <FiPlus size={14} className="text-primary" />
            </div>
            Tambah Makanan
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls} htmlFor="mk-nama">Nama Makanan</label>
              <div className="flex gap-2">
                <input id="mk-nama" name="namaMakanan" type="text" className={inputCls}
                  placeholder="Contoh: Nasi Goreng Telur"
                  value={form.namaMakanan} onChange={handleChange} />
                <button
                  type="button"
                  onClick={handleAiAnalyze}
                  disabled={aiLoading || !form.namaMakanan.trim()}
                  className="px-3 md:px-4 bg-primary-light border border-primary/20 text-primary rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer hover:bg-primary-mid/20 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {aiLoading ? (
                    <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-primary/20 border-t-primary animate-spin" />
                  ) : '🪄 Analisis AI'}
                </button>
              </div>
            </div>

            <div className="h-px bg-border-light my-0.5" />
            <div className="text-xs text-text-muted">Kandungan nutrisi (opsional)</div>

            <div className="grid grid-cols-2 gap-3">
              {NUTRISI_FIELDS.map(({ key, label, unit, Icon, color }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className={labelCls} htmlFor={`mk-${key}`} style={{ color }}>
                    <Icon size={12} /> {label}
                    <span className="text-text-muted font-normal">({unit})</span>
                  </label>
                  <input
                    id={`mk-${key}`} name={key} type="number" step="0.1" min="0"
                    className={inputCls} placeholder="0"
                    value={form[key]} onChange={handleChange}
                    style={{ borderColor: form[key] ? color : undefined }}
                  />
                </div>
              ))}
            </div>

            <button id="mk-submit" type="submit" disabled={submitting} className="mt-1 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-bg text-[15px] font-medium border-none cursor-pointer transition-all hover:bg-primary-hover hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(63,185,80,0.3)] active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none">
              {submitting
                ? <><span className="spinner" />Menyimpan...</>
                : <><FiPlus size={15} /> Simpan Makanan</>
              }
            </button>
          </form>
        </div>

        {/* Progress sidebar */}
        <div className="flex flex-col gap-2.5">
          <div className="text-[11px] font-semibold tracking-[0.8px] uppercase text-text-muted mb-0.5">Progres Hari Ini</div>
          {loadingPage ? (
            [...Array(5)].map((_, i) => <div key={i} className="skeleton h-[76px] rounded-xl" />)
          ) : (
            NUTRISI_FIELDS.map(({ key, label, unit, Icon, color, bg }) => {
              const consumed = (ki?.[key] as number) ?? 0;
              const target = (kb?.[key] as number) ?? 1;
              const pct = Math.min((consumed / target) * 100, 100);
              return (
                <div key={key} className="bg-surface rounded-xl border border-border-light p-3.5">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0" style={{ background: bg, color }}>
                      <Icon size={13} />
                    </div>
                    <span className="text-[13px] font-semibold flex-1 text-text-primary">{label}</span>
                    <span className="text-[13px] font-bold" style={{ color }}>
                      {consumed.toFixed(1)}<span className="text-[11px] text-text-muted">/{target.toFixed(0)}{unit}</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="progress-fill" style={{
                      width: `${pct}%`, background: color,
                      boxShadow: pct > 5 ? `0 0 6px ${color}50` : 'none',
                    }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Today's food list */}
      <div className="mt-7">
        <div className="flex items-center gap-2 mb-3.5">
          <FiList size={14} className="text-text-muted" />
          <div className="text-[11px] font-semibold tracking-[0.8px] uppercase text-text-muted">
            Makanan Hari Ini
            {history.length > 0 && (
              <span className="text-primary font-bold ml-1.5">({history.length})</span>
            )}
          </div>
        </div>

        {loadingPage ? (
          <div className="skeleton h-20 rounded-xl" />
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[52px] px-6 gap-2.5 text-center bg-surface border border-dashed border-border-light rounded-2xl">
            <FiShoppingBag size={32} className="text-text-muted" />
            <p className="text-sm text-text-muted">Belum ada makanan yang dicatat hari ini.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {history.map(entry => (
              <div
                key={entry.id}
                className="bg-surface rounded-xl border border-border-light p-3.5 flex items-center gap-3 transition-colors duration-150 hover:border-border"
              >
                <div className="w-[38px] h-[38px] rounded-lg shrink-0 bg-primary-light border border-primary/20 flex items-center justify-center">
                  <FiShoppingBag size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-text-primary mb-1 overflow-hidden text-ellipsis whitespace-nowrap">{entry.namaMakanan}</div>
                  <div className="flex gap-2.5 flex-wrap">
                    {(['kalori', 'protein', 'karbo', 'lemak', 'serat'] as const).filter(k => (entry[k] ?? 0) > 0).map(k => {
                      const f = NUTRISI_FIELDS.find(n => n.key === k)!;
                      return (
                        <span key={k} className="text-[11px] font-medium" style={{ color: f.color }}>
                          {entry[k].toFixed(0)}{f.unit}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-kalori/20 bg-kalori/10 text-kalori shrink-0">
                  <FiZap size={10} /> {entry.kalori.toFixed(0)} kal
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && aiResult && (
        <div className="fixed h-screen overflow-y-hidden  inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
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
              <div className="flex justify-between items-start gap-2">
                <div>
                  <div className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.8px] mb-0.5">Makanan Terdeteksi</div>
                  <div className="text-[15px] font-bold text-text-primary">{aiResult.foodName}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.8px] mb-0.5">Porsi Standar</div>
                  <div className="text-xs font-medium text-text-secondary">{aiResult.portion}</div>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.8px] mb-1">Total Energi</div>
                <div className="text-2xl font-bold text-primary flex items-center gap-1.5 leading-none">
                  <FiZap size={20} />
                  {aiResult.calories} <span className="text-xs font-normal text-text-muted">kkal</span>
                </div>
              </div>

              {/* Nutrition details grid */}
              <div className="bg-surface-2 border border-border-light rounded-xl p-4 flex flex-col gap-3">
                <div className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.8px]">Estimasi Nilai Gizi</div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {[
                    { label: 'Protein', val: aiResult.protein, color: 'var(--c-protein)', unit: 'g' },
                    { label: 'Karbohidrat', val: aiResult.carbs, color: 'var(--c-karbo)', unit: 'g' },
                    { label: 'Lemak', val: aiResult.fat, color: 'var(--c-lemak)', unit: 'g' },
                    { label: 'Serat', val: aiResult.fiber, color: 'var(--c-serat)', unit: 'g' },
                  ].map(n => (
                    <div key={n.label} className="flex justify-between items-center text-xs">
                      <span className="text-text-secondary flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: n.color }} />
                        {n.label}
                      </span>
                      <span className="font-bold text-text-primary">{n.val} {n.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 bg-surface-2 border-t border-border-light flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setForm({
                    namaMakanan: aiResult.foodName,
                    kalori: aiResult.calories.toString(),
                    protein: aiResult.protein.toString(),
                    karbo: aiResult.carbs.toString(),
                    lemak: aiResult.fat.toString(),
                    serat: aiResult.fiber.toString()
                  });
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
                    const res = await dashboardApi.tambahKonsumsi({
                      namaMakanan: aiResult.foodName,
                      kalori: aiResult.calories,
                      protein: aiResult.protein,
                      karbo: aiResult.carbs,
                      lemak: aiResult.fat,
                      serat: aiResult.fiber
                    });
                    setHistory(prev => [res.data.data, ...prev]);
                    setDashData(prev => prev ? { ...prev, konsumsiHariIni: res.data.konsumsiHariIni } : prev);
                    setForm({ namaMakanan: '', kalori: '', protein: '', karbo: '', lemak: '', serat: '' });
                    showToast('success', `"${aiResult.foodName}" berhasil dicatat!`);
                  } catch {
                    showToast('error', 'Gagal mencatat makanan.');
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
