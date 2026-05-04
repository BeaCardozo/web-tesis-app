'use client';

import { useState, useEffect } from 'react';
import {
  Package,
  Tag,
  Layers,
  Store,
  Users,
  Globe,
  Clock,
  Loader2,
  AlertTriangle,
  ImageIcon,
} from 'lucide-react';
import { analystApi, AnalystDashboard } from '../../lib/api';

// ============================================
// COMPONENTES
// ============================================

function StatCard({
  title,
  value,
  icon: Icon,
  color = 'primary',
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color?: 'primary' | 'secondary' | 'warning' | 'success';
}) {
  const colorClasses = {
    primary: 'bg-primary/20 text-accent-green-dark',
    secondary: 'bg-blue-100 text-blue-700',
    warning: 'bg-orange-100 text-orange-700',
    success: 'bg-green-100 text-green-700',
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function HorizontalBarChart({
  data,
  maxValue,
}: {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
}) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 truncate mr-2">{item.label}</span>
            <span className="font-medium text-gray-800 whitespace-nowrap">
              {item.value.toLocaleString()}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.color || '#77A14B',
                minWidth: item.value > 0 ? '4px' : '0',
              }}
            />
          </div>
        </div>
      ))}
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

  useEffect(() => {
    const load = async () => {
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
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500 gap-3">
        <AlertTriangle size={40} />
        <p className="text-lg font-medium">{error}</p>
      </div>
    );
  }

  if (!dashboard || !dashboard.assigned || !dashboard.supermarket) {
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

  const { supermarket, catalogStats } = dashboard;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header del supermercado */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          {supermarket.logoUrl ? (
            <img
              src={supermarket.logoUrl}
              alt={supermarket.name}
              className="w-14 h-14 rounded-xl object-contain border border-gray-200"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center text-accent-green-dark font-bold text-2xl">
              {supermarket.name.charAt(0)}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">{supermarket.name}</h1>
            <p className="text-gray-500">Panel de control y estadísticas</p>
          </div>
          <div className="flex items-center gap-3">
            {supermarket.website && (
              <a
                href={supermarket.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Globe size={16} />
                Sitio web
              </a>
            )}
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                supermarket.isActive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {supermarket.isActive ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>

        {/* Info del supermercado */}
        <div className="mt-4 flex gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <Store size={15} />
            <span>
              {supermarket.storeCount}{' '}
              {supermarket.storeCount === 1 ? 'tienda' : 'tiendas'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={15} />
            <span>
              {supermarket.analystCount}{' '}
              {supermarket.analystCount === 1 ? 'analista' : 'analistas'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={15} />
            <span>
              Desde{' '}
              {new Date(supermarket.createdAt).toLocaleDateString('es-VE', {
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas del catálogo */}
      {catalogStats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Productos en Catálogo"
              value={catalogStats.totalProducts.toLocaleString()}
              icon={Package}
              color="primary"
            />
            <StatCard
              title="Categorías con Productos"
              value={catalogStats.totalCategories}
              icon={Layers}
              color="secondary"
            />
            <StatCard
              title="Marcas Registradas"
              value={catalogStats.totalBrands}
              icon={Tag}
              color="warning"
            />
          </div>

          {/* Gráficos: Productos por categoría y por marca */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">
                Productos por Categoría
              </h3>
              {catalogStats.productsByCategory.length > 0 ? (
                <HorizontalBarChart
                  data={catalogStats.productsByCategory.map((c) => ({
                    label: c.name,
                    value: c.count,
                    color: '#77A14B',
                  }))}
                />
              ) : (
                <p className="text-gray-400 text-sm">Sin datos</p>
              )}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">
                Productos por Marca
              </h3>
              {catalogStats.productsByBrand.length > 0 ? (
                <HorizontalBarChart
                  data={catalogStats.productsByBrand.map((b) => ({
                    label: b.name,
                    value: b.count,
                    color: '#3B82F6',
                  }))}
                />
              ) : (
                <p className="text-gray-400 text-sm">Sin datos</p>
              )}
            </div>
          </div>

          {/* Productos recientes */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">
              Productos Actualizados Recientemente
            </h3>
            {catalogStats.recentProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                        Producto
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                        Categoría
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                        Marca
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                        Presentación
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">
                        Actualizado
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {catalogStats.recentProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-gray-50 hover:bg-gray-50/50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-8 h-8 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                <ImageIcon size={14} className="text-gray-400" />
                              </div>
                            )}
                            <span className="text-gray-800 font-medium">
                              {product.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                            {product.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {product.brand || '—'}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {product.unit}
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-gray-500">
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

          {/* Tiendas del supermercado */}
          {supermarket.stores.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">
                Tiendas ({supermarket.stores.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {supermarket.stores.map((store) => (
                  <div
                    key={store.id}
                    className="p-4 bg-gray-50 rounded-xl flex items-start gap-3"
                  >
                    <Store size={18} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">{store.name}</p>
                      {store.address && (
                        <p className="text-sm text-gray-500">{store.address}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
