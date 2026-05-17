const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ============================================
// MANEJO DE TOKENS
// ============================================
function getAccessToken(): string | null {
  return localStorage.getItem('accessToken');
}

function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

let proactiveTimer: ReturnType<typeof setTimeout> | null = null;

function decodeJwtExpMs(accessToken: string): number | null {
  try {
    const parts = accessToken.split('.');
    if (parts.length < 2) return null;
    let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4;
    if (pad) b64 += '='.repeat(4 - pad);
    const payload = JSON.parse(atob(b64)) as { exp?: number };
    if (typeof payload.exp !== 'number') return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

/** Programa renovación del access ~1 min antes de `exp` (JWT sin validar firma en cliente). */
function scheduleProactiveTokenRefresh() {
  if (typeof window === 'undefined') return;
  if (proactiveTimer != null) {
    clearTimeout(proactiveTimer);
    proactiveTimer = null;
  }
  const access = getAccessToken();
  const refresh = getRefreshToken();
  if (!access || !refresh) return;

  const expMs = decodeJwtExpMs(access);
  if (expMs == null) return;

  const skewMs = 60_000;
  const delay = Math.max(10_000, expMs - Date.now() - skewMs);

  proactiveTimer = setTimeout(async () => {
    proactiveTimer = null;
    const ok = await refreshAccessToken();
    if (ok) scheduleProactiveTokenRefresh();
  }, delay);
}

function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  scheduleProactiveTokenRefresh();
}

export function clearTokens() {
  if (proactiveTimer != null) {
    clearTimeout(proactiveTimer);
    proactiveTimer = null;
  }
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

/** Mensaje de error de respuestas Nest (`message` string o array de validación). */
export function parseApiErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback;
  const m = (body as { message?: unknown }).message;
  if (typeof m === 'string') return m;
  if (Array.isArray(m)) return m.map(String).join(' ');
  return fallback;
}

// ============================================
// FETCH CON AUTH Y REFRESH AUTOMÁTICO
// ============================================
let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  const p = (async (): Promise<boolean> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (!res.ok) return false;

      const json = await res.json();
      const tokens = json.data ?? json;
      setTokens(tokens.accessToken, tokens.refreshToken);
      return true;
    } catch {
      return false;
    }
  })();

  refreshInFlight = p;
  p.finally(() => {
    refreshInFlight = null;
  });
  return p;
}

