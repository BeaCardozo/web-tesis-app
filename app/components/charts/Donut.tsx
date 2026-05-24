'use client';

import { useMemo } from 'react';
import { Modal } from '../Modal';

// ============================================
// PALETAS
// ============================================
export const DONUT_PALETTES = {
  green: ['#316746', '#437D68', '#77A14B', '#A5C87C', '#BADD71', '#D4ECA5', '#B1C7A1'],
  blue: ['#1E40AF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'],
} as const;

/** Paletas extendidas (más stops) para cuando se renderizan TODOS los segmentos. */
export const DONUT_PALETTES_FULL = {
  green: ['#1F4A33', '#2A5A3F', '#316746', '#3D7457', '#437D68', '#5A9159', '#77A14B', '#8FB85D', '#A5C87C', '#BADD71', '#CEE894', '#D4ECA5'],
  blue: ['#0F2C6B', '#1E40AF', '#2452C2', '#2563EB', '#3B82F6', '#4F92F7', '#60A5FA', '#7AB5FB', '#93C5FD', '#AFD3FD', '#BFDBFE', '#DBEAFE'],
} as const;

export type DonutPaletteKey = keyof typeof DONUT_PALETTES;

// ============================================
// HELPERS DE COLOR
// ============================================
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

/** Genera una paleta de N colores interpolando entre los stops dados. */
export function buildPalette(stops: readonly string[], count: number): string[] {
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

/** Construye los arcos cumulativos del donut sin mutar variables en el render scope. */
function buildArcs<T>(items: T[], valueOf: (item: T) => number, total: number, circumference: number) {
  return items.reduce<{ length: number; offset: number }[]>((acc, item) => {
    const length = total > 0 ? (valueOf(item) / total) * circumference : 0;
    const prev = acc[acc.length - 1];
    const offset = prev ? prev.offset + prev.length : 0;
    acc.push({ length, offset });
    return acc;
  }, []);
}

// ============================================
// DONUT CHART (Top N + Otros)
// ============================================
interface DonutChartProps {
  data: { name: string; count: number }[];
  palette?: DonutPaletteKey;
  topN?: number;
}

export function DonutChart({ data, palette = 'green', topN = 6 }: DonutChartProps) {
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

  const arcs = buildArcs(segments, (s) => s.count, total, circumference);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative flex-shrink-0">
        <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#F3F4F6" strokeWidth="18" />
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
          <span className="text-[11px] uppercase tracking-wider text-gray-400">Total</span>
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
              <span className="text-gray-500 tabular-nums text-xs">{pct.toFixed(1)}%</span>
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

// ============================================
// FIXED COLOR DONUT (colores ya asignados, p. ej. roles de usuario)
// ============================================
interface FixedColorDonutProps {
  data: { label: string; value: number; color: string }[];
}

export function FixedColorDonut({ data }: FixedColorDonutProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <p className="text-gray-400 text-sm">Sin datos</p>;

  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const arcs = buildArcs(data, (d) => d.value, total, circumference);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative flex-shrink-0">
        <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#F3F4F6" strokeWidth="18" />
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
          <span className="text-[11px] uppercase tracking-wider text-gray-400">Total</span>
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
              <span className="text-gray-500 tabular-nums text-xs">{pct.toFixed(1)}%</span>
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

// ============================================
// FULL DONUT MODAL (dona grande con todos los segmentos)
// ============================================
interface FullDonutModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  data: { name: string; count: number }[];
  palette?: keyof typeof DONUT_PALETTES_FULL;
}

export function FullDonutModal({
  open,
  onClose,
  title,
  data,
  palette = 'green',
}: FullDonutModalProps) {
  const { sorted, total, colors } = useMemo(() => {
    const s = [...data].sort((a, b) => b.count - a.count);
    const t = s.reduce((acc, x) => acc + x.count, 0);
    const c = buildPalette(DONUT_PALETTES_FULL[palette], s.length);
    return { sorted: s, total: t, colors: c };
  }, [data, palette]);

  const radius = 90;
  const stroke = 28;
  const C = 2 * Math.PI * radius;
  const arcs = buildArcs(sorted, (s) => s.count, total, C);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={`${sorted.length} ${sorted.length === 1 ? 'segmento' : 'segmentos'} · ${total.toLocaleString()} en total`}
      size="xl"
    >
      {total === 0 ? (
        <p className="text-gray-400 text-sm text-center py-12">Sin datos</p>
      ) : (
        <>
          <div className="flex justify-center mb-8">
            <div className="relative">
              <svg width="240" height="240" viewBox="0 0 240 240" className="-rotate-90">
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
                  <span className="flex-1 text-gray-700 truncate" title={seg.name}>
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
    </Modal>
  );
}
