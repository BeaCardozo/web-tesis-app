'use client';

import { useFx } from '../context/FxContext';

export function FxRateDisplay() {
  const { rateUsdToBs, isLoading } = useFx();
  const formatted = rateUsdToBs.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div
      className="inline-flex items-center bg-white rounded-xl border border-gray-200 p-1"
      title={`Tasa BCV: Bs. ${formatted} = USD 1`}
    >
      <div className={`flex items-stretch text-xs font-medium rounded-lg overflow-hidden bg-gray-50 ${isLoading ? 'text-gray-300' : ''}`}>
        <span className="px-3 py-1.5 text-gray-500">USD</span>
        <span className="px-3 py-1.5 text-gray-700 border-l border-gray-200">Bs. {formatted}</span>
      </div>
    </div>
  );
}
