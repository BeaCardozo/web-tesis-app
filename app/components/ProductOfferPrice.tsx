'use client';

import { formatBs } from '../lib/currency';

export type OfferPriceCurrency = 'USD' | 'Bs';

export interface ProductOfferPriceProps {
  priceUsd: number;
  priceBs: number;
  originalPriceUsd?: number | null;
  originalPriceBs?: number | null;
  discountPct?: number | null;
  isOnSale?: boolean | null;
  currency: OfferPriceCurrency;
  rateUsdToBs?: number;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  label?: string;
  layout?: 'inline' | 'stack';
  className?: string;
}

function formatAmount(usd: number, bs: number, currency: OfferPriceCurrency): string {
  if (currency === 'Bs') return formatBs(bs);
  return `$${usd.toFixed(2)}`;
}

export function hasOfferDisplay(
  priceUsd: number,
  originalPriceUsd?: number | null,
  isOnSale?: boolean | null,
): boolean {
  if (originalPriceUsd != null && originalPriceUsd > priceUsd) return true;
  return Boolean(isOnSale);
}

export function ProductOfferPrice({
  priceUsd,
  priceBs,
  originalPriceUsd,
  originalPriceBs,
  discountPct,
  isOnSale,
  currency,
  rateUsdToBs = 1,
  size = 'md',
  showLabel = false,
  label = 'Desde',
  layout = 'inline',
  className = '',
}: ProductOfferPriceProps) {
  const showStrikethrough = hasOfferDisplay(priceUsd, originalPriceUsd, isOnSale);
  const origUsd = originalPriceUsd ?? null;
  const origBs =
    originalPriceBs ?? (origUsd != null ? origUsd * rateUsdToBs : null);

  const priceClass = size === 'sm' ? 'text-base font-bold' : 'text-lg font-bold';
  const strikeClass = size === 'sm' ? 'text-xs' : 'text-sm';

  const wrapperClass =
    layout === 'stack'
      ? `flex flex-col gap-0.5 ${className}`.trim()
      : `flex items-end gap-2 flex-wrap ${className}`.trim();

  return (
    <div className={wrapperClass}>
      {showLabel && (
        <p className={`text-xs text-gray-400 ${layout === 'inline' ? 'w-full' : ''}`}>
          {label}
        </p>
      )}
      <p className={`${priceClass} text-button-green`}>
        {formatAmount(priceUsd, priceBs, currency)}
      </p>
      {showStrikethrough && origUsd != null && (
        <p className={`${strikeClass} text-gray-400 line-through`}>
          {formatAmount(origUsd, origBs ?? origUsd * rateUsdToBs, currency)}
        </p>
      )}
      {discountPct != null && discountPct > 0 && (
        <span className="text-xs font-bold text-red-500">-{discountPct}%</span>
      )}
    </div>
  );
}
