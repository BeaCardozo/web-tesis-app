'use client';

import { useState, useEffect, useMemo } from 'react';
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
  X,
} from 'lucide-react';
import { adminStatsApi, DashboardStats, BackendRole } from '../../lib/api';
import { supermarketLogoSrc } from '../../components/SupermarketLogo';

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

// ============================================
// PALETAS DE DONA
// ============================================
const DONUT_PALETTES = {
  green: ['#316746', '#437D68', '#77A14B', '#A5C87C', '#BADD71', '#D4ECA5', '#B1C7A1'],
  blue: ['#1E40AF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'],
} as const;

const DONUT_PALETTES_FULL = {
  green: ['#1F4A33', '#2A5A3F', '#316746', '#3D7457', '#437D68', '#5A9159', '#77A14B', '#8FB85D', '#A5C87C', '#BADD71', '#CEE894', '#D4ECA5'],
  blue: ['#0F2C6B', '#1E40AF', '#2452C2', '#2563EB', '#3B82F6', '#4F92F7', '#60A5FA', '#7AB5FB', '#93C5FD', '#AFD3FD', '#BFDBFE', '#DBEAFE'],
} as const;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function buildPalette(stops: readonly string[], count: number): string[] {
  if (count <= 0) return [];
  if (count === 1) return [stops[0]];
  const result: string[] = [];
  const lastStop = stops.length - 1;
  for (let i = 0; i < count; i++) {
    const t = (i / (count - 1)) * lastStop;
    const idx = Math.floor(t);
    const frac = t - idx;
    const next = Math.min(idx + 1, lastStop);
    const [r1, g1, b1] = hexToRgb(stops[idx]);
    const [r2, g2, b2] = hexToRgb(stops[next]);
    result.push(
      rgbToHex(
        r1 + (r2 - r1) * frac,
        g1 + (g2 - g1) * frac,
        b1 + (b2 - b1) * frac,
      ),
    );
  }
  return result;
}

// ============================================
// COMPONENTES DE GRÁFICOS
// ============================================

