'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  analystApi,
  AnalystPriceHistory,
  AnalystPriceHistoryPoint,
  AnalystProduct,
} from '../../lib/api';

// ============================================
// COMPONENTE DE GRÁFICO DE LÍNEAS
// ============================================
function LineChart({
  data,
  supermarketColor,
  showCompetition,
}: {
  data: AnalystPriceHistoryPoint[];
  supermarketColor: string;
  showCompetition: boolean;
}) {
  if (data.length === 0) return null;

  const prices = data.map((d) => d.ownPrice).filter((v): v is number => v != null);
  const competitions = data.map((d) => d.avgCompetition).filter((v): v is number => v != null);
  const allValues = showCompetition ? [...prices, ...competitions] : prices;
  if (allValues.length === 0) return null;

  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);
  const range = maxValue - minValue || 1;
  const padding = range * 0.1;

  const chartHeight = 200;
  const chartWidth = 100;

  const getY = (value: number) =>
    chartHeight - ((value - minValue + padding) / (range + padding * 2)) * chartHeight;

  const xFor = (i: number) =>
    data.length === 1 ? chartWidth / 2 : (i / (data.length - 1)) * chartWidth;

  const pricePoints = data
    .map((d, i) => (d.ownPrice != null ? { x: xFor(i), y: getY(d.ownPrice) } : null))
    .filter((p): p is { x: number; y: number } => p !== null);

  const competitionPoints = showCompetition
    ? data
        .map((d, i) =>
          d.avgCompetition != null ? { x: xFor(i), y: getY(d.avgCompetition) } : null,
        )
        .filter((p): p is { x: number; y: number } => p !== null)
    : [];

  const createPath = (points: { x: number; y: number }[]) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full h-48"
        preserveAspectRatio="none"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="0"
            y1={chartHeight * (i / 4)}
            x2={chartWidth}
            y2={chartHeight * (i / 4)}
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
        ))}

        {showCompetition && competitionPoints.length > 1 && (
          <path
            d={createPath(competitionPoints)}
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
        )}

        {pricePoints.length > 1 && (
          <path d={createPath(pricePoints)} fill="none" stroke={supermarketColor} strokeWidth="2.5" />
        )}

        {pricePoints.map((p, i) => (
          <circle key={`own-${i}`} cx={p.x} cy={p.y} r="3" fill={supermarketColor} />
        ))}

        {showCompetition &&
          competitionPoints.map((p, i) => (
            <circle key={`comp-${i}`} cx={p.x} cy={p.y} r="2.5" fill="#9ca3af" />
          ))}
      </svg>

      <div className="flex justify-between mt-2 text-xs text-gray-500">
        {data.map((d, i) => (
          <span key={i} className={i !== 0 && i !== data.length - 1 ? 'hidden md:inline' : ''}>
            {new Date(d.day).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
          </span>
        ))}
      </div>

      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 rounded" style={{ backgroundColor: supermarketColor }} />
          <span className="text-xs text-gray-600">Tu precio</span>
        </div>
        {showCompetition && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded bg-gray-400" />
            <span className="text-xs text-gray-600">Promedio competencia</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// PÁGINA DE HISTORIAL DE PRECIOS
// ============================================
export default function PriceHistoryPage() {
  const supermarketColor = '#77A14B';

  const [products, setProducts] = useState<AnalystProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const [history, setHistory] = useState<AnalystPriceHistory | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Cargar lista de productos del partner
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingProducts(true);
        setProductsError(null);
        const res = await analystApi.products({ page: 1, limit: 50 });
        if (cancelled) return;
        // Deduplicar por id (vienen filas por tienda en algunos casos)
        const seen = new Set<string>();
        const unique = res.items.filter((p) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });
        setProducts(unique);
        if (unique.length > 0 && !selectedProductId) {
          setSelectedProductId(unique[0].id);
        }
      } catch (err) {
        if (!cancelled) {
          setProductsError(err instanceof Error ? err.message : 'Error al cargar productos');
        }
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar histórico del producto seleccionado
  useEffect(() => {
    if (!selectedProductId) {
      setHistory(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoadingHistory(true);
        setHistoryError(null);
        const data = await analystApi.priceHistory(selectedProductId, 30);
        if (!cancelled) setHistory(data);
      } catch (err) {
        if (!cancelled) {
          setHistoryError(
            err instanceof Error ? err.message : 'Error al cargar histórico',
          );
          setHistory(null);
        }
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedProductId]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, searchTerm]);

  const series = history?.series ?? [];
  const hasCompetition = series.some((p) => p.avgCompetition != null);

  // Stats
  const stats = useMemo(() => {
    const ownPrices = series.map((p) => p.ownPrice).filter((v): v is number => v != null);
    if (ownPrices.length === 0) return null;

    const firstPrice = ownPrices[0];
    const lastPrice = ownPrices[ownPrices.length - 1];
    const priceChange = firstPrice > 0 ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;

    const avgPrice = ownPrices.reduce((a, b) => a + b, 0) / ownPrices.length;
    const minPrice = Math.min(...ownPrices);
    const maxPrice = Math.max(...ownPrices);

    // diferencia vs competencia (último día con ambos datos)
    let currentDiff: number | null = null;
    for (let i = series.length - 1; i >= 0; i--) {
      const pt = series[i];
      if (pt.ownPrice != null && pt.avgCompetition != null && pt.avgCompetition > 0) {
        currentDiff = ((pt.ownPrice - pt.avgCompetition) / pt.avgCompetition) * 100;
        break;
      }
    }

    return {
      priceChange,
      avgPrice,
      minPrice,
      maxPrice,
      currentDiff,
      lastPrice,
    };
  }, [series]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Historial de Precios</h1>
        <p className="text-gray-500">Evolución de los últimos 30 días de tus productos vs la competencia</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selector de producto */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-6">
            <h3 className="font-semibold text-gray-800 mb-4">Seleccionar Producto</h3>

            <div className="relative mb-4">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none"
              />
            </div>

            {loadingProducts && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-gray-400" size={24} />
              </div>
            )}

            {productsError && !loadingProducts && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                <AlertCircle size={16} />
                <span>{productsError}</span>
              </div>
            )}

            {!loadingProducts && !productsError && (
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProductId(product.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                      selectedProductId === product.id
                        ? 'bg-primary text-accent-green-dark'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs opacity-70">${product.priceUsd.toFixed(2)}</p>
                  </button>
                ))}
                {filteredProducts.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No se encontraron productos
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Gráfico y estadísticas */}
        <div className="lg:col-span-2 space-y-6">
          {loadingHistory && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <Loader2 className="animate-spin mx-auto text-gray-400" size={32} />
            </div>
          )}

          {historyError && !loadingHistory && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-3 text-red-700">
              <AlertCircle size={20} />
              <span>{historyError}</span>
            </div>
          )}

          {!loadingHistory && !historyError && history && series.length > 0 && (
            <>
              {/* Info del producto */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{history.productName}</h2>
                    <p className="text-sm text-gray-500">
                      {selectedProduct?.category?.name ?? '—'} • {history.ownChainName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{ color: supermarketColor }}>
                      ${(stats?.lastPrice ?? 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">Precio actual</p>
                  </div>
                </div>

                <LineChart
                  data={series}
                  supermarketColor={supermarketColor}
                  showCompetition={hasCompetition}
                />

                {!hasCompetition && (
                  <p className="mt-4 text-xs text-gray-500 text-center">
                    Sin matches en otras cadenas para este producto — solo se muestra tu precio.
                  </p>
                )}
              </div>

              {/* Estadísticas */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      {stats.priceChange >= 0 ? (
                        <TrendingUp size={18} className="text-red-500" />
                      ) : (
                        <TrendingDown size={18} className="text-green-500" />
                      )}
                      <span className="text-sm text-gray-500">Variación</span>
                    </div>
                    <p
                      className={`text-xl font-bold ${stats.priceChange >= 0 ? 'text-red-500' : 'text-green-600'}`}
                    >
                      {stats.priceChange >= 0 ? '+' : ''}
                      {stats.priceChange.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-400">en la ventana</p>
                  </div>

                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign size={18} className="text-blue-500" />
                      <span className="text-sm text-gray-500">Promedio</span>
                    </div>
                    <p className="text-xl font-bold text-gray-800">${stats.avgPrice.toFixed(2)}</p>
                    <p className="text-xs text-gray-400">tu precio</p>
                  </div>

                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 size={18} className="text-gray-500" />
                      <span className="text-sm text-gray-500">Rango</span>
                    </div>
                    <p className="text-xl font-bold text-gray-800">
                      ${stats.minPrice.toFixed(2)} - ${stats.maxPrice.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">mín - máx</p>
                  </div>

                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      {stats.currentDiff == null ? (
                        <BarChart3 size={18} className="text-gray-400" />
                      ) : stats.currentDiff <= 0 ? (
                        <ArrowDownRight size={18} className="text-green-500" />
                      ) : (
                        <ArrowUpRight size={18} className="text-red-500" />
                      )}
                      <span className="text-sm text-gray-500">vs Competencia</span>
                    </div>
                    {stats.currentDiff == null ? (
                      <p className="text-xl font-bold text-gray-400">—</p>
                    ) : (
                      <p
                        className={`text-xl font-bold ${stats.currentDiff <= 0 ? 'text-green-600' : 'text-red-500'}`}
                      >
                        {stats.currentDiff > 0 ? '+' : ''}
                        {stats.currentDiff.toFixed(1)}%
                      </p>
                    )}
                    <p className="text-xs text-gray-400">diferencia actual</p>
                  </div>
                </div>
              )}

              {/* Tabla de historial */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">Detalle del Historial</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Fecha</th>
                        <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Tu Precio</th>
                        <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">
                          Prom. Competencia
                        </th>
                        <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Diferencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...series].reverse().map((entry, index) => {
                        const diff =
                          entry.ownPrice != null &&
                          entry.avgCompetition != null &&
                          entry.avgCompetition > 0
                            ? ((entry.ownPrice - entry.avgCompetition) / entry.avgCompetition) * 100
                            : null;
                        return (
                          <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="px-6 py-3 text-sm text-gray-600">
                              {new Date(entry.day).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td
                              className="px-6 py-3 text-right font-medium"
                              style={{ color: supermarketColor }}
                            >
                              {entry.ownPrice != null ? `$${entry.ownPrice.toFixed(2)}` : '—'}
                            </td>
                            <td className="px-6 py-3 text-right text-gray-600">
                              {entry.avgCompetition != null
                                ? `$${entry.avgCompetition.toFixed(2)}`
                                : '—'}
                            </td>
                            <td
                              className={`px-6 py-3 text-right font-medium ${
                                diff == null
                                  ? 'text-gray-400'
                                  : diff <= 0
                                    ? 'text-green-600'
                                    : 'text-red-500'
                              }`}
                            >
                              {diff == null ? '—' : `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {!loadingHistory && !historyError && history && series.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">
                Este producto aún no tiene observaciones de precio en los últimos 30 días.
              </p>
            </div>
          )}

          {!selectedProductId && !loadingProducts && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Selecciona un producto para ver su historial de precios</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
