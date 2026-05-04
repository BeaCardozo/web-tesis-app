'use client';

import { useState, useMemo, useEffect } from 'react';
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
  Loader2,
} from 'lucide-react';
import {
  productsApi,
  cartsApi,
  ApiProductDetail,
  ApiSupermarketPrice,
  ApiCart,
} from '../../../lib/api';
import { EXCHANGE_RATE, formatTimeAgo } from '../../../data/userMockData';

type PriceSortOption = 'priceAsc' | 'priceDesc' | 'nameAsc' | 'recent';

interface NormalizedPrice {
  supermarketName: string;
  storeName: string;
  priceUsd: number;
  priceBs: number;
  scrapedAt: string;
  isAvailable: boolean;
}

function normalizePrices(pricesBySupermarket: Record<string, ApiSupermarketPrice[]>): NormalizedPrice[] {
  const prices: NormalizedPrice[] = [];
  for (const [smName, records] of Object.entries(pricesBySupermarket)) {
    for (const r of records) {
      prices.push({
        supermarketName: String(r.supermarket_name ?? smName),
        storeName: String(r.store_name ?? ''),
        priceUsd: Number(r.price_usd ?? 0),
        priceBs: Number(r.price_bs ?? 0),
        scrapedAt: String(r.scraped_at ?? ''),
        isAvailable: Boolean(r.is_available ?? true),
      });
    }
  }
  return prices;
}

