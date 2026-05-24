import Link from 'next/link';
import { User } from 'lucide-react';

// ============================================
// FOOTER COMPLETO — páginas públicas (landing, login, register)
// ============================================
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-accent-green-dark text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <span className="text-lg block mb-2">
              <span className="font-bold text-primary-lighter">Caracas</span>
              <span className="font-bold text-white">Ahorra</span>
            </span>
            <p className="text-xs text-white/70 leading-snug">
              Comparador de precios de la canasta alimentaria en supermercados de Caracas.
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider mb-2 text-white/60">
              Plataforma
            </h4>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/login" className="text-white/80 hover:text-white transition-colors">
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-white/80 hover:text-white transition-colors">
                  Crear cuenta
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider mb-2 text-white/60">
              Acerca del proyecto
            </h4>
            <p className="text-xs text-white/80 leading-snug">
              Trabajo de grado · Universidad Metropolitana
              <br />
              Caracas, Venezuela
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-2 text-[11px] text-white/60">
          <p>© {year} CaracasAhorra</p>
          <div className="flex items-center gap-2">
            <User size={11} />
            <span>David Dávila y Beatriz Cardozo</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================
// FOOTER COMPACTO — páginas internas con sidebar (admin, analista, usuario)
// ============================================
export function FooterCompact() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-8 pt-3 border-t border-gray-200">
      <div className="px-6 pb-3 flex flex-col md:flex-row items-center justify-between gap-1 text-[11px] text-gray-500">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">
            <span className="text-button-green">Caracas</span>
            <span className="text-accent-green-dark">Ahorra</span>
          </span>
          <span className="text-gray-300">·</span>
          <span>© {year}</span>
        </div>
        <p>Trabajo de grado · Universidad Metropolitana</p>
      </div>
    </footer>
  );
}
