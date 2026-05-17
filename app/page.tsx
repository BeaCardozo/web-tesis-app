import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Search,
  RefreshCw,
  ShoppingCart,
  TrendingDown,
  Store,
} from 'lucide-react';

// ============================================
// LANDING PAGE — CaracasAhorra
// ============================================
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <TopNav />
      <Hero />
      <HowItWorks />
      <Footer />
    </div>
  );
}

// ============================================
// TOP NAV
// ============================================
function TopNav() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/70 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-button-green to-accent-green-dark flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <ShoppingCart size={18} className="text-white" />
          </div>
          <span className="text-xl">
            <span className="font-bold text-button-green">Caracas</span>
            <span className="font-bold text-accent-green-dark">Ahorra</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-accent-green-dark transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm font-semibold text-white bg-accent-green-dark rounded-xl hover:opacity-90 transition-opacity shadow-sm"
          >
            Crear cuenta
          </Link>
        </nav>

        <Link
          href="/login"
          className="md:hidden px-4 py-2 text-sm font-semibold text-white bg-accent-green-dark rounded-xl shadow-sm"
        >
          Entrar
        </Link>
      </div>
    </header>
  );
}

// ============================================
// HERO
// ============================================
function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background con gradiente animado */}
      <div
        className="absolute inset-0 -z-10 animate-gradient"
        style={{
          backgroundImage:
            'radial-gradient(at 0% 0%, rgba(186, 221, 113, 0.35) 0px, transparent 50%), ' +
            'radial-gradient(at 100% 0%, rgba(154, 214, 151, 0.30) 0px, transparent 55%), ' +
            'radial-gradient(at 50% 100%, rgba(177, 199, 161, 0.25) 0px, transparent 60%)',
        }}
      />

      {/* Decoración: círculos flotantes */}
      <div className="absolute top-32 left-12 w-24 h-24 rounded-full bg-primary/30 blur-3xl animate-float" />
      <div
        className="absolute bottom-20 right-16 w-32 h-32 rounded-full bg-accent-pastel/40 blur-3xl animate-float"
        style={{ animationDelay: '1.5s' }}
      />

      <div className="max-w-6xl mx-auto px-6 pt-20 pb-28 lg:pt-28 lg:pb-36 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Texto principal */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 border border-primary/40 text-xs font-medium text-accent-green-dark animate-fade-in-up">
            <Sparkles size={14} className="text-button-green" />
            Actualizado cada 30 minutos
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-gray-900 animate-fade-in-up delay-100">
            Compara los precios de la{' '}
            <span className="bg-gradient-to-r from-button-green to-accent-green-dark bg-clip-text text-transparent">
              canasta básica
            </span>{' '}
            en Caracas
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-xl leading-relaxed animate-fade-in-up delay-200">
            Conoce dónde está más barato cada producto de la canasta CENDAS comparando precios
            entre los principales supermercados de la ciudad, todos los días.
          </p>

          <div className="flex flex-wrap items-center gap-4 animate-fade-in-up delay-300">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-accent-green-dark rounded-xl hover:opacity-90 transition-all shadow-lg shadow-accent-green-dark/20 hover:shadow-xl hover:-translate-y-0.5"
            >
              Iniciar sesión
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-accent-green-dark bg-white border border-primary/40 rounded-xl hover:border-accent-green-dark transition-colors"
            >
              Crear cuenta
            </Link>
          </div>
        </div>

        {/* Visual ilustrativo */}
        <div className="relative animate-fade-in delay-400">
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}

