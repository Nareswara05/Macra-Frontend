export interface User {
  id: number;
  nama?: string;
  email: string;
  gender?: string;
  beratBadan: number;
  tinggiBadan: number;
  tanggalLahir: string;
  target: string;
  jenisKegiatan: string;
}

export interface NutrisiData {
  kalori: number;
  protein: number;
  karbo: number;
  lemak: number;
  serat: number;
}

export interface KonsumsiHariIni extends NutrisiData {
  tanggal: string;
  kaloriTerbakar: number;
}

export interface DashboardData {
  user: User;
  kebutuhanNutrisi: NutrisiData;
  konsumsiHariIni: KonsumsiHariIni;
  sisaKebutuhan: NutrisiData;
}

export interface AuthResponse {
  status: string;
  message: string;
  token: string;
  data: User;
}

export interface DashboardResponse {
  status: string;
  data: DashboardData;
}

export interface MakananEntry {
  id: number;
  userId: number;
  namaMakanan: string;
  kalori: number;
  protein: number;
  karbo: number;
  lemak: number;
  serat: number;
  tanggal: string;
}

export interface AktivitasEntry {
  id: number;
  userId: number;
  namaAktivitas: string;
  kalori: number;
  tanggal: string;
}

export interface HistoryData {
  makanan: MakananEntry[];
  aktivitas: AktivitasEntry[];
}