// Dona "Top N + Otros" (igual que la del analista)
function DonutChart({
  data,
  palette = 'green',
  topN = 6,
}: {
  data: { name: string; count: number }[];
  palette?: keyof typeof DONUT_PALETTES;
  topN?: number;
}) {
  const segments = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.count - a.count);
    if (sorted.length <= topN) return sorted;
    const top = sorted.slice(0, topN);
    const rest = sorted.slice(topN);
    const restSum = rest.reduce((acc, x) => acc + x.count, 0);
    return [...top, { name: `Otros (${rest.length})`, count: restSum }];
  }, [data, topN]);

  const total = segments.reduce((acc, s) => acc + s.count, 0);
  const colors = DONUT_PALETTES[palette];

  const radius = 56;
  const circumference = 2 * Math.PI * radius;

  if (total === 0) {
    return <p className="text-gray-400 text-sm">Sin datos</p>;
  }

  const arcs = segments.reduce<{ length: number; offset: number }[]>((acc, seg) => {
    const length = (seg.count / total) * circumference;
    const prev = acc[acc.length - 1];
    const offset = prev ? prev.offset + prev.length : 0;
    acc.push({ length, offset });
    return acc;
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative flex-shrink-0">
        <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#F3F4F6"
            strokeWidth="18"
          />
          {segments.map((seg, i) => {
            const { length, offset } = arcs[i];
            return (
              <circle
                key={i}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={colors[i % colors.length]}
                strokeWidth="18"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-gray-800 tabular-nums">
            {total.toLocaleString()}
          </span>
          <span className="text-[11px] uppercase tracking-wider text-gray-400">
            Total
          </span>
        </div>
      </div>

      <ul className="flex-1 w-full space-y-2 min-w-0">
        {segments.map((seg, i) => {
          const pct = (seg.count / total) * 100;
          return (
            <li key={i} className="flex items-center gap-3 text-sm min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span className="flex-1 text-gray-700 truncate" title={seg.name}>
                {seg.name}
              </span>
              <span className="text-gray-500 tabular-nums text-xs">
                {pct.toFixed(1)}%
              </span>
              <span className="font-medium text-gray-800 tabular-nums w-12 text-right">
                {seg.count.toLocaleString()}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Dona simple con colores fijos (para roles de usuario)
function FixedColorDonut({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <p className="text-gray-400 text-sm">Sin datos</p>;

  const radius = 56;
  const circumference = 2 * Math.PI * radius;

  const arcs = data.reduce<{ length: number; offset: number }[]>((acc, seg) => {
    const length = (seg.value / total) * circumference;
    const prev = acc[acc.length - 1];
    const offset = prev ? prev.offset + prev.length : 0;
    acc.push({ length, offset });
    return acc;
  }, []);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative flex-shrink-0">
        <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#F3F4F6"
            strokeWidth="18"
          />
          {data.map((seg, i) => {
            const { length, offset } = arcs[i];
            return (
              <circle
                key={i}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth="18"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-gray-800 tabular-nums">
            {total.toLocaleString()}
          </span>
          <span className="text-[11px] uppercase tracking-wider text-gray-400">
            Total
          </span>
        </div>
      </div>

      <ul className="flex-1 w-full space-y-2 min-w-0">
        {data.map((seg, i) => {
          const pct = (seg.value / total) * 100;
          return (
            <li key={i} className="flex items-center gap-3 text-sm min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="flex-1 text-gray-700 truncate" title={seg.label}>
                {seg.label}
              </span>
              <span className="text-gray-500 tabular-nums text-xs">
                {pct.toFixed(1)}%
              </span>
              <span className="font-medium text-gray-800 tabular-nums w-10 text-right">
                {seg.value.toLocaleString()}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Modal de detalle completo de la dona
function FullDonutModal({
  open,
  onClose,
  title,
  data,
  palette = 'green',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  data: { name: string; count: number }[];
  palette?: keyof typeof DONUT_PALETTES_FULL;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const { sorted, total, colors } = useMemo(() => {
    const s = [...data].sort((a, b) => b.count - a.count);
    const t = s.reduce((acc, x) => acc + x.count, 0);
    const c = buildPalette(DONUT_PALETTES_FULL[palette], s.length);
    return { sorted: s, total: t, colors: c };
  }, [data, palette]);

  if (!open) return null;

  const radius = 90;
  const stroke = 28;
  const C = 2 * Math.PI * radius;

  const arcs = sorted.reduce<{ length: number; offset: number }[]>((acc, seg) => {
    const length = total > 0 ? (seg.count / total) * C : 0;
    const prev = acc[acc.length - 1];
    const offset = prev ? prev.offset + prev.length : 0;
    acc.push({ length, offset });
    return acc;
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {sorted.length}{' '}
              {sorted.length === 1 ? 'segmento' : 'segmentos'} ·{' '}
              {total.toLocaleString()} en total
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-6">
          {total === 0 ? (
            <p className="text-gray-400 text-sm text-center py-12">Sin datos</p>
          ) : (
            <>
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <svg
                    width="240"
                    height="240"
                    viewBox="0 0 240 240"
                    className="-rotate-90"
                  >
                    <circle
                      cx="120"
                      cy="120"
                      r={radius}
                      fill="none"
                      stroke="#F3F4F6"
                      strokeWidth={stroke}
                    />
                    {sorted.map((seg, i) => {
                      const { length, offset } = arcs[i];
                      return (
                        <circle
                          key={i}
                          cx="120"
                          cy="120"
                          r={radius}
                          fill="none"
                          stroke={colors[i]}
                          strokeWidth={stroke}
                          strokeDasharray={`${length} ${C - length}`}
                          strokeDashoffset={-offset}
                          className="transition-all duration-500"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-semibold text-gray-800 tabular-nums">
                      {total.toLocaleString()}
                    </span>
                    <span className="text-[11px] uppercase tracking-wider text-gray-400">
                      Total
                    </span>
                  </div>
                </div>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
                {sorted.map((seg, i) => {
                  const pct = (seg.count / total) * 100;
                  return (
                    <li
                      key={i}
                      className="flex items-center gap-2.5 text-sm min-w-0 py-2 border-b border-gray-50"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: colors[i] }}
                      />
                      <span
                        className="flex-1 text-gray-700 truncate"
                        title={seg.name}
                      >
                        {seg.name}
                      </span>
                      <span className="text-gray-400 tabular-nums text-xs">
                        {pct.toFixed(1)}%
                      </span>
                      <span className="font-medium text-gray-800 tabular-nums text-xs w-10 text-right">
                        {seg.count.toLocaleString()}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

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
                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 shadow-sm p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img
                            src={logo}
                            alt={sm.name}
                            className="max-w-full max-h-full object-contain"
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
