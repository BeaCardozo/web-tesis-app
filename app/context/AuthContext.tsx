'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { authApi, BackendUser, clearTokens, getMeForRestore, tryRefreshAccessToken } from '../lib/api';

// ============================================
// MAPEO DE ROLES BACKEND → FRONTEND
// ============================================
const ROLE_MAP: Record<string, UserRole> = {
  admin: 'Administrador',
  partner: 'Analista',
  consumer: 'Usuario',
};

function mapBackendUser(backendUser: BackendUser): User {
  const firstName = backendUser.firstName || '';
  const lastName = backendUser.lastName || '';
  const name = [firstName, lastName].filter(Boolean).join(' ') || backendUser.email;

  return {
    id: backendUser.id,
    name,
    email: backendUser.email,
    role: ROLE_MAP[backendUser.role] || 'Usuario',
    firstName: backendUser.firstName,
    lastName: backendUser.lastName,
    createdAt: backendUser.createdAt,
    status: backendUser.isActive ? 'activo' : 'inactivo',
  };
}

// ============================================
// TIPOS
// ============================================
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
}

// ============================================
// CONTEXTO
// ============================================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay sesión guardada al cargar
  useEffect(() => {
    const restoreSession = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!accessToken && !refreshToken) {
        setIsLoading(false);
        return;
      }

      if (!accessToken && refreshToken) {
        await tryRefreshAccessToken();
      }

      const me = await getMeForRestore();
      if (me.ok) {
        const mappedUser = mapBackendUser(me.user);
        setUser(mappedUser);
        localStorage.setItem('currentUser', JSON.stringify(mappedUser));
      } else if (me.reason === 'unauthorized') {
        clearTokens();
        localStorage.removeItem('currentUser');
      }
      // `network`: conservar tokens; el usuario puede reintentar al navegar

      setIsLoading(false);
    };

    void restoreSession();
  }, []);

  // ============================================
  // LOGIN
  // ============================================
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      await authApi.login(email, password);

      const me = await getMeForRestore();
      if (!me.ok) {
        if (me.reason === 'unauthorized') {
          clearTokens();
          localStorage.removeItem('currentUser');
        }
        setIsLoading(false);
        const message =
          me.reason === 'network'
            ? 'No se pudo cargar tu perfil. Revisa la conexión e inténtalo de nuevo.'
            : 'No se pudo obtener el perfil del usuario';
        return { success: false, error: message };
      }

      const mappedUser = mapBackendUser(me.user);
      setUser(mappedUser);
      localStorage.setItem('currentUser', JSON.stringify(mappedUser));
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
      return { success: false, error: message };
    }
  };

  // ============================================
  // LOGOUT
  // ============================================
  const logout = () => {
    authApi.logout();
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const refreshProfile = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    if (!accessToken && refreshToken) {
      await tryRefreshAccessToken();
    }
    if (!localStorage.getItem('accessToken')) return;

    const me = await getMeForRestore();
    if (!me.ok) {
      if (me.reason === 'unauthorized') {
        clearTokens();
        localStorage.removeItem('currentUser');
        setUser(null);
      }
      return;
    }
    const mappedUser = mapBackendUser(me.user);
    setUser(mappedUser);
    localStorage.setItem('currentUser', JSON.stringify(mappedUser));
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    refreshProfile,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============================================
// HOOK PERSONALIZADO
// ============================================
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
