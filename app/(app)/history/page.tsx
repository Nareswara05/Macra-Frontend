'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  FiClock, FiShoppingBag, FiActivity, FiZap, FiTrendingDown,
  FiFilter, FiCalendar, FiAlertCircle,
} from 'react-icons/fi';
import { dashboardApi } from '@/lib/api/dashboard';
import type { MakananEntry, AktivitasEntry } from '@/types';

type TabType = 'semua' | 'makanan' | 'aktivitas';

interface UnifiedEntry {
  id: string; type: 'makanan' | 'aktivitas';
  tanggal: string; nama: string; kalori: number;
  protein?: number; karbo?: number; lemak?: number; serat?: number;
}

const toUnified = (m: MakananEntry): UnifiedEntry =>
  ({ id: `m-${m.id}`, type: 'makanan', tanggal: m.tanggal, nama: m.namaMakanan, kalori: m.kalori, protein: m.protein, karbo: m.karbo, lemak: m.lemak, serat: m.serat });

const toUnifiedAkt = (a: AktivitasEntry): UnifiedEntry =>
  ({ id: `a-${a.id}`, type: 'aktivitas', tanggal: a.tanggal, nama: a.namaAktivitas, kalori: a.kalori });

function groupByDate(entries: UnifiedEntry[]): [string, UnifiedEntry[]][] {
  const map: Record<string, UnifiedEntry[]> = {};
  entries.forEach(e => { (map[e.tanggal] ??= []).push(e); });
  return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
}

