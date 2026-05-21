'use client';

import { Store } from 'lucide-react';

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function supermarketLogoSrc(name: string): string | null {
  const n = normalize(name);
  if (n.includes('madeirense')) return '/logos/madeirense.png';
  if (n.includes('gama')) return '/logos/gama.png';
  if (n.includes('suarez')) return '/logos/plan_suarez.png';
  return null;
}

interface SupermarketLogoProps {
  name: string;
  size?: number;
  className?: string;
}

export function SupermarketLogo({ name, size = 40, className = '' }: SupermarketLogoProps) {
  const src = supermarketLogoSrc(name);
  const pad = Math.round(size * 0.14);

  return (
    <div
      className={`rounded-xl flex items-center justify-center bg-white border border-gray-100 overflow-hidden flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-contain"
          style={{ padding: pad }}
          onError={(e) => {
            const target = e.currentTarget;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : null}
      <Store
        size={Math.round(size * 0.5)}
        className={`text-button-green/70 ${src ? 'hidden' : ''}`}
      />
    </div>
  );
}
