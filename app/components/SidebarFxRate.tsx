'use client';

import { DollarSign } from 'lucide-react';
import { useFx } from '../context/FxContext';

interface Props {
  expanded: boolean;
}

export function SidebarFxRate({ expanded }: Props) {
  const { rateUsdToBs, isLoading } = useFx();

  const formatted = rateUsdToBs.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (!expanded) {
    return (
      <div
        className="flex justify-center px-3 py-2"
        title={`Tasa BCV: Bs. ${formatted} = USD 1`}
      >
        <DollarSign size={18} className="text-white/40" />
      </div>
    );
  }

  return (
    <div className="px-4 py-2.5">
      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Tasa BCV</p>
      <p
        className={`text-[13px] font-medium leading-tight ${
          isLoading ? 'text-white/30' : 'text-white/80'
        }`}
      >
        Bs. {formatted} <span className="text-white/40 font-normal">= USD 1</span>
      </p>
    </div>
  );
}
