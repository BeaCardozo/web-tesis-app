'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  TrendingDown,
  ArrowRight,
  ShoppingCart,
  Package,
  DollarSign,
  Star,
  Loader2,
  Sparkles,
  Tag,
  Zap,
} from 'lucide-react';
import {
  productsApi,
  categoriesApi,
  supermarketsApi,
  ApiProduct,
  ApiCategory,
  ApiSupermarket,
} from '../../lib/api';
import { EXCHANGE_RATE } from '../../data/userMockData';
import { useAuth } from '../../context/AuthContext';

export default function InicioPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currency, setCurrency] = useState<'USD' | 'Bs'>('USD');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [featuredProducts, setFeaturedProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [supermarkets, setSupermarkets] = useState<ApiSupermarket[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [featured, cats, sms, productsList] = await Promise.all([
          productsApi.featured(),
          categoriesApi.list(),
          supermarketsApi.list(),
          productsApi.list({ page: 1, limit: 1 }),
        ]);
        setFeaturedProducts(featured);
        setCategories(cats);
        setSupermarkets(sms);
        setTotalProducts(productsList.total);
      } catch {
        // Silenciar errores en la página de inicio
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const banners = [
    {
      gradient: 'from-button-green via-accent-green to-accent-green-dark',
      BadgeIcon: Sparkles,
      badge: `Más de ${totalProducts} productos`,
      title: 'Compara precios, ahorra en grande',
      subtitle: 'Encuentra las mejores ofertas en los principales supermercados de Caracas.',
      Icon1: ShoppingCart,
      Icon2: TrendingDown,
    },
    {
      gradient: 'from-accent-teal via-accent-green-dark to-accent-green',
      BadgeIcon: Tag,
      badge: 'Actualizado diariamente',
      title: 'Precios frescos cada día',
      subtitle: 'Datos actualizados constantemente para que siempre tengas la información más reciente.',
      Icon1: Sparkles,
      Icon2: Tag,
    },
    {
      gradient: 'from-accent-green-dark via-button-green to-accent-olive',
      BadgeIcon: Zap,
      badge: 'Compra inteligente',
      title: 'Arma tu carrito perfecto',
      subtitle: 'Crea tu lista de compras y descubre en qué supermercado te sale más barato.',
      Icon1: Star,
      Icon2: Zap,
    },
  ];

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/usuario/productos?categoria=${categoryId}`);
  };

  // Categorías con productos, sin padres vacíos
  const leafCategories = useMemo(() => {
    return categories
      .filter(c => c.productCount > 0)
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 5);
  }, [categories]);

  const formatCurrency = (usd: number) => {
    if (currency === 'Bs') return `Bs. ${(usd * EXCHANGE_RATE).toFixed(2)}`;
    return `$${usd.toFixed(2)}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Usuario';
  const userInitial = firstName.charAt(0).toUpperCase();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header personalizado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-button-green/20 to-accent-teal/20 flex items-center justify-center ring-2 ring-button-green/10">
            <span className="text-lg font-bold text-accent-green-dark">{userInitial}</span>
          </div>
          {/* Saludo */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {getGreeting()}, <span className="text-button-green">{firstName}</span>
            </h1>
            <p className="text-gray-400 text-sm">
              <span className="text-gray-300">·</span>
              Compara precios y ahorra en todas tus compras
            </p>
          </div>
        </div>
        {/* Selector de moneda */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-1 shadow-sm">
          <button
            onClick={() => setCurrency('USD')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              currency === 'USD'
                ? 'bg-button-green text-white shadow-md shadow-button-green/25'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <DollarSign size={14} />
            USD
          </button>
          <button
            onClick={() => setCurrency('Bs')}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              currency === 'Bs'
                ? 'bg-button-green text-white shadow-md shadow-button-green/25'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Bs
          </button>
        </div>
      </div>

      {/* Carousel de banners */}
      <div
        className="relative overflow-hidden rounded-3xl shadow-xl shadow-button-green/15"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {banners.map((banner, index) => (
          <div
            key={index}
            className={`${index === 0 ? 'relative' : 'absolute inset-0'} bg-gradient-to-br ${banner.gradient} p-8 md:p-10 text-white transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Elementos decorativos */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
            <div className="absolute top-1/2 right-12 w-24 h-24 bg-white/8 rounded-full -translate-y-1/2" />
            <div className="absolute bottom-4 left-8 w-16 h-16 bg-white/5 rounded-full" />

            {/* Contenido */}
            <div className="relative z-10 flex items-center justify-between min-h-[140px]">
              <div className="max-w-lg">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium text-white/90 mb-4 border border-white/10">
                  <banner.BadgeIcon size={12} />
                  {banner.badge}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                  {banner.title}
                </h2>
                <p className="text-white/70 text-sm md:text-base leading-relaxed">
                  {banner.subtitle}
                </p>
              </div>

              {/* Iconos decorativos */}
              <div className="hidden lg:flex flex-col items-center gap-3 opacity-90">
                <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 rotate-3">
                  <banner.Icon1 size={36} className="text-white/80" />
                </div>
                <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 -rotate-6 -mt-2 ml-8">
                  <banner.Icon2 size={24} className="text-white/80" />
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Indicadores */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'bg-white w-6'
                  : 'bg-white/40 hover:bg-white/60 w-2'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Categorías */}
      {leafCategories.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Categorías</h2>
            <button
              onClick={() => router.push('/usuario/productos')}
              className="flex items-center gap-1 text-sm text-button-green hover:text-accent-green-dark transition-colors"
            >
              Ver todas <ArrowRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {leafCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl border border-gray-100 hover:border-button-green/30 hover:shadow-md transition-all group"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-button-green/15 to-accent-teal/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package size={16} className="text-button-green" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-button-green transition-colors truncate">
                    {cat.name}
                  </p>
                  <p className="text-xs text-gray-400">{cat.productCount} prod.</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Productos destacados */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Productos Disponibles</h2>
          <button
            onClick={() => router.push('/usuario/productos')}
            className="flex items-center gap-1 text-sm text-button-green hover:text-accent-green-dark transition-colors"
          >
            Ver todos <ArrowRight size={16} />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={32} className="animate-spin text-button-green" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product) => {
              const cheapestUsd = product.priceSnapshot?.cheapestPriceUsd;
              const cheapestBs = product.priceSnapshot?.cheapestPriceBs;
              const unit = `${product.baseAmount} ${product.unitType}`;

              return (
                <div
                  key={product.id}
                  onClick={() => router.push(`/usuario/producto/${product.id}`)}
                  className="bg-primary-lightest/30 rounded-xl border border-button-green/20 overflow-hidden hover:shadow-lg hover:border-button-green/40 transition-all cursor-pointer group"
                >
                  {/* Imagen */}
                  <div className="h-36 bg-white flex items-center justify-center relative overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-contain p-2"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <Package size={40} className={`text-button-green/40 ${product.imageUrl ? 'hidden' : ''}`} />
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <p className="text-xs text-button-green font-medium mb-1">{product.category.name}</p>
                    <h3 className="font-semibold text-gray-800 text-sm mb-1 group-hover:text-button-green transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-400 mb-3">{unit}</p>
                    <div className="flex items-end justify-between">
                      <div>
                        {cheapestUsd != null ? (
                          <>
                            <p className="text-xs text-gray-400">Desde</p>
                            <p className="text-lg font-bold text-button-green">
                              {currency === 'USD'
                                ? `$${cheapestUsd.toFixed(2)}`
                                : `Bs. ${(cheapestBs ?? cheapestUsd * EXCHANGE_RATE).toFixed(2)}`}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-400">Precio no disponible</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-button-green/10">
                      <span className="text-xs text-gray-400 truncate">
                        {product.priceSnapshot?.cheapestSupermarket || product.brand?.name || ''}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/usuario/producto/${product.id}`);
                        }}
                        className="flex items-center gap-1 text-xs text-button-green font-medium hover:text-accent-green-dark"
                      >
                        <ShoppingCart size={14} />
                        Comparar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
