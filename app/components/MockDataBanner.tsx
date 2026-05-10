'use client';

import { Info } from 'lucide-react';

/** Aviso para pantallas que aún consumen mocks u operan sin API real. */
export function MockDataBanner() {
  return (
    <div
      className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-950 text-sm"
      role="status"
    >
      <Info className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" aria-hidden />
      <p>
        <span className="font-medium">Datos de demostración.</span>{' '}
        Esta pantalla no está conectada a la API; los valores son de ejemplo.
      </p>
    </div>
  );
}
