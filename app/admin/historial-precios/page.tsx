'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Search,
  Loader2,
  AlertTriangle,
  ChevronDown,
  Package,
} from 'lucide-react';
import {
  adminStatsApi,
  AdminPriceHistory,
  productsApi,
  ApiProduct,
} from '../../lib/api';

// ============================================
// CONFIG
// ============================================
const RANGES = [
  { value: 7, label: '7d' },
  { value: 14, label: '14d' },
  { value: 30, label: '30d' },
  { value: 60, label: '60d' },
  { value: 90, label: '90d' },
];

const CHAIN_COLORS: Record<string, string> = {
  'gama-en-linea': '#77A14B',
  'central-madeirense': '#3B82F6',
  plansuarez: '#F59E0B',
};
const FALLBACK_COLORS = ['#9333EA', '#EF4444', '#06B6D4', '#EC4899', '#8B5CF6'];
const AVG_COLOR = '#94A3B8';

// ============================================
// HELPERS NUMÉRICOS (igual que /analista/historial)
// ============================================
function niceTicks(
  min: number,
  max: number,
  target = 5,
): { ticks: number[]; step: number } {
  if (min === max) {
    const span = Math.abs(min) > 0 ? Math.abs(min) * 0.2 : 1;
    return niceTicks(min - span, max + span, target);
  }
  const range = max - min;
  const roughStep = range / (target - 1);
  const mag = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalized = roughStep / mag;
  let step: number;
  if (normalized < 1.5) step = 1 * mag;
  else if (normalized < 3) step = 2 * mag;
  else if (normalized < 7) step = 5 * mag;
  else step = 10 * mag;
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = niceMin; v <= niceMax + step / 2; v += step) {
    ticks.push(Number(v.toFixed(8)));
  }
  return { ticks, step };
}

function decimalsForStep(step: number): number {
  if (step >= 1) return 0;
  if (step >= 0.1) return 1;
  if (step >= 0.01) return 2;
  return Math.max(2, Math.ceil(-Math.log10(step)) + 1);
}

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2)
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  const t = 0.2;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) * t;
    const cp1y = p1.y + (p2.y - p0.y) * t;
    const cp2x = p2.x - (p3.x - p1.x) * t;
    const cp2y = p2.y - (p3.y - p1.y) * t;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

function fmt(v: number | null | undefined, decimals = 2): string {
  if (v == null || !Number.isFinite(v)) return '—';
  return `$${v.toFixed(decimals)}`;
}