/** Una sola petición de refresh concurrente; útil desde AuthContext o timers. */
export async function tryRefreshAccessToken(): Promise<boolean> {
  return refreshAccessToken();
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const accessToken = getAccessToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res = await fetch(url, { ...options, headers });

  // Si el access token expiró, intentar refresh
  if (res.status === 401 && getRefreshToken()) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getAccessToken()}`;
      res = await fetch(url, { ...options, headers });
    }
  }

  return res;
}

// ============================================
// TIPOS DE RESPUESTA DEL BACKEND
// ============================================
interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export type BackendRole = 'admin' | 'partner' | 'consumer';

export interface BackendUser {
  id: string;
  email: string;
  role: BackendRole;
  supermarketId?: string | null;
  supermarket?: { id: string; name: string; slug: string } | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  preferenceCurrency: string;
  preferenceLanguage: string;
  notificationsEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export type GetMeForRestoreResult =
  | { ok: true; user: BackendUser }
  | { ok: false; reason: 'unauthorized' | 'network' };

/** Perfil para restaurar sesión: distingue fallo de auth (limpiar tokens) vs red (no limpiar). */
export async function getMeForRestore(): Promise<GetMeForRestoreResult> {
  try {
    const res = await authFetch(`${API_BASE_URL}/users/me`);
    if (res.ok) {
      const json: ApiResponse<BackendUser> = await res.json();
      return { ok: true, user: json.data };
    }
    if (res.status === 401 || res.status === 403) {
      return { ok: false, reason: 'unauthorized' };
    }
    return { ok: false, reason: 'network' };
  } catch {
    return { ok: false, reason: 'network' };
  }
}

// ============================================
// ENDPOINTS DE AUTH
// ============================================
export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseApiErrorMessage(error, 'Credenciales incorrectas'));
    }

    const json: ApiResponse<LoginResponse> = await res.json();
    const tokens = json.data;
    setTokens(tokens.accessToken, tokens.refreshToken);
    return tokens;
  },

  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<BackendUser> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseApiErrorMessage(error, 'Error al registrar usuario'));
    }

    const json: ApiResponse<BackendUser> = await res.json();
    return json.data;
  },

  async getMe(): Promise<BackendUser> {
    const r = await getMeForRestore();
    if (r.ok) return r.user;
    throw new Error('No se pudo obtener el perfil del usuario');
  },

  async logout(): Promise<void> {
    try {
      await authFetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
    } finally {
      clearTokens();
    }
  },

  async updateProfile(data: { name?: string; email?: string }): Promise<BackendUser> {
    const res = await authFetch(`${API_BASE_URL}/users/profile`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(parseApiErrorMessage(err, 'No se pudo actualizar el perfil'));
    }
    const json: ApiResponse<BackendUser> = await res.json();
    return json.data;
  },
};

// ============================================
// ENDPOINTS DE ADMIN - USUARIOS
// ============================================
export interface CreateUserPayload {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: BackendRole;
  /** Obligatorio en API si `role === 'partner'`. */
  supermarketId?: number;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: BackendRole;
  isActive?: boolean;
  supermarketId?: number;
}

export const adminUsersApi = {
  async list(): Promise<BackendUser[]> {
    const res = await authFetch(`${API_BASE_URL}/users`);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseApiErrorMessage(error, 'Error al cargar usuarios'));
    }
    const json: ApiResponse<BackendUser[]> = await res.json();
    return json.data;
  },

  async create(data: CreateUserPayload): Promise<BackendUser> {
    const res = await authFetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseApiErrorMessage(error, 'Error al crear usuario'));
    }
    const json: ApiResponse<BackendUser> = await res.json();
    return json.data;
  },

  async update(id: string, data: UpdateUserPayload): Promise<BackendUser> {
    const res = await authFetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseApiErrorMessage(error, 'Error al actualizar usuario'));
    }
    const json: ApiResponse<BackendUser> = await res.json();
    return json.data;
  },

  async toggleStatus(id: string): Promise<BackendUser> {
    const res = await authFetch(`${API_BASE_URL}/users/${id}/status`, {
      method: 'PATCH',
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseApiErrorMessage(error, 'Error al cambiar estado'));
    }
    const json: ApiResponse<BackendUser> = await res.json();
    return json.data;
  },

  async remove(id: string): Promise<void> {
    const res = await authFetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseApiErrorMessage(error, 'Error al eliminar usuario'));
    }
  },
};

// ============================================
// ENDPOINTS DE ADMIN - SUPERMERCADOS
// ============================================
export interface AdminSupermarket {
  id: string;
  name: string;
  slug: string | null;
  logoUrl: string | null;
  website: string | null;
  isActive: boolean;
  createdAt: string;
  storeCount: number;
  analystCount: number;
}

export interface CreateSupermarketPayload {
  name: string;
  slug?: string;
  logoUrl?: string;
  website?: string;
  isActive?: boolean;
}

export interface UpdateSupermarketPayload {
  name?: string;
  slug?: string;
  logoUrl?: string;
  website?: string;
  isActive?: boolean;
}

export const adminSupermarketsApi = {
  async list(): Promise<AdminSupermarket[]> {
    const res = await authFetch(`${API_BASE_URL}/supermarkets/admin`);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseApiErrorMessage(error, 'Error al cargar supermercados'));
    }
    const json: ApiResponse<AdminSupermarket[]> = await res.json();
    return json.data;
  },

  async create(data: CreateSupermarketPayload): Promise<AdminSupermarket> {
    const res = await authFetch(`${API_BASE_URL}/supermarkets`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseApiErrorMessage(error, 'Error al crear supermercado'));
    }
    const json: ApiResponse<AdminSupermarket> = await res.json();
    return json.data;
  },

  async update(id: string, data: UpdateSupermarketPayload): Promise<AdminSupermarket> {
    const res = await authFetch(`${API_BASE_URL}/supermarkets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseApiErrorMessage(error, 'Error al actualizar supermercado'));
    }
    const json: ApiResponse<AdminSupermarket> = await res.json();
    return json.data;
  },

  async toggleStatus(id: string): Promise<AdminSupermarket> {
    const res = await authFetch(`${API_BASE_URL}/supermarkets/${id}/status`, {
      method: 'PATCH',
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseApiErrorMessage(error, 'Error al cambiar estado'));
    }
    const json: ApiResponse<AdminSupermarket> = await res.json();
    return json.data;
  },

  async remove(id: string): Promise<void> {
    const res = await authFetch(`${API_BASE_URL}/supermarkets/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseApiErrorMessage(error, 'Error al eliminar supermercado'));
    }
  },
};

// ============================================
// ENDPOINTS DE ADMIN - DASHBOARD STATS
// ============================================
export interface DashboardStats {
  counts: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalProducts: number;
    totalCategories: number;
    categoriesWithProducts: number;
    totalBrands: number;
    totalSupermarkets: number;
    totalCarts: number;
    totalCartItems: number;
  };
  usersByRole: { role: BackendRole; count: number }[];
  usersOverTime: { month: string; label: string; count: number }[];
  productsByCategory: { name: string; count: number }[];
  productsByBrand: { name: string; count: number }[];
  supermarkets: { name: string; storeCount: number }[];
  recentUsers: {
    id: string;
    name: string;
    email: string;
    role: BackendRole;
    createdAt: string;
    isActive: boolean;
  }[];
}

export const adminStatsApi = {
  async dashboard(): Promise<DashboardStats> {
    const res = await authFetch(`${API_BASE_URL}/admin/stats`);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseApiErrorMessage(error, 'Error al cargar estadísticas'));
    }
    const json: ApiResponse<DashboardStats> = await res.json();
    return json.data;
  },

  async priceHistory(productId: string, days = 30): Promise<AdminPriceHistory> {
    const res = await authFetch(
      `${API_BASE_URL}/admin/products/${encodeURIComponent(productId)}/price-history?days=${days}`,
    );
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseApiErrorMessage(error, 'Error al cargar histórico de precios'));
    }
    const json: ApiResponse<AdminPriceHistory> = await res.json();
    return json.data;
  },
};

/** Respuesta de GET /admin/audit/events (Postgres). */
export interface ApiAuditEvent {
  eventId: string;
  timestamp: string;
  source: string;
  type: string;
  schemaVersion?: number;
  actor?: { kind: string; id?: string; name?: string };
  resource?: { kind: string; id?: string };
  context?: {
    ip?: string;
    userAgent?: string;
    dagId?: string;
    runId?: string;
    logicalDate?: string;
  };
  payload?: Record<string, unknown>;
}

export interface AuditEventsQueryPayload {
  events: ApiAuditEvent[];
  stats: { total: number; byType: Record<string, number> };
}

export const adminAuditApi = {
  async getEvents(params?: { since?: string; limit?: number }): Promise<AuditEventsQueryPayload> {
    const q = new URLSearchParams();
    if (params?.since) q.set('since', params.since);
    if (params?.limit != null) q.set('limit', String(params.limit));
    const qs = q.toString();
    const url = `${API_BASE_URL}/admin/audit/events${qs ? `?${qs}` : ''}`;
    const res = await authFetch(url);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseApiErrorMessage(error, 'Error al cargar auditoría'));
    }
    const json: ApiResponse<AuditEventsQueryPayload> = await res.json();
    return json.data;
  },
};

// ============================================
// TIPOS DE CATÁLOGO
// ============================================
export interface PriceSnapshot {
  cheapestPriceUsd: number | null;
  cheapestPriceBs: number | null;
  cheapestPricePerUnitUsd: number | null;
  cheapestPricePerUnitBs: number | null;
  cheapestSupermarket: string | null;
  cheapestStore: string | null;
  cheapestScrapedAt: string | null;
  cheapestAvailable: boolean | null;
  cheapestIsOnSale?: boolean | null;
  cheapestDiscountPct?: number | null;
  cheapestOriginalPriceUsd?: number | null;
  cheapestOriginalPriceBs?: number | null;
  cheapestSupermarketSlug?: string | null;
}

export interface ApiProduct {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  unitType: string;
  baseAmount: number;
  imageUrl: string | null;
  brand: { id: string; name: string; slug?: string } | null;
  category: { id: string; name: string };
  updatedAt: string;
  priceSnapshot: PriceSnapshot | null;
}

export interface ApiProductDetail extends ApiProduct {
  pricesBySupermarket: Record<string, ApiSupermarketPrice[]>;
  cheapest: ApiSupermarketPrice | null;
}

export interface ApiSupermarketPrice {
  product_id?: string;
  supermarket_name?: string;
  store_name?: string;
  price_usd?: number;
  price_bs?: number;
  price_per_unit_usd?: number;
  price_per_unit_bs?: number;
  original_price_usd?: number | null;
  original_price_bs?: number | null;
  discount_pct?: number | null;
  is_on_sale?: boolean | null;
  is_available?: boolean;
  scraped_at?: string;
  [key: string]: unknown;
}

export interface ProductListResponse {
  page: number;
  limit: number;
  total: number;
  items: ApiProduct[];
}

export interface ProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  minPrice?: number;
  maxPrice?: number;
}

/** Respuesta plana del listado Nest (canonicalProduct + category); el backend ignora query params hoy. */
type NestProductRow = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  categoryId: number;
  baseUnit: string;
  baseQuantity?: string | number;
  updatedAt: string;
  category?: { id: number; name: string };
};

function toQty(v: unknown): number {
  if (v == null) return 1;
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : 1;
}

function mapNestRowToApiProduct(row: NestProductRow): ApiProduct {
  const catId = row.category?.id ?? row.categoryId;
  const catName = row.category?.name ?? '—';
  return {
    id: String(row.id),
    name: row.name,
    slug: row.slug ?? null,
    description: row.description ?? null,
    unitType: String(row.baseUnit),
    baseAmount: toQty(row.baseQuantity),
    imageUrl: row.imageUrl ?? null,
    brand: null,
    category: { id: String(catId), name: catName },
    updatedAt: typeof row.updatedAt === 'string' ? row.updatedAt : new Date(row.updatedAt).toISOString(),
    priceSnapshot: null,
  };
}

function sortApiProducts(items: ApiProduct[], sortBy: string | undefined): ApiProduct[] {
  const copy = [...items];
  switch (sortBy) {
    case 'nameDesc':
      return copy.sort((a, b) => b.name.localeCompare(a.name, 'es'));
    case 'priceAsc':
    case 'priceDesc': {
      const dir = sortBy === 'priceAsc' ? 1 : -1;
      return copy.sort((a, b) => {
        const pa = a.priceSnapshot?.cheapestPriceUsd;
        const pb = b.priceSnapshot?.cheapestPriceUsd;
        const ha = pa != null;
        const hb = pb != null;
        if (ha && hb && pa !== pb) return (pa - pb) * dir;
        if (ha !== hb) return ha ? -1 : 1;
        return a.name.localeCompare(b.name, 'es');
      });
    }
    default:
      return copy.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }
}

function normalizeProductList(data: unknown, query: ProductsQuery): ProductListResponse {
  const page = query.page ?? 1;
  const limit = query.limit ?? 12;

  if (data && typeof data === 'object' && !Array.isArray(data) && Array.isArray((data as ProductListResponse).items)) {
    return data as ProductListResponse;
  }

  const rows = Array.isArray(data) ? (data as NestProductRow[]) : [];
  let mapped = rows.map(mapNestRowToApiProduct);

  const cat = query.category?.trim();
  if (cat) {
    mapped = mapped.filter((p) => p.category.id === cat);
  }
  const q = query.search?.trim().toLowerCase();
  if (q) {
    mapped = mapped.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.slug?.toLowerCase().includes(q) ?? false),
    );
  }

  mapped = sortApiProducts(mapped, query.sortBy);

  const total = mapped.length;
  const start = (page - 1) * limit;
  const items = mapped.slice(start, start + limit);

  return { page, limit, total, items };
}

export interface ApiCategory {
  id: string;
  name: string;
  parentId: string | null;
  productCount: number;
}

export interface ApiSupermarket {
  id: string;
  name: string;
  logo: string | null;
}

// ============================================
// ENDPOINTS DE PRODUCTOS
// ============================================
export const productsApi = {
  async list(query: ProductsQuery = {}): Promise<ProductListResponse> {
    const params = new URLSearchParams();
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));
    if (query.search) params.set('search', query.search);
    if (query.category) params.set('category', query.category);
    if (query.sortBy) params.set('sortBy', query.sortBy);
    if (query.minPrice != null) params.set('minPrice', String(query.minPrice));
    if (query.maxPrice != null) params.set('maxPrice', String(query.maxPrice));

    const url = `${API_BASE_URL}/products?${params.toString()}`;
    const res = await fetch(url);

    if (!res.ok) throw new Error('Error al cargar productos');

    const json: ApiResponse<ProductListResponse | NestProductRow[]> = await res.json();
    return normalizeProductList(json.data, query);
  },

  async featured(): Promise<ApiProduct[]> {
    const res = await fetch(`${API_BASE_URL}/products/featured`);
    if (!res.ok) throw new Error('Error al cargar productos destacados');

    const json: ApiResponse<{ items: ApiProduct[] }> = await res.json();
    return json.data.items;
  },

  async getById(id: string): Promise<ApiProductDetail> {
    const res = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!res.ok) throw new Error('Producto no encontrado');

    const json: ApiResponse<ApiProductDetail> = await res.json();
    return json.data;
  },

  async priceObservations(
    id: string,
    query?: {
      page?: number;
      page_size?: number;
      chain_slug?: string;
      date_from?: string;
      date_to?: string;
    },
  ): Promise<{ page: number; page_size: number; total: number; items: unknown[] }> {
    const params = new URLSearchParams();
    if (query?.page != null) params.set('page', String(query.page));
    if (query?.page_size != null) params.set('page_size', String(query.page_size));
    if (query?.chain_slug) params.set('chain_slug', query.chain_slug);
    if (query?.date_from) params.set('date_from', query.date_from);
    if (query?.date_to) params.set('date_to', query.date_to);
    const q = params.toString();
    const res = await fetch(`${API_BASE_URL}/products/${id}/prices/observations${q ? `?${q}` : ''}`);
    if (!res.ok) throw new Error('No se pudieron cargar observaciones de precio');
    const json: ApiResponse<{ page: number; page_size: number; total: number; items: unknown[] }> = await res.json();
    return json.data;
  },

  async priceHistoryDaily(id: string, days?: number): Promise<unknown[]> {
    const qs = days != null ? `?days=${days}` : '';
    const res = await fetch(`${API_BASE_URL}/products/${id}/prices/history/daily${qs}`);
    if (!res.ok) throw new Error('No se pudo cargar el histórico diario');
    const json: ApiResponse<unknown[]> = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  },

  async offersHistory(
    id: string,
    query?: {
      page?: number;
      page_size?: number;
      chain_slug?: string;
      date_from?: string;
      date_to?: string;
    },
  ): Promise<{ page: number; page_size: number; total: number; items: unknown[] }> {
    const params = new URLSearchParams();
    if (query?.page != null) params.set('page', String(query.page));
    if (query?.page_size != null) params.set('page_size', String(query.page_size));
    if (query?.chain_slug) params.set('chain_slug', query.chain_slug);
    if (query?.date_from) params.set('date_from', query.date_from);
    if (query?.date_to) params.set('date_to', query.date_to);
    const q = params.toString();
    const res = await fetch(`${API_BASE_URL}/products/${id}/offers/history${q ? `?${q}` : ''}`);
    if (!res.ok) throw new Error('No se pudo cargar el histórico de ofertas');
    const json: ApiResponse<{ page: number; page_size: number; total: number; items: unknown[] }> = await res.json();
    return json.data;
  },
};

// ============================================
// ENDPOINTS DE CATEGORÍAS
// ============================================
export const categoriesApi = {
  async list(): Promise<ApiCategory[]> {
    const res = await fetch(`${API_BASE_URL}/categories`);
    if (!res.ok) throw new Error('Error al cargar categorías');

    const json: ApiResponse<ApiCategory[]> = await res.json();
    return json.data;
  },
};

// ============================================
// ENDPOINTS DE ANALISTA (PARTNER)
// ============================================
export interface AnalystSupermarket {
  id: string;
  name: string;
  slug: string | null;
  logoUrl: string | null;
  website: string | null;
  isActive: boolean;
  createdAt: string;
  storeCount: number;
  analystCount: number;
  stores: { id: string; name: string; address: string | null }[];
}

export interface AnalystCatalogStats {
  totalProducts: number;
  totalCategories: number;
  totalBrands: number;
  productsByCategory: { name: string; count: number }[];
  productsByBrand: { name: string; count: number }[];
  recentProducts: {
    id: string;
    name: string;
    unit: string;
    imageUrl: string | null;
    category: string;
    brand: { id: string; name: string; slug?: string } | null;
    updatedAt: string;
  }[];
}

export interface AnalystDashboard {
  assigned: boolean;
  supermarket: AnalystSupermarket | null;
  catalogStats: AnalystCatalogStats | null;
}

export interface AnalystProduct {
  id: string;
  name: string;
  slug: string | null;
  unitType: string;
  baseAmount: number;
  imageUrl: string | null;
  category: { id: string; name: string } | null;
  brand: { id: string; name: string; slug?: string } | null;
  storeName: string;
  priceUsd: number;
  priceBs: number;
  pricePerUnitUsd: number;
  pricePerUnitBs: number;
  isAvailable: boolean;
  scrapedAt: string;
}

export interface AnalystProductsResponse {
  assigned: boolean;
  supermarketName: string | null;
  dwhAvailable?: boolean;
  page: number;
  limit: number;
  total: number;
  items: AnalystProduct[];
}

export interface AnalystProductsQuery {
  search?: string;
  page?: number;
  limit?: number;
}

export const analystApi = {
  async dashboard(): Promise<AnalystDashboard> {
    const res = await authFetch(`${API_BASE_URL}/partners/me/dashboard`);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseApiErrorMessage(error, 'Error al cargar dashboard del analista'));
    }
    const json: ApiResponse<AnalystDashboard> = await res.json();
    return json.data;
  },

  async products(query: AnalystProductsQuery = {}): Promise<AnalystProductsResponse> {
    const params = new URLSearchParams();
    if (query.search) params.set('search', query.search);
    if (query.page) params.set('page', String(query.page));
    if (query.limit) params.set('limit', String(query.limit));

    const res = await authFetch(`${API_BASE_URL}/partners/me/products?${params.toString()}`);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseApiErrorMessage(error, 'Error al cargar productos'));
    }
    const json: ApiResponse<AnalystProductsResponse> = await res.json();
    return json.data;
  },

  async priceHistory(productId: string, days = 30): Promise<AnalystPriceHistory> {
    const res = await authFetch(
      `${API_BASE_URL}/partners/me/products/${encodeURIComponent(productId)}/price-history?days=${days}`,
    );
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseApiErrorMessage(error, 'Error al cargar histórico de precios'));
    }
    const json: ApiResponse<AnalystPriceHistory> = await res.json();
    return json.data;
  },

  async comparisonReport(days = 30): Promise<AnalystComparisonReport> {
    const res = await authFetch(
      `${API_BASE_URL}/partners/me/comparison-report?days=${days}`,
    );
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseApiErrorMessage(error, 'Error al cargar reporte'));
    }
    const json: ApiResponse<AnalystComparisonReport> = await res.json();
    return json.data;
  },
};

// ============================================
// REPORTE COMPARATIVO (alimenta inventario, comparación y tendencias)
// ============================================
export interface AnalystComparisonReport {
  supermarketSlug: string;
  supermarketName: string;
  daysWindow: number;
  generatedAt: string;
  items: AnalystComparisonReportItem[];
  summary: {
    totalProducts: number;
    productsWithCompetition: number;
    productsWithoutCompetition: number;
    avgOwnPrice: number | null;
    avgCompetitionPrice: number | null;
    avgDiffPct: number | null;
  };
}

export interface AnalystComparisonReportItem {
  productId: string;
  productName: string;
  categoryName: string | null;
  brandName: string | null;
  unitType: string;
  baseAmount: number;
  ownPrice: number | null;
  avgCompetition: number | null;
  diffPct: number | null;
  priceChangePct: number | null;
  observations: number;
}

export interface AnalystPriceHistory {
  productId: string;
  productName: string;
  ownChainSlug: string;
  ownChainName: string;
  /** Solo el número de competidores; los nombres/slugs no se exponen al analista. */
  competitorCount: number;
  days: number;
  series: AnalystPriceHistoryPoint[];
}

export interface AnalystPriceHistoryPoint {
  day: string;
  ownPrice: number | null;
  avgCompetition: number | null;
}

// ============================================
// HISTORIAL DE PRECIOS — ADMIN (todas las cadenas)
// ============================================
export interface AdminPriceHistory {
  productId: string;
  productName: string;
  chains: { slug: string; name: string }[];
  days: number;
  series: AdminPriceHistoryPoint[];
}

export interface AdminPriceHistoryPoint {
  day: string;
  perChain: Record<string, number | null>;
  /** Promedio simple de todas las cadenas con dato ese día. */
  avgAll: number | null;
}

// ============================================
// TIPOS DE CARRITO
// ============================================
export interface ApiCart {
  id: string;
  name: string;
  updatedAt: string;
  itemCount: number;
}

export interface ApiCartItem {
  id: string;
  quantity: number;
  preferredSupermarketId: string | null;
  preferredSupermarket: { id: string; name: string } | null;
  product: {
    id: string;
    name: string;
    slug: string | null;
    unitType: string;
    baseAmount: number;
    imageUrl: string | null;
    brand: { id: string; name: string; slug?: string } | null;
    category: { id: string; name: string };
  };
}

export interface ApiCartDetail {
  id: string;
  name: string;
  updatedAt: string;
  items: ApiCartItem[];
}

export interface ApiCompareFxRate {
  rate: number;
  observedAt: string | null;
  source: string | null;
  effectiveCalendarDate: string | null;
  fromOltp: boolean;
}

export interface ApiCompareLine {
  productId: string;
  productName: string;
  quantity: number;
  /** Precio del pack en USD para ese supermercado. `unit × quantity = lineTotal`. */
  bestUnitPriceUsd: number | null;
  bestUnitPriceBs?: number | null;
  /** Precio por unidad base (ej. USD/kg) para comparación normalizada. */
  pricePerUnitUsd?: number | null;
  pricePerUnitBs?: number | null;
  lineTotalUsd: number | null;
  lineTotalBs?: number | null;
  available: boolean;
}

export interface ApiCompareSupermarket {
  dwhSupermarketKey: number | null;
  name: string;
  logoUrl: string | null;
  slug: string | null;
  allProductsAvailable: boolean;
  totalUsd: number;
  totalBs?: number;
  lines: ApiCompareLine[];
}

export interface ApiCompareSingleResult {
  cartId: string;
  name: string;
  mode: 'single';
  supermarkets: ApiCompareSupermarket[];
  cheapest: ApiCompareSupermarket | null;
  note: string;
  pricesAsOf: string;
  fxRate: ApiCompareFxRate;
}

export interface ApiMixedLine {
  productId: string;
  productName: string;
  quantity: number;
  bestOffer: {
    supermarketName: string;
    storeName: string | null;
    /** Precio del pack en USD. `unitPriceUsd × quantity = lineTotalUsd`. */
    unitPriceUsd: number;
    unitPriceBs?: number;
    /** Precio por unidad base (USD/kg, USD/L, etc.). */
    pricePerUnitUsd?: number | null;
    pricePerUnitBs?: number | null;
    lineTotalUsd: number;
    lineTotalBs?: number;
  } | null;
}

export interface ApiMixedSupermarket {
  supermarketName: string;
  purchases: {
    productId: string;
    productName: string;
    quantity: number;
    /** Precio del pack en USD. */
    unitPriceUsd: number;
    unitPriceBs?: number;
    /** Precio por unidad base (USD/kg, USD/L, etc.). */
    pricePerUnitUsd?: number | null;
    pricePerUnitBs?: number | null;
    lineTotalUsd: number;
    lineTotalBs?: number;
    storeName: string | null;
  }[];
  subtotalUsd: number;
  subtotalBs?: number;
}

export interface ApiCompareMixedResult {
  cartId: string;
  name: string;
  mode: 'mixed';
  lines: ApiMixedLine[];
  bySupermarket: ApiMixedSupermarket[];
  grandTotalUsd: number;
  grandTotalBs?: number;
  note: string;
  pricesAsOf: string;
  fxRate: ApiCompareFxRate;
}

export type ApiCompareResult = ApiCompareSingleResult | ApiCompareMixedResult;

// ============================================
// ENDPOINTS DE CARRITO
// ============================================
export const cartsApi = {
  async list(): Promise<ApiCart[]> {
    const res = await authFetch(`${API_BASE_URL}/carts`);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Error al cargar carritos');
    }
    const json: ApiResponse<{ carts: ApiCart[] }> = await res.json();
    return json.data.carts;
  },

  async create(name: string): Promise<ApiCartDetail> {
    const res = await authFetch(`${API_BASE_URL}/carts`, {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Error al crear carrito');
    }
    const json: ApiResponse<ApiCartDetail> = await res.json();
    return json.data;
  },

  async getOne(cartId: string): Promise<ApiCartDetail> {
    const res = await authFetch(`${API_BASE_URL}/carts/${cartId}`);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Error al cargar carrito');
    }
    const json: ApiResponse<ApiCartDetail> = await res.json();
    return json.data;
  },

  async remove(cartId: string): Promise<void> {
    const res = await authFetch(`${API_BASE_URL}/carts/${cartId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Error al eliminar carrito');
    }
  },

  async clearItems(cartId: string): Promise<void> {
    const res = await authFetch(`${API_BASE_URL}/carts/${cartId}/items`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Error al vaciar carrito');
    }
  },

  async compare(cartId: string, mode: 'single' | 'mixed' = 'single'): Promise<ApiCompareResult> {
    const res = await authFetch(`${API_BASE_URL}/carts/${cartId}/compare?mode=${mode}`);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseApiErrorMessage(error, 'Error al comparar precios'));
    }
    const json: ApiResponse<ApiCompareResult> = await res.json();
    return json.data;
  },

  async addItem(cartId: string, data: { productId: string; quantity: number; supermarketId?: string }): Promise<ApiCartItem> {
    const res = await authFetch(`${API_BASE_URL}/carts/${cartId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Error al agregar producto');
    }
    const json: ApiResponse<ApiCartItem> = await res.json();
    return json.data;
  },

  async updateItem(cartId: string, itemId: string, data: { quantity: number }): Promise<ApiCartItem> {
    const res = await authFetch(`${API_BASE_URL}/carts/${cartId}/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Error al actualizar cantidad');
    }
    const json: ApiResponse<ApiCartItem> = await res.json();
    return json.data;
  },

  async removeItem(cartId: string, itemId: string): Promise<void> {
    const res = await authFetch(`${API_BASE_URL}/carts/${cartId}/items/${itemId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Error al eliminar producto');
    }
  },
};

// ============================================
// ENDPOINTS DE SUPERMERCADOS
// ============================================
export const supermarketsApi = {
  async list(): Promise<ApiSupermarket[]> {
    const res = await fetch(`${API_BASE_URL}/supermarkets`);
    if (!res.ok) throw new Error('Error al cargar supermercados');

    const json: ApiResponse<ApiSupermarket[]> = await res.json();
    return json.data;
  },
};

// ============================================
// ENDPOINTS DE OFERTAS
// ============================================
export interface ApiDeal {
  productId: string;
  productName: string;
  productSlug: string;
  unitType: string;
  baseAmount: number;
  storeName: string;
  supermarketName: string;
  supermarketSlug: string;
  priceUsd: number;
  priceBs: number;
  pricePerUnitUsd: number;
  pricePerUnitBs: number;
  originalPriceUsd: number | null;
  originalPriceBs: number | null;
  discountPct: number;
  imageUrl: string | null;
  scrapedAt: string;
}

export interface ApiDealsCount {
  total: number;
  by_supermarket: { supermarket_name: string; supermarket_slug: string; total: number }[];
}

export const offersApi = {
  async listDeals(query?: {
    supermarket?: string;
    productId?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiDeal[]> {
    const params = new URLSearchParams();
    if (query?.supermarket) params.set('supermarket', query.supermarket);
    if (query?.productId) params.set('productId', query.productId);
    if (query?.limit) params.set('limit', String(query.limit));
    if (query?.offset) params.set('offset', String(query.offset));

    const url = `${API_BASE_URL}/offers/deals?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Error al cargar ofertas');

    const json: ApiResponse<ApiDeal[]> = await res.json();
    return json.data;
  },

  async getCount(): Promise<ApiDealsCount> {
    const res = await fetch(`${API_BASE_URL}/offers/deals/count`);
    if (!res.ok) throw new Error('Error al cargar conteo de ofertas');

    const json: ApiResponse<ApiDealsCount> = await res.json();
    return json.data;
  },
};

