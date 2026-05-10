'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, X, LayoutGrid } from 'lucide-react';
import { categoriesApi, ApiCategory } from '../../lib/api';
import { getCategoryIcon } from '../../lib/categoryIcons';

export default function CategoriasPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    setLoadError('');
    categoriesApi
      .list()
      .then(setCategories)
      .catch((e: unknown) => {
        setLoadError(e instanceof Error ? e.message : 'Error al cargar categorías');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const withProducts = categories
      .filter(c => c.productCount > 0)
      .sort((a, b) => b.productCount - a.productCount);

    if (!searchQuery.trim()) return withProducts;
    const query = searchQuery.toLowerCase();
    return withProducts.filter(c => c.name.toLowerCase().includes(query));
  }, [categories, searchQuery]);

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/usuario/productos?categoria=${categoryId}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>
        <p className="text-gray-500 mt-1">
          Explora productos organizados por categoría
        </p>
      </div>

      {loadError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
          {loadError}
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar categorías..."
          className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-gray-100 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-button-green/30 focus:border-button-green shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Contenido */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-button-green" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <LayoutGrid size={28} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">No se encontraron categorías</p>
          <p className="text-gray-400 text-sm mt-1">Intenta con otro término de búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((cat) => {
            const Icon = getCategoryIcon(cat.name);
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="group flex flex-col items-center text-center gap-3 p-6 bg-white rounded-2xl border border-gray-100 hover:border-button-green/30 hover:shadow-lg transition-all"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-button-green/15 to-accent-teal/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon size={24} className="text-button-green" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-button-green transition-colors leading-tight">
                    {cat.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {cat.productCount} producto{cat.productCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
