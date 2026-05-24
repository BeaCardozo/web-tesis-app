'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCcw, X } from 'lucide-react';

/**
 * Detecta cuando otra pestaña del mismo origen cambia la sesión (login con
 * otro usuario, logout). Muestra un banner pidiendo recargar.
 *
 * Esto pasa porque `localStorage` se comparte entre pestañas del mismo origen.
 * Si en pesta_ña B se loguea otra cuenta, los tokens nuevos pisan los de
 * pestaña A. Cualquier request desde A va a usar el token nuevo y puede
 * causar 403 o redirecciones inesperadas.
 */

const TRACKED_KEYS = ['accessToken', 'currentUser'];

function captureSessionId(): string {
  if (typeof window === 'undefined') return '';
  const token = localStorage.getItem('accessToken') ?? '';
  const user = localStorage.getItem('currentUser') ?? '';
  return `${token.slice(-40)}::${user.slice(0, 40)}`;
}

export function SessionChangeBanner() {
  const [hasChanged, setHasChanged] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Capturamos la huella de la sesión al montar y escuchamos cambios en
  // localStorage hechos por OTRAS pestañas. El original vive en el closure
  // para no necesitar un estado sincrónico extra.
  useEffect(() => {
    const original = captureSessionId();
    const onStorage = (e: StorageEvent) => {
      if (e.key != null && !TRACKED_KEYS.includes(e.key)) return;
      const current = captureSessionId();
      if (current !== original) {
        setHasChanged(true);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (!hasChanged || dismissed) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md bg-white rounded-2xl shadow-lg border border-orange-200 p-4 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={18} className="text-orange-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-800 text-sm">
            Tu sesión cambió en otra pestaña
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Iniciaste sesión con otro usuario en otra ventana. Recarga esta página para usar
            la sesión actualizada.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-green-dark text-white text-xs font-medium hover:opacity-90 transition-opacity"
            >
              <RefreshCcw size={14} />
              Recargar
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Ignorar
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
