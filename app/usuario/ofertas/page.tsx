'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, Package, Loader2, DollarSign, ShoppingCart, TrendingDown } from 'lucide-react';
import { offersApi, ApiDeal } from '../../lib/api';
import { useFx } from '../../context/FxContext';

export default function OfertasPage() {
  const router = useRouter();
  const { rateUsdToBs } = useFx();
  const [deals, setDeals] = useState<ApiDeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'Bs'>('USD');
  const [filterSuper, setFilterSuper] = useState('');

  useEffect(() => {
    const fetchDeals = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await offersApi.listDeals({ limit: 200 });
        setDeals(data);
      } catch {
        setError('Error al cargar ofertas. Verifica que el servidor este corriendo.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeals();
  }, []);

  const supermarkets = [...new Set(deals.map((d) => d.supermarketName))].sort();

  const formatPriceVal = (usd: number, bs: number) => {
    if (currency === 'Bs') return `Bs. ${bs.toFixed(2)}`;
    return `$${usd.toFixed(2)}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ofertas</h1>
          <p className="text-gray-500 mt-1">
            {deals.length} producto{deals.length !== 1 ? 's' : ''} en oferta
          </p>
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

      {/* Filtro por supermercado */}
      {!isLoading && deals.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterSuper('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !filterSuper
                ? 'bg-button-green text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Todos
          </button>
          {supermarkets.map((s) => (
            <button
              key={s}
              onClick={() => setFilterSuper(filterSuper === s ? '' : s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterSuper === s
                  ? 'bg-button-green text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-button-green" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Grid de ofertas */}
      {!isLoading && !error && deals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {deals
            .filter((d) => !filterSuper || d.supermarketName === filterSuper)
            .map((deal) => (
              <div
                key={`${deal.productId}-${deal.supermarketSlug}`}
                onClick={() => router.push(`/usuario/producto/${deal.productId}`)}
                className="bg-primary-lightest/30 rounded-xl border border-button-green/20 overflow-hidden hover:shadow-lg hover:border-button-green/40 transition-all cursor-pointer group relative"
              >
                {/* Badge de descuento */}
                {deal.discountPct > 0 && (
                  <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                    <TrendingDown size={12} />
                    -{deal.discountPct}%
                  </div>
                )}

                {/* Imagen */}
                <div className="h-32 bg-white flex items-center justify-center relative overflow-hidden">
                  {deal.imageUrl ? (
                    <img
                      src={deal.imageUrl}
                      alt={deal.productName}
                      className="h-full w-full object-contain p-2"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <Package size={36} className={`text-button-green/40 ${deal.imageUrl ? 'hidden' : ''}`} />
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-xs text-button-green font-medium mb-1">{deal.supermarketName}</p>
                  <h3 className="font-semibold text-gray-800 text-sm mb-1 group-hover:text-button-green transition-colors line-clamp-2">
                    {deal.productName}
                  </h3>
                  <p className="text-xs text-gray-400 mb-3">
                    {deal.baseAmount} {deal.unitType} &middot; {deal.storeName}
                  </p>

                  {/* Precios */}
                  <div className="flex items-end gap-2">
                    <p className="text-lg font-bold text-button-green">
                      {formatPriceVal(deal.priceUsd, deal.priceBs)}
                    </p>
                    {deal.originalPriceUsd && deal.originalPriceUsd > deal.priceUsd && (
                      <p className="text-sm text-gray-400 line-through">
                        {formatPriceVal(deal.originalPriceUsd, deal.originalPriceBs ?? deal.originalPriceUsd * rateUsdToBs)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-button-green/10">
                    <span className="text-xs text-gray-400">
                      {deal.discountPct > 0
                        ? `Ahorras ${formatPriceVal(
                            deal.originalPriceUsd! - deal.priceUsd,
                            (deal.originalPriceBs ?? 0) - deal.priceBs
                          )}`
                        : 'En oferta'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/usuario/producto/${deal.productId}`);
                      }}
                      className="flex items-center gap-1 text-xs text-button-green font-medium hover:text-accent-green-dark"
                    >
                      <ShoppingCart size={14} />
                      Ver
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Estado vacio */}
      {!isLoading && !error && deals.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Tag size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No hay ofertas disponibles
          </h3>
          <p className="text-gray-500">
            En este momento no se detectaron descuentos en los supermercados. Las ofertas se actualizan automaticamente con cada scraping.
          </p>
        </div>
      )}
    </div>
  );
}
