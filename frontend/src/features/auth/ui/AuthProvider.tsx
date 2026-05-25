import { useEffect, type ReactNode } from 'react';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../model/authStore';

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setInitialized = useAuthStore((state) => state.setInitialized);

  useEffect(() => {
    const initAuth = async () => {
      if (!accessToken) {
        setInitialized(true);
        return;
      }

      try {
        const response = await authApi.me();

        setUser(response.user);
      } catch {
        clearAuth();
      } finally {
        setInitialized(true);
      }
    };

    initAuth();
  }, [accessToken, setUser, clearAuth, setInitialized]);

  return <>{children}</>;
}