'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../data/mockData';
import { authApi, BackendUser, clearTokens } from '../lib/api';

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
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const backendUser = await authApi.getMe();
        const mappedUser = mapBackendUser(backendUser);
        setUser(mappedUser);
        localStorage.setItem('currentUser', JSON.stringify(mappedUser));
      } catch {
        // Token inválido o expirado, limpiar sesión
        clearTokens();
        localStorage.removeItem('currentUser');
      }

      setIsLoading(false);
    };

    restoreSession();
  }, []);

  // ============================================
  // LOGIN
  // ============================================
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      // 1. Obtener tokens del backend
      await authApi.login(email, password);

      // 2. Obtener perfil del usuario con su rol
      const backendUser = await authApi.getMe();
      const mappedUser = mapBackendUser(backendUser);

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

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
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