export default function ProductoDetallePage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<ApiProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'Bs'>('USD');
  const [priceSort, setPriceSort] = useState<PriceSortOption>('priceAsc');
  const [addedToCart, setAddedToCart] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showCartPicker, setShowCartPicker] = useState(false);
  const [userCarts, setUserCarts] = useState<ApiCart[]>([]);
  const [cartError, setCartError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await productsApi.getById(productId);
        setProduct(data);
      } catch {
        setError('Producto no encontrado');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const prices = useMemo(() => {
    if (!product) return [];
    return normalizePrices(product.pricesBySupermarket);
  }, [product]);

  const sortedPrices = useMemo(() => {
    const sorted = [...prices];
    switch (priceSort) {
      case 'priceAsc':
        return sorted.sort((a, b) => a.priceUsd - b.priceUsd);
      case 'priceDesc':
        return sorted.sort((a, b) => b.priceUsd - a.priceUsd);
      case 'nameAsc':
        return sorted.sort((a, b) => a.supermarketName.localeCompare(b.supermarketName));
      case 'recent':
        return sorted.sort((a, b) => new Date(b.scrapedAt).getTime() - new Date(a.scrapedAt).getTime());
      default:
        return sorted;
    }
  }, [prices, priceSort]);

  const lowest = useMemo(() => {
    if (prices.length === 0) return null;
    return prices.reduce((min, p) => p.priceUsd < min.priceUsd ? p : min, prices[0]);
  }, [prices]);

  const highest = useMemo(() => {
    if (prices.length === 0) return null;
    return prices.reduce((max, p) => p.priceUsd > max.priceUsd ? p : max, prices[0]);
  }, [prices]);

  const savings = useMemo(() => {
    if (!lowest || !highest || highest.priceUsd === 0) return 0;
    return Math.round(((highest.priceUsd - lowest.priceUsd) / highest.priceUsd) * 100);
  }, [lowest, highest]);

  const formatCurrency = (usd: number, bs?: number) => {
    if (currency === 'Bs') return `Bs. ${(bs ?? usd * EXCHANGE_RATE).toFixed(2)}`;
    return `$${usd.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-button-green" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-5xl mx-auto">
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

  const unit = `${product.baseAmount} ${product.unitType}`;

  const handleAddToCart = async () => {
    setCartError('');
    setIsAddingToCart(true);
    try {
      const carts = await cartsApi.list();
      if (carts.length === 0) {
        // Create default cart and add item
        const newCart = await cartsApi.create('Mi carrito');
        await cartsApi.addItem(newCart.id, { productId, quantity: 1 });
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
      } else if (carts.length === 1) {
        // Add to only cart
        await cartsApi.addItem(carts[0].id, { productId, quantity: 1 });
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
      } else {
        // Show picker
        setUserCarts(carts);
        setShowCartPicker(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al agregar al carrito';
      setCartError(msg);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToSpecificCart = async (cartId: string) => {
    setCartError('');
    setIsAddingToCart(true);
    try {
      await cartsApi.addItem(cartId, { productId, quantity: 1 });
      setShowCartPicker(false);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al agregar al carrito';
      setCartError(msg);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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
            <div className="h-56 bg-white flex items-center justify-center relative overflow-hidden">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-contain p-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <Package size={64} className={`text-button-green/40 ${product.imageUrl ? 'hidden' : ''}`} />
              {savings > 0 && (
                <div className="absolute top-3 right-3 bg-green-500 text-white text-sm font-bold px-3 py-1.5 rounded-xl">
                  Ahorra {savings}%
                </div>
              )}
            </div>
            <div className="p-5">
              <span className="inline-block px-2.5 py-1 bg-primary/20 text-button-green text-xs font-medium rounded-lg mb-2">
                {product.category.name}
              </span>
              <h1 className="text-xl font-bold text-gray-800 mb-1">{product.name}</h1>
              <p className="text-sm text-gray-400 mb-3">{unit}</p>
              {product.brand && (
                <p className="text-sm text-gray-500">Marca: {product.brand.name}</p>
              )}
              {product.description && (
                <p className="text-sm text-gray-600 mt-2">{product.description}</p>
              )}
            </div>
          </div>

          {/* Boton agregar al carrito */}
          <div className="relative">
            <button
              onClick={handleAddToCart}
              disabled={addedToCart || isAddingToCart}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                addedToCart
                  ? 'bg-green-500 text-white'
                  : 'bg-button-green text-white hover:bg-accent-green-dark'
              } disabled:opacity-70`}
            >
              {addedToCart ? (
                <>
                  <Check size={20} />
                  Agregado al carrito
                </>
              ) : isAddingToCart ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Agregando...
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  Agregar al carrito
                </>
              )}
            </button>
            {cartError && (
              <p className="text-xs text-red-500 mt-1.5 text-center">{cartError}</p>
            )}

            {/* Cart picker dropdown */}
            {showCartPicker && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
                <p className="px-4 py-2.5 text-xs font-medium text-gray-500 border-b border-gray-100">
                  Selecciona un carrito
                </p>
                {userCarts.map(cart => (
                  <button
                    key={cart.id}
                    onClick={() => handleAddToSpecificCart(cart.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{cart.name}</p>
                      <p className="text-xs text-gray-400">{cart.itemCount} productos</p>
                    </div>
                    <ShoppingCart size={16} className="text-gray-400" />
                  </button>
                ))}
                <button
                  onClick={() => setShowCartPicker(false)}
                  className="w-full px-4 py-2.5 text-xs text-gray-500 hover:bg-gray-50 border-t border-gray-100"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha: Comparacion de precios */}
        <div className="lg:col-span-2 space-y-4">
          {/* Resumen de precios */}
          {prices.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border-2 border-green-200 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown size={18} className="text-green-600" />
                    <span className="text-sm text-gray-500">Precio mas bajo</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {lowest ? formatCurrency(lowest.priceUsd, lowest.priceBs) : '-'}
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
                    {highest ? formatCurrency(highest.priceUsd, highest.priceBs) : '-'}
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
                      ? formatCurrency(highest.priceUsd - lowest.priceUsd, highest.priceBs - lowest.priceBs)
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
                    Precios por supermercado ({prices.length})
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
                    const isLowest = lowest && price.priceUsd === lowest.priceUsd;
                    return (
                      <div
                        key={`${price.supermarketName}-${price.storeName}-${index}`}
                        className={`flex items-center justify-between p-5 hover:bg-gray-50 transition-colors ${
                          isLowest ? 'bg-green-50/50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold text-gray-400 bg-gray-100">
                            {index + 1}
                          </div>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm bg-button-green">
                            <Store size={18} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{price.supermarketName}</p>
                            {price.storeName && (
                              <p className="text-xs text-gray-400">{price.storeName}</p>
                            )}
                            {price.scrapedAt && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Clock size={12} className="text-gray-400" />
                                <span className="text-xs text-gray-400">
                                  Actualizado {formatTimeAgo(price.scrapedAt)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${isLowest ? 'text-green-600' : 'text-gray-800'}`}>
                            {formatCurrency(price.priceUsd, price.priceBs)}
                          </p>
                          {isLowest && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                              Mas barato
                            </span>
                          )}
                          {!isLowest && lowest && (
                            <span className="text-xs text-red-400">
                              +{formatCurrency(price.priceUsd - lowest.priceUsd)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <DollarSign size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Precios no disponibles
              </h3>
              <p className="text-gray-500">
                Aun no hay datos de precios para este producto.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
