'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { RoleSidebar, type NavItem } from './RoleSidebar';
import { FxRateDisplay } from './FxRateDisplay';
import { FooterCompact } from './Footer';
import type { UserRole } from '../types';

// Home por rol — destino al que se redirige si el usuario está autenticado
// pero abrió una sección que no le corresponde.
const ROLE_HOME: Record<UserRole, string> = {
  Administrador: '/admin/dashboard',
  Analista: '/analista/dashboard',
  Usuario: '/usuario/inicio',
};

interface RoleLayoutProps {
  /** Rol que esta sección espera. Si el usuario tiene otro rol, se redirige a su home. */
  role: UserRole;
  sidebarItems: NavItem[];
  sidebarSubtitle: string;
  /** Pásalo a true cuando los subpaths deban resaltar el item padre (p. ej. /usuario/producto/[id]). */
  matchSubpaths?: boolean;
  /** Muestra el badge de tasa USD→Bs sobre el contenido. Sólo aplica a admin y analista. */
  showFxRate?: boolean;
  children: React.ReactNode;
}

export function RoleLayout({
  role,
  sidebarItems,
  sidebarSubtitle,
  matchSubpaths = false,
  showFxRate = false,
  children,
}: RoleLayoutProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { isCollapsed, isMobile } = useSidebar();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user && user.role !== role) {
      router.push(ROLE_HOME[user.role]);
    }
  }, [isLoading, isAuthenticated, user, role, router]);

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

  if (!isAuthenticated || user?.role !== role) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RoleSidebar
        items={sidebarItems}
        subtitle={sidebarSubtitle}
        matchSubpaths={matchSubpaths}
      />
      <main
        className={`min-h-screen flex flex-col transition-all duration-300 ${
          isMobile ? 'ml-0 pt-16' : isCollapsed ? 'ml-20' : 'ml-[272px]'
        }`}
      >
        <div className="flex-1 px-6 pt-10 pb-6">
          {showFxRate && (
            <div className="max-w-5xl mx-auto flex justify-end mb-4">
              <FxRateDisplay />
            </div>
          )}
          {children}
        </div>
        <FooterCompact />
      </main>
    </div>
  );
}
