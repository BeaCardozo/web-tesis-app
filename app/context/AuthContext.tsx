'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, mockUsers } from '../data/mockData';

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
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  // ============================================
  // LOGIN
  // En producción: Reemplazar con llamada a API
  // ============================================
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 500));

    // TODO: Reemplazar con llamada a API
    // const response = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   body: JSON.stringify({ email, password }),
    // });

    // Buscar usuario en datos mock
    const foundUser = mockUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (foundUser) {
      // Crear objeto de usuario sin password para guardar
      const userWithoutPassword = { ...foundUser };
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { success: false, error: 'Email o contraseña incorrectos' };
  };

  // ============================================
  // LOGOUT
  // En producción: Agregar llamada a API para invalidar token
  // ============================================
  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    // TODO: Llamar a API para invalidar sesión
    // await fetch('/api/auth/logout', { method: 'POST' });
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
