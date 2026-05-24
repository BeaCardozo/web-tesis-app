'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Package,
  Tag,
  Layers,
  Users,
  Clock,
  Loader2,
  AlertTriangle,
  ImageIcon,
  Building2,
  TrendingUp,
  Maximize2,
} from 'lucide-react';
import { analystApi, AnalystDashboard } from '../../lib/api';
import { supermarketLogoSrc } from '../../components/SupermarketLogo';
import { DonutChart, FullDonutModal } from '../../components/charts/Donut';

// ============================================
// COMPONENTES
// ============================================

function StatCard({
  title,
  value,
  icon: Icon,
  tone = 'primary',
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  tone?: 'primary' | 'secondary' | 'warning';
}) {
  const toneStyles = {
    primary: {
      iconWrap: 'bg-[#E9F1DC] text-accent-green-dark',
      accent: 'from-primary/30 to-transparent',
    },
    secondary: {
      iconWrap: 'bg-blue-50 text-blue-700',
      accent: 'from-blue-100/60 to-transparent',
    },
    warning: {
      iconWrap: 'bg-amber-50 text-amber-700',
      accent: 'from-amber-100/60 to-transparent',
    },
  } as const;

  const s = toneStyles[tone];

  return (
    <div className="group relative overflow-hidden bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_4px_18px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300">
      <div
        className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${s.accent} pointer-events-none`}
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-medium">
            {title}
          </p>
          <p className="text-3xl font-semibold text-gray-800 tabular-nums">
            {value}
          </p>
        </div>
        <div
          className={`p-3 rounded-xl ${s.iconWrap} transition-transform duration-300 group-hover:scale-105`}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return 'Hace minutos';
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString('es-VE', { day: '2-digit', month: 'short' });
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================
export default function AnalistaDashboardPage() {
  const [dashboard, setDashboard] = useState<AnalystDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [openModal, setOpenModal] = useState<null | 'category' | 'brand'>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await analystApi.dashboard();
        setDashboard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [reloadToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500 gap-4">
        <AlertTriangle size={40} />
        <p className="text-lg font-medium text-center max-w-md">{error}</p>
        <button
          type="button"
          onClick={() => setReloadToken((t) => t + 1)}
          className="px-4 py-2 rounded-xl bg-white border border-red-200 text-red-700 text-sm font-medium hover:bg-red-50 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!dashboard || !dashboard.assigned || !dashboard.supermarket) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-3">
        <Building2 size={48} />
        <p className="text-lg font-medium">No tienes un supermercado asignado</p>
        <p className="text-sm text-gray-400">
          Contacta al administrador para que te asigne un supermercado.
        </p>
      </div>
    );
  }

  const { supermarket, catalogStats } = dashboard;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header del supermercado */}
      <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-br from-primary/15 to-transparent pointer-events-none" />

        <div className="relative flex items-center gap-5">
          {(() => {
            const logo = supermarket.logoUrl || supermarketLogoSrc(supermarket.name);
            return logo ? (
              <div className="relative w-16 h-16 rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <Image
                  src={logo}
                  alt={supermarket.name}
                  fill
                  sizes="64px"
                  className="object-contain p-2"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-primary-lighter/40 flex items-center justify-center text-accent-green-dark font-bold text-2xl shadow-sm">
                {supermarket.name.charAt(0)}
              </div>
            );
          })()}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
              {supermarket.name}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Panel de control y estadísticas
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wide ${
              supermarket.isActive
                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60'
                : 'bg-red-50 text-red-700 ring-1 ring-red-200/60'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                supermarket.isActive ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
            {supermarket.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {/* Info del supermercado */}
        <div className="relative mt-5 pt-4 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <Users size={15} className="text-gray-400" />
            <span>
              <span className="font-medium text-gray-700">
                {supermarket.analystCount}
              </span>{' '}
              {supermarket.analystCount === 1 ? 'analista' : 'analistas'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={15} className="text-gray-400" />
            <span>
              Desde{' '}
              <span className="font-medium text-gray-700">
                {new Date(supermarket.createdAt).toLocaleDateString('es-VE', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas del catálogo */}
      {catalogStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Productos en catálogo"
              value={catalogStats.totalProducts.toLocaleString()}
              icon={Package}
              tone="primary"
            />
            <StatCard
              title="Categorías con productos"
              value={catalogStats.totalCategories}
              icon={Layers}
              tone="secondary"
            />
            <StatCard
              title="Marcas registradas"
              value={catalogStats.totalBrands}
              icon={Tag}
              tone="warning"
            />
          </div>

          {/* Gráficos: Productos por categoría y por marca */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100">
              <div className="flex items-center justify-between mb-5 gap-3">
                <div className="flex items-baseline gap-2 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">
                    Productos por categoría
                  </h3>
                  <span className="text-xs text-gray-400 tabular-nums whitespace-nowrap">
                    · {catalogStats.productsByCategory.length}{' '}
                    {catalogStats.productsByCategory.length === 1
                      ? 'categoría'
                      : 'categorías'}
                  </span>
                </div>
                {catalogStats.productsByCategory.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setOpenModal('category')}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-green-dark hover:text-accent-green px-2.5 py-1.5 rounded-lg hover:bg-primary/10 transition-colors whitespace-nowrap"
                  >
                    <Maximize2 size={13} />
                    Ver detalle
                  </button>
                )}
              </div>
              {catalogStats.productsByCategory.length > 0 ? (
                <DonutChart
                  data={catalogStats.productsByCategory}
                  palette="green"
                />
              ) : (
                <p className="text-gray-400 text-sm">Sin datos</p>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100">
              <div className="flex items-center justify-between mb-5 gap-3">
                <div className="flex items-baseline gap-2 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">
                    Productos por marca
                  </h3>
                  <span className="text-xs text-gray-400 tabular-nums whitespace-nowrap">
                    · {catalogStats.productsByBrand.length}{' '}
                    {catalogStats.productsByBrand.length === 1 ? 'marca' : 'marcas'}
                  </span>
                </div>
                {catalogStats.productsByBrand.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setOpenModal('brand')}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-900 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
                  >
                    <Maximize2 size={13} />
                    Ver detalle
                  </button>
                )}
              </div>
              {catalogStats.productsByBrand.length > 0 ? (
                <DonutChart data={catalogStats.productsByBrand} palette="blue" />
              ) : (
                <p className="text-gray-400 text-sm">Sin datos</p>
              )}
            </div>
          </div>

          {/* Productos recientes */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/15 text-accent-green-dark">
                  <TrendingUp size={16} />
                </div>
                <h3 className="font-semibold text-gray-800">
                  Productos actualizados recientemente
                </h3>
              </div>
              <span className="text-xs text-gray-400">
                {catalogStats.recentProducts.length} más recientes
              </span>
            </div>
            {catalogStats.recentProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-3 text-[11px] uppercase tracking-wider font-semibold text-gray-500">
                        Producto
                      </th>
                      <th className="text-left py-3 px-3 text-[11px] uppercase tracking-wider font-semibold text-gray-500">
                        Categoría
                      </th>
                      <th className="text-left py-3 px-3 text-[11px] uppercase tracking-wider font-semibold text-gray-500">
                        Marca
                      </th>
                      <th className="text-left py-3 px-3 text-[11px] uppercase tracking-wider font-semibold text-gray-500">
                        Presentación
                      </th>
                      <th className="text-right py-3 px-3 text-[11px] uppercase tracking-wider font-semibold text-gray-500">
                        Actualizado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {catalogStats.recentProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/60 transition-colors"
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            {product.imageUrl ? (
                              <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                                <Image
                                  src={product.imageUrl}
                                  alt={product.name}
                                  fill
                                  sizes="36px"
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                                <ImageIcon size={14} className="text-gray-400" />
                              </div>
                            )}
                            <span className="text-gray-800 font-medium text-sm">
                              {product.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                            {product.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-gray-600 text-sm">
                          {product.brand?.name ?? '—'}
                        </td>
                        <td className="py-3 px-3 text-gray-600 text-sm">
                          {product.unit}
                        </td>
                        <td className="py-3 px-3 text-right text-xs text-gray-500 tabular-nums whitespace-nowrap">
                          {formatDate(product.updatedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No hay productos recientes</p>
            )}
          </div>

          <FullDonutModal
            open={openModal === 'category'}
            onClose={() => setOpenModal(null)}
            title="Productos por categoría — detalle completo"
            data={catalogStats.productsByCategory}
            palette="green"
          />
          <FullDonutModal
            open={openModal === 'brand'}
            onClose={() => setOpenModal(null)}
            title="Productos por marca — detalle completo"
            data={catalogStats.productsByBrand}
            palette="blue"
          />
        </>
      )}
    </div>
  );
}
