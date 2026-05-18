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
