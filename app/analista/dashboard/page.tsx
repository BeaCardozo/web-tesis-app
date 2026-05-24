'use client';

import { useState, useEffect, useMemo } from 'react';
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
  X,
} from 'lucide-react';
import { analystApi, AnalystDashboard } from '../../lib/api';
import { supermarketLogoSrc } from '../../components/SupermarketLogo';

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

// Paleta de colores para los segmentos de la dona
const DONUT_PALETTES = {
  green: ['#316746', '#437D68', '#77A14B', '#A5C87C', '#BADD71', '#D4ECA5', '#B1C7A1'],
  blue: ['#1E40AF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'],
} as const;

// Paletas extendidas (con más stops) para cuando se muestran todos los segmentos
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

// Genera una paleta de N colores interpolando entre los stops dados
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

  // SVG donut con stroke-dasharray
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
      {/* Dona */}
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

      {/* Leyenda */}
      <ul className="flex-1 w-full space-y-2 min-w-0">
        {segments.map((seg, i) => {
          const pct = (seg.count / total) * 100;
          return (
            <li
              key={i}
              className="flex items-center gap-3 text-sm min-w-0"
            >
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
        {/* Header */}
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

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-6">
          {total === 0 ? (
            <p className="text-gray-400 text-sm text-center py-12">Sin datos</p>
          ) : (
            <>
              {/* Dona grande centrada */}
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

              {/* Leyenda en 3 columnas, ordenada por valor */}
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
              <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 shadow-sm p-2 flex items-center justify-center overflow-hidden">
                <img
                  src={logo}
                  alt={supermarket.name}
                  className="max-w-full max-h-full object-contain"
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
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-9 h-9 rounded-lg object-cover bg-gray-50 border border-gray-100"
                              />
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
