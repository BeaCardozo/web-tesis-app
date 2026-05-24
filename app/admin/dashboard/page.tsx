'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Users,
  ShoppingBag,
  Store,
  Tag,
  ShoppingCart,
  Loader2,
  UserCheck,
  UserX,
  Package,
  TrendingUp,
  PieChart,
  BarChart3,
  Maximize2,
} from 'lucide-react';
import { adminStatsApi, DashboardStats, BackendRole } from '../../lib/api';
import { supermarketLogoSrc } from '../../components/SupermarketLogo';
import {
  DonutChart,
  FixedColorDonut,
  FullDonutModal,
} from '../../components/charts/Donut';

// ============================================
// MAPEO DE ROLES
// ============================================
const ROLE_LABELS: Record<BackendRole, string> = {
  admin: 'Administrador',
  partner: 'Analista',
  consumer: 'Usuario',
};

const ROLE_COLORS: Record<BackendRole, string> = {
  admin: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200/60',
  partner: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60',
  consumer: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200/60',
};

function VerticalBarChart({
  data,
}: {
  data: { label: string; value: number; color?: string }[];
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end justify-between gap-2 h-40">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <span className="text-xs font-medium text-gray-700 mb-1 tabular-nums">
            {item.value}
          </span>
          <div
            className="w-full rounded-t-lg transition-all duration-500"
            style={{
              height: `${(item.value / max) * 100}%`,
              backgroundColor: item.color || '#77A14B',
              minHeight: item.value > 0 ? '8px' : '2px',
            }}
          />
          <span className="text-[11px] text-gray-400 mt-2 text-center leading-tight uppercase tracking-wider">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// StatCard estilo analista
function StatCard({
  title,
  value,
  icon: Icon,
  tone = 'primary',
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  tone?: 'primary' | 'secondary' | 'warning' | 'danger';
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
    danger: {
      iconWrap: 'bg-red-50 text-red-700',
      accent: 'from-red-100/60 to-transparent',
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
            {typeof value === 'number' ? value.toLocaleString() : value}
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

function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  tone = 'primary',
  action,
}: {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
  tone?: 'primary' | 'secondary' | 'warning';
  action?: React.ReactNode;
}) {
  const tones = {
    primary: 'bg-primary/15 text-accent-green-dark',
    secondary: 'bg-blue-50 text-blue-700',
    warning: 'bg-amber-50 text-amber-700',
  } as const;
  return (
    <div className="flex items-center justify-between mb-5 gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <div className={`p-1.5 rounded-lg ${tones[tone]}`}>
          <Icon size={16} />
        </div>
        <h3 className="font-semibold text-gray-800 truncate">{title}</h3>
        {subtitle && (
          <span className="text-xs text-gray-400 tabular-nums whitespace-nowrap">
            {subtitle}
          </span>
        )}
      </div>
      {action}
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
  const [openModal, setOpenModal] = useState<null | 'category' | 'brand'>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await adminStatsApi.dashboard();
        setStats(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Error al cargar estadísticas',
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [reloadToken]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500 gap-4">
        <p className="text-lg font-medium text-center max-w-md">
          {error || 'No se pudieron cargar las estadísticas'}
        </p>
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

  const { counts } = stats;

  const usersChartData = stats.usersOverTime.map((d) => ({
    label: d.label.split(' ')[0],
    value: d.count,
  }));

  const roleDonutData = stats.usersByRole.map((r) => ({
    label: ROLE_LABELS[r.role] || r.role,
    value: r.count,
    color:
      r.role === 'admin'
        ? '#7C3AED'
        : r.role === 'partner'
          ? '#D97706'
          : '#2563EB',
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100">
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-br from-primary/15 to-transparent pointer-events-none" />
        <div className="relative">
          <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Resumen general de la plataforma
          </p>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Usuarios"
          value={counts.totalUsers}
          icon={Users}
          tone="primary"
        />
        <StatCard
          title="Usuarios Activos"
          value={counts.activeUsers}
          icon={UserCheck}
          tone="secondary"
        />
        <StatCard
          title="Productos"
          value={counts.totalProducts}
          icon={ShoppingBag}
          tone="warning"
        />
        <StatCard
          title="Categorías"
          value={counts.totalCategories}
          icon={Tag}
          tone="primary"
        />
      </div>

      {/* Segunda fila de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Supermercados"
          value={counts.totalSupermarkets}
          icon={Store}
          tone="secondary"
        />
        <StatCard
          title="Marcas"
          value={counts.totalBrands}
          icon={Package}
          tone="warning"
        />
        <StatCard
          title="Carritos Creados"
          value={counts.totalCarts}
          icon={ShoppingCart}
          tone="primary"
        />
        <StatCard
          title="Usuarios Inactivos"
          value={counts.inactiveUsers}
          icon={UserX}
          tone="danger"
        />
      </div>

      {/* Gráficos - primera fila */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100">
          <SectionHeader
            title="Registro de Usuarios por Mes"
            icon={BarChart3}
            tone="primary"
          />
          <VerticalBarChart data={usersChartData} />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100">
          <SectionHeader
            title="Usuarios por Rol"
            icon={PieChart}
            tone="secondary"
          />
          <FixedColorDonut data={roleDonutData} />
        </div>
      </div>

      {/* Gráficos - segunda fila: donas Top N */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100">
          <SectionHeader
            title="Productos por categoría"
            subtitle={`· ${stats.productsByCategory.length} ${
              stats.productsByCategory.length === 1 ? 'categoría' : 'categorías'
            }`}
            icon={PieChart}
            tone="primary"
            action={
              stats.productsByCategory.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setOpenModal('category')}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-green-dark hover:text-accent-green px-2.5 py-1.5 rounded-lg hover:bg-primary/10 transition-colors whitespace-nowrap"
                >
                  <Maximize2 size={13} />
                  Ver detalle
                </button>
              ) : null
            }
          />
          {stats.productsByCategory.length > 0 ? (
            <DonutChart data={stats.productsByCategory} palette="green" />
          ) : (
            <p className="text-gray-400 text-sm">Sin datos</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100">
          <SectionHeader
            title="Productos por marca"
            subtitle={`· ${stats.productsByBrand.length} ${
              stats.productsByBrand.length === 1 ? 'marca' : 'marcas'
            }`}
            icon={PieChart}
            tone="secondary"
            action={
              stats.productsByBrand.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setOpenModal('brand')}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-900 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
                >
                  <Maximize2 size={13} />
                  Ver detalle
                </button>
              ) : null
            }
          />
          {stats.productsByBrand.length > 0 ? (
            <DonutChart data={stats.productsByBrand} palette="blue" />
          ) : (
            <p className="text-gray-400 text-sm">Sin datos</p>
          )}
        </div>
      </div>

      {/* Tercera fila */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100">
          <SectionHeader
            title="Supermercados Activos"
            icon={Store}
            tone="primary"
          />
          {stats.supermarkets.length > 0 ? (
            <div className="space-y-1">
              {stats.supermarkets.map((sm, index) => {
                const logo = supermarketLogoSrc(sm.name);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50/60 border-b border-gray-50 last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {logo ? (
                        <div className="relative w-10 h-10 rounded-lg bg-white border border-gray-200 shadow-sm overflow-hidden flex-shrink-0">
                          <Image
                            src={logo}
                            alt={sm.name}
                            fill
                            sizes="40px"
                            className="object-contain p-1"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 to-primary-lighter/40 flex items-center justify-center text-accent-green-dark font-bold text-sm shadow-sm flex-shrink-0">
                          {sm.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium text-gray-800 text-sm">
                        {sm.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Sin supermercados activos</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-gray-100">
          <SectionHeader
            title="Usuarios Recientes"
            icon={TrendingUp}
            tone="secondary"
          />
          <div className="space-y-0.5">
            {stats.recentUsers.slice(0, 3).map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-accent-green-dark font-semibold text-xs flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide ${ROLE_COLORS[user.role]}`}
                  >
                    {ROLE_LABELS[user.role]}
                  </span>
                  <p className="text-[10px] text-gray-400 mt-0.5 tabular-nums">
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

      <FullDonutModal
        open={openModal === 'category'}
        onClose={() => setOpenModal(null)}
        title="Productos por categoría — detalle completo"
        data={stats.productsByCategory}
        palette="green"
      />
      <FullDonutModal
        open={openModal === 'brand'}
        onClose={() => setOpenModal(null)}
        title="Productos por marca — detalle completo"
        data={stats.productsByBrand}
        palette="blue"
      />
    </div>
  );
}
