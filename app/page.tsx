'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Sparkles, Search, RefreshCw, ShoppingCart, TrendingDown } from 'lucide-react';
import { Footer } from './components/Footer';

// ============================================
// LANDING PAGE — CaracasAhorra
// ============================================
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800">
      <TopNav />
      <Hero />
      <TrustBand />
      <HowItWorks />
      <Footer />
    </div>
  );
}

// ============================================
// HOOKS
// ============================================
function useInView<T extends HTMLElement>(
  options?: IntersectionObserverInit,
): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: '0px 0px -40px 0px', ...options },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [inView, options]);
  return [ref, inView];
}

function useCountUp(target: number, start: boolean, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration]);
  return val;
}

function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setY(window.scrollY));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return y;
}

// ============================================
// TOP NAV
// ============================================
function TopNav() {
  return (
    <header className="sticky top-0 z-30 bg-accent-green-dark text-white border-b border-white/10 shadow-md shadow-accent-green-dark/20">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl tracking-tight transition-transform group-hover:scale-[1.02]">
            <span className="font-bold text-primary-lighter">Caracas</span>
            <span className="font-bold text-white">Ahorra</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/login"
            className="relative px-4 py-2 text-sm font-medium text-white/85 hover:text-white transition-colors group"
          >
            Iniciar sesión
            <span className="absolute left-4 right-4 -bottom-0.5 h-px bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
          </Link>
          <Link
            href="/register"
            className="ml-2 px-4 py-2 text-sm font-semibold text-accent-green-dark bg-white rounded-xl hover:bg-primary-lightest hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all shadow-sm ring-1 ring-white/0 hover:ring-primary/40"
          >
            Crear cuenta
          </Link>
        </nav>

        <Link
          href="/login"
          className="md:hidden px-4 py-2 text-sm font-semibold text-accent-green-dark bg-white rounded-xl shadow-sm"
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
  const y = useScrollY();

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

      {/* Decoración: círculos flotantes con parallax sutil */}
      <div
        className="absolute top-32 left-12 w-24 h-24 rounded-full bg-primary/55 blur-3xl animate-float will-change-transform"
        style={{ transform: `translate3d(0, ${y * 0.18}px, 0)` }}
      />
      <div
        className="absolute bottom-20 right-16 w-32 h-32 rounded-full bg-accent-pastel/60 blur-3xl animate-float will-change-transform"
        style={{ transform: `translate3d(0, ${y * -0.12}px, 0)`, animationDelay: '1.5s' }}
      />
      <div
        className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-primary-lighter/40 blur-3xl will-change-transform"
        style={{ transform: `translate3d(0, ${y * 0.08}px, 0)` }}
      />

      <div className="max-w-6xl mx-auto px-6 pt-16 pb-12 lg:pt-20 lg:pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Texto principal */}
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-accent-green-dark text-white shadow-lg animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
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
            Conoce dónde está más barato cada producto de la canasta básica comparando precios
            entre los principales supermercados de Caracas, todos los días.
          </p>

        </div>

        {/* Visual ilustrativo */}
        <div className="relative animate-fade-in delay-400">
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}

function Stat({ n, suffix, label }: { n: number; suffix?: string; label: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-button-green to-accent-green-dark bg-clip-text text-transparent tabular-nums">
        {n}
        {suffix}
      </span>
      <span className="text-sm text-gray-600">{label}</span>
    </div>
  );
}

// ============================================
// HERO ILLUSTRATION (card que cicla productos)
// ============================================
type ProductDemo = {
  name: string;
  size: string;
  category: string;
  img: string;
  rows: { chain: string; price: number }[];
  savingsPct: number;
};

const DEMO_PRODUCTS: ProductDemo[] = [
  {
    name: 'Arroz Mary',
    size: '1 Kg',
    category: 'Granos: Caraotas, Arvejas y Lentejas',
    img: '/arroz-mary.png',
    rows: [
      { chain: 'Excelsior Gama', price: 1.45 },
      { chain: 'Central Madeirense', price: 1.35 },
      { chain: 'Plansuarez', price: 1.29 },
    ],
    savingsPct: 11,
  },
  {
    name: 'Zanahoria',
    size: '1 Kg',
    category: 'Raíces, Tubérculos y Otros',
    img: '/zanahoria.png',
    rows: [
      { chain: 'Excelsior Gama', price: 1.2 },
      { chain: 'Central Madeirense', price: 1.05 },
      { chain: 'Plansuarez', price: 0.99 },
    ],
    savingsPct: 17,
  },
  {
    name: 'Caraota Roja Pantera',
    size: '500 g',
    category: 'Granos: Caraotas, Arvejas y Lentejas',
    img: '/caraota-pantera.png',
    rows: [
      { chain: 'Excelsior Gama', price: 2.1 },
      { chain: 'Central Madeirense', price: 1.95 },
      { chain: 'Plansuarez', price: 2.25 },
    ],
    savingsPct: 13,
  },
];

// Mapa: nombre de cadena → logo en /public/logos
const CHAIN_LOGO_BY_NAME: Record<string, string> = {
  'Excelsior Gama': '/logos/gama.png',
  'Central Madeirense': '/logos/madeirense.png',
  Plansuarez: '/logos/plan_suarez.png',
  'Plansuárez': '/logos/plan_suarez.png',
};

function HeroIllustration() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % DEMO_PRODUCTS.length);
    }, 4200);
    return () => clearInterval(id);
  }, [paused]);

  const product = DEMO_PRODUCTS[idx];
  const minPrice = Math.min(...product.rows.map((r) => r.price));

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Card principal */}
      <div className="relative bg-white rounded-3xl shadow-2xl shadow-button-green/20 border border-primary/30 p-6 lg:p-8 overflow-hidden">
        {/* Contenido cíclico — key fuerza remount + animación */}
        <div key={idx} className="animate-pop-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
                <img
                  src={product.img}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{product.name}</p>
                <p className="text-xs text-gray-500">
                  {product.size} · {product.category}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary/15 text-accent-teal border border-secondary/40">
              En 3 cadenas
            </span>
          </div>

          <div className="space-y-2.5">
            {product.rows.map((r, i) => {
              const isWinner = r.price === minPrice;
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
                      className={`w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden shrink-0 bg-white ${
                        isWinner ? 'border border-button-green/50 shadow-sm' : 'border border-gray-200'
                      }`}
                    >
                      <img
                        src={CHAIN_LOGO_BY_NAME[r.chain]}
                        alt={r.chain}
                        className="max-h-full max-w-full object-contain p-0.5"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{r.chain}</p>
                      {isWinner && (
                        <p className="text-[10px] uppercase tracking-wider text-accent-green-dark font-semibold">
                          Más barato
                        </p>
                      )}
                    </div>
                  </div>
                  <p
                    className={`text-lg font-bold tabular-nums ${
                      isWinner ? 'text-accent-green-dark' : 'text-gray-700'
                    }`}
                  >
                    ${r.price.toFixed(2)}
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
              Ahorras hasta {product.savingsPct}%
            </div>
          </div>
        </div>

        {/* Dots de progreso del ciclado */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {DEMO_PRODUCTS.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ver producto ${i + 1}`}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? 'w-6 bg-accent-green-dark' : 'w-1.5 bg-primary/40 hover:bg-primary'
              }`}
            />
          ))}
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
          <span className="text-xs font-semibold">+50 productos</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// TRUST BAND — stats animadas + logos de cadenas (a color, estáticos)
// ============================================
const CHAIN_LOGOS = [
  // height en px: Gama es icon-only (cuadrado), pesa visualmente más → menor
  { src: '/logos/gama.png', alt: 'Excelsior Gama', h: 'h-9 md:h-10' },
  { src: '/logos/madeirense.png', alt: 'Central Madeirense', h: 'h-11 md:h-12' },
  { src: '/logos/plan_suarez.png', alt: 'Plansuarez', h: 'h-11 md:h-12' },
];

function TrustBand() {
  const [ref, inView] = useInView<HTMLDivElement>();
  const products = useCountUp(50, inView);
  const chains = useCountUp(3, inView);
  const savings = useCountUp(17, inView);

  return (
    <section
      ref={ref}
      className="relative py-10 lg:py-12 border-y border-button-green/15 bg-gradient-to-r from-primary-lightest/30 via-white to-primary-lightest/30"
    >
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row md:items-center md:justify-center gap-8 md:gap-12 lg:gap-16">
        {/* Stats (izquierda) */}
        <div className="flex flex-wrap items-baseline justify-center gap-x-6 gap-y-2">
          <Stat n={products} suffix="+" label="productos" />
          <span className="text-primary/60 text-2xl leading-none">·</span>
          <Stat n={chains} label="cadenas" />
          <span className="text-primary/60 text-2xl leading-none">·</span>
          <Stat n={savings} suffix="%" label="ahorro promedio" />
        </div>

        {/* Separador vertical (solo en desktop) */}
        <div className="hidden md:block h-12 w-px bg-button-green/25" />

        {/* Logos a color, estáticos (derecha) */}
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 md:gap-x-12">
          {CHAIN_LOGOS.map((l) => (
            <img
              key={l.src}
              src={l.src}
              alt={l.alt}
              className={`${l.h} w-auto object-contain`}
              draggable={false}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// REVEAL — wrapper para scroll-triggered fade-in
// ============================================
function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'article';
}) {
  const [ref, inView] = useInView<HTMLDivElement>();
  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      } ${className}`}
    >
      {children}
    </Tag>
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

function HowItWorks() {
  return (
    <section className="pt-12 pb-20 lg:pt-16 lg:pb-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal className="text-center max-w-2xl mx-auto mb-10">
          <p className="inline-block text-xs font-semibold text-accent-green-dark uppercase tracking-wider mb-3 px-3 py-1 rounded-full bg-white/70 border border-button-green/30">
            ¿Cómo funciona?
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
            Tres pasos para encontrar la mejor compra
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Desde un gran catálogo hasta tu carrito optimizado, todo a tu alcance.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <Reveal
                key={step.n}
                delay={i * 120}
                className={`group relative bg-white rounded-3xl p-7 border ${step.border} shadow-md ${step.cardShadow} hover:shadow-xl ${step.cardShadowHover} ${step.borderHover} hover:-translate-y-1`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-5 shadow-lg ${step.iconShadow} group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-xl ${step.iconShadowHover} transition-all`}
                >
                  <Icon size={26} className="text-white" />
                </div>

                <div
                  className={`absolute top-7 right-6 text-6xl font-black bg-gradient-to-br ${step.numberGradient} bg-clip-text text-transparent opacity-30 group-hover:opacity-60 transition-opacity`}
                >
                  {step.n}
                </div>

                <h3
                  className={`text-xl font-bold mb-2 bg-gradient-to-r ${step.titleGradient} bg-clip-text text-transparent`}
                >
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </Reveal>
            );
          })}
        </div>

        {/* CTA final */}
        <Reveal delay={200} className="mt-12 text-center">
          <Link
            href="/login"
            className="inline-flex items-center px-7 py-3.5 text-base font-semibold text-white bg-gradient-to-r from-button-green to-accent-green-dark rounded-xl hover:shadow-xl hover:shadow-button-green/40 transition-all shadow-lg shadow-accent-green-dark/30 hover:-translate-y-0.5"
          >
            Empezar a ahorrar
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
