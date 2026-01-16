'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggle: () => void;
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

const MOBILE_BREAKPOINT = 1024; // lg breakpoint

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Detectar tamaño de pantalla inicial
    const checkScreenSize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);

      // Solo establecer el estado inicial una vez
      if (!isInitialized) {
        setIsCollapsed(mobile);
        setIsInitialized(true);
      }
    };

    // Verificar tamaño inicial
    checkScreenSize();

    // Escuchar cambios de tamaño
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);

      // Auto-colapsar al cambiar a móvil
      if (mobile && !isCollapsed) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCollapsed, isInitialized]);

  const toggle = () => setIsCollapsed(!isCollapsed);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, toggle, isMobile }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar debe usarse dentro de un SidebarProvider');
  }
  return context;
}
