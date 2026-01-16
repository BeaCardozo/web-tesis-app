'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { Sidebar } from '../components/Sidebar';

export default function AdminLayout({
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
      } else if (user?.role !== 'Administrador') {
        // Si no es admin, redirigir a la vista de usuario
        router.push('/usuario');
      }
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

  // No mostrar nada si no está autenticado o no es admin
  if (!isAuthenticated || user?.role !== 'Administrador') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      {/* Contenido principal con margen dinámico para el sidebar */}
      <main className={`transition-all duration-300 ${
        isMobile
          ? 'ml-0 pt-16'
          : isCollapsed
            ? 'ml-20'
            : 'ml-64'
      }`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
