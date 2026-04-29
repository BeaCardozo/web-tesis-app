'use client';

import { useState, useMemo } from 'react';
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
  ToggleLeft,
  ToggleRight,
  ArrowRight,
} from 'lucide-react';
import {
  userCarts,
  userProducts,
  formatPrice,
  UserCart,
  CartItem,
  SupermarketPrice,
} from '../../data/userMockData';
import { mockSupermarkets } from '../../data/mockData';

interface ComparisonResult {
  supermarketId: string;
  supermarketName: string;
  supermarketColor: string;
  total: number;
  items: { productName: string; price: number; quantity: number }[];
  allAvailable: boolean;
}

interface MixedResult {
  items: {
    productName: string;
    quantity: number;
    bestPrice: number;
    supermarketName: string;
    supermarketColor: string;
  }[];
  total: number;
}

export default function CarritoPage() {
  const router = useRouter();
  const [carts, setCarts] = useState<UserCart[]>(userCarts);
  const [activeCartId, setActiveCartId] = useState(carts[0]?.id || '');
  const [currency, setCurrency] = useState<'USD' | 'Bs'>('USD');
  const [comparisonMode, setComparisonMode] = useState<'single' | 'mixed'>('single');
  const [showCartSelector, setShowCartSelector] = useState(false);
  const [showNewCartModal, setShowNewCartModal] = useState(false);
  const [newCartName, setNewCartName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const activeCart = carts.find(c => c.id === activeCartId);
  const cartItems = activeCart?.items || [];

  // Comparacion modo unico: total por supermercado
  const singleComparison = useMemo((): ComparisonResult[] => {
    if (cartItems.length === 0) return [];

    const results: ComparisonResult[] = [];

    for (const sm of mockSupermarkets) {
      let total = 0;
      let allAvailable = true;
      const items: ComparisonResult['items'] = [];

      for (const item of cartItems) {
        const priceEntry = item.prices.find(p => p.supermarketId === sm.id);
        if (priceEntry) {
          total += priceEntry.price * item.quantity;
          items.push({
            productName: item.productName,
            price: priceEntry.price,
            quantity: item.quantity,
          });
        } else {
          allAvailable = false;
        }
      }

      if (items.length > 0) {
        results.push({
          supermarketId: sm.id,
          supermarketName: sm.name,
          supermarketColor: sm.color,
          total,
          items,
          allAvailable,
        });
      }
    }

    return results.sort((a, b) => {
      if (a.allAvailable && !b.allAvailable) return -1;
      if (!a.allAvailable && b.allAvailable) return 1;
      return a.total - b.total;
    });
  }, [cartItems]);

  // Comparacion modo mixto: mejor precio por producto
  const mixedComparison = useMemo((): MixedResult => {
    const items: MixedResult['items'] = [];
    let total = 0;

    for (const item of cartItems) {
      if (item.prices.length === 0) continue;
      const best = item.prices.reduce((min, p) => p.price < min.price ? p : min, item.prices[0]);
      const subtotal = best.price * item.quantity;
      total += subtotal;
      items.push({
        productName: item.productName,
        quantity: item.quantity,
        bestPrice: best.price,
        supermarketName: best.supermarketName,
        supermarketColor: best.supermarketColor,
      });
    }

    return { items, total };
  }, [cartItems]);

  const updateQuantity = (itemId: string, delta: number) => {
    setCarts(prev =>
      prev.map(cart => {
        if (cart.id !== activeCartId) return cart;
        return {
          ...cart,
          items: cart.items
            .map(item =>
              item.id === itemId
                ? { ...item, quantity: Math.max(0, item.quantity + delta) }
                : item
            )
            .filter(item => item.quantity > 0),
        };
      })
    );
  };

  const removeItem = (itemId: string) => {
    setCarts(prev =>
      prev.map(cart => {
        if (cart.id !== activeCartId) return cart;
        return { ...cart, items: cart.items.filter(item => item.id !== itemId) };
      })
    );
  };

  const createCart = () => {
    if (!newCartName.trim()) return;
    const newCart: UserCart = {
      id: `cart-${Date.now()}`,
      name: newCartName.trim(),
      items: [],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCarts(prev => [...prev, newCart]);
    setActiveCartId(newCart.id);
    setNewCartName('');
    setShowNewCartModal(false);
  };

  const deleteCart = (cartId: string) => {
    setCarts(prev => prev.filter(c => c.id !== cartId));
    if (activeCartId === cartId) {
      const remaining = carts.filter(c => c.id !== cartId);
      setActiveCartId(remaining[0]?.id || '');
    }
    setShowDeleteConfirm(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mi Carrito</h1>
          <p className="text-gray-500 mt-1">Compara precios y optimiza tu compra</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Selector de moneda */}
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

      {/* Selector de carrito */}
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
                ({cartItems.length} items)
              </span>
              <ChevronDown size={16} className="text-gray-400 ml-auto" />
            </button>

            {/* Dropdown de carritos */}
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
                      <p className="text-xs text-gray-400">{cart.items.length} productos</p>
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

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Lista de items del carrito */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-semibold text-gray-800">
              Productos en el carrito ({cartItems.length})
            </h2>
            {cartItems.map(item => {
              const lowestPrice = item.prices.length > 0
                ? item.prices.reduce((min, p) => p.price < min.price ? p : min, item.prices[0])
                : null;
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-lighter to-primary-lightest rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package size={22} className="text-button-green/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => router.push(`/usuario/producto/${item.productId}`)}
                      className="font-medium text-gray-800 text-sm hover:text-button-green transition-colors truncate block text-left"
                    >
                      {item.productName}
                    </button>
                    <p className="text-xs text-gray-400">{item.unit}</p>
                    {lowestPrice && (
                      <p className="text-sm font-semibold text-button-green mt-1">
                        {formatPrice(lowestPrice.price, currency)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-medium text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-button-green text-white hover:bg-accent-green-dark transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
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

          {/* Comparacion de precios */}
          <div className="lg:col-span-3 space-y-4">
            {/* Toggle de modo */}
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

            {/* Resultados */}
            {comparisonMode === 'single' ? (
              <div className="space-y-3">
                {singleComparison.map((result, index) => (
                  <div
                    key={result.supermarketId}
                    className={`bg-white rounded-xl border overflow-hidden ${
                      index === 0 && result.allAvailable
                        ? 'border-green-300 shadow-sm'
                        : 'border-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold text-gray-400 bg-gray-100">
                          {index + 1}
                        </div>
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                          style={{ backgroundColor: result.supermarketColor }}
                        >
                          <Store size={18} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{result.supermarketName}</p>
                          <p className="text-xs text-gray-400">
                            {result.items.length}/{cartItems.length} productos disponibles
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${
                          index === 0 && result.allAvailable ? 'text-green-600' : 'text-gray-800'
                        }`}>
                          {formatPrice(result.total, currency)}
                        </p>
                        {index === 0 && result.allAvailable && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            Mejor opcion
                          </span>
                        )}
                        {!result.allAvailable && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                            Incompleto
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Desglose */}
                    <div className="border-t border-gray-50 px-4 py-2">
                      {result.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 text-sm">
                          <span className="text-gray-600">
                            {item.productName} x{item.quantity}
                          </span>
                          <span className="text-gray-800 font-medium">
                            {formatPrice(item.price * item.quantity, currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Modo mixto */
              <div className="bg-white rounded-xl border border-green-300 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800">Compra optimizada</h3>
                    <p className="text-xs text-gray-400">Mejor precio por producto</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      {formatPrice(mixedComparison.total, currency)}
                    </p>
                    <span className="text-xs text-green-600 font-medium">Total optimizado</span>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {mixedComparison.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-lighter to-primary-lightest rounded-xl flex items-center justify-center flex-shrink-0">
                          <Package size={16} className="text-button-green/40" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{item.productName}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: item.supermarketColor }}
                            />
                            <span className="text-xs text-gray-400">{item.supermarketName}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">
                          {formatPrice(item.bestPrice * item.quantity, currency)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatPrice(item.bestPrice, currency)} x {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {singleComparison.length > 0 && singleComparison[0].allAvailable && (
                  <div className="p-4 bg-green-50 border-t border-green-100">
                    <p className="text-sm text-green-700">
                      Ahorro vs. mejor supermercado unico:{' '}
                      <strong>
                        {formatPrice(singleComparison[0].total - mixedComparison.total, currency)}
                      </strong>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Estado vacio */
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
      )}

      {/* Modal crear carrito */}
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
              onKeyDown={(e) => e.key === 'Enter' && createCart()}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowNewCartModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={createCart}
                disabled={!newCartName.trim()}
                className="flex-1 px-4 py-2.5 rounded-xl bg-button-green text-white hover:bg-accent-green-dark transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminar */}
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
                onClick={() => deleteCart(showDeleteConfirm)}
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
