'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { SidebarProvider } from '../context/SidebarContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <SidebarProvider>
        {children}
      </SidebarProvider>
    </AuthProvider>
  );
}
