'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  SlidersHorizontal,
  X,
  Package,
  ShoppingCart,
  DollarSign,
  ChevronDown,
  ArrowUpDown,
  Loader2,
} from 'lucide-react';
import {
  productsApi,
  categoriesApi,
  ApiProduct,
  ApiCategory,
} from '../../lib/api';
import { formatPrice, EXCHANGE_RATE } from '../../data/userMockData';
import { Pagination } from '../../components/Pagination';
import { usePagination } from '../../hooks/usePagination';

type SortOption = 'nameAsc' | 'nameDesc' | 'priceAsc' | 'priceDesc';

const SORT_LABELS: Record<SortOption, string> = {
  nameAsc: 'Nombre: A - Z',
  nameDesc: 'Nombre: Z - A',
  priceAsc: 'Precio: Menor a Mayor',
  priceDesc: 'Precio: Mayor a Menor',
};

function getSavingsText(product: ApiProduct): number {
  const snap = product.priceSnapshot;
  if (!snap?.cheapestPriceUsd) return 0;
  // Sin datos de precio máximo en el snapshot del listado, no podemos calcular ahorro
  return 0;
}

export default function ProductosPage() {
  return (
    <Suspense>
      <ProductosContent />
    </Suspense>
  );
}

function ProductosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState(searchParams.get('buscar') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoria') || '');
  const [sortBy, setSortBy] = useState<SortOption>('nameAsc');
  const [showFilters, setShowFilters] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'Bs'>('USD');

  // Paginación del API
  const [apiPage, setApiPage] = useState(1);
  const [apiLimit, setApiLimit] = useState(12);
  const totalPages = Math.ceil(totalProducts / apiLimit);

  // Cargar categorías una sola vez
  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => {});
  }, []);

  // Cargar productos cuando cambian filtros
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await productsApi.list({
          page: apiPage,
          limit: apiLimit,
          search: searchQuery || undefined,
          category: selectedCategory || undefined,
          sortBy: sortBy,
        });
        setProducts(data.items);
        setTotalProducts(data.total);
      } catch {
        setError('Error al cargar productos. Verifica que el servidor esté corriendo.');
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce para la búsqueda
    const timeout = setTimeout(fetchProducts, searchQuery ? 400 : 0);
    return () => clearTimeout(timeout);
  }, [apiPage, apiLimit, searchQuery, selectedCategory, sortBy]);

  // Reset página al cambiar filtros
  useEffect(() => {
    setApiPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('nameAsc');
  };

  const hasActiveFilters = !!selectedCategory || sortBy !== 'nameAsc';

  // Categorías que tienen productos (filtrar las que son subcategorías con productos)
  const leafCategories = useMemo(() => {
    return categories.filter(c => c.productCount > 0).sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
          <p className="text-gray-500 mt-1">
            {totalProducts} producto{totalProducts !== 1 ? 's' : ''} encontrado{totalProducts !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Selector de moneda */}
          <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1">
            <button
              onClick={() => setCurrency('USD')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currency === 'USD'
                  ? 'bg-button-green text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <DollarSign size={14} />
              USD
            </button>
            <button
              onClick={() => setCurrency('Bs')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currency === 'Bs'
                  ? 'bg-button-green text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Bs
            </button>
          </div>
        </div>
      </div>

      {/* Barra de busqueda y filtros */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Busqueda */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-button-green/30 focus:border-button-green"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Boton filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-button-green text-white border-button-green'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal size={18} />
            Filtros
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-white rounded-full" />
            )}
          </button>

          {/* Ordenar */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none w-full sm:w-48 pl-10 pr-8 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm outline-none focus:ring-2 focus:ring-button-green/30 focus:border-button-green cursor-pointer"
            >
              {Object.entries(SORT_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Categoria</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-button-green/30 focus:border-button-green cursor-pointer"
              >
                <option value="">Todas las categorías</option>
                {leafCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.productCount})
                  </option>
                ))}
              </select>
            </div>

            {/* Limpiar filtros */}
            {hasActiveFilters && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <X size={14} />
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-button-green" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Grid de productos */}
      {!isLoading && !error && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => {
              const cheapestUsd = product.priceSnapshot?.cheapestPriceUsd;
              const cheapestBs = product.priceSnapshot?.cheapestPriceBs;
              const cheapestSupermarket = product.priceSnapshot?.cheapestSupermarket;
              const unit = `${product.baseAmount} ${product.unitType}`;

              return (
                <div
                  key={product.id}
                  onClick={() => router.push(`/usuario/producto/${product.id}`)}
                  className="bg-primary-lightest/30 rounded-xl border border-button-green/20 overflow-hidden hover:shadow-lg hover:border-button-green/40 transition-all cursor-pointer group"
                >
                  {/* Imagen */}
                  <div className="h-32 bg-white flex items-center justify-center relative overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-contain p-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <Package size={36} className={`text-button-green/40 ${product.imageUrl ? 'hidden' : ''}`} />
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <p className="text-xs text-button-green font-medium mb-1">{product.category.name}</p>
                    <h3 className="font-semibold text-gray-800 text-sm mb-1 group-hover:text-button-green transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-400 mb-3">{unit}</p>
                    <div className="flex items-end justify-between">
                      <div>
                        {cheapestUsd != null ? (
                          <>
                            <p className="text-xs text-gray-400">Desde</p>
                            <p className="text-lg font-bold text-button-green">
                              {currency === 'USD'
                                ? `$${cheapestUsd.toFixed(2)}`
                                : `Bs. ${(cheapestBs ?? cheapestUsd * EXCHANGE_RATE).toFixed(2)}`}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-400">Precio no disponible</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-button-green/10">
                      <span className="text-xs text-gray-400 truncate">
                        {cheapestSupermarket || product.brand?.name || ''}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/usuario/producto/${product.id}`);
                        }}
                        className="flex items-center gap-1 text-xs text-button-green font-medium hover:text-accent-green-dark"
                      >
                        <ShoppingCart size={14} />
                        Comparar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Paginacion */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <Pagination
              currentPage={apiPage}
              totalPages={totalPages}
              totalItems={totalProducts}
              itemsPerPage={apiLimit}
              onPageChange={setApiPage}
              onItemsPerPageChange={(n) => { setApiLimit(n); setApiPage(1); }}
              itemsPerPageOptions={[8, 12, 24]}
              itemName="productos"
            />
          </div>
        </>
      )}

      {/* Estado vacio */}
      {!isLoading && !error && products.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Search size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No se encontraron productos
          </h3>
          <p className="text-gray-500 mb-4">
            Intenta con otros terminos de busqueda o ajusta los filtros.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-button-green text-white rounded-xl hover:bg-accent-green-dark transition-colors text-sm"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
