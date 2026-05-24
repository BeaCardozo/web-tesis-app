'use client';

import { useState } from 'react';
import Image from 'next/image';
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
  const [errored, setErrored] = useState(false);
  const showImage = src != null && !errored;
  const pad = Math.round(size * 0.14);
  const inner = size - pad * 2;

  return (
    <div
      className={`rounded-xl flex items-center justify-center bg-white border border-gray-100 overflow-hidden flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <Image
          src={src!}
          alt={name}
          width={inner}
          height={inner}
          style={{ padding: pad, width: '100%', height: '100%', objectFit: 'contain' }}
          onError={() => setErrored(true)}
        />
      ) : (
        <Store
          size={Math.round(size * 0.5)}
          className="text-button-green/70"
        />
      )}
    </div>
  );
}
