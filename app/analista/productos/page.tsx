'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Search,
  Package,
  Loader2,
  AlertTriangle,
  ImageIcon,
  Store,
  WifiOff,
} from 'lucide-react';
import {
  analystApi,
  AnalystProductsResponse,
} from '../../lib/api';
import { Pagination } from '../../components/Pagination';

// ============================================
// HELPERS
// ============================================
function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatPrice(price: number | null | undefined) {
  if (price == null) return '—';
  return `$${price.toFixed(2)}`;
}

function formatPriceBs(price: number | null | undefined) {
  if (price == null) return '—';
  return `Bs${price.toFixed(2)}`;
}

// ============================================
// PÁGINA DE PRODUCTOS DEL SUPERMERCADO
// ============================================
export default function ProductsPage() {
  const [data, setData] = useState<AnalystProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros y paginación
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset página al cambiar búsqueda
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, limit]);

  // Cargar productos
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analystApi.products({
        search: debouncedSearch || undefined,
        page,
        limit,
      });
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Estado: sin supermercado asignado
  if (!loading && data && !data.assigned) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-3">
        <Store size={48} />
        <p className="text-lg font-medium">No tienes un supermercado asignado</p>
        <p className="text-sm text-gray-400">
          Contacta al administrador para que te asigne un supermercado.
        </p>
      </div>
    );
  }

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Productos{data?.supermarketName ? ` — ${data.supermarketName}` : ''}
        </h1>
        <p className="text-gray-500">
          Productos disponibles en tu supermercado con precios actualizados
        </p>
      </div>

      {/* DWH no disponible */}
      {data && data.dwhAvailable === false && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl text-amber-700 border border-amber-200">
          <WifiOff size={20} />
          <div>
            <p className="font-medium">Servicio de precios no disponible</p>
            <p className="text-sm text-amber-600">
              El sistema de precios (Data Warehouse) no está respondiendo. Los productos se mostrarán cuando el servicio esté activo.
            </p>
          </div>
        </div>
      )}

      {/* Resumen + Búsqueda */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-3 mr-4">
            <div className="p-2 rounded-lg bg-primary/20">
              <Package size={20} className="text-accent-green-dark" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800">
                {total.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">productos</p>
            </div>
          </div>

          <div className="flex-1 relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-red-50 rounded-xl text-red-600 border border-red-100">
          <div className="flex items-center gap-3 min-w-0">
            <AlertTriangle size={20} className="flex-shrink-0" />
            <span className="break-words">{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchProducts()}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-white border border-red-200 text-sm font-medium hover:bg-red-100/50 transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla de productos */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="text-center py-16">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">
              {debouncedSearch
                ? 'No se encontraron productos con esa búsqueda'
                : 'No hay productos disponibles'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Producto
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Categoría
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Marca
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Presentación
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Tienda
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                      Precio USD
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">
                      Precio Bs
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                      Fecha
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((product, idx) => (
                    <tr
                      key={`${product.id}-${idx}`}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                              <Image
                                src={product.imageUrl}
                                alt={product.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                              <ImageIcon size={16} className="text-gray-400" />
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-gray-800">
                              {product.name}
                            </span>
                            {!product.isAvailable && (
                              <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded">
                                No disponible
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {product.category ? (
                          <span className="px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                            {product.category.name}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.brand?.name || '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.baseAmount} {product.unitType}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.storeName}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-green-700">
                          {formatPrice(product.priceUsd)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-medium text-gray-700">
                          {formatPriceBs(product.priceBs)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(product.scrapedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={total}
              itemsPerPage={limit}
              onPageChange={setPage}
              onItemsPerPageChange={setLimit}
              itemName="productos"
            />
          </>
        )}
      </div>
    </div>
  );
}