// ============================================
// STAT CARD (igual al dashboard analista)
// ============================================
function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  iconColor = 'primary',
  trend,
}: {
  title: string;
  value: string;
  subtext?: string;
  icon: React.ElementType;
  iconColor?: 'primary' | 'secondary' | 'warning' | 'success' | 'danger' | 'neutral';
  trend?: 'up' | 'down' | 'neutral';
}) {
  const colorClasses = {
    primary: 'bg-primary/20 text-accent-green-dark',
    secondary: 'bg-blue-100 text-blue-700',
    warning: 'bg-orange-100 text-orange-700',
    success: 'bg-green-100 text-green-700',
    danger: 'bg-red-100 text-red-700',
    neutral: 'bg-gray-100 text-gray-600',
  };
  const trendColor =
    trend === 'up'
      ? 'text-red-500'
      : trend === 'down'
        ? 'text-green-600'
        : 'text-gray-800';

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${trendColor}`}>{value}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[iconColor]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

// ============================================
// LINE CHART (multi-línea genérico)
// ============================================
type ChartLineSeries = {
  id: string;
  name: string;
  color: string;
  dashed?: boolean;
  emphasis?: boolean;
  values: Array<number | null>;
};

function LineChart({
  days,
  series,
}: {
  days: string[];
  series: ChartLineSeries[];
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (days.length === 0 || series.length === 0) return null;

  const allValues: number[] = [];
  for (const s of series) {
    for (const v of s.values) if (v != null) allValues.push(v);
  }
  if (allValues.length === 0) return null;

  const CHART_W = 820;
  const CHART_H = 340;
  const PAD_L = 56;
  const PAD_R = 20;
  const PAD_T = 16;
  const PAD_B = 44;
  const innerW = CHART_W - PAD_L - PAD_R;
  const innerH = CHART_H - PAD_T - PAD_B;

  const dataMin = Math.min(...allValues);
  const dataMax = Math.max(...allValues);
  const { ticks: rawTicks, step: tickStep } = niceTicks(dataMin, dataMax, 5);
  const tickDecimals = Math.max(2, decimalsForStep(tickStep));
  const seenTicks = new Set<string>();
  const ticks = rawTicks.filter((t) => {
    const k = t.toFixed(tickDecimals);
    if (seenTicks.has(k)) return false;
    seenTicks.add(k);
    return true;
  });
  const yMin = ticks[0];
  const yMax = ticks[ticks.length - 1];
  const yRange = yMax - yMin || 1;

  const xFor = (i: number) =>
    PAD_L + (days.length === 1 ? innerW / 2 : (i / (days.length - 1)) * innerW);
  const yFor = (v: number) => PAD_T + ((yMax - v) / yRange) * innerH;

  const maxLabels = 7;
  const labelStep = Math.max(1, Math.ceil(days.length / maxLabels));
  const xLabels = days
    .map((day, i) => ({ i, day }))
    .filter((x, idx, arr) => idx === 0 || idx === arr.length - 1 || x.i % labelStep === 0);

  const chainPaths = series.map((s) => {
    const pts = s.values
      .map((v, i) => (v != null ? { x: xFor(i), y: yFor(v), i } : null))
      .filter((p): p is { x: number; y: number; i: number } => p !== null);
    return { chain: s, points: pts };
  });

  const hoveredX = hoverIdx != null ? xFor(hoverIdx) : null;
  const hoveredDayStr = hoverIdx != null ? days[hoverIdx] : null;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const xRel = ((e.clientX - rect.left) / rect.width) * CHART_W;
    if (xRel < PAD_L - 8 || xRel > CHART_W - PAD_R + 8) {
      setHoverIdx(null);
      return;
    }
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < days.length; i++) {
      const d = Math.abs(xFor(i) - xRel);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    setHoverIdx(best);
  };

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${CHART_W} ${CHART_H}`}
        className="w-full h-80"
        role="img"
        aria-label="Histórico de precios"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIdx(null)}
      >
        {ticks.map((t) => {
          const y = yFor(t);
          return (
            <g key={`tick-${t}`}>
              <line x1={PAD_L} y1={y} x2={CHART_W - PAD_R} y2={y} stroke="#f3f4f6" strokeWidth="1" />
              <text
                x={PAD_L - 10}
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize="11"
                fill="#9ca3af"
              >
                ${t.toFixed(tickDecimals)}
              </text>
            </g>
          );
        })}

        <line
          x1={PAD_L}
          y1={CHART_H - PAD_B}
          x2={CHART_W - PAD_R}
          y2={CHART_H - PAD_B}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
        {xLabels.map(({ i, day }) => {
          const x = xFor(i);
          return (
            <text
              key={`xlab-${i}`}
              x={x}
              y={CHART_H - PAD_B + 18}
              textAnchor="middle"
              fontSize="11"
              fill="#6b7280"
            >
              {new Date(day).toLocaleDateString('es-VE', { day: '2-digit', month: 'short' })}
            </text>
          );
        })}

        {hoveredX != null && (
          <line
            x1={hoveredX}
            y1={PAD_T}
            x2={hoveredX}
            y2={CHART_H - PAD_B}
            stroke="#d1d5db"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        )}

        {chainPaths.map((cp) => {
          if (cp.points.length < 2) return null;
          return (
            <path
              key={`line-${cp.chain.id}`}
              d={smoothPath(cp.points)}
              fill="none"
              stroke={cp.chain.color}
              strokeWidth={cp.chain.emphasis ? 2.5 : 2}
              strokeDasharray={cp.chain.dashed ? '5 4' : undefined}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {chainPaths.map((cp) =>
          cp.points.map((p) => (
            <circle
              key={`pt-${cp.chain.id}-${p.i}`}
              cx={p.x}
              cy={p.y}
              r={hoverIdx === p.i ? 5 : 3.5}
              fill="white"
              stroke={cp.chain.color}
              strokeWidth={cp.chain.emphasis ? 2 : 1.5}
            />
          )),
        )}
      </svg>

      {hoveredDayStr && hoveredX != null && hoverIdx != null && (
        <div
          className="pointer-events-none absolute bg-white shadow-lg rounded-xl border border-gray-100 px-4 py-3 text-sm"
          style={{
            left: `${(hoveredX / CHART_W) * 100}%`,
            top: 0,
            transform: 'translate(-50%, -12px) translateY(-100%)',
            minWidth: 220,
          }}
        >
          <p className="font-semibold text-gray-800 mb-2 pb-2 border-b border-gray-100">
            {new Date(hoveredDayStr).toLocaleDateString('es-VE', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
          <div className="space-y-1.5">
            {series.map((s) => {
              const v = s.values[hoverIdx];
              return (
                <div key={s.id} className="flex items-center justify-between gap-4 text-xs">
                  <span className="flex items-center gap-2 text-gray-600">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: s.color }}
                    />
                    {s.name}
                  </span>
                  <span className="font-semibold" style={{ color: s.color }}>
                    {v != null ? `$${v.toFixed(2)}` : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// PÁGINA ADMIN: HISTORIAL DE PRECIOS
// ============================================
export default function AdminPriceHistoryPage() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const [history, setHistory] = useState<AdminPriceHistory | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const [selectedDays, setSelectedDays] = useState(30);
  const [hiddenChains, setHiddenChains] = useState<Set<string>>(new Set());
  const [showAvg, setShowAvg] = useState(false);

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPickerOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [isPickerOpen]);

  // Cargar lista de productos canónicos
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingProducts(true);
        setProductsError(null);
        const res = await productsApi.list({ page: 1, limit: 100 });
        if (cancelled) return;
        setProducts(res.items);
        if (res.items.length > 0 && !selectedProductId) {
          setSelectedProductId(res.items[0].id);
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

  // Cargar histórico
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
        const data = await adminStatsApi.priceHistory(selectedProductId, selectedDays);
        if (!cancelled) setHistory(data);
      } catch (err) {
        if (!cancelled) {
          setHistoryError(err instanceof Error ? err.message : 'Error al cargar histórico');
          setHistory(null);
        }
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedProductId, selectedDays]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, searchTerm]);

  const seriesData = history?.series ?? [];
  const chartDays = seriesData.map((s) => s.day);

  // Color por cadena: mapping fijo + fallback
  const colorForChain = (slug: string, idx: number): string =>
    CHAIN_COLORS[slug] ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length];

  // Construir series para la gráfica: una por cadena + (opcional) promedio
  const chartSeries: ChartLineSeries[] = useMemo(() => {
    if (!history) return [];
    const chainsList = history.chains;
    const out: ChartLineSeries[] = chainsList
      .filter((c) => !hiddenChains.has(c.slug))
      .map((c, i) => ({
        id: c.slug,
        name: c.name,
        color: colorForChain(c.slug, chainsList.findIndex((cc) => cc.slug === c.slug)),
        values: history.series.map((p) => p.perChain[c.slug] ?? null),
      }));
    if (showAvg) {
      out.push({
        id: '__avg__',
        name: 'Promedio global',
        color: AVG_COLOR,
        dashed: true,
        values: history.series.map((p) => p.avgAll),
      });
    }
    return out;
  }, [history, hiddenChains, showAvg]);

  // Stats globales: tomamos el promedio entre cadenas como referencia
  const stats = useMemo(() => {
    if (!history || seriesData.length === 0) return null;
    const avgValues = seriesData
      .map((p) => p.avgAll)
      .filter((v): v is number => v != null);
    if (avgValues.length === 0) return null;

    const firstAvg = avgValues[0];
    const lastAvg = avgValues[avgValues.length - 1];
    const priceChange = firstAvg > 0 ? ((lastAvg - firstAvg) / firstAvg) * 100 : 0;

    // Cadena más barata en el último día
    const lastDay = seriesData[seriesData.length - 1];
    let cheapest: { name: string; price: number } | null = null;
    let mostExpensive: { name: string; price: number } | null = null;
    for (const chain of history.chains) {
      const price = lastDay.perChain[chain.slug];
      if (price == null) continue;
      if (cheapest == null || price < cheapest.price) {
        cheapest = { name: chain.name, price };
      }
      if (mostExpensive == null || price > mostExpensive.price) {
        mostExpensive = { name: chain.name, price };
      }
    }

    // Spread: diferencia max-min último día
    const spread =
      cheapest != null && mostExpensive != null && cheapest.price > 0
        ? ((mostExpensive.price - cheapest.price) / cheapest.price) * 100
        : null;

    return {
      lastAvg,
      priceChange,
      avgPrice: avgValues.reduce((a, b) => a + b, 0) / avgValues.length,
      minPrice: Math.min(...avgValues),
      maxPrice: Math.max(...avgValues),
      cheapest,
      mostExpensive,
      spread,
    };
  }, [history, seriesData]);

  const toggleChain = (slug: string) => {
    setHiddenChains((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Historial de Precios</h1>
          <p className="text-gray-500 mt-0.5">
            Evolución comparativa de precios entre todas las cadenas
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {/* Combobox de producto */}
          <div className="relative flex-1 min-w-[260px]" ref={pickerRef}>
            <button
              type="button"
              onClick={() => setIsPickerOpen((v) => !v)}
              className="w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Package size={16} className="text-accent-green-dark" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[11px] text-gray-400 leading-none mb-0.5">Producto</p>
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {selectedProduct?.name ?? 'Selecciona un producto'}
                  </p>
                </div>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform flex-shrink-0 ${
                  isPickerOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isPickerOpen && (
              <div className="absolute z-30 mt-2 left-0 right-0 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-3 border-b border-gray-100">
                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Buscar producto..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-accent-green focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {loadingProducts && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin text-gray-400" size={20} />
                  </div>
                )}

                {productsError && !loadingProducts && (
                  <div className="flex items-start gap-2 m-3 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                    <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{productsError}</span>
                  </div>
                )}

                {!loadingProducts && !productsError && (
                  <div className="max-h-72 overflow-y-auto py-1">
                    {filteredProducts.map((p) => {
                      const isSelected = selectedProductId === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedProductId(p.id);
                            setIsPickerOpen(false);
                            setSearchTerm('');
                          }}
                          className={`w-full text-left px-4 py-2 flex items-center justify-between gap-3 transition-colors ${
                            isSelected
                              ? 'bg-primary/20 text-accent-green-dark'
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <span className="text-sm font-medium truncate">{p.name}</span>
                          <span className="text-xs opacity-70 flex-shrink-0">
                            {p.category?.name ?? ''}
                          </span>
                        </button>
                      );
                    })}
                    {filteredProducts.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-6 px-4">
                        No se encontraron productos
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Pills de rango */}
          <div className="flex items-center bg-gray-100 rounded-xl p-1">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setSelectedDays(r.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  selectedDays === r.value
                    ? 'bg-white text-accent-green-dark shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loadingHistory && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <Loader2 className="animate-spin mx-auto text-gray-400" size={32} />
        </div>
      )}

      {historyError && !loadingHistory && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-200 flex items-center gap-3 text-red-700">
          <AlertTriangle size={20} />
          <span>{historyError}</span>
        </div>
      )}

      {!loadingHistory && !historyError && history && seriesData.length > 0 && stats && (
        <>
          {/* Info del producto */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-gray-800">{history.productName}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {selectedProduct?.category?.name ?? '—'} ·{' '}
                  {history.chains.length}{' '}
                  {history.chains.length === 1 ? 'cadena activa' : 'cadenas activas'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800">{fmt(stats.lastAvg)}</p>
                <p className="text-xs text-gray-400 mt-0.5">Promedio global hoy</p>
              </div>
            </div>
          </div>

          {/* Stats — 4 cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              title="Variación"
              value={`${stats.priceChange >= 0 ? '+' : ''}${stats.priceChange.toFixed(1)}%`}
              subtext={`últimos ${selectedDays} días`}
              icon={stats.priceChange >= 0 ? TrendingUp : TrendingDown}
              iconColor={stats.priceChange >= 0 ? 'danger' : 'success'}
              trend={stats.priceChange > 0 ? 'up' : stats.priceChange < 0 ? 'down' : 'neutral'}
            />
            <StatCard
              title="Más barata hoy"
              value={stats.cheapest ? fmt(stats.cheapest.price) : '—'}
              subtext={stats.cheapest?.name ?? '—'}
              icon={DollarSign}
              iconColor="success"
            />
            <StatCard
              title="Más cara hoy"
              value={stats.mostExpensive ? fmt(stats.mostExpensive.price) : '—'}
              subtext={stats.mostExpensive?.name ?? '—'}
              icon={DollarSign}
              iconColor="danger"
            />
            <StatCard
              title="Spread"
              value={
                stats.spread == null
                  ? '—'
                  : `+${stats.spread.toFixed(1)}%`
              }
              subtext="caro vs barato"
              icon={
                stats.spread == null
                  ? Minus
                  : stats.spread > 0
                    ? ArrowUpRight
                    : ArrowDownRight
              }
              iconColor="warning"
            />
          </div>

          {/* Gráfica */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
              <h3 className="font-semibold text-gray-800">Comparativa por cadena</h3>
              <p className="text-xs text-gray-400">
                {seriesData.length} {seriesData.length === 1 ? 'observación' : 'observaciones'}
              </p>
            </div>

            {/* Toggles de cadenas */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {history.chains.map((ch, i) => {
                const isHidden = hiddenChains.has(ch.slug);
                const color = colorForChain(ch.slug, i);
                return (
                  <button
                    key={ch.slug}
                    onClick={() => toggleChain(ch.slug)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                      isHidden
                        ? 'border-gray-200 text-gray-400 bg-white'
                        : 'border-gray-200 text-gray-700 bg-gray-50'
                    }`}
                  >
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: color, opacity: isHidden ? 0.3 : 1 }}
                    />
                    {ch.name}
                  </button>
                );
              })}
              {history.chains.length > 1 && (
                <button
                  onClick={() => setShowAvg((v) => !v)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all border border-dashed ${
                    showAvg
                      ? 'border-gray-400 text-gray-700 bg-gray-50'
                      : 'border-gray-200 text-gray-400 bg-white'
                  }`}
                >
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: AVG_COLOR, opacity: showAvg ? 1 : 0.3 }}
                  />
                  Promedio global
                </button>
              )}
            </div>

            {chartSeries.length > 0 ? (
              <LineChart days={chartDays} series={chartSeries} />
            ) : (
              <div className="py-12 text-center text-sm text-gray-400">
                Selecciona al menos una cadena para mostrar la gráfica.
              </div>
            )}
          </div>

          {/* Tabla — una columna por cadena */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 pb-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-semibold text-gray-800">Detalle por día</h3>
              <p className="text-xs text-gray-400">
                {seriesData.length} {seriesData.length === 1 ? 'fila' : 'filas'}
              </p>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 bg-white">
                      Fecha
                    </th>
                    {history.chains.map((ch, i) => (
                      <th
                        key={ch.slug}
                        className="text-right py-3 px-4 text-sm font-semibold text-gray-600 bg-white"
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <span
                            className="inline-block w-2 h-2 rounded-full"
                            style={{ backgroundColor: colorForChain(ch.slug, i) }}
                          />
                          {ch.name}
                        </div>
                      </th>
                    ))}
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600 bg-white">
                      Promedio
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...seriesData].reverse().map((pt) => (
                    <tr
                      key={pt.day}
                      className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(pt.day).toLocaleDateString('es-VE', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      {history.chains.map((ch) => {
                        const v = pt.perChain[ch.slug];
                        return (
                          <td
                            key={ch.slug}
                            className="py-3 px-4 text-sm text-right text-gray-700"
                          >
                            {v != null ? `$${v.toFixed(2)}` : '—'}
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 text-sm text-right font-semibold text-gray-800">
                        {pt.avgAll != null ? `$${pt.avgAll.toFixed(2)}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!loadingHistory && !historyError && history && seriesData.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">
            Sin observaciones para los últimos {selectedDays} días.
          </p>
        </div>
      )}

      {!selectedProductId && !loadingProducts && (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
          <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">
            Selecciona un producto para ver su historial de precios.
          </p>
        </div>
      )}
    </div>
  );
}
