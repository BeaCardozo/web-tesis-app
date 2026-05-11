'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { FxProvider } from '../context/FxContext';
import { SidebarProvider } from '../context/SidebarContext';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <FxProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </FxProvider>
    </AuthProvider>
  );
}
