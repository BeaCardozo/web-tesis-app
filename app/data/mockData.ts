// ============================================
// DATOS MOCK - Reemplazar con llamadas a API
// ============================================

export type UserRole = 'Administrador' | 'Usuario' | 'Analista';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // En producción, nunca almacenar passwords en el frontend
  role: UserRole;
  createdAt: string;
  lastLogin: string;
  status: 'activo' | 'inactivo';
  avatar?: string;
  supermarketId?: string; // Solo para Analistas - ID del supermercado al que pertenecen
}

export interface Supermarket {
  id: string;
  name: string;
  logo?: string;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  image?: string;
}

export interface PriceComparison {
  productId: string;
  supermarketId: string;
  price: number;
  lastUpdated: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalProducts: number;
  totalSupermarkets: number;
  totalComparisons: number;
  averageSavings: number;
}

// ============================================
// USUARIOS HARDCODEADOS
// ============================================
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin Principal',
    email: 'admin@caracasahorra.com',
    password: 'admin123', // Solo para desarrollo
    role: 'Administrador',
    createdAt: '2024-01-15',
    lastLogin: '2025-01-14',
    status: 'activo',
  },
  {
    id: '2',
    name: 'Usuario Demo',
    email: 'usuario@demo.com',
    password: 'usuario123', // Solo para desarrollo
    role: 'Usuario',
    createdAt: '2024-06-20',
    lastLogin: '2025-01-13',
    status: 'activo',
  },
  {
    id: '3',
    name: 'María García',
    email: 'maria.garcia@email.com',
    password: 'maria123',
    role: 'Usuario',
    createdAt: '2024-08-10',
    lastLogin: '2025-01-10',
    status: 'activo',
  },
  {
    id: '4',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@email.com',
    password: 'carlos123',
    role: 'Usuario',
    createdAt: '2024-09-05',
    lastLogin: '2025-01-08',
    status: 'activo',
  },
  {
    id: '5',
    name: 'Ana Martínez',
    email: 'ana.martinez@email.com',
    password: 'ana123',
    role: 'Usuario',
    createdAt: '2024-10-12',
    lastLogin: '2024-12-28',
    status: 'inactivo',
  },
  {
    id: '6',
    name: 'Pedro López',
    email: 'pedro.lopez@email.com',
    password: 'pedro123',
    role: 'Usuario',
    createdAt: '2024-11-01',
    lastLogin: '2025-01-12',
    status: 'activo',
  },
  {
    id: '7',
    name: 'Laura Fernández',
    email: 'laura.fernandez@email.com',
    password: 'laura123',
    role: 'Usuario',
    createdAt: '2024-11-20',
    lastLogin: '2025-01-11',
    status: 'activo',
  },
  {
    id: '8',
    name: 'José Hernández',
    email: 'jose.hernandez@email.com',
    password: 'jose123',
    role: 'Usuario',
    createdAt: '2024-12-05',
    lastLogin: '2025-01-09',
    status: 'activo',
  },
  {
    id: '9',
    name: 'Roberto Analista',
    email: 'analista@excelsior.com',
    password: 'analista123', // Solo para desarrollo
    role: 'Analista',
    createdAt: '2024-03-10',
    lastLogin: '2025-01-14',
    status: 'activo',
    supermarketId: '1', // Excelsior Gama
  },
];

// ============================================
// SUPERMERCADOS
// ============================================
export const mockSupermarkets: Supermarket[] = [
  { id: '1', name: 'Excelsior Gama', color: '#E31837' },
  { id: '2', name: 'Central Madeirense', color: '#0066B3' },
  { id: '3', name: 'Automercado Plaza\'s', color: '#FF6B00' },
  { id: '4', name: 'Luvebras', color: '#00A651' },
  { id: '5', name: 'Farmatodo', color: '#1E4D92' },
  { id: '6', name: 'Locatel', color: '#E4002B' },
];

// ============================================
// CATEGORÍAS DE PRODUCTOS
// ============================================
export const mockCategories = [
  'Lácteos',
  'Carnes',
  'Frutas y Verduras',
  'Panadería',
  'Bebidas',
  'Limpieza',
  'Higiene Personal',
  'Enlatados',
  'Cereales',
  'Snacks',
];

// ============================================
// ESTADÍSTICAS DEL DASHBOARD
// ============================================
export const mockDashboardStats: DashboardStats = {
  totalUsers: 1247,
  activeUsers: 892,
  totalProducts: 3456,
  totalSupermarkets: 6,
  totalComparisons: 15789,
  averageSavings: 23.5, // Porcentaje
};

