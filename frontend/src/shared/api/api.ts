import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

type AuthResponse = {
  access_token: string;
};

type RetryRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is not defined');
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;

let refreshQueue: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshQueue.push(callback);
};

const notifyTokenRefreshed = (token: string) => {
  refreshQueue.forEach((callback) => callback(token));
  refreshQueue = [];
};

const refreshAccessToken = async () => {
  const response = await axios.post<AuthResponse>(
    `${API_BASE_URL}/auth/refresh`,
    {},
    {
      withCredentials: true,
    }
  );

  return response.data.access_token;
};

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isUnauthorized = error.response?.status === 401;

    const isAuthRequest =
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh');

    if (!isUnauthorized || originalRequest._retry || isAuthRequest) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const newAccessToken = await refreshAccessToken();

      localStorage.setItem('access_token', newAccessToken);

      api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      notifyTokenRefreshed(newAccessToken);

      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem('access_token');

      window.location.href = '/login';

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
