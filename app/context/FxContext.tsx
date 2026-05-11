'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { metaApi, type ApiFxCurrent } from '../lib/api';

const STORAGE_KEY = 'caracas_fx_snapshot_v1';
const REFRESH_MS = 45 * 60 * 1000;
/** Solo si API y caché fallan (alineado con ca-api `FALLBACK_FX_USD_TO_BS`). */
const APP_FX_FALLBACK = 36;

export interface FxContextValue {
  rateUsdToBs: number;
  observedAt: string | null;
  source: string | null;
  fromOltp: boolean | null;
  isStale: boolean;
  isLoading: boolean;
  lastFetchedAt: number | null;
  refresh: () => Promise<void>;
}

const FxContext = createContext<FxContextValue | undefined>(undefined);

function readLocalSnapshot(): Partial<ApiFxCurrent> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as unknown;
    if (!o || typeof o !== 'object') return null;
    return o as Partial<ApiFxCurrent>;
  } catch {
    return null;
  }
}

function writeLocalSnapshot(data: ApiFxCurrent) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

function parseFxPayload(data: Record<string, unknown> | null): ApiFxCurrent | null {
  if (!data) return null;
  const n = data.fx_usd_to_bs;
  const rate = typeof n === 'number' ? n : typeof n === 'string' ? parseFloat(n) : NaN;
  if (!Number.isFinite(rate) || rate <= 0) return null;
  const fo = data.from_oltp;
  return {
    fx_usd_to_bs: rate,
    fx_observed_at: (data.fx_observed_at as string) ?? null,
    fx_source: (data.fx_source as string) ?? null,
    effective_calendar_date: (data.effective_calendar_date as string) ?? null,
    from_oltp: typeof fo === 'boolean' ? fo : null,
  };
}

export function FxProvider({ children }: { children: ReactNode }) {
  const cached = typeof window !== 'undefined' ? readLocalSnapshot() : null;
  const initialRate =
    cached?.fx_usd_to_bs != null && cached.fx_usd_to_bs > 0 ? cached.fx_usd_to_bs : APP_FX_FALLBACK;

  const [rateUsdToBs, setRateUsdToBs] = useState(initialRate);
  const [observedAt, setObservedAt] = useState<string | null>(cached?.fx_observed_at ?? null);
  const [source, setSource] = useState<string | null>(cached?.fx_source ?? null);
  const [fromOltp, setFromOltp] = useState<boolean | null>(() => {
    const fo = cached?.from_oltp;
    return typeof fo === 'boolean' ? fo : null;
  });
  const [isStale, setIsStale] = useState(
    () => cached?.fx_usd_to_bs == null || cached.fx_usd_to_bs <= 0,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);

  const applyPayload = useCallback((payload: ApiFxCurrent, stale: boolean) => {
    setRateUsdToBs(payload.fx_usd_to_bs);
    setObservedAt(payload.fx_observed_at);
    setSource(payload.fx_source);
    setFromOltp(typeof payload.from_oltp === 'boolean' ? payload.from_oltp : null);
    setIsStale(stale);
    writeLocalSnapshot(payload);
    setLastFetchedAt(Date.now());
  }, []);

  const refresh = useCallback(async () => {
    try {
      const raw = await metaApi.fxCurrent();
      const parsed = parseFxPayload(raw);
      if (parsed) {
        applyPayload(parsed, false);
        return;
      }
    } catch {
      /* red o 5xx */
    }

    const snap = readLocalSnapshot() as Record<string, unknown> | null;
    const parsed = parseFxPayload(snap);
    if (parsed) {
      applyPayload(parsed, true);
      return;
    }

    setRateUsdToBs(APP_FX_FALLBACK);
    setIsStale(true);
    setLastFetchedAt(Date.now());
  }, [applyPayload]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      await refresh();
      if (!cancelled) setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useEffect(() => {
    const id = setInterval(() => {
      void refresh();
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    const onFocus = () => {
      void refresh();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);

  const value = useMemo<FxContextValue>(
    () => ({
      rateUsdToBs,
      observedAt,
      source,
      fromOltp,
      isStale,
      isLoading,
      lastFetchedAt,
      refresh,
    }),
    [rateUsdToBs, observedAt, source, fromOltp, isStale, isLoading, lastFetchedAt, refresh],
  );

  return <FxContext.Provider value={value}>{children}</FxContext.Provider>;
}

export function useFx(): FxContextValue {
  const ctx = useContext(FxContext);
  if (!ctx) {
    throw new Error('useFx debe usarse dentro de FxProvider');
  }
  return ctx;
}
