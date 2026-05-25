import { api } from '../../../shared/api/api';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  MeResponse,
} from '../../users/model/types';

export const authApi = {
  async login(data: LoginRequest) {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterRequest) {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  async me() {
    const response = await api.get<MeResponse>('/auth/me');
    return response.data;
  },

  async logout() {
    await api.post('/auth/logout');
  },
};
