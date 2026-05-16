'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, Package, Loader2, DollarSign, ShoppingCart, TrendingDown } from 'lucide-react';
import { offersApi, ApiDeal, ApiDealsCount } from '../../lib/api';
import { ProductOfferPrice } from '../../components/ProductOfferPrice';
import { useFx } from '../../context/FxContext';

export default function OfertasPage() {
  const router = useRouter();
  const { rateUsdToBs } = useFx();
  const [deals, setDeals] = useState<ApiDeal[]>([]);
  const [dealsCount, setDealsCount] = useState<ApiDealsCount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'Bs'>('USD');
  const [filterSlug, setFilterSlug] = useState('');

  useEffect(() => {
    offersApi.getCount().then(setDealsCount).catch(() => setDealsCount(null));
  }, []);

  useEffect(() => {
    const fetchDeals = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await offersApi.listDeals({
          limit: 200,
          supermarket: filterSlug || undefined,
        });
        setDeals(data);
      } catch {
        setError('Error al cargar ofertas. Verifica que el servidor este corriendo.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeals();
  }, [filterSlug]);

  const totalLabel = filterSlug
    ? deals.length
    : (dealsCount?.total ?? deals.length);

  const formatSavings = (deal: ApiDeal) => {
    if (deal.discountPct > 0 && deal.originalPriceUsd != null) {
      return `Ahorras ${
        currency === 'USD'
          ? `$${(deal.originalPriceUsd - deal.priceUsd).toFixed(2)}`
          : `Bs. ${((deal.originalPriceBs ?? 0) - deal.priceBs).toFixed(2)}`
      }`;
    }
    return 'En oferta';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ofertas</h1>
          <p className="text-gray-500 mt-1">
            {totalLabel} producto{totalLabel !== 1 ? 's' : ''} en oferta
          </p>
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

      {!isLoading && (dealsCount?.by_supermarket?.length ?? 0) > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterSlug('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !filterSlug
                ? 'bg-button-green text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Todos
          </button>
          {dealsCount!.by_supermarket.map((s) => (
            <button
              key={s.supermarket_slug}
              onClick={() =>
                setFilterSlug(filterSlug === s.supermarket_slug ? '' : s.supermarket_slug)
              }
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterSlug === s.supermarket_slug
                  ? 'bg-button-green text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s.supermarket_name} ({s.total})
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-button-green" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
          {error}
        </div>
      )}

      {!isLoading && !error && deals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {deals.map((deal) => (
            <div
              key={`${deal.productId}-${deal.supermarketSlug}`}
              onClick={() => router.push(`/usuario/producto/${deal.productId}`)}
              className="bg-primary-lightest/30 rounded-xl border border-button-green/20 overflow-hidden hover:shadow-lg hover:border-button-green/40 transition-all cursor-pointer group relative"
            >
              {deal.discountPct > 0 && (
                <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                  <TrendingDown size={12} />
                  -{deal.discountPct}%
                </div>
              )}

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

              <div className="p-4">
                <p className="text-xs text-button-green font-medium mb-1">{deal.supermarketName}</p>
                <h3 className="font-semibold text-gray-800 text-sm mb-1 group-hover:text-button-green transition-colors line-clamp-2">
                  {deal.productName}
                </h3>
                <p className="text-xs text-gray-400 mb-3">
                  {deal.baseAmount} {deal.unitType} &middot; {deal.storeName}
                </p>

                <ProductOfferPrice
                  priceUsd={deal.priceUsd}
                  priceBs={deal.priceBs}
                  originalPriceUsd={deal.originalPriceUsd}
                  originalPriceBs={deal.originalPriceBs}
                  discountPct={deal.discountPct}
                  isOnSale
                  currency={currency}
                  rateUsdToBs={rateUsdToBs}
                />

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-button-green/10">
                  <span className="text-xs text-gray-400">{formatSavings(deal)}</span>
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

      {!isLoading && !error && deals.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Tag size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No hay ofertas disponibles
          </h3>
          <p className="text-gray-500">
            En este momento no se detectaron descuentos en los supermercados. Las ofertas se
            actualizan automaticamente con cada scraping.
          </p>
        </div>
      )}
    </div>
  );
}
