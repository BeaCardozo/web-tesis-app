/**
 * Parsea un string ISO date-only ('YYYY-MM-DD') como fecha LOCAL.
 *
 * `new Date('2026-05-18')` lo interpreta como UTC midnight. En zonas horarias
 * con offset negativo (ej. America/Caracas, UTC-4) el resultado renderizado
 * cae un día antes. Este helper construye el Date desde año/mes/día como
 * componentes locales, evitando el off-by-one.
 */
export function parseDayLocal(day: string): Date {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Diferencia entre `isoDate` y ahora, formateada en español ("hace 5 min", "ayer", ...). */
export function formatTimeAgo(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays === 1) return 'ayer';
  return `hace ${diffDays} dias`;
}
