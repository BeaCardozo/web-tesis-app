'use client';

import {
  Package,
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  AlertTriangle,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Pagination } from '../../components/Pagination';
import { usePagination } from '../../hooks/usePagination';
import {
  mockSupermarkets,
  supermarketStats,
  supermarketCategoryStats,
  priceComparison,
  priceTrend,
  supermarketProducts
} from '../../data/mockData';

// ============================================
// COMPONENTES
// ============================================

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary',
  iconColor
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: 'primary' | 'secondary' | 'warning' | 'success';
  iconColor?: string;
}) {
  const colorClasses = {
    primary: 'bg-primary/20 text-accent-green-dark',
    secondary: 'bg-secondary/20 text-blue-700',
    warning: 'bg-orange-100 text-orange-700',
    success: 'bg-green-100 text-green-700'
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend === 'up' ? 'text-green-600' : 'text-red-500'
            }`}>
              {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-xl ${colorClasses[color]}`}
          style={iconColor ? { backgroundColor: `${iconColor}20`, color: iconColor } : {}}
        >
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function VerticalBarChart({ data }: {
  data: { label: string; value: number; color?: string }[]
}) {
  const max = Math.max(...data.map(d => d.value));

  return (
    <div className="flex items-end justify-between gap-2 h-40">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <span className="text-xs text-gray-600 mb-1">{item.value.toFixed(2)}</span>
          <div
            className="w-full rounded-t-lg transition-all duration-500"
            style={{
              height: `${(item.value / max) * 100}%`,
              backgroundColor: item.color || '#77A14B',
              minHeight: '8px'
            }}
          />
          <span className="text-xs text-gray-500 mt-2">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================
// PÁGINA PRINCIPAL
// ============================================
export default function AnalistaDashboardPage() {
  const { user } = useAuth();

  // Obtener datos del supermercado del analista
  const supermarket = mockSupermarkets.find(s => s.id === user?.supermarketId);
  const stats = supermarketStats[user?.supermarketId || '1'];
  const categoryStats = supermarketCategoryStats[user?.supermarketId || '1'] || [];
  const priceComp = priceComparison[user?.supermarketId || '1'] || [];
  const trend = priceTrend[user?.supermarketId || '1'] || [];
  const products = supermarketProducts[user?.supermarketId || '1'] || [];

  // Paginacion para comparacion de precios
  const {
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginatedData: paginatedPriceComp,
    totalItems
  } = usePagination({ data: priceComp, initialItemsPerPage: 5 });

  // Preparar datos para gráfico de tendencia
  const trendChartData = trend.map(t => ({
    label: t.day,
    value: t.avgPrice,
    color: supermarket?.color
  }));

  // Contar productos por estado
  const productsUpdated = products.filter(p => p.status === 'actualizado').length;
  const productsOutdated = products.filter(p => p.status === 'desactualizado').length;
  const productsNew = products.filter(p => p.status === 'nuevo').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
          style={{ backgroundColor: supermarket?.color }}
        >
          {supermarket?.name?.charAt(0) || 'S'}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{supermarket?.name || 'Mi Supermercado'}</h1>
          <p className="text-gray-500">Panel de control y estadísticas</p>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Productos"
          value={stats?.totalProducts?.toLocaleString() || '0'}
          icon={Package}
          iconColor={supermarket?.color}
        />
        <StatCard
          title="Actualizados Hoy"
          value={stats?.productsUpdatedToday || 0}
          icon={CheckCircle}
          trend="up"
          trendValue="Último: hace 2h"
          color="success"
        />
        <StatCard
          title="Productos Desactualizados"
          value={stats?.productsOutdated || 0}
          icon={AlertTriangle}
          color="warning"
        />
        <StatCard
          title="Posición en Ranking"
          value={`#${stats?.positionInRanking || '-'}`}
          icon={Trophy}
          trend="up"
          trendValue="Subió 2 posiciones"
          color="primary"
        />
      </div>

      {/* Segunda fila de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Vistas Totales"
          value={stats?.totalViews?.toLocaleString() || '0'}
          icon={Eye}
          trend="up"
          trendValue={`+${stats?.viewsChangeLastWeek || 0}% esta semana`}
          color="secondary"
        />
        <StatCard
          title="Precio Promedio"
          value={`$${stats?.averagePrice?.toFixed(2) || '0.00'}`}
          icon={stats?.priceChangeLastWeek >= 0 ? TrendingUp : TrendingDown}
          trend={stats?.priceChangeLastWeek >= 0 ? 'up' : 'down'}
          trendValue={`${stats?.priceChangeLastWeek >= 0 ? '+' : ''}${stats?.priceChangeLastWeek || 0}% vs semana pasada`}
          color={stats?.priceChangeLastWeek >= 0 ? 'warning' : 'success'}
        />
        <StatCard
          title="Última Carga"
          value={stats?.lastUpload?.split(' ')[1] || '--:--'}
          icon={Clock}
          color="primary"
        />
      </div>

      {/* Gráficos y tablas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencia de precios */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Tendencia de Precios (7 días)</h3>
          <VerticalBarChart data={trendChartData} />
        </div>

        {/* Estado de productos */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Estado de Productos</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Actualizados</span>
                <span className="font-medium text-green-600">{productsUpdated}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${(productsUpdated / products.length) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Desactualizados</span>
                <span className="font-medium text-orange-600">{productsOutdated}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${(productsOutdated / products.length) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Nuevos</span>
                <span className="font-medium text-blue-600">{productsNew}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(productsNew / products.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparación con competencia */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Comparación con Competencia</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Producto</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Tu Precio</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Promedio Competencia</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Diferencia</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPriceComp.map((item, index) => (
                <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-3 px-4 text-gray-800">{item.product}</td>
                  <td className="py-3 px-4 text-right font-medium" style={{ color: supermarket?.color }}>
                    ${item.ownPrice.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    ${item.avgCompetition.toFixed(2)}
                  </td>
                  <td className={`py-3 px-4 text-right font-medium ${
                    item.difference < 0 ? 'text-green-600' : 'text-red-500'
                  }`}>
                    {item.difference > 0 ? '+' : ''}{item.difference.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginacion */}
        {priceComp.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            itemsPerPageOptions={[5, 10, 20]}
            itemName="productos"
          />
        )}
      </div>

      {/* Rendimiento por categoría */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Rendimiento por Categoría</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {categoryStats.map((cat, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-xl text-center">
              <p className="text-sm text-gray-500 mb-1">{cat.category}</p>
              <p className="text-xl font-bold text-gray-800">{cat.views.toLocaleString()}</p>
              <p className="text-xs text-gray-500">vistas</p>
              <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                cat.position === 1 ? 'bg-yellow-100 text-yellow-700' :
                cat.position === 2 ? 'bg-gray-200 text-gray-700' :
                cat.position === 3 ? 'bg-orange-100 text-orange-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                <Trophy size={12} />
                #{cat.position}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
