'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Plus,
  Trash2,
  Minus,
  X,
  Package,
  Store,
  DollarSign,
  ChevronDown,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  cartsApi,
  ApiCart,
  ApiCartDetail,
  ApiCompareResult,
  ApiCompareSingleResult,
  ApiCompareMixedResult,
} from '../../lib/api';
import { EXCHANGE_RATE } from '../../data/userMockData';

export default function CarritoPage() {
  const router = useRouter();

  // Cart list & active cart
  const [carts, setCarts] = useState<ApiCart[]>([]);
  const [activeCartId, setActiveCartId] = useState('');
  const [activeCart, setActiveCart] = useState<ApiCartDetail | null>(null);

  // Comparison
  const [comparisonMode, setComparisonMode] = useState<'single' | 'mixed'>('single');
  const [comparison, setComparison] = useState<ApiCompareResult | null>(null);

  // Loading & error
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCart, setIsLoadingCart] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState('');

  // UI
  const [currency, setCurrency] = useState<'USD' | 'Bs'>('USD');
  const [showCartSelector, setShowCartSelector] = useState(false);
  const [showNewCartModal, setShowNewCartModal] = useState(false);
  const [newCartName, setNewCartName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [compareVersion, setCompareVersion] = useState(0);

  const cartItems = activeCart?.items || [];

  const formatCurrency = (usd: number) => {
    if (currency === 'Bs') return `Bs. ${(usd * EXCHANGE_RATE).toFixed(2)}`;
    return `$${usd.toFixed(2)}`;
  };

  // ---- Data fetching ----

  const fetchCarts = useCallback(async () => {
    try {
      const data = await cartsApi.list();
      setCarts(data);
      return data;
    } catch {
      setError('Error al cargar carritos');
      return [];
    }
  }, []);

  const fetchCart = useCallback(async (cartId: string) => {
    setIsLoadingCart(true);
    try {
      const data = await cartsApi.getOne(cartId);
      setActiveCart(data);
      return data;
    } catch {
      setActiveCart(null);
    } finally {
      setIsLoadingCart(false);
    }
  }, []);

  const fetchComparison = useCallback(async (cartId: string, mode: 'single' | 'mixed') => {
    setIsComparing(true);
    setComparison(null);
    try {
      const data = await cartsApi.compare(cartId, mode);
      setComparison(data);
    } catch {
      // Comparison may fail if no DWH data — that's OK
      setComparison(null);
    } finally {
      setIsComparing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const data = await fetchCarts();
      if (data.length > 0) {
        setActiveCartId(data[0].id);
      }
      setIsLoading(false);
    };
    init();
  }, [fetchCarts]);

  // Fetch cart detail when active cart changes
  useEffect(() => {
    if (!activeCartId) return;
    fetchCart(activeCartId);
  }, [activeCartId, fetchCart]);

  // Fetch comparison when cart loads, mode changes, or quantities change
  useEffect(() => {
    if (!activeCartId || !activeCart || activeCart.items.length === 0) {
      setComparison(null);
      return;
    }
    fetchComparison(activeCartId, comparisonMode);
  }, [activeCartId, activeCart?.items.length, comparisonMode, compareVersion, fetchComparison]);

  // ---- Mutations ----

  const handleCreateCart = async () => {
    if (!newCartName.trim()) return;
    try {
      const newCart = await cartsApi.create(newCartName.trim());
      setNewCartName('');
      setShowNewCartModal(false);
      await fetchCarts();
      setActiveCartId(newCart.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al crear carrito';
      setError(msg);
    }
  };

  const handleDeleteCart = async (cartId: string) => {
    try {
      await cartsApi.remove(cartId);
      setShowDeleteConfirm(null);
      const remaining = await fetchCarts();
      if (activeCartId === cartId) {
        setActiveCartId(remaining[0]?.id || '');
        if (remaining.length === 0) setActiveCart(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al eliminar carrito';
      setError(msg);
    }
  };

  const handleUpdateQuantity = async (itemId: string, delta: number) => {
    if (!activeCart) return;
    const item = activeCart.items.find(i => i.id === itemId);
    if (!item) return;

    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      // Remove item
      setActiveCart(prev => prev ? { ...prev, items: prev.items.filter(i => i.id !== itemId) } : prev);
      try {
        await cartsApi.removeItem(activeCartId, itemId);
        await fetchCarts();
        setCompareVersion(v => v + 1);
      } catch {
        fetchCart(activeCartId);
      }
      return;
    }

    // Optimistic update
    setActiveCart(prev => prev ? {
      ...prev,
      items: prev.items.map(i => i.id === itemId ? { ...i, quantity: newQty } : i),
    } : prev);

    try {
      await cartsApi.updateItem(activeCartId, itemId, { quantity: newQty });
      setCompareVersion(v => v + 1);
    } catch {
      fetchCart(activeCartId);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    // Optimistic
    setActiveCart(prev => prev ? { ...prev, items: prev.items.filter(i => i.id !== itemId) } : prev);
    try {
      await cartsApi.removeItem(activeCartId, itemId);
      await fetchCarts();
      setCompareVersion(v => v + 1);
    } catch {
      fetchCart(activeCartId);
    }
  };

  // ---- Render helpers ----

  const singleData = comparison?.mode === 'single' ? comparison as ApiCompareSingleResult : null;
  const mixedData = comparison?.mode === 'mixed' ? comparison as ApiCompareMixedResult : null;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-button-green" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mi Carrito</h1>
          <p className="text-gray-500 mt-1">Compara precios y optimiza tu compra</p>
        </div>
        <div className="flex items-center gap-2">
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
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
          <p className="text-red-600 text-sm flex-1">{error}</p>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Cart selector */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div className="relative flex-1">
            <button
              onClick={() => setShowCartSelector(!showCartSelector)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors w-full sm:w-auto"
            >
              <ShoppingCart size={18} className="text-button-green" />
              <span className="font-medium text-gray-800">
                {activeCart?.name || 'Seleccionar carrito'}
              </span>
              <span className="text-xs text-gray-400">
                ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
              </span>
              <ChevronDown size={16} className="text-gray-400 ml-auto" />
            </button>

            {showCartSelector && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
                {carts.map(cart => (
                  <div
                    key={cart.id}
                    className={`flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                      cart.id === activeCartId ? 'bg-primary/10' : ''
                    }`}
                  >
                    <button
                      onClick={() => {
                        setActiveCartId(cart.id);
                        setShowCartSelector(false);
                      }}
                      className="flex-1 text-left"
                    >
                      <p className="font-medium text-gray-800 text-sm">{cart.name}</p>
                      <p className="text-xs text-gray-400">{cart.itemCount} productos</p>
                    </button>
                    {carts.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(cart.id);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => {
                    setShowCartSelector(false);
                    setShowNewCartModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-button-green hover:bg-green-50 border-t border-gray-100 text-sm font-medium"
                >
                  <Plus size={16} />
                  Crear nuevo carrito
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowNewCartModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-button-green text-white rounded-xl hover:bg-accent-green-dark transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nuevo carrito</span>
          </button>
        </div>
      </div>

      {/* Cart loading */}
      {isLoadingCart && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-button-green" />
        </div>
      )}

      {/* Cart content */}
      {!isLoadingCart && cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-semibold text-gray-800">
              Productos en el carrito ({cartItems.length})
            </h2>
            {cartItems.map(item => {
              const unit = `${item.product.baseAmount} ${item.product.unitType}`;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-100 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100 overflow-hidden">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="h-full w-full object-contain p-1"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Package size={20} className="text-button-green/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => router.push(`/usuario/producto/${item.product.id}`)}
                        className="font-medium text-gray-800 text-sm hover:text-button-green transition-colors text-left line-clamp-2 leading-tight"
                      >
                        {item.product.name}
                      </button>
                      <p className="text-xs text-gray-400 mt-0.5">{unit}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    {item.product.category && (
                      <span className="text-xs text-button-green">{item.product.category.name}</span>
                    )}
                    <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-medium text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-button-green text-white hover:bg-accent-green-dark transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <button
              onClick={() => router.push('/usuario/productos')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:text-button-green hover:border-button-green transition-colors text-sm"
            >
              <Plus size={16} />
              Agregar mas productos
            </button>
          </div>

          {/* Comparison section */}
          <div className="lg:col-span-3 space-y-4">
            {/* Mode toggle */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-600">Modo de comparacion:</span>
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setComparisonMode('single')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      comparisonMode === 'single'
                        ? 'bg-button-green text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Un supermercado
                  </button>
                  <button
                    onClick={() => setComparisonMode('mixed')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      comparisonMode === 'mixed'
                        ? 'bg-button-green text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Mixto
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {comparisonMode === 'single'
                  ? 'Compra todo en un solo supermercado al mejor precio total.'
                  : 'Compra cada producto en el supermercado mas barato.'}
              </p>
            </div>

            {/* Comparison loading */}
            {isComparing && (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-button-green" />
                <span className="ml-2 text-sm text-gray-500">Comparando precios...</span>
              </div>
            )}

            {/* Single mode results */}
            {!isComparing && comparisonMode === 'single' && singleData && (
              <div className="space-y-3">
                {singleData.supermarkets
                  .sort((a, b) => {
                    if (a.allProductsAvailable && !b.allProductsAvailable) return -1;
                    if (!a.allProductsAvailable && b.allProductsAvailable) return 1;
                    return a.totalUsd - b.totalUsd;
                  })
                  .map((sm, index) => {
                    const isCheapest = singleData.cheapest?.name === sm.name;
                    return (
                      <div
                        key={sm.name}
                        className={`bg-white rounded-xl border overflow-hidden ${
                          isCheapest && sm.allProductsAvailable
                            ? 'border-green-300 shadow-sm'
                            : 'border-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold text-gray-400 bg-gray-100">
                              {index + 1}
                            </div>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm bg-button-green">
                              <Store size={18} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{sm.name}</p>
                              <p className="text-xs text-gray-400">
                                {sm.lines.filter(l => l.available).length}/{cartItems.length} productos disponibles
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-xl font-bold ${
                              isCheapest && sm.allProductsAvailable ? 'text-green-600' : 'text-gray-800'
                            }`}>
                              {formatCurrency(sm.totalUsd)}
                            </p>
                            {isCheapest && sm.allProductsAvailable && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                Mejor opcion
                              </span>
                            )}
                            {!sm.allProductsAvailable && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                Incompleto
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Line breakdown */}
                        <div className="border-t border-gray-50 px-4 py-2">
                          {sm.lines.map((line) => (
                            <div key={line.productId} className="flex items-center justify-between py-1.5 text-sm">
                              <span className={`${line.available ? 'text-gray-600' : 'text-gray-400 line-through'}`}>
                                {line.productName} x{line.quantity}
                              </span>
                              <span className="text-gray-800 font-medium">
                                {line.lineTotalUsd != null ? formatCurrency(line.lineTotalUsd) : 'N/D'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Mixed mode results */}
            {!isComparing && comparisonMode === 'mixed' && mixedData && (
              <div className="space-y-3">
                {/* Total card */}
                <div className="bg-white rounded-xl border border-green-300 shadow-sm p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">Compra optimizada</h3>
                    <p className="text-xs text-gray-400">
                      Comprar en {mixedData.bySupermarket.length} supermercado{mixedData.bySupermarket.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(mixedData.grandTotalUsd)}
                    </p>
                    <span className="text-xs text-green-600 font-medium">Total optimizado</span>
                  </div>
                </div>

                {/* Grouped by supermarket */}
                {mixedData.bySupermarket.map((sm) => (
                  <div key={sm.supermarketName} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-button-green">
                          <Store size={18} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{sm.supermarketName}</p>
                          <p className="text-xs text-gray-400">
                            {sm.purchases.length} producto{sm.purchases.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-gray-800">
                        {formatCurrency(sm.subtotalUsd)}
                      </p>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {sm.purchases.map((p) => (
                        <div key={p.productId} className="flex items-center justify-between px-5 py-3 ml-4">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 bg-primary-lightest rounded-lg flex items-center justify-center flex-shrink-0">
                              <Package size={14} className="text-button-green/40" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm text-gray-700 line-clamp-1">{p.productName}</p>
                              <p className="text-xs text-gray-400">
                                {formatCurrency(p.unitPriceUsd)} x {p.quantity}
                              </p>
                            </div>
                          </div>
                          <p className="font-medium text-gray-800 text-sm flex-shrink-0 ml-3">
                            {formatCurrency(p.lineTotalUsd)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Savings vs single */}
                {singleData && singleData.cheapest && mixedData.grandTotalUsd < singleData.cheapest.totalUsd && (
                  <div className="bg-green-50 rounded-xl border border-green-200 p-4">
                    <p className="text-sm text-green-700">
                      Ahorro vs. mejor supermercado unico:{' '}
                      <strong>
                        {formatCurrency(singleData.cheapest.totalUsd - mixedData.grandTotalUsd)}
                      </strong>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* No comparison data */}
            {!isComparing && !comparison && cartItems.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <AlertCircle size={36} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  No se pudieron obtener datos de precios para la comparacion.
                </p>
                <button
                  onClick={() => fetchComparison(activeCartId, comparisonMode)}
                  className="mt-3 px-4 py-2 text-sm text-button-green hover:text-accent-green-dark font-medium"
                >
                  Reintentar
                </button>
              </div>
            )}
          </div>
        </div>
      ) : !isLoadingCart && carts.length > 0 && cartItems.length === 0 ? (
        /* Empty cart */
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <ShoppingCart size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Tu carrito esta vacio</h3>
          <p className="text-gray-500 mb-6">
            Agrega productos para comparar precios y optimizar tu compra.
          </p>
          <button
            onClick={() => router.push('/usuario/productos')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-button-green text-white rounded-xl hover:bg-accent-green-dark transition-colors font-medium"
          >
            Explorar productos
            <ArrowRight size={18} />
          </button>
        </div>
      ) : !isLoadingCart && carts.length === 0 ? (
        /* No carts at all */
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <ShoppingCart size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No tienes carritos</h3>
          <p className="text-gray-500 mb-6">
            Crea tu primer carrito para empezar a comparar precios.
          </p>
          <button
            onClick={() => setShowNewCartModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-button-green text-white rounded-xl hover:bg-accent-green-dark transition-colors font-medium"
          >
            <Plus size={18} />
            Crear mi primer carrito
          </button>
        </div>
      ) : null}

      {/* New cart modal */}
      {showNewCartModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Nuevo carrito</h3>
              <button
                onClick={() => setShowNewCartModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <input
              type="text"
              value={newCartName}
              onChange={(e) => setNewCartName(e.target.value)}
              placeholder="Nombre del carrito"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-button-green/30 focus:border-button-green mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateCart()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewCartModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCart}
                disabled={!newCartName.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-button-green text-white hover:bg-accent-green-dark transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Eliminar carrito</h3>
            <p className="text-gray-500 text-sm mb-4">
              Esta accion no se puede deshacer. Se eliminaran todos los productos del carrito.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteCart(showDeleteConfirm)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
