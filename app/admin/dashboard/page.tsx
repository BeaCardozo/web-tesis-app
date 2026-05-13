'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  ShoppingBag,
  Store,
  Tag,
  ShoppingCart,
  ArrowUpRight,
  Loader2,
  UserCheck,
  UserX,
  Package,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { adminStatsApi, DashboardStats, BackendRole } from '../../lib/api';

// ============================================
// MAPEO DE ROLES
// ============================================
const ROLE_LABELS: Record<BackendRole, string> = {
  admin: 'Administrador',
  partner: 'Analista',
  consumer: 'Usuario',
};

const ROLE_COLORS: Record<BackendRole, string> = {
  admin: 'bg-purple-100 text-purple-700',
  partner: 'bg-amber-100 text-amber-700',
  consumer: 'bg-blue-100 text-blue-700',
};

// ============================================
// COMPONENTES DE GRÁFICOS
// ============================================

function HorizontalBarChart({ data, maxValue, unit }: {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
  unit?: string;
}) {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 truncate mr-2">{item.label}</span>
            <span className="font-medium text-gray-800 whitespace-nowrap">
              {item.value.toLocaleString()}{unit ? ` ${unit}` : ''}
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

const CHART_PAGE_SIZE = 10;

function PaginatedHorizontalBarChart({
  data,
  maxValue,
  unit,
}: {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
  unit?: string;
}) {
  const [page, setPage] = useState(0);
  const globalMax = maxValue ?? Math.max(...data.map((d) => d.value), 1);
  const totalPages = Math.max(1, Math.ceil(data.length / CHART_PAGE_SIZE));

  useEffect(() => {
    setPage(0);
  }, [data]);

  const effectivePage = Math.min(page, totalPages - 1);
  const start = effectivePage * CHART_PAGE_SIZE;
  const pageData = useMemo(
    () => data.slice(start, start + CHART_PAGE_SIZE),
    [data, start],
  );

  return (
    <div>
      <HorizontalBarChart data={pageData} maxValue={globalMax} unit={unit} />
      {data.length > CHART_PAGE_SIZE && (
        <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={effectivePage <= 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft size={18} />
            Anterior
          </button>
          <span className="text-sm text-gray-500 tabular-nums">
            {start + 1}–{Math.min(start + CHART_PAGE_SIZE, data.length)} de {data.length} · Página{' '}
            {effectivePage + 1}/{totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={effectivePage >= totalPages - 1}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            Siguiente
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

function VerticalBarChart({ data }: {
  data: { label: string; value: number; color?: string }[];
}) {
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="flex items-end justify-between gap-2 h-40">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <span className="text-xs font-medium text-gray-700 mb-1">{item.value}</span>
          <div
            className="w-full rounded-t-lg transition-all duration-500"
            style={{
              height: `${(item.value / max) * 100}%`,
              backgroundColor: item.color || '#77A14B',
              minHeight: item.value > 0 ? '8px' : '2px',
            }}
          />
          <span className="text-xs text-gray-500 mt-2 text-center leading-tight">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// Gráfico de donut para distribución de roles
function DonutChart({ data }: {
  data: { label: string; value: number; color: string }[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <p className="text-gray-400 text-center py-8">Sin datos</p>;

  let cumulative = 0;
  const segments = data.map((d) => {
    const pct = (d.value / total) * 100;
    const offset = cumulative;
    cumulative += pct;
    return { ...d, pct, offset };
  });

  // Build conic-gradient
  const gradientParts = segments.map(
    (s) => `${s.color} ${s.offset}% ${s.offset + s.pct}%`
  );
  const gradient = `conic-gradient(${gradientParts.join(', ')})`;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32 flex-shrink-0">
        <div
          className="w-full h-full rounded-full"
          style={{ background: gradient }}
        />
        <div className="absolute inset-3 bg-white rounded-full flex items-center justify-center">
          <span className="text-lg font-bold text-gray-800">{total}</span>
        </div>
      </div>
      <div className="space-y-2 flex-1">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-sm text-gray-600 flex-1">{s.label}</span>
            <span className="text-sm font-medium text-gray-800">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// StatCard
function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary',
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: 'primary' | 'secondary' | 'accent' | 'danger';
}) {
  const colorClasses = {
    primary: 'bg-primary/20 text-accent-green-dark',
    secondary: 'bg-secondary/20 text-blue-700',
    accent: 'bg-orange-100 text-orange-700',
    danger: 'bg-red-100 text-red-700',
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend === 'up' ? 'text-green-600' : 'text-red-500'
            }`}>
              <ArrowUpRight size={16} />
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

// ============================================
// PÁGINA PRINCIPAL DEL DASHBOARD
// ============================================
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await adminStatsApi.dashboard();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [reloadToken]);

  const categoryChartData = useMemo(() => {
    if (!stats) return [];
    return stats.productsByCategory.map((d) => ({ label: d.name, value: d.count }));
  }, [stats]);

  const brandChartData = useMemo(() => {
    if (!stats) return [];
    return stats.productsByBrand.map((d) => ({ label: d.name, value: d.count }));
  }, [stats]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-button-green" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-4">
        <p className="text-red-600">{error || 'No se pudieron cargar las estadísticas'}</p>
        <button
          type="button"
          onClick={() => setReloadToken((t) => t + 1)}
          className="px-4 py-2 rounded-xl bg-white border border-red-200 text-red-700 text-sm font-medium hover:bg-red-100/50 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const { counts } = stats;

  // Datos para gráficos
  const usersChartData = stats.usersOverTime.map(d => ({
    label: d.label.split(' ')[0], // Solo "Abr", "Mar", etc.
    value: d.count,
  }));

  const categoryMax =
    categoryChartData.length > 0 ? Math.max(...categoryChartData.map((d) => d.value), 1) : 1;
  const brandMax = brandChartData.length > 0 ? Math.max(...brandChartData.map((d) => d.value), 1) : 1;

  const roleDonutData = stats.usersByRole.map((r) => ({
    label: ROLE_LABELS[r.role] || r.role,
    value: r.count,
    color: r.role === 'admin' ? '#7C3AED' : r.role === 'partner' ? '#D97706' : '#2563EB',
  }));

  const supermarketChartData = stats.supermarkets.map((s, i) => {
    const colors = ['#E31837', '#0066B3', '#FF6B00', '#00A651', '#1E4D92', '#E4002B'];
    return {
      label: s.name,
      value: s.storeCount,
      color: colors[i % colors.length],
    };
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Resumen general de la plataforma</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Usuarios"
          value={counts.totalUsers}
          icon={Users}
          color="primary"
        />
        <StatCard
          title="Usuarios Activos"
          value={counts.activeUsers}
          icon={UserCheck}
          color="secondary"
        />
        <StatCard
          title="Productos"
          value={counts.totalProducts}
          icon={ShoppingBag}
          color="accent"
        />
        <StatCard
          title="Categorías"
          value={counts.totalCategories}
          icon={Tag}
          color="primary"
        />
      </div>

      {/* Segunda fila de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Supermercados"
          value={counts.totalSupermarkets}
          icon={Store}
          color="secondary"
        />
        <StatCard
          title="Marcas"
          value={counts.totalBrands}
          icon={Package}
          color="accent"
        />
        <StatCard
          title="Carritos Creados"
          value={counts.totalCarts}
          icon={ShoppingCart}
          color="primary"
        />
        <StatCard
          title="Usuarios Inactivos"
          value={counts.inactiveUsers}
          icon={UserX}
          color="danger"
        />
      </div>

      {/* Gráficos - primera fila */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usuarios registrados por mes */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Registro de Usuarios por Mes</h3>
          <VerticalBarChart data={usersChartData} />
        </div>

        {/* Distribución por rol */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Usuarios por Rol</h3>
          <DonutChart data={roleDonutData} />
        </div>
      </div>

      {/* Gráficos - segunda fila */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos por categoría */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Productos por categoría</h3>
          {categoryChartData.length > 0 ? (
            <PaginatedHorizontalBarChart data={categoryChartData} maxValue={categoryMax} />
          ) : (
            <p className="text-gray-400 text-center py-8">Sin datos</p>
          )}
        </div>

        {/* Productos por marca */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Productos por marca</h3>
          {brandChartData.length > 0 ? (
            <PaginatedHorizontalBarChart data={brandChartData} maxValue={brandMax} />
          ) : (
            <p className="text-gray-400 text-center py-8">Sin datos</p>
          )}
        </div>
      </div>

      {/* Tercera fila */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supermercados */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Supermercados Activos</h3>
          {stats.supermarkets.length > 0 ? (
            <div className="space-y-3">
              {stats.supermarkets.map((sm, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: supermarketChartData[index]?.color || '#77A14B' }}
                    >
                      <Store size={18} />
                    </div>
                    <span className="font-medium text-gray-800">{sm.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {sm.storeCount} tienda{sm.storeCount !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">Sin supermercados activos</p>
          )}
        </div>

        {/* Últimos usuarios */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Usuarios Recientes</h3>
          <div className="space-y-3">
            {stats.recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-accent-green-dark font-semibold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                    {ROLE_LABELS[user.role]}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(user.createdAt).toLocaleDateString('es-VE', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resumen general */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Resumen del Catalogo</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-button-green">{counts.totalProducts}</p>
            <p className="text-sm text-gray-500 mt-1">Productos</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-blue-600">{counts.categoriesWithProducts}</p>
            <p className="text-sm text-gray-500 mt-1">Categorias con productos</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-orange-600">{counts.totalBrands}</p>
            <p className="text-sm text-gray-500 mt-1">Marcas registradas</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl text-center">
            <p className="text-2xl font-bold text-purple-600">{counts.totalCartItems}</p>
            <p className="text-sm text-gray-500 mt-1">Items en carritos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
