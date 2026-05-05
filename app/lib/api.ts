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

function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

export function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

// ============================================
// FETCH CON AUTH Y REFRESH AUTOMÁTICO
// ============================================
async function refreshAccessToken(): Promise<boolean> {
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
      const error = await res.json();
      throw new Error(error.message || 'Credenciales incorrectas');
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
      const error = await res.json();
      throw new Error(error.message || 'Error al registrar usuario');
    }

    const json: ApiResponse<BackendUser> = await res.json();
    return json.data;
  },

  async getMe(): Promise<BackendUser> {
    const res = await authFetch(`${API_BASE_URL}/users/me`);

    if (!res.ok) {
      throw new Error('No se pudo obtener el perfil del usuario');
    }

    const json: ApiResponse<BackendUser> = await res.json();
    return json.data;
  },

  async logout(): Promise<void> {
    try {
      await authFetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
    } finally {
      clearTokens();
    }
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
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: BackendRole;
  isActive?: boolean;
}

export const adminUsersApi = {
  async list(): Promise<BackendUser[]> {
    const res = await authFetch(`${API_BASE_URL}/users`);
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || 'Error al cargar usuarios');
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
      throw new Error(error.message || 'Error al crear usuario');
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
      throw new Error(error.message || 'Error al actualizar usuario');
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
      throw new Error(error.message || 'Error al cambiar estado');
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
      throw new Error(error.message || 'Error al eliminar usuario');
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
      throw new Error(error.message || 'Error al cargar supermercados');
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
      throw new Error(error.message || 'Error al crear supermercado');
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
      throw new Error(error.message || 'Error al actualizar supermercado');
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
      throw new Error(error.message || 'Error al cambiar estado');
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
      throw new Error(error.message || 'Error al eliminar supermercado');
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
      throw new Error(error.message || 'Error al cargar estadísticas');
    }
    const json: ApiResponse<DashboardStats> = await res.json();
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
}

export interface ApiProduct {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  unitType: string;
  baseAmount: number;
  imageUrl: string | null;
  brand: { id: string; name: string } | null;
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
export interface ProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  minPrice?: number;
  maxPrice?: number;
}

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

    const json: ApiResponse<ProductListResponse> = await res.json();
    return json.data;
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
    brand: string | null;
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
  brand: { id: string; name: string } | null;
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
      throw new Error(error.message || 'Error al cargar dashboard del analista');
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
      throw new Error(error.message || 'Error al cargar productos');
    }
    const json: ApiResponse<AnalystProductsResponse> = await res.json();
    return json.data;
  },
};

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
    brand: { id: string; name: string } | null;
    category: { id: string; name: string };
  };
}

export interface ApiCartDetail {
  id: string;
  name: string;
  updatedAt: string;
  items: ApiCartItem[];
}

export interface ApiCompareLine {
  productId: string;
  productName: string;
  quantity: number;
  bestUnitPriceUsd: number | null;
  lineTotalUsd: number | null;
  available: boolean;
}

export interface ApiCompareSupermarket {
  dwhSupermarketKey: number | null;
  name: string;
  logoUrl: string | null;
  slug: string | null;
  allProductsAvailable: boolean;
  totalUsd: number;
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
}

export interface ApiMixedLine {
  productId: string;
  productName: string;
  quantity: number;
  bestOffer: {
    supermarketName: string;
    storeName: string | null;
    unitPriceUsd: number;
    lineTotalUsd: number;
  } | null;
}

export interface ApiMixedSupermarket {
  supermarketName: string;
  purchases: {
    productId: string;
    productName: string;
    quantity: number;
    unitPriceUsd: number;
    lineTotalUsd: number;
    storeName: string | null;
  }[];
  subtotalUsd: number;
}

export interface ApiCompareMixedResult {
  cartId: string;
  name: string;
  mode: 'mixed';
  lines: ApiMixedLine[];
  bySupermarket: ApiMixedSupermarket[];
  grandTotalUsd: number;
  note: string;
  pricesAsOf: string;
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
      throw new Error(error.message || 'Error al comparar precios');
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
  async listDeals(query?: { supermarket?: string; limit?: number; offset?: number }): Promise<ApiDeal[]> {
    const params = new URLSearchParams();
    if (query?.supermarket) params.set('supermarket', query.supermarket);
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
