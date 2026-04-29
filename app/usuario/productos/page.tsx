'use client';

import { useState, useMemo, useEffect } from 'react';
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
} from 'lucide-react';
import {
  userProducts,
  userCategories,
  getLowestPrice,
  getHighestPrice,
  getSavingsPercent,
  formatPrice,
} from '../../data/userMockData';
import { mockSupermarkets } from '../../data/mockData';
import { Pagination } from '../../components/Pagination';
import { usePagination } from '../../hooks/usePagination';

type SortOption = 'relevance' | 'priceAsc' | 'priceDesc' | 'nameAsc';

export default function ProductosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('buscar') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoria') || '');
  const [selectedSupermarket, setSelectedSupermarket] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [maxPrice, setMaxPrice] = useState(50);
  const [showFilters, setShowFilters] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'Bs'>('USD');

  // Filtrar productos
  const filteredProducts = useMemo(() => {
    let results = [...userProducts];

    // Busqueda por texto
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        p =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Filtrar por categoria
    if (selectedCategory) {
      results = results.filter(p => p.categoryId === selectedCategory);
    }

    // Filtrar por supermercado
    if (selectedSupermarket) {
      results = results.filter(p =>
        p.prices.some(price => price.supermarketId === selectedSupermarket)
      );
    }

    // Filtrar por precio maximo
    results = results.filter(p => {
      const lowest = getLowestPrice(p);
      return lowest ? lowest.price <= maxPrice : true;
    });

    // Ordenar
    switch (sortBy) {
      case 'priceAsc':
        results.sort((a, b) => {
          const la = getLowestPrice(a);
          const lb = getLowestPrice(b);
          return (la?.price || 0) - (lb?.price || 0);
        });
        break;
      case 'priceDesc':
        results.sort((a, b) => {
          const la = getLowestPrice(a);
          const lb = getLowestPrice(b);
          return (lb?.price || 0) - (la?.price || 0);
        });
        break;
      case 'nameAsc':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return results;
  }, [searchQuery, selectedCategory, selectedSupermarket, sortBy, maxPrice]);

  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginatedData,
    totalItems,
    resetToFirstPage,
  } = usePagination({ data: filteredProducts, initialItemsPerPage: 12 });

  // Reset pagina al cambiar filtros
  useEffect(() => {
    resetToFirstPage();
  }, [searchQuery, selectedCategory, selectedSupermarket, sortBy, maxPrice, resetToFirstPage]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSupermarket('');
    setSortBy('relevance');
    setMaxPrice(50);
  };

  const hasActiveFilters = selectedCategory || selectedSupermarket || sortBy !== 'relevance' || maxPrice < 50;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
          <p className="text-gray-500 mt-1">
            {totalItems} producto{totalItems !== 1 ? 's' : ''} encontrado{totalItems !== 1 ? 's' : ''}
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
              <option value="relevance">Relevancia</option>
              <option value="priceAsc">Precio: Menor a Mayor</option>
              <option value="priceDesc">Precio: Mayor a Menor</option>
              <option value="nameAsc">Nombre: A - Z</option>
            </select>
            <ArrowUpDown size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Categoria</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-button-green/30 focus:border-button-green cursor-pointer"
              >
                <option value="">Todas las categorias</option>
                {userCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Supermercado */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Supermercado</label>
              <select
                value={selectedSupermarket}
                onChange={(e) => setSelectedSupermarket(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-button-green/30 focus:border-button-green cursor-pointer"
              >
                <option value="">Todos los supermercados</option>
                {mockSupermarkets.map((sm) => (
                  <option key={sm.id} value={sm.id}>{sm.name}</option>
                ))}
              </select>
            </div>

            {/* Precio maximo */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Precio maximo: {formatPrice(maxPrice, currency)}
              </label>
              <input
                type="range"
                min={1}
                max={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-button-green"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{formatPrice(1, currency)}</span>
                <span>{formatPrice(50, currency)}</span>
              </div>
            </div>

            {/* Limpiar filtros */}
            {hasActiveFilters && (
              <div className="sm:col-span-3">
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

      {/* Grid de productos */}
      {paginatedData.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedData.map((product) => {
              const lowest = getLowestPrice(product);
              const highest = getHighestPrice(product);
              const savings = getSavingsPercent(product);

              return (
                <div
                  key={product.id}
                  onClick={() => router.push(`/usuario/producto/${product.id}`)}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-button-green/30 transition-all cursor-pointer group"
                >
                  {/* Imagen placeholder */}
                  <div className="h-32 bg-gradient-to-br from-primary-lighter to-primary-lightest flex items-center justify-center relative">
                    <Package size={36} className="text-button-green/40" />
                    {savings > 0 && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                        -{savings}%
                      </div>
                    )}
                    {product.isFeatured && (
                      <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                        <span>Destacado</span>
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <p className="text-xs text-button-green font-medium mb-1">{product.category}</p>
                    <h3 className="font-semibold text-gray-800 text-sm mb-1 group-hover:text-button-green transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-400 mb-3">{product.unit}</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs text-gray-400">Desde</p>
                        <p className="text-lg font-bold text-button-green">
                          {lowest ? formatPrice(lowest.price, currency) : '-'}
                        </p>
                      </div>
                      {highest && lowest && highest.price !== lowest.price && (
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Hasta</p>
                          <p className="text-sm text-gray-400 line-through">
                            {formatPrice(highest.price, currency)}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                      <span className="text-xs text-gray-400">
                        {product.prices.length} supermercados
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
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              itemsPerPageOptions={[8, 12, 24]}
              itemName="productos"
            />
          </div>
        </>
      ) : (
        /* Estado vacio */
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
