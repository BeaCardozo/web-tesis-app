'use client';

import { DollarSign } from 'lucide-react';
import { useFx } from '../context/FxContext';

export type Currency = 'USD' | 'Bs';

interface Props {
  currency: Currency;
  onChange: (c: Currency) => void;
}

export function CurrencyPicker({ currency, onChange }: Props) {
  const { rateUsdToBs, isLoading } = useFx();
  const formatted = rateUsdToBs.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="flex items-center gap-3">
      <div
        className="hidden sm:inline-flex items-center bg-white rounded-xl border border-gray-200 p-1"
        title={`Tasa BCV: Bs. ${formatted} = USD 1`}
      >
        <div className={`flex items-stretch text-xs font-medium rounded-lg overflow-hidden bg-gray-50 ${isLoading ? 'text-gray-300' : ''}`}>
          <span className="px-3 py-1.5 text-gray-500">USD</span>
          <span className="px-3 py-1.5 text-gray-700 border-l border-gray-200">Bs. {formatted}</span>
        </div>
      </div>
      <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1">
        <button
          onClick={() => onChange('USD')}
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
          onClick={() => onChange('Bs')}
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
  );
}
