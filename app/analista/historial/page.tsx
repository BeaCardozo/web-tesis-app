'use client';

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  supermarketProducts,
  productPriceHistory,
  mockSupermarkets,
  PriceHistoryEntry
} from '../../data/mockData';

// ============================================
// COMPONENTE DE GRÁFICO DE LÍNEAS
// ============================================
function LineChart({
  data,
  supermarketColor
}: {
  data: PriceHistoryEntry[];
  supermarketColor: string;
}) {
  if (data.length === 0) return null;

  const prices = data.map(d => d.price);
  const competitions = data.map(d => d.avgCompetition);
  const allValues = [...prices, ...competitions];
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);
  const range = maxValue - minValue || 1;
  const padding = range * 0.1;

  const chartHeight = 200;
  const chartWidth = 100;

  const getY = (value: number) => {
    return chartHeight - ((value - minValue + padding) / (range + padding * 2)) * chartHeight;
  };

  const pricePoints = data.map((d, i) => ({
    x: (i / (data.length - 1)) * chartWidth,
    y: getY(d.price)
  }));

  const competitionPoints = data.map((d, i) => ({
    x: (i / (data.length - 1)) * chartWidth,
    y: getY(d.avgCompetition)
  }));

  const createPath = (points: { x: number; y: number }[]) => {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map(i => (
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

        {/* Competition line (dashed) */}
        <path
          d={createPath(competitionPoints)}
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2"
          strokeDasharray="4 2"
        />

        {/* Price line */}
        <path
          d={createPath(pricePoints)}
          fill="none"
          stroke={supermarketColor}
          strokeWidth="2.5"
        />

        {/* Price points */}
        {pricePoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="3"
            fill={supermarketColor}
          />
        ))}
      </svg>

      {/* Labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        {data.map((d, i) => (
          <span key={i} className={i !== 0 && i !== data.length - 1 ? 'hidden md:inline' : ''}>
            {new Date(d.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 rounded" style={{ backgroundColor: supermarketColor }} />
          <span className="text-xs text-gray-600">Tu precio</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 rounded bg-gray-400" style={{ borderStyle: 'dashed' }} />
          <span className="text-xs text-gray-600">Promedio competencia</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PÁGINA DE HISTORIAL DE PRECIOS
// ============================================
export default function PriceHistoryPage() {
  const { user } = useAuth();
  const supermarket = mockSupermarkets.find(s => s.id === user?.supermarketId);
  const products = supermarketProducts[user?.supermarketId || '1'] || [];

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const priceHistory = productPriceHistory[selectedProductId] || [];

  // Filtrar productos para el selector
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular estadísticas
  const calculateStats = () => {
    if (priceHistory.length < 2) return null;

    const firstPrice = priceHistory[0].price;
    const lastPrice = priceHistory[priceHistory.length - 1].price;
    const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100;

    const firstComp = priceHistory[0].avgCompetition;
    const lastComp = priceHistory[priceHistory.length - 1].avgCompetition;

    const avgPrice = priceHistory.reduce((sum, p) => sum + p.price, 0) / priceHistory.length;
    const avgComp = priceHistory.reduce((sum, p) => sum + p.avgCompetition, 0) / priceHistory.length;

    const currentDiff = ((lastPrice - lastComp) / lastComp) * 100;

    return {
      priceChange,
      avgPrice,
      avgComp,
      currentDiff,
      minPrice: Math.min(...priceHistory.map(p => p.price)),
      maxPrice: Math.max(...priceHistory.map(p => p.price)),
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Historial de Precios</h1>
        <p className="text-gray-500">Analiza la evolución de precios de tus productos</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selector de producto */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-6">
            <h3 className="font-semibold text-gray-800 mb-4">Seleccionar Producto</h3>

            {/* Búsqueda */}
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

            {/* Lista de productos */}
            <div className="space-y-1 max-h-[400px] overflow-y-auto">
              {filteredProducts.map(product => {
                const hasHistory = !!productPriceHistory[product.id];
                return (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProductId(product.id)}
                    disabled={!hasHistory}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                      selectedProductId === product.id
                        ? 'bg-primary text-accent-green-dark'
                        : hasHistory
                          ? 'hover:bg-gray-50 text-gray-700'
                          : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs opacity-70">
                      {hasHistory ? `$${product.price.toFixed(2)}` : 'Sin historial'}
                    </p>
                  </button>
                );
              })}
            </div>

            {filteredProducts.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No se encontraron productos
              </p>
            )}
          </div>
        </div>

        {/* Gráfico y estadísticas */}
        <div className="lg:col-span-2 space-y-6">
          {selectedProduct && priceHistory.length > 0 ? (
            <>
              {/* Info del producto */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{selectedProduct.name}</h2>
                    <p className="text-sm text-gray-500">{selectedProduct.category} • SKU: {selectedProduct.sku || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{ color: supermarket?.color }}>
                      ${selectedProduct.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">Precio actual</p>
                  </div>
                </div>

                {/* Gráfico */}
                <LineChart data={priceHistory} supermarketColor={supermarket?.color || '#77A14B'} />
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
                    <p className={`text-xl font-bold ${stats.priceChange >= 0 ? 'text-red-500' : 'text-green-600'}`}>
                      {stats.priceChange >= 0 ? '+' : ''}{stats.priceChange.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-400">últimas 8 semanas</p>
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
                      {stats.currentDiff <= 0 ? (
                        <ArrowDownRight size={18} className="text-green-500" />
                      ) : (
                        <ArrowUpRight size={18} className="text-red-500" />
                      )}
                      <span className="text-sm text-gray-500">vs Competencia</span>
                    </div>
                    <p className={`text-xl font-bold ${stats.currentDiff <= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {stats.currentDiff > 0 ? '+' : ''}{stats.currentDiff.toFixed(1)}%
                    </p>
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
                        <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Prom. Competencia</th>
                        <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Diferencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...priceHistory].reverse().map((entry, index) => {
                        const diff = ((entry.price - entry.avgCompetition) / entry.avgCompetition) * 100;
                        return (
                          <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="px-6 py-3 text-sm text-gray-600">
                              {new Date(entry.date).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="px-6 py-3 text-right font-medium" style={{ color: supermarket?.color }}>
                              ${entry.price.toFixed(2)}
                            </td>
                            <td className="px-6 py-3 text-right text-gray-600">
                              ${entry.avgCompetition.toFixed(2)}
                            </td>
                            <td className={`px-6 py-3 text-right font-medium ${diff <= 0 ? 'text-green-600' : 'text-red-500'}`}>
                              {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">
                {selectedProduct
                  ? 'Este producto no tiene historial de precios disponible'
                  : 'Selecciona un producto para ver su historial de precios'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