// ============================================
// METADATOS DWH (FX, frescura de scrape)
// ============================================

/** Respuesta GET `/meta/fx/current` (ca-api; origen OLTP o DWH vía scraper). */
export interface ApiFxCurrent {
  fx_usd_to_bs: number;
  fx_observed_at: string | null;
  fx_source: string | null;
  effective_calendar_date: string | null;
  from_oltp?: boolean | null;
}

export const metaApi = {
  async fxCurrent(): Promise<Record<string, unknown> | null> {
    const res = await fetch(`${API_BASE_URL}/meta/fx/current`);
    if (!res.ok) return null;
    const json: ApiResponse<Record<string, unknown> | null> = await res.json();
    return json.data ?? null;
  },

  async scrapeFreshness(): Promise<Record<string, unknown>[]> {
    const res = await fetch(`${API_BASE_URL}/meta/scrape-freshness`);
    if (!res.ok) return [];
    const json: ApiResponse<Record<string, unknown>[]> = await res.json();
    return Array.isArray(json.data) ? json.data : [];
  },
};

// ============================================
// ENDPOINTS DE CARGAS (ANALISTA)
// ============================================
export type UploadStatusBackend = 'procesando' | 'completado' | 'error';
export type IngestionStatusBackend =
  | 'pendiente'
  | 'ingestado'
  | 'sin_match'
  | 'fallido'
  | 'no_aplica';

