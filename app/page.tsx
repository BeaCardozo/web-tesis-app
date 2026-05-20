import Link from 'next/link';
import {
  Sparkles,
  Search,
  RefreshCw,
  ShoppingCart,
  TrendingDown,
} from 'lucide-react';
import { Footer } from './components/Footer';

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
    <header className="sticky top-0 z-30 backdrop-blur-md bg-primary-lightest/60 border-b border-button-green/30 shadow-sm shadow-button-green/10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-button-green to-accent-green-dark flex items-center justify-center shadow-md shadow-button-green/40 group-hover:scale-105 transition-transform">
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
            className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-button-green to-accent-green-dark rounded-xl hover:shadow-md hover:shadow-button-green/30 transition-all shadow-sm"
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
            'radial-gradient(at 0% 0%, rgba(186, 221, 113, 0.55) 0px, transparent 50%), ' +
            'radial-gradient(at 100% 0%, rgba(154, 214, 151, 0.50) 0px, transparent 55%), ' +
            'radial-gradient(at 50% 100%, rgba(177, 199, 161, 0.45) 0px, transparent 60%)',
        }}
      />

      {/* Decoración: círculos flotantes */}
      <div className="absolute top-32 left-12 w-24 h-24 rounded-full bg-primary/55 blur-3xl animate-float" />
      <div
        className="absolute bottom-20 right-16 w-32 h-32 rounded-full bg-accent-pastel/60 blur-3xl animate-float"
        style={{ animationDelay: '1.5s' }}
      />

      <div className="max-w-6xl mx-auto px-6 pt-16 pb-12 lg:pt-20 lg:pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Texto principal */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-accent-green-dark text-white shadow-lg animate-fade-in-up">
            <Sparkles size={14} />
            <span className="text-xs font-semibold">Actualizado cada 12 horas</span>
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
            entre los principales supermercados de Caracas, todos los días.
          </p>

          <div className="flex flex-wrap items-center gap-4 animate-fade-in-up delay-300">
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-button-green to-accent-green-dark rounded-xl hover:shadow-xl hover:shadow-button-green/40 transition-all shadow-lg shadow-accent-green-dark/30 hover:-translate-y-0.5"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3.5 text-base font-semibold text-accent-green-dark bg-white border-2 border-button-green/50 rounded-xl hover:border-button-green hover:shadow-md hover:shadow-button-green/15 transition-all"
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
    { name: 'Harina P.A.N. 1 Kg', chain: 'Excelsior Gama', price: '$1.67' },
    { name: 'Harina P.A.N. 1 Kg', chain: 'Central Madeirense', price: '$1.59' },
    { name: 'Harina P.A.N. 1 Kg', chain: 'Plansuarez', price: '$1.39' },
  ];

  const winner = items.reduce((min, it) =>
    parseFloat(it.price.slice(1)) < parseFloat(min.price.slice(1)) ? it : min,
  );

  return (
    <div className="relative">
      {/* Card principal */}
      <div className="relative bg-white rounded-3xl shadow-2xl shadow-button-green/20 border border-primary/30 p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-lighter to-primary flex items-center justify-center text-2xl overflow-hidden">
              <img
                src="/harina-pan.jpg"
                alt="Harina P.A.N."
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Harina P.A.N.</p>
              <p className="text-xs text-gray-500">1 Kg · Harinas y Cereales</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary/15 text-accent-teal border border-secondary/40">
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
                    ? 'bg-gradient-to-r from-primary-lighter to-primary/40 border-button-green/50'
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
            <RefreshCw size={12} className="text-button-green" />
            Hace 12 min
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-accent-green-dark">
            <TrendingDown size={14} />
            Ahorras hasta 17%
          </div>
        </div>
      </div>

      {/* Burbujas decorativas */}
      <div
        className="absolute -top-4 -right-4 px-3 py-2 rounded-2xl bg-accent-green-dark text-white shadow-lg animate-float"
        style={{ animationDelay: '0.8s' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-semibold">Datos en vivo</span>
        </div>
      </div>

      <div
        className="absolute -bottom-3 -left-4 px-3 py-2 rounded-2xl bg-accent-green-dark text-white shadow-lg animate-float"
        style={{ animationDelay: '1.5s' }}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={14} />
          <span className="text-xs font-semibold">+50 productos</span>
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
    title: 'Catálogo Seleccionado',
    desc: 'Seleccionamos más de 50 productos representativos de las 11 categorías de nuestra canasta alimentaria.',
    gradient: 'from-primary to-button-green',
    titleGradient: 'from-button-green to-accent-green',
    numberGradient: 'from-primary to-button-green',
    iconShadow: 'shadow-button-green/40',
    iconShadowHover: 'group-hover:shadow-button-green/60',
    border: 'border-primary/50',
    borderHover: 'hover:border-button-green',
    cardShadow: 'shadow-button-green/15',
    cardShadowHover: 'hover:shadow-button-green/30',
  },
  {
    n: 2,
    icon: RefreshCw,
    title: 'Datos Siempre Actualizados',
    desc: 'Cada 12 horas, se extraen automáticamente los precios de cada cadena para garantizar que siempre tengas la información más reciente al alcance de tu mano.',
    gradient: 'from-button-green to-accent-green',
    titleGradient: 'from-accent-green to-accent-teal',
    numberGradient: 'from-button-green to-accent-green',
    iconShadow: 'shadow-accent-green/40',
    iconShadowHover: 'group-hover:shadow-accent-green/60',
    border: 'border-button-green/50',
    borderHover: 'hover:border-accent-green',
    cardShadow: 'shadow-accent-green/15',
    cardShadowHover: 'hover:shadow-accent-green/30',
  },
  {
    n: 3,
    icon: Search,
    title: 'Compara y Ahorra',
    desc: 'Arma tu carrito y descubre en qué supermercado pagas menos por la misma compra, o como puedes organizarte para conseguir los mejores precios comprando en varios supermercados',
    gradient: 'from-accent-green to-accent-green-dark',
    titleGradient: 'from-accent-green-dark to-accent-teal',
    numberGradient: 'from-accent-green to-accent-green-dark',
    iconShadow: 'shadow-accent-green-dark/40',
    iconShadowHover: 'group-hover:shadow-accent-green-dark/60',
    border: 'border-accent-green/40',
    borderHover: 'hover:border-accent-green-dark',
    cardShadow: 'shadow-accent-green-dark/15',
    cardShadowHover: 'hover:shadow-accent-green-dark/30',
  },
];

const DELAYS = ['delay-100', 'delay-200', 'delay-300'] as const;

function HowItWorks() {
  return (
    <section className="pt-12 pb-20 lg:pt-16 lg:pb-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 animate-fade-in-up">
          <p className="inline-block text-xs font-semibold text-accent-green-dark uppercase tracking-wider mb-3 px-3 py-1 rounded-full bg-white/70 border border-button-green/30">
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
                className={`group relative bg-white rounded-3xl p-7 border ${step.border} shadow-md ${step.cardShadow} hover:shadow-xl ${step.cardShadowHover} ${step.borderHover} hover:-translate-y-1 transition-all animate-fade-in-up ${DELAYS[i]}`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-5 shadow-lg ${step.iconShadow} group-hover:scale-110 group-hover:shadow-xl ${step.iconShadowHover} transition-all`}
                >
                  <Icon size={26} className="text-white" />
                </div>

                <div className={`absolute top-7 right-6 text-6xl font-black bg-gradient-to-br ${step.numberGradient} bg-clip-text text-transparent opacity-30 group-hover:opacity-60 transition-opacity`}>
                  {step.n}
                </div>

                <h3 className={`text-xl font-bold mb-2 bg-gradient-to-r ${step.titleGradient} bg-clip-text text-transparent`}>{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>

        {/* CTA final */}
        <div className="mt-12 text-center">
          <Link
            href="/login"
            className="inline-flex items-center px-7 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-button-green to-accent-green-dark rounded-xl hover:shadow-xl hover:shadow-button-green/40 transition-all shadow-lg shadow-accent-green-dark/30 hover:-translate-y-0.5"
          >
            Empezar a ahorrar
          </Link>
        </div>
      </div>
    </section>
  );
}
