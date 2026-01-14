'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { ShoppingCart, LogOut } from 'lucide-react';

export default function UserPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-lighter via-primary-lightest to-accent-pastel-light">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-button-green" size={28} />
            <span className="font-bold text-lg text-accent-green-dark">
              CaracasAhorra
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Hola, <strong>{user?.name}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut size={18} />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Vista de Usuario
          </h1>
          <p className="text-gray-600 mb-6">
            Esta es la vista para usuarios normales. Aquí podrán buscar productos
            y comparar precios entre supermercados.
          </p>
          <div className="inline-block px-4 py-2 bg-primary/20 text-accent-green-dark rounded-full text-sm">
            Rol: {user?.role}
          </div>
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <p className="text-gray-500">
              Esta vista se desarrollará más adelante con las funcionalidades
              de búsqueda y comparación de productos.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