function formatDate(d: string) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (d === today) return 'Hari Ini';
  if (d === yesterday) return 'Kemarin';
  return new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function HistoryPage() {
  const [makanan, setMakanan] = useState<MakananEntry[]>([]);
  const [aktivitas, setAktivitas] = useState<AktivitasEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<TabType>('semua');
  const [filterDate, setFilterDate] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await dashboardApi.getHistory();
      setMakanan(res.data.data.makanan);
      setAktivitas(res.data.data.aktivitas);
    } catch { setError('Gagal memuat riwayat.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const allEntries = useMemo<UnifiedEntry[]>(() => {
    let entries: UnifiedEntry[] = [];
    if (tab !== 'aktivitas') entries.push(...makanan.map(toUnified));
    if (tab !== 'makanan') entries.push(...aktivitas.map(toUnifiedAkt));
    if (filterDate) entries = entries.filter(e => e.tanggal === filterDate);
    return entries.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [makanan, aktivitas, tab, filterDate]);

  const grouped = useMemo(() => groupByDate(allEntries), [allEntries]);

  const stats = useMemo(() => ({
    totalMakanan: makanan.length,
    totalAktivitas: aktivitas.length,
    kaloriMasuk: makanan.reduce((s, m) => s + m.kalori, 0),
    kaloriTerbakar: aktivitas.reduce((s, a) => s + a.kalori, 0),
  }), [makanan, aktivitas]);

  const tabs: { key: TabType; label: string; Icon: React.ElementType; count: number }[] = [
    { key: 'semua', label: 'Semua', Icon: FiClock, count: makanan.length + aktivitas.length },
    { key: 'makanan', label: 'Makanan', Icon: FiShoppingBag, count: makanan.length },
    { key: 'aktivitas', label: 'Aktivitas', Icon: FiActivity, count: aktivitas.length },
  ];

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-[-0.4px] text-text-primary flex items-center gap-2 mb-1">
          <FiClock size={21} className="text-primary" /> Riwayat
        </h1>
        <p className="text-[13px] text-text-muted">Semua catatan makanan dan aktivitas kamu</p>
      </div>

      {/* Summary stats */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-[22px]">
          {[
            { label: 'Total Makanan', value: stats.totalMakanan, unit: 'entri', color: 'var(--primary)', bg: 'var(--primary-light)', border: 'rgba(63,185,80,0.2)', Icon: FiShoppingBag },
            { label: 'Total Aktivitas', value: stats.totalAktivitas, unit: 'sesi', color: 'var(--c-burned)', bg: 'var(--c-burned-bg)', border: 'rgba(34,211,238,0.2)', Icon: FiActivity },
            { label: 'Kalori Masuk', value: Math.round(stats.kaloriMasuk), unit: 'kal', color: 'var(--c-kalori)', bg: 'var(--c-kalori-bg)', border: 'rgba(255,146,43,0.2)', Icon: FiZap },
            { label: 'Kalori Bakar', value: Math.round(stats.kaloriTerbakar), unit: 'kal', color: 'var(--c-burned)', bg: 'var(--c-burned-bg)', border: 'rgba(34,211,238,0.2)', Icon: FiTrendingDown },
          ].map(({ label, value, unit, color, bg, border, Icon }) => (
            <div key={label} className="bg-surface rounded-xl border p-3.5 flex items-center gap-2.5" style={{ borderColor: border }}>
              <div className="w-[34px] h-[34px] rounded-lg shrink-0 flex items-center justify-center" style={{ background: bg, color }}>
                <Icon size={16} />
              </div>
              <div>
                <div className="text-[11px] text-text-muted mb-0.5">{label}</div>
                <div className="text-[17px] font-bold leading-none" style={{ color }}>
                  {value} <span className="text-[11px] font-normal text-text-muted ml-0.5">{unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter row */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex gap-1 bg-surface-2 p-1 rounded-xl border border-border-light">
          {tabs.map(({ key, label, Icon, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={[
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer transition-all",
                tab === key
                  ? "bg-primary text-bg"
                  : "bg-transparent text-text-secondary hover:bg-white/[0.04] hover:text-text-primary"
              ].join(' ')}
            >
              <Icon size={13} /> {label}
              {count > 0 && (
                <span className={[
                  "min-w-4.5 h-4.5 rounded-full px-1 text-[10px] font-bold flex items-center justify-center ml-1",
                  tab === key ? "bg-bg text-primary" : "bg-border-light text-text-muted"
                ].join(' ')}>{count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          <FiCalendar size={14} className="text-text-muted" />
          <input type="date"
            className="w-auto px-2.5 py-1.5 rounded-lg border-[1.5px] border-border bg-surface-2 text-text-primary text-[13px] outline-none transition-all duration-150 focus:border-primary focus:bg-surface"
            value={filterDate} onChange={e => setFilterDate(e.target.value)}
          />
          {filterDate && (
            <button className="flex items-center justify-center p-1.5 rounded-lg text-text-muted hover:bg-surface-2 hover:text-text-primary cursor-pointer text-xs" onClick={() => setFilterDate('')}>✕</button>
          )}
        </div>
      </div>

      {filterDate && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-primary/20 bg-primary-light text-primary text-sm mb-4">
          <FiFilter size={14} className="shrink-0" />
          Filter: {new Date(filterDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg border border-lemak/25 bg-lemak/8 text-lemak text-sm mb-4">
          <FiAlertCircle size={15} className="shrink-0" />{error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col gap-5">
          {[1, 2].map(i => (
            <div key={i}>
              <div className="skeleton h-3.5 w-[150px] mb-3" />
              {[1, 2, 3].map(j => <div key={j} className="skeleton h-[68px] rounded-xl mb-2" />)}
            </div>
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[52px] px-6 gap-2.5 text-center bg-surface border border-dashed border-border-light rounded-2xl">
          <FiClock size={40} className="text-text-muted" />
          <p className="text-[15px] font-semibold text-text-secondary">Tidak ada riwayat ditemukan</p>
          <p className="text-sm text-text-muted">{filterDate ? 'Coba pilih tanggal lain atau hapus filter.' : 'Mulai catat makanan dan aktivitasmu!'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-7">
          {grouped.map(([date, entries]) => {
            const dayMasuk = entries.filter(e => e.type === 'makanan').reduce((s, e) => s + e.kalori, 0);
            const dayTerbakar = entries.filter(e => e.type === 'aktivitas').reduce((s, e) => s + e.kalori, 0);
            return (
              <div key={date}>
                {/* Date header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border-light">
                  <div className="text-sm font-bold text-text-primary">
                    {formatDate(date)}
                    <span className="text-xs font-normal text-text-muted ml-2">
                      {entries.length} entri
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {dayMasuk > 0 && (
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-kalori/20 bg-kalori/10 text-kalori">
                        <FiZap size={10} /> {Math.round(dayMasuk)} masuk
                      </div>
                    )}
                    {dayTerbakar > 0 && (
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-burned/20 bg-burned/10 text-burned">
                        <FiTrendingDown size={10} /> {Math.round(dayTerbakar)} bakar
                      </div>
                    )}
                  </div>
                </div>

                {/* Entries */}
                <div className="flex flex-col gap-1.5">
                  {entries.map(entry => {
                    const isMakan = entry.type === 'makanan';
                    return (
                      <div
                        key={entry.id}
                        className={[
                          "bg-surface rounded-xl p-3 px-4 flex items-center gap-3 border transition-colors duration-150",
                          isMakan
                            ? "border-border-light hover:border-primary/25 hover:bg-surface-2"
                            : "border-burned/12 hover:border-burned/30 hover:bg-surface-2"
                        ].join(' ')}
                      >
                        <div className={[
                          "w-9 h-9 rounded-lg shrink-0 flex items-center justify-center border",
                          isMakan
                            ? "bg-primary-light border-primary/20"
                            : "bg-burned-bg border-burned/20"
                        ].join(' ')}>
                          {isMakan
                            ? <FiShoppingBag size={15} className="text-primary" />
                            : <FiActivity size={15} className="text-burned" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-text-primary overflow-hidden text-ellipsis whitespace-nowrap">
                            {entry.nama}
                          </div>
                          {isMakan && entry.protein !== undefined && (
                            <div className="flex gap-2 mt-0.5 flex-wrap">
                              {[
                                { label: 'P', val: entry.protein, color: 'var(--c-protein)' },
                                { label: 'K', val: entry.karbo, color: 'var(--c-karbo)' },
                                { label: 'L', val: entry.lemak, color: 'var(--c-lemak)' },
                                { label: 'S', val: entry.serat, color: 'var(--c-serat)' },
                              ].filter(n => (n.val ?? 0) > 0).map(n => (
                                <span key={n.label} className="text-[11px] font-medium" style={{ color: n.color }}>
                                  {n.label}: {(n.val ?? 0).toFixed(0)}g
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <div className={[
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                            isMakan
                              ? "border-kalori/20 bg-kalori/10 text-kalori"
                              : "border-burned/20 bg-burned/10 text-burned"
                          ].join(' ')}>
                            {isMakan ? <FiZap size={10} /> : <FiTrendingDown size={10} />}
                            {entry.kalori.toFixed(0)} kal
                          </div>
                          <div className="text-[10px] text-text-muted mt-1">
                            {isMakan ? 'masuk' : 'terbakar'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