// ============================================
// DATOS PARA GRÁFICOS
// ============================================

// Usuarios registrados por mes (últimos 6 meses)
export const usersPerMonth = [
  { month: 'Ago', users: 145 },
  { month: 'Sep', users: 198 },
  { month: 'Oct', users: 267 },
  { month: 'Nov', users: 312 },
  { month: 'Dic', users: 189 },
  { month: 'Ene', users: 136 },
];

// Comparaciones por supermercado
export const comparisonsPerSupermarket = [
  { name: 'Excelsior Gama', comparisons: 4521, color: '#E31837' },
  { name: 'Central Madeirense', comparisons: 3892, color: '#0066B3' },
  { name: 'Plaza\'s', comparisons: 2876, color: '#FF6B00' },
  { name: 'Luvebras', comparisons: 2134, color: '#00A651' },
  { name: 'Farmatodo', comparisons: 1456, color: '#1E4D92' },
  { name: 'Locatel', comparisons: 910, color: '#E4002B' },
];

// Categorías más buscadas
export const topCategories = [
  { category: 'Lácteos', searches: 4230 },
  { category: 'Carnes', searches: 3890 },
  { category: 'Bebidas', searches: 3450 },
  { category: 'Limpieza', searches: 2980 },
  { category: 'Frutas y Verduras', searches: 2760 },
];

// Ahorro promedio por categoría
export const savingsPerCategory = [
  { category: 'Lácteos', savings: 18 },
  { category: 'Carnes', savings: 25 },
  { category: 'Bebidas', savings: 22 },
  { category: 'Limpieza', savings: 31 },
  { category: 'Higiene', savings: 28 },
  { category: 'Enlatados', savings: 15 },
];

// Actividad de usuarios por día de la semana
export const activityPerDay = [
  { day: 'Lun', visits: 1245 },
  { day: 'Mar', visits: 1389 },
  { day: 'Mié', visits: 1567 },
  { day: 'Jue', visits: 1423 },
  { day: 'Vie', visits: 1678 },
  { day: 'Sáb', visits: 2134 },
  { day: 'Dom', visits: 1890 },
];

// Productos más comparados
export const topProducts = [
  { name: 'Leche completa 1L', comparisons: 892 },
  { name: 'Arroz 1kg', comparisons: 756 },
  { name: 'Aceite vegetal 1L', comparisons: 689 },
  { name: 'Harina PAN 1kg', comparisons: 634 },
  { name: 'Azúcar 1kg', comparisons: 598 },
];

// Supermercado más económico por categoría
export const cheapestByCategory = [
  { category: 'Lácteos', supermarket: 'Luvebras', difference: -12 },
  { category: 'Carnes', supermarket: 'Central Madeirense', difference: -8 },
  { category: 'Bebidas', supermarket: 'Excelsior Gama', difference: -15 },
  { category: 'Limpieza', supermarket: 'Farmatodo', difference: -18 },
  { category: 'Higiene', supermarket: 'Locatel', difference: -10 },
];

// ============================================
// DATOS PARA ANALISTAS (por supermercado)
// ============================================

export interface SupermarketStats {
  supermarketId: string;
  totalProducts: number;
  productsUpdatedToday: number;
  productsOutdated: number;
  averagePrice: number;
  priceChangeLastWeek: number; // Porcentaje
  totalViews: number;
  viewsChangeLastWeek: number; // Porcentaje
  positionInRanking: number;
  lastUpload: string;
}

export interface UploadHistory {
  id: string;
  supermarketId: string;
  fileName: string;
  uploadDate: string;
  productsCount: number;
  status: 'completado' | 'procesando' | 'error';
  errors?: number;
}

// Estadísticas por supermercado (indexadas por supermarketId)
export const supermarketStats: Record<string, SupermarketStats> = {
  '1': { // Excelsior Gama
    supermarketId: '1',
    totalProducts: 1245,
    productsUpdatedToday: 89,
    productsOutdated: 156,
    averagePrice: 8.75,
    priceChangeLastWeek: 2.3,
    totalViews: 4521,
    viewsChangeLastWeek: 12.5,
    positionInRanking: 1,
    lastUpload: '2025-01-14 09:30',
  },
  '2': { // Central Madeirense
    supermarketId: '2',
    totalProducts: 1189,
    productsUpdatedToday: 67,
    productsOutdated: 203,
    averagePrice: 8.92,
    priceChangeLastWeek: 1.8,
    totalViews: 3892,
    viewsChangeLastWeek: 8.2,
    positionInRanking: 2,
    lastUpload: '2025-01-13 14:15',
  },
};

