import { create } from 'zustand';

import type { User } from '../../users/model/types';

type AuthState = {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: User | null) => void;
  clearAuth: () => void;
  setInitialized: (value: boolean) => void;
};

const getInitialAccessToken = () => localStorage.getItem('access_token');

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: getInitialAccessToken(),
  isAuthenticated: Boolean(getInitialAccessToken()),
  isInitialized: false,

  setAuth: (user, accessToken) => {
    localStorage.setItem('access_token', accessToken);

    set({
      user,
      accessToken,
      isAuthenticated: true,
    });
  },

  setAccessToken: (accessToken) => {
    localStorage.setItem('access_token', accessToken);

    set({
      accessToken,
      isAuthenticated: true,
    });
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: Boolean(user),
    });
  },

  clearAuth: () => {
    localStorage.removeItem('access_token');

    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },

  setInitialized: (value) => {
    set({
      isInitialized: value,
    });
  },
}));
