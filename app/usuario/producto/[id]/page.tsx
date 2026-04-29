'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Package,
  TrendingDown,
  TrendingUp,
  Clock,
  Store,
  DollarSign,
  ShoppingCart,
  Check,
  ArrowUpDown,
} from 'lucide-react';
import {
  userProducts,
  getLowestPrice,
  getHighestPrice,
  getSavingsPercent,
  formatPrice,
  formatTimeAgo,
  UserProduct,
  SupermarketPrice,
} from '../../../data/userMockData';

type PriceSortOption = 'priceAsc' | 'priceDesc' | 'nameAsc' | 'recent';

export default function ProductoDetallePage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [currency, setCurrency] = useState<'USD' | 'Bs'>('USD');
  const [priceSort, setPriceSort] = useState<PriceSortOption>('priceAsc');
  const [addedToCart, setAddedToCart] = useState(false);

  const product = userProducts.find(p => p.id === productId);

  const sortedPrices = useMemo(() => {
    if (!product) return [];
    const prices = [...product.prices];
    switch (priceSort) {
      case 'priceAsc':
        return prices.sort((a, b) => a.price - b.price);
      case 'priceDesc':
        return prices.sort((a, b) => b.price - a.price);
      case 'nameAsc':
        return prices.sort((a, b) => a.supermarketName.localeCompare(b.supermarketName));
      case 'recent':
        return prices.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
      default:
        return prices;
    }
  }, [product, priceSort]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Package size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Producto no encontrado</h3>
          <button
            onClick={() => router.push('/usuario/productos')}
            className="px-4 py-2 bg-button-green text-white rounded-xl hover:bg-accent-green-dark transition-colors text-sm mt-4"
          >
            Volver a productos
          </button>
        </div>
      </div>
    );
  }

  const lowest = getLowestPrice(product);
  const highest = getHighestPrice(product);
  const savings = getSavingsPercent(product);

  const handleAddToCart = () => {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Navegacion */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-medium">Volver</span>
        </button>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: Info del producto */}
        <div className="lg:col-span-1 space-y-4">
          {/* Imagen */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="h-56 bg-gradient-to-br from-primary-lighter to-primary-lightest flex items-center justify-center relative">
              <Package size={64} className="text-button-green/40" />
              {savings > 0 && (
                <div className="absolute top-3 right-3 bg-green-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl">
                  Ahorra {savings}%
                </div>
              )}
            </div>
            <div className="p-5">
              <span className="inline-block px-2.5 py-1 bg-primary/20 text-button-green text-xs font-medium rounded-lg mb-2">
                {product.category}
              </span>
              <h1 className="text-xl font-bold text-gray-800 mb-1">{product.name}</h1>
              <p className="text-sm text-gray-400 mb-3">{product.unit}</p>
              <p className="text-sm text-gray-600">{product.description}</p>
            </div>
          </div>

          {/* Boton agregar al carrito */}
          <button
            onClick={handleAddToCart}
            disabled={addedToCart}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
              addedToCart
                ? 'bg-green-500 text-white'
                : 'bg-button-green text-white hover:bg-accent-green-dark'
            }`}
          >
            {addedToCart ? (
              <>
                <Check size={20} />
                Agregado al carrito
              </>
            ) : (
              <>
                <ShoppingCart size={20} />
                Agregar al carrito
              </>
            )}
          </button>
        </div>

        {/* Columna derecha: Comparacion de precios */}
        <div className="lg:col-span-2 space-y-4">
          {/* Resumen de precios */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border-2 border-green-200 p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={18} className="text-green-600" />
                <span className="text-sm text-gray-500">Precio mas bajo</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {lowest ? formatPrice(lowest.price, currency) : '-'}
              </p>
              {lowest && (
                <p className="text-xs text-gray-400 mt-1">{lowest.supermarketName}</p>
              )}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-red-500" />
                <span className="text-sm text-gray-500">Precio mas alto</span>
              </div>
              <p className="text-2xl font-bold text-gray-700">
                {highest ? formatPrice(highest.price, currency) : '-'}
              </p>
              {highest && (
                <p className="text-xs text-gray-400 mt-1">{highest.supermarketName}</p>
              )}
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={18} className="text-button-green" />
                <span className="text-sm text-gray-500">Tu ahorro</span>
              </div>
              <p className="text-2xl font-bold text-button-green">
                {lowest && highest
                  ? formatPrice(highest.price - lowest.price, currency)
                  : '-'}
              </p>
              {savings > 0 && (
                <p className="text-xs text-green-600 mt-1">{savings}% menos</p>
              )}
            </div>
          </div>

          {/* Lista de precios por supermercado */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">
                Precios por supermercado ({product.prices.length})
              </h2>
              <div className="relative">
                <select
                  value={priceSort}
                  onChange={(e) => setPriceSort(e.target.value as PriceSortOption)}
                  className="appearance-none pl-8 pr-4 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-button-green/30 cursor-pointer"
                >
                  <option value="priceAsc">Menor precio</option>
                  <option value="priceDesc">Mayor precio</option>
                  <option value="nameAsc">Nombre A-Z</option>
                  <option value="recent">Mas reciente</option>
                </select>
                <ArrowUpDown size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="divide-y divide-gray-50">
              {sortedPrices.map((price, index) => {
                const isLowest = lowest && price.price === lowest.price;
                return (
                  <div
                    key={price.supermarketId}
                    className={`flex items-center justify-between p-5 hover:bg-gray-50 transition-colors ${
                      isLowest ? 'bg-green-50/50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold text-gray-400 bg-gray-100">
                        {index + 1}
                      </div>
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: price.supermarketColor }}
                      >
                        <Store size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{price.supermarketName}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-400">
                            Actualizado {formatTimeAgo(price.lastUpdated)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${isLowest ? 'text-green-600' : 'text-gray-800'}`}>
                        {formatPrice(price.price, currency)}
                      </p>
                      {isLowest && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Mas barato
                        </span>
                      )}
                      {!isLowest && lowest && (
                        <span className="text-xs text-red-400">
                          +{formatPrice(price.price - lowest.price, currency)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
