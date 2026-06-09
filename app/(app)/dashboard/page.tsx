'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  FiZap, FiTarget, FiPackage, FiDroplet, FiFeather,
  FiTrendingDown, FiActivity, FiRefreshCw, FiAlertCircle,
} from 'react-icons/fi';
import { dashboardApi } from '@/lib/api/dashboard';
import { useAuth } from '@/contexts/AuthContext';
import type { DashboardData } from '@/types';

const NUTRIENTS = [
  { key: 'protein' as const, label: 'Protein',     unit: 'g', Icon: FiTarget,  color: 'var(--c-protein)', bg: 'var(--c-protein-bg)' },
  { key: 'karbo'   as const, label: 'Karbohidrat', unit: 'g', Icon: FiPackage, color: 'var(--c-karbo)',   bg: 'var(--c-karbo-bg)'   },
  { key: 'lemak'   as const, label: 'Lemak',        unit: 'g', Icon: FiDroplet, color: 'var(--c-lemak)',   bg: 'var(--c-lemak-bg)'   },
  { key: 'serat'   as const, label: 'Serat',        unit: 'g', Icon: FiFeather, color: 'var(--c-serat)',   bg: 'var(--c-serat-bg)'   },
];

function CalorieRing({ consumed, burned, target }: { consumed: number; burned: number; target: number }) {
  const net   = Math.max(consumed - burned, 0);
  const pct   = Math.min((net / target) * 100, 100);
  const r     = 70;
  const circ  = 2 * Math.PI * r;
  const isOver = net > target;

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="relative w-46 h-46">
        {/* Glow behind SVG */}
        <div 
          className="absolute inset-5 rounded-full pointer-events-none"
          style={{
            background: isOver
              ? 'radial-gradient(circle, rgba(251,132,132,0.08) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255,146,43,0.08) 0%, transparent 70%)',
          }} 
        />
        <svg width="184" height="184" className="rotate-[-90deg]">
          {/* Track */}
          <circle cx="92" cy="92" r={r} fill="none" stroke="#21262d" strokeWidth="14" />
          {/* Progress */}
          <circle
            cx="92" cy="92" r={r} fill="none" strokeLinecap="round" strokeWidth="14"
            stroke={isOver ? 'var(--c-lemak)' : 'var(--c-kalori)'}
            strokeDasharray={`${(pct / 100) * circ} ${circ}`}
            style={{
              transition: 'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)',
              filter: `drop-shadow(0 0 6px ${isOver ? 'rgba(251,132,132,0.5)' : 'rgba(255,146,43,0.4)'})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="text-[10px] text-text-muted tracking-[0.8px] uppercase">Net Kalori</span>
          <span 
            className="text-3xl font-bold leading-none"
            style={{ color: isOver ? 'var(--c-lemak)' : '#e6edf3' }}
          >
            {Math.round(net)}
          </span>
          <span className="text-[11px] text-text-muted">dari {Math.round(target)}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-x-4 gap-y-2 w-full text-xs">
        {[
          { label: 'Masuk',    value: Math.round(consumed), color: 'var(--c-kalori)' },
          { label: 'Terbakar', value: Math.round(burned),   color: 'var(--c-burned)' },
          { label: 'Sisa',     value: Math.abs(Math.round(target - net)), color: isOver ? 'var(--c-lemak)' : 'var(--primary)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center">
            <div className="text-text-muted mb-0.5">{label}</div>
            <div className="font-bold text-base" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NutrientCard({ label, consumed, target, unit, Icon, color, bg }: {
  label: string; consumed: number; target: number; unit: string;
  Icon: React.ElementType; color: string; bg: string;
}) {
  const pct = Math.min((consumed / target) * 100, 100);
  return (
    <div 
      className="w-full bg-surface rounded-xl border border-border p-5 md:p-6 transition-colors duration-200 hover:border-[var(--hover-color)]"
      style={{ '--hover-color': color } as React.CSSProperties}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg, color }}>
          <Icon size={15} />
        </div>
        <span className="text-[13px] font-semibold flex-1 text-text-primary">{label}</span>
        <div className="text-right">
          <span className="text-base font-bold" style={{ color }}>{consumed.toFixed(1)}</span>
          <span className="text-[11px] text-text-muted">/{target.toFixed(0)}{unit}</span>
        </div>
      </div>
      <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
        <div className="progress-fill" style={{
          width: `${pct}%`, background: color,
          boxShadow: pct > 10 ? `0 0 8px ${color}40` : 'none',
        }} />
      </div>
      <div className="mt-1.5 text-[11px] text-text-muted">
        {pct.toFixed(0)}% · sisa {Math.max(0, target - consumed).toFixed(1)}{unit}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { updateUser } = useAuth();
  const [data, setData]     = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  const tanggal = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const hour    = new Date().getHours();
  const greeting = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : hour < 19 ? 'Selamat sore' : 'Selamat malam';

  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await dashboardApi.getDashboard();
      setData(res.data.data);
      if (res.data.data.user) updateUser(res.data.data.user);
    } catch { setError('Gagal memuat data.'); }
    finally { setLoading(false); }
  }, [updateUser]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return (
    <div className="p-6 md:p-10 pb-24 md:pb-16 flex flex-col gap-6">
      <div className="skeleton h-[30px] w-[300px]" />
      <div className="skeleton h-[14px] w-[200px]" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="skeleton h-[360px] rounded-2xl" />
        <div className="skeleton h-[360px] rounded-2xl" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-[110px] rounded-xl" />)}
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-lemak/25 bg-lemak/8 text-lemak text-sm mb-4">
        <FiAlertCircle size={15} className="shrink-0" />{error}
      </div>
      <button 
        className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary text-bg text-sm font-medium transition-all hover:bg-primary-hover hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(63,185,80,0.3)] active:translate-y-0 cursor-pointer" 
        onClick={loadData}
      >
        <FiRefreshCw size={13} /> Coba Lagi
      </button>
    </div>
  );

  if (!data) return null;

  const { kebutuhanNutrisi: kb, konsumsiHariIni: ki, sisaKebutuhan: sisa } = data;
  const burned      = ki.kaloriTerbakar ?? 0;
  const displayName = data.user?.nama || data.user?.email?.split('@')[0] || 'Pengguna';

  return (
    <div className="p-6 md:p-10 pb-24 md:pb-16 animate-fade-in">
      {/* Header */}
      <div className="mb-7 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.5px] text-text-primary mb-1.2">
            {greeting},{' '}
            <span className="text-gradient">{displayName}</span>{' '}👋
          </h1>
          <p className="text-[13px] text-text-muted">{tanggal}</p>
        </div>
        <button 
          onClick={loadData} 
          className="inline-flex items-center justify-center gap-1.5 px-[13px] py-1.5 rounded-lg text-[13px] font-medium text-text-secondary transition-all hover:bg-surface-2 hover:text-text-primary cursor-pointer"
        >
          <FiRefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Main 2-col */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-[18px]">
        {/* Calorie ring card */}
        <div className="bg-surface rounded-2xl border border-border p-6 md:p-8 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-6">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.8px] uppercase text-text-muted mb-1">Kalori Hari Ini</div>
              <div className="inline-flex items-center gap-1.2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-kalori/20 bg-kalori/10 text-kalori">
                <FiZap size={11} /> {Math.round((ki.kalori / kb.kalori) * 100)}% tercapai
              </div>
            </div>
            {burned > 0 && (
              <div className="inline-flex items-center gap-1.2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-burned/20 bg-burned/10 text-burned">
                <FiTrendingDown size={11} /> −{Math.round(burned)} terbakar
              </div>
            )}
          </div>
          <CalorieRing consumed={ki.kalori} burned={burned} target={kb.kalori} />
        </div>

        {/* Sisa kebutuhan */}
        <div className="bg-surface rounded-2xl border border-border p-6 md:p-8">
          <div className="text-[11px] font-semibold tracking-[0.8px] uppercase text-text-muted mb-4">Sisa Kebutuhan</div>
          <div className="flex flex-col gap-3">
            {([
              { label: 'Kalori', value: Math.max(0, sisa.kalori), unit: 'kal', color: 'var(--c-kalori)' },
              { label: 'Protein', value: Math.max(0, sisa.protein), unit: 'g', color: 'var(--c-protein)' },
              { label: 'Karbohidrat', value: Math.max(0, sisa.karbo), unit: 'g', color: 'var(--c-karbo)' },
              { label: 'Lemak', value: Math.max(0, sisa.lemak), unit: 'g', color: 'var(--c-lemak)' },
              { label: 'Serat', value: Math.max(0, sisa.serat), unit: 'g', color: 'var(--c-serat)' },
            ] as const).map(({ label, value, unit, color }) => (
              <div key={label} className="flex items-center justify-between py-2.5 border-b border-border-light">
                <span className="text-[13px] text-text-secondary">{label}</span>
                <span className="text-[15px] font-bold" style={{ color }}>
                  {value.toFixed(1)}<span className="text-[11px] font-normal text-text-muted ml-0.5">{unit}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            <Link href="/konsumsi" className="flex-1">
              <button className="w-full inline-flex items-center justify-center gap-1.5 px-[13px] py-1.5 rounded-lg text-[13px] font-medium transition-all bg-primary text-bg hover:bg-primary-hover hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(63,185,80,0.3)] active:translate-y-0 cursor-pointer">
                <FiZap size={13} /> Catat Makan
              </button>
            </Link>
            <Link href="/aktivitas">
              <button className="inline-flex items-center justify-center gap-1.5 px-[13px] py-1.5 rounded-lg text-[13px] font-medium transition-all bg-burned/10 text-burned border border-burned/20 hover:bg-burned/18 cursor-pointer">
                <FiActivity size={13} />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Nutrient cards */}
      <div className="text-[11px] font-semibold tracking-[0.8px] uppercase text-text-muted mb-3">Detail Nutrisi</div>
      <div className="flex w-full flex-col lg:flex-row gap-3">
        {NUTRIENTS.map(n => (
          <NutrientCard
            key={n.key} label={n.label} unit={n.unit} Icon={n.Icon} color={n.color} bg={n.bg}
            consumed={ki[n.key] ?? 0} target={kb[n.key] ?? 1}
          />
        ))}
      </div>
    </div>
  );
}
