import api from './instance';
import type { AuthResponse } from '@/types';

export interface RegisterPayload {
  nama: string;
  email: string;
  password: string;
  gender: string;
  beratBadan: number;
  tinggiBadan: number;
  tanggalLahir: string;
  target: string;
  jenisKegiatan: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  gender?: string;
  beratBadan?: number;
  tinggiBadan?: number;
  tanggalLahir?: string;
  target?: string;
  jenisKegiatan?: string;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', payload),

  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', payload),

  updateProfile: (payload: UpdateProfilePayload) =>
    api.put<{ status: string; message: string; data: AuthResponse['data'] }>(
      '/auth/profile',
      payload
    ),
};