// Ilustración del hero: mockup de comparación de precios
function HeroIllustration() {
  const items = [
    { name: 'Auyama 1 Kg', chain: 'Gama', price: '$0.89' },
    { name: 'Auyama 1 Kg', chain: 'Madeirense', price: '$0.90' },
    { name: 'Auyama 1 Kg', chain: 'Plansuarez', price: '$0.75' },
  ];

  const winner = items.reduce((min, it) =>
    parseFloat(it.price.slice(1)) < parseFloat(min.price.slice(1)) ? it : min,
  );

  return (
    <div className="relative">
      {/* Card principal */}
      <div className="relative bg-white rounded-3xl shadow-2xl shadow-accent-green-dark/10 border border-gray-100 p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-lighter to-primary flex items-center justify-center text-2xl">
              🎃
            </div>
            <div>
              <p className="font-semibold text-gray-900">Auyama</p>
              <p className="text-xs text-gray-500">1 Kg · Raíces y Tubérculos</p>
            </div>
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
            En 3 cadenas
          </span>
        </div>

        <div className="space-y-2.5">
          {items.map((it, i) => {
            const isWinner = it === winner;
            return (
              <div
                key={i}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isWinner
                    ? 'bg-gradient-to-r from-primary-lightest to-primary-lighter/40 border-primary/40'
                    : 'bg-gray-50 border-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      isWinner
                        ? 'bg-accent-green-dark text-white'
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    {it.chain.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{it.chain}</p>
                    {isWinner && (
                      <p className="text-[10px] uppercase tracking-wider text-accent-green-dark font-semibold">
                        Más barato
                      </p>
                    )}
                  </div>
                </div>
                <p
                  className={`text-lg font-bold ${
                    isWinner ? 'text-accent-green-dark' : 'text-gray-700'
                  }`}
                >
                  {it.price}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <RefreshCw size={12} />
            Hace 12 min
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-green-600">
            <TrendingDown size={14} />
            Ahorras hasta 17%
          </div>
        </div>
      </div>

      {/* Burbujas decorativas */}
      <div
        className="absolute -top-4 -right-4 px-3 py-2 rounded-2xl bg-white shadow-lg border border-gray-100 animate-float"
        style={{ animationDelay: '0.8s' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-medium text-gray-700">Datos en vivo</span>
        </div>
      </div>

      <div
        className="absolute -bottom-3 -left-4 px-3 py-2 rounded-2xl bg-accent-green-dark text-white shadow-lg animate-float"
        style={{ animationDelay: '1.5s' }}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={14} />
          <span className="text-xs font-semibold">+59 productos</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// CÓMO FUNCIONA
// ============================================
const STEPS = [
  {
    n: 1,
    icon: ShoppingCart,
    title: 'Catálogo curado',
    desc: 'Seleccionamos 59 productos representativos de los 11 rubros de la canasta alimentaria definidos por CENDAS.',
    gradient: 'from-primary to-button-green',
  },
  {
    n: 2,
    icon: RefreshCw,
    title: 'Datos siempre frescos',
    desc: 'Cada 30 minutos un pipeline automático extrae los precios de cada cadena y los normaliza para comparar manzanas con manzanas.',
    gradient: 'from-button-green to-accent-green',
  },
  {
    n: 3,
    icon: Search,
    title: 'Compara y ahorra',
    desc: 'Arma tu carrito y descubre en qué supermercado pagas menos por la misma compra, con histórico de precios y tendencias.',
    gradient: 'from-accent-green to-accent-green-dark',
  },
];

const DELAYS = ['delay-100', 'delay-200', 'delay-300'] as const;

function HowItWorks() {
  return (
    <section className="py-24 lg:py-32 bg-gradient-to-b from-white via-primary-lightest/20 to-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16 animate-fade-in-up">
          <p className="text-sm font-semibold text-accent-green-dark uppercase tracking-wider mb-3">
            Cómo funciona
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Tres pasos para encontrar la mejor compra
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Desde un catálogo curado hasta tu carrito optimizado, todo automatizado.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.n}
                className={`group relative bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all animate-fade-in-up ${DELAYS[i]}`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform`}
                >
                  <Icon size={26} className="text-white" />
                </div>

                <div className="absolute top-6 right-6 text-5xl font-bold text-primary/20 group-hover:text-primary/30 transition-colors">
                  {step.n}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>

        {/* CTA final */}
        <div className="mt-16 text-center">
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-accent-green-dark rounded-xl hover:opacity-90 transition-all shadow-lg shadow-accent-green-dark/20 hover:shadow-xl hover:-translate-y-0.5"
          >
            Empezar a ahorrar
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================
// FOOTER
// ============================================
function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-accent-green-dark text-white">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <ShoppingCart size={18} className="text-primary-lighter" />
              </div>
              <span className="text-xl">
                <span className="font-bold text-primary-lighter">Caracas</span>
                <span className="font-bold text-white">Ahorra</span>
              </span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Comparador de precios de la canasta alimentaria en supermercados de Caracas.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3 text-white/60">
              Plataforma
            </h4>
            <ul className="space-y-2 text-sm">
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
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-3 text-white/60">
              Acerca del proyecto
            </h4>
            <p className="text-sm text-white/80 leading-relaxed">
              Trabajo de grado · Universidad Metropolitana
              <br />
              Caracas, Venezuela
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/60">
          <p>© {year} CaracasAhorra. Proyecto académico.</p>
          <div className="flex items-center gap-2">
            <Store size={12} />
            <span>Comparamos Gama, Central Madeirense y Plan Suárez</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
