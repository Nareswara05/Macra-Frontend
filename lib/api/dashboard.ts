import api from './instance';
import type {
  DashboardResponse,
  NutrisiData,
  MakananEntry,
  AktivitasEntry,
  HistoryData,
  KonsumsiHariIni,
} from '@/types';

// ── Payload types ──────────────────────────────────────────────

export interface TambahKonsumsiPayload extends Partial<NutrisiData> {
  namaMakanan: string;
}

export interface TambahAktivitasPayload {
  namaAktivitas: string;
  kalori: number;
}

// ── Response types ─────────────────────────────────────────────

export interface TambahKonsumsiResponse {
  status: string;
  message: string;
  data: MakananEntry;
  konsumsiHariIni: KonsumsiHariIni;
}

export interface TambahAktivitasResponse {
  status: string;
  message: string;
  data: AktivitasEntry;
  konsumsiHariIni: KonsumsiHariIni;
}

// ── API calls ──────────────────────────────────────────────────

export const dashboardApi = {
  getDashboard: () =>
    api.get<DashboardResponse>('/dashboard'),

  tambahKonsumsi: (payload: TambahKonsumsiPayload) =>
    api.post<TambahKonsumsiResponse>('/dashboard/tambah-konsumsi', payload),

  tambahAktivitas: (payload: TambahAktivitasPayload) =>
    api.post<TambahAktivitasResponse>('/dashboard/tambah-aktivitas', payload),

  getHistory: () =>
    api.get<{ status: string; data: HistoryData }>('/dashboard/history'),

  getHistoryMakanan: () =>
    api.get<{ status: string; data: MakananEntry[] }>('/dashboard/history/makanan'),

  getHistoryAktivitas: () =>
    api.get<{ status: string; data: AktivitasEntry[] }>('/dashboard/history/aktivitas'),
};
