'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  TrendingDown,
  ArrowRight,
  ShoppingCart,
  Milk,
  Beef,
  Apple,
  Croissant,
  CupSoda,
  SprayCan,
  Heart,
  Package,
  Wheat,
  CircleDot,
  DollarSign,
  Star,
} from 'lucide-react';
import {
  userProducts,
  userCategories,
  getLowestPrice,
  getHighestPrice,
  getSavingsPercent,
  formatPrice,
} from '../../data/userMockData';

const iconMap: Record<string, React.ReactNode> = {
  Milk: <Milk size={24} />,
  Beef: <Beef size={24} />,
  Apple: <Apple size={24} />,
  Croissant: <Croissant size={24} />,
  CupSoda: <CupSoda size={24} />,
  SprayCan: <SprayCan size={24} />,
  Heart: <Heart size={24} />,
  Package: <Package size={24} />,
  Wheat: <Wheat size={24} />,
  CircleDot: <CircleDot size={24} />,
};

export default function InicioPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'Bs'>('USD');

  const featuredProducts = userProducts.filter(p => p.isFeatured);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/usuario/productos?buscar=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/usuario/productos?categoria=${categoryId}`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header con selector de moneda */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bienvenido a CaracasAhorra</h1>
          <p className="text-gray-500 mt-1">Compara precios y ahorra en tu compra</p>
        </div>
        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1">
          <button
            onClick={() => setCurrency('USD')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currency === 'USD'
                ? 'bg-button-green text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <DollarSign size={14} />
            USD
          </button>
          <button
            onClick={() => setCurrency('Bs')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currency === 'Bs'
                ? 'bg-button-green text-white'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Bs
          </button>
        </div>
      </div>

      {/* Banner de busqueda */}
      <div className="bg-gradient-to-r from-button-green to-accent-green-dark rounded-2xl p-8 text-white">
        <div className="max-w-2xl">
          <h2 className="text-xl font-bold mb-2">Encuentra los mejores precios</h2>
          <p className="text-white/80 mb-4">
            Busca entre mas de {userProducts.length} productos y compara precios en los principales supermercados de Caracas.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-11 pr-4 py-3 rounded-xl text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-white text-button-green font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingDown size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Ahorro promedio</p>
              <p className="text-lg font-bold text-gray-800">23.5%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Productos disponibles</p>
              <p className="text-lg font-bold text-gray-800">{userProducts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Supermercados</p>
              <p className="text-lg font-bold text-gray-800">6</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categorias */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Categorias</h2>
          <button
            onClick={() => router.push('/usuario/productos')}
            className="flex items-center gap-1 text-sm text-button-green hover:text-accent-green-dark transition-colors"
          >
            Ver todas <ArrowRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {userCategories.slice(0, 10).map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-100 hover:border-button-green hover:shadow-md transition-all group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ backgroundColor: cat.bgColor, color: cat.color }}
              >
                {iconMap[cat.iconName] || <Package size={24} />}
              </div>
              <span className="text-sm text-gray-700 font-medium text-center leading-tight">
                {cat.name}
              </span>
              <span className="text-xs text-gray-400">{cat.productCount} productos</span>
            </button>
          ))}
        </div>
      </div>

      {/* Productos destacados */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Productos destacados</h2>
          <button
            onClick={() => router.push('/usuario/productos')}
            className="flex items-center gap-1 text-sm text-button-green hover:text-accent-green-dark transition-colors"
          >
            Ver todos <ArrowRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredProducts.map((product) => {
            const lowest = getLowestPrice(product);
            const highest = getHighestPrice(product);
            const savings = getSavingsPercent(product);

            return (
              <div
                key={product.id}
                onClick={() => router.push(`/usuario/producto/${product.id}`)}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-button-green/30 transition-all cursor-pointer group"
              >
                {/* Imagen placeholder */}
                <div className="h-36 bg-gradient-to-br from-primary-lighter to-primary-lightest flex items-center justify-center relative">
                  <Package size={40} className="text-button-green/40" />
                  {savings > 0 && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                      -{savings}%
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-4">
                  <p className="text-xs text-button-green font-medium mb-1">{product.category}</p>
                  <h3 className="font-semibold text-gray-800 text-sm mb-1 group-hover:text-button-green transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">{product.unit}</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-gray-400">Desde</p>
                      <p className="text-lg font-bold text-button-green">
                        {lowest ? formatPrice(lowest.price, currency) : '-'}
                      </p>
                    </div>
                    {highest && lowest && highest.price !== lowest.price && (
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Hasta</p>
                        <p className="text-sm text-gray-400 line-through">
                          {formatPrice(highest.price, currency)}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <span className="text-xs text-gray-400">
                      {product.prices.length} supermercados
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
      </div>
    </div>
  );
}