// Productos del supermercado (para el analista)
export interface SupermarketProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  lastUpdated: string;
  status: 'actualizado' | 'desactualizado' | 'nuevo';
}

export const supermarketProducts: Record<string, SupermarketProduct[]> = {
  '1': [ // Excelsior Gama
    { id: 'p1', name: 'Leche Completa 1L', category: 'Lácteos', price: 3.50, lastUpdated: '2025-01-14', status: 'actualizado' },
    { id: 'p2', name: 'Arroz Premium 1kg', category: 'Cereales', price: 2.80, lastUpdated: '2025-01-14', status: 'actualizado' },
    { id: 'p3', name: 'Aceite Vegetal 1L', category: 'Abarrotes', price: 4.25, lastUpdated: '2025-01-13', status: 'actualizado' },
    { id: 'p4', name: 'Harina PAN 1kg', category: 'Abarrotes', price: 2.15, lastUpdated: '2025-01-12', status: 'desactualizado' },
    { id: 'p5', name: 'Azúcar 1kg', category: 'Abarrotes', price: 1.95, lastUpdated: '2025-01-14', status: 'actualizado' },
    { id: 'p6', name: 'Pollo Entero kg', category: 'Carnes', price: 5.80, lastUpdated: '2025-01-14', status: 'nuevo' },
    { id: 'p7', name: 'Carne Molida kg', category: 'Carnes', price: 8.50, lastUpdated: '2025-01-10', status: 'desactualizado' },
    { id: 'p8', name: 'Queso Blanco kg', category: 'Lácteos', price: 7.25, lastUpdated: '2025-01-14', status: 'actualizado' },
  ],
};

// Historial de cargas
export const uploadHistory: UploadHistory[] = [
  { id: 'u1', supermarketId: '1', fileName: 'productos_enero_14.csv', uploadDate: '2025-01-14 09:30', productsCount: 89, status: 'completado' },
  { id: 'u2', supermarketId: '1', fileName: 'actualizacion_precios.csv', uploadDate: '2025-01-13 16:45', productsCount: 234, status: 'completado' },
  { id: 'u3', supermarketId: '1', fileName: 'productos_nuevos.csv', uploadDate: '2025-01-12 11:20', productsCount: 45, status: 'completado', errors: 3 },
  { id: 'u4', supermarketId: '1', fileName: 'carga_masiva.csv', uploadDate: '2025-01-10 08:00', productsCount: 567, status: 'completado' },
  { id: 'u5', supermarketId: '1', fileName: 'precios_diciembre.csv', uploadDate: '2024-12-28 10:15', productsCount: 189, status: 'completado' },
];

// Ventas/Comparaciones por categoría del supermercado
export const supermarketCategoryStats: Record<string, { category: string; views: number; position: number }[]> = {
  '1': [ // Excelsior Gama
    { category: 'Lácteos', views: 892, position: 2 },
    { category: 'Carnes', views: 756, position: 1 },
    { category: 'Bebidas', views: 1245, position: 1 },
    { category: 'Abarrotes', views: 634, position: 3 },
    { category: 'Limpieza', views: 423, position: 4 },
  ],
};

// Comparación de precios con competencia
export const priceComparison: Record<string, { product: string; ownPrice: number; avgCompetition: number; difference: number }[]> = {
  '1': [ // Excelsior Gama
    { product: 'Leche Completa 1L', ownPrice: 3.50, avgCompetition: 3.65, difference: -4.1 },
    { product: 'Arroz Premium 1kg', ownPrice: 2.80, avgCompetition: 2.75, difference: 1.8 },
    { product: 'Aceite Vegetal 1L', ownPrice: 4.25, avgCompetition: 4.50, difference: -5.6 },
    { product: 'Harina PAN 1kg', ownPrice: 2.15, avgCompetition: 2.10, difference: 2.4 },
    { product: 'Azúcar 1kg', ownPrice: 1.95, avgCompetition: 2.05, difference: -4.9 },
  ],
};

// Tendencia de precios del supermercado (últimos 7 días)
export const priceTrend: Record<string, { day: string; avgPrice: number }[]> = {
  '1': [ // Excelsior Gama
    { day: 'Lun', avgPrice: 8.52 },
    { day: 'Mar', avgPrice: 8.58 },
    { day: 'Mié', avgPrice: 8.61 },
    { day: 'Jue', avgPrice: 8.65 },
    { day: 'Vie', avgPrice: 8.70 },
    { day: 'Sáb', avgPrice: 8.73 },
    { day: 'Dom', avgPrice: 8.75 },
  ],
};
