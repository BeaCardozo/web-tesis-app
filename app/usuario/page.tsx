'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UsuarioRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/usuario/inicio');
  }, [router]);

  return null;
}