export interface BackendUpload {
  id: number;
  fileName: string;
  fileSize: number;
  productsCount: number;
  errorsCount: number;
  status: UploadStatusBackend;
  uploadDate: string;
  ingestionStatus: IngestionStatusBackend;
  /** Filas que el matcher emparejó con un canónico (escritas a fact_prices). */
  matchedRows: number;
  /** Filas válidas que el matcher rechazó por no encontrar canónico. */
  unmatchedRows: number;
  /** Filas efectivamente insertadas en fact_prices tras el loader (idempotente). */
  factRowsInserted: number;
  /** Mensaje cuando ingestionStatus = fallido/pendiente (null cuando ok). */
  ingestionError: string | null;
}

export const uploadsApi = {
  async list(): Promise<BackendUpload[]> {
    const res = await authFetch(`${API_BASE_URL}/uploads`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(parseApiErrorMessage(err, 'No se pudo cargar el historial'));
    }
    const json: ApiResponse<BackendUpload[]> = await res.json();
    return json.data;
  },

  /**
   * Sube el CSV con progreso real (XHR — fetch no expone upload progress).
   * Refresca el access token de forma proactiva antes de iniciar la subida
   * porque XHR no pasa por authFetch.
   */
  upload(
    file: File,
    onProgress?: (pct: number) => void,
  ): Promise<BackendUpload> {
    return new Promise(async (resolve, reject) => {
      // Refresh proactivo si el access está vencido
      const access = getAccessToken();
      if (!access && getRefreshToken()) {
        await tryRefreshAccessToken();
      }
      const token = getAccessToken();

      const form = new FormData();
      form.append('file', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/uploads`);
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };
      xhr.onload = () => {
        try {
          const body = JSON.parse(xhr.responseText || '{}');
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve((body as ApiResponse<BackendUpload>).data);
          } else {
            reject(new Error(parseApiErrorMessage(body, 'Error al subir el archivo')));
          }
        } catch {
          reject(new Error('Respuesta inválida del servidor'));
        }
      };
      xhr.onerror = () => reject(new Error('Error de red al subir el archivo'));
      xhr.send(form);
    });
  },

  /** Descarga el reporte de errores como CSV y dispara el download en el browser. */
  async downloadErrors(uploadId: number): Promise<void> {
    const res = await authFetch(`${API_BASE_URL}/uploads/${uploadId}/errors.csv`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(parseApiErrorMessage(err, 'No se pudo descargar el reporte'));
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `upload-${uploadId}-errores.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};
