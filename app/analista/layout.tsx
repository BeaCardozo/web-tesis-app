'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { SidebarAnalista } from '../components/SidebarAnalista';

export default function AnalistaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { isCollapsed, isMobile } = useSidebar();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.role === 'Administrador') {
        router.push('/admin/dashboard');
      } else if (user?.role === 'Usuario') {
        router.push('/usuario/inicio');
      }
      // Si es Analista, se queda en /analista/*
    }
  }, [isLoading, isAuthenticated, user, router]);

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    );
  }

  // No mostrar nada si no está autenticado o no es analista
  if (!isAuthenticated || user?.role !== 'Analista') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarAnalista />
      {/* Contenido principal con margen dinámico para el sidebar */}
      <main className={`transition-all duration-300 ${
        isMobile
          ? 'ml-0 pt-16'
          : isCollapsed
            ? 'ml-20'
            : 'ml-[272px]'
      }`}>
        <div className="px-6 pt-10 pb-6">
          {children}
        </div>
      </main>
    </div>
  );
}
