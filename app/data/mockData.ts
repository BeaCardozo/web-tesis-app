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
  sku?: string;
}

export const supermarketProducts: Record<string, SupermarketProduct[]> = {
  '1': [ // Excelsior Gama
    { id: 'p1', name: 'Leche Completa 1L', category: 'Lácteos', price: 3.50, lastUpdated: '2025-01-14', status: 'actualizado', sku: 'LAC001' },
    { id: 'p2', name: 'Arroz Premium 1kg', category: 'Cereales', price: 2.80, lastUpdated: '2025-01-14', status: 'actualizado', sku: 'CER001' },
    { id: 'p3', name: 'Aceite Vegetal 1L', category: 'Abarrotes', price: 4.25, lastUpdated: '2025-01-13', status: 'actualizado', sku: 'ABA001' },
    { id: 'p4', name: 'Harina PAN 1kg', category: 'Abarrotes', price: 2.15, lastUpdated: '2025-01-12', status: 'desactualizado', sku: 'ABA002' },
    { id: 'p5', name: 'Azúcar 1kg', category: 'Abarrotes', price: 1.95, lastUpdated: '2025-01-14', status: 'actualizado', sku: 'ABA003' },
    { id: 'p6', name: 'Pollo Entero kg', category: 'Carnes', price: 5.80, lastUpdated: '2025-01-14', status: 'nuevo', sku: 'CAR001' },
    { id: 'p7', name: 'Carne Molida kg', category: 'Carnes', price: 8.50, lastUpdated: '2025-01-10', status: 'desactualizado', sku: 'CAR002' },
    { id: 'p8', name: 'Queso Blanco kg', category: 'Lácteos', price: 7.25, lastUpdated: '2025-01-14', status: 'actualizado', sku: 'LAC002' },
    { id: 'p9', name: 'Yogurt Natural 500g', category: 'Lácteos', price: 2.40, lastUpdated: '2025-01-13', status: 'actualizado', sku: 'LAC003' },
    { id: 'p10', name: 'Pan de Sandwich', category: 'Panadería', price: 1.80, lastUpdated: '2025-01-14', status: 'actualizado', sku: 'PAN001' },
    { id: 'p11', name: 'Pasta Corta 500g', category: 'Abarrotes', price: 1.65, lastUpdated: '2025-01-11', status: 'desactualizado', sku: 'ABA004' },
    { id: 'p12', name: 'Atún en Lata 170g', category: 'Enlatados', price: 2.90, lastUpdated: '2025-01-14', status: 'actualizado', sku: 'ENL001' },
    { id: 'p13', name: 'Refresco Cola 2L', category: 'Bebidas', price: 2.50, lastUpdated: '2025-01-14', status: 'actualizado', sku: 'BEB001' },
    { id: 'p14', name: 'Agua Mineral 1.5L', category: 'Bebidas', price: 1.20, lastUpdated: '2025-01-14', status: 'actualizado', sku: 'BEB002' },
    { id: 'p15', name: 'Detergente Líquido 1L', category: 'Limpieza', price: 4.80, lastUpdated: '2025-01-13', status: 'actualizado', sku: 'LIM001' },
    { id: 'p16', name: 'Jabón de Baño 3pack', category: 'Higiene Personal', price: 3.25, lastUpdated: '2025-01-12', status: 'desactualizado', sku: 'HIG001' },
    { id: 'p17', name: 'Papel Higiénico 12 rollos', category: 'Higiene Personal', price: 5.90, lastUpdated: '2025-01-14', status: 'nuevo', sku: 'HIG002' },
    { id: 'p18', name: 'Cereal de Maíz 500g', category: 'Cereales', price: 4.15, lastUpdated: '2025-01-14', status: 'actualizado', sku: 'CER002' },
  ],
};

// Historial de precios por producto (últimas 8 semanas)
export interface PriceHistoryEntry {
  date: string;
  price: number;
  avgCompetition: number;
}

export const productPriceHistory: Record<string, PriceHistoryEntry[]> = {
  'p1': [ // Leche Completa 1L
    { date: '2024-11-25', price: 3.20, avgCompetition: 3.35 },
    { date: '2024-12-02', price: 3.25, avgCompetition: 3.40 },
    { date: '2024-12-09', price: 3.30, avgCompetition: 3.45 },
    { date: '2024-12-16', price: 3.35, avgCompetition: 3.50 },
    { date: '2024-12-23', price: 3.40, avgCompetition: 3.55 },
    { date: '2024-12-30', price: 3.45, avgCompetition: 3.60 },
    { date: '2025-01-06', price: 3.48, avgCompetition: 3.62 },
    { date: '2025-01-13', price: 3.50, avgCompetition: 3.65 },
  ],
  'p2': [ // Arroz Premium 1kg
    { date: '2024-11-25', price: 2.50, avgCompetition: 2.45 },
    { date: '2024-12-02', price: 2.55, avgCompetition: 2.50 },
    { date: '2024-12-09', price: 2.60, avgCompetition: 2.55 },
    { date: '2024-12-16', price: 2.65, avgCompetition: 2.60 },
    { date: '2024-12-23', price: 2.70, avgCompetition: 2.65 },
    { date: '2024-12-30', price: 2.75, avgCompetition: 2.70 },
    { date: '2025-01-06', price: 2.78, avgCompetition: 2.72 },
    { date: '2025-01-13', price: 2.80, avgCompetition: 2.75 },
  ],
  'p3': [ // Aceite Vegetal 1L
    { date: '2024-11-25', price: 3.80, avgCompetition: 4.00 },
    { date: '2024-12-02', price: 3.90, avgCompetition: 4.10 },
    { date: '2024-12-09', price: 4.00, avgCompetition: 4.20 },
    { date: '2024-12-16', price: 4.05, avgCompetition: 4.30 },
    { date: '2024-12-23', price: 4.10, avgCompetition: 4.35 },
    { date: '2024-12-30', price: 4.15, avgCompetition: 4.40 },
    { date: '2025-01-06', price: 4.20, avgCompetition: 4.45 },
    { date: '2025-01-13', price: 4.25, avgCompetition: 4.50 },
  ],
  'p6': [ // Pollo Entero kg
    { date: '2024-11-25', price: 5.20, avgCompetition: 5.40 },
    { date: '2024-12-02', price: 5.30, avgCompetition: 5.50 },
    { date: '2024-12-09', price: 5.40, avgCompetition: 5.55 },
    { date: '2024-12-16', price: 5.50, avgCompetition: 5.60 },
    { date: '2024-12-23', price: 5.60, avgCompetition: 5.70 },
    { date: '2024-12-30', price: 5.65, avgCompetition: 5.75 },
    { date: '2025-01-06', price: 5.75, avgCompetition: 5.85 },
    { date: '2025-01-13', price: 5.80, avgCompetition: 5.90 },
  ],
  'p8': [ // Queso Blanco kg
    { date: '2024-11-25', price: 6.50, avgCompetition: 6.80 },
    { date: '2024-12-02', price: 6.60, avgCompetition: 6.90 },
    { date: '2024-12-09', price: 6.75, avgCompetition: 7.00 },
    { date: '2024-12-16', price: 6.90, avgCompetition: 7.10 },
    { date: '2024-12-23', price: 7.00, avgCompetition: 7.20 },
    { date: '2024-12-30', price: 7.10, avgCompetition: 7.30 },
    { date: '2025-01-06', price: 7.18, avgCompetition: 7.40 },
    { date: '2025-01-13', price: 7.25, avgCompetition: 7.50 },
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

// ============================================
// AUDITORÍA / LOGS DE ACTIVIDAD
// ============================================

export type AuditAction =
  | 'user_login'
  | 'user_logout'
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'user_status_changed'
  | 'supermarket_created'
  | 'supermarket_updated'
  | 'supermarket_deleted'
  | 'data_uploaded'
  | 'data_deleted'
  | 'password_changed'
  | 'role_changed';

export interface AuditLog {
  id: string;
  action: AuditAction;
  userId: string;
  userName: string;
  userRole: UserRole;
  targetType?: 'user' | 'supermarket' | 'product' | 'upload';
  targetId?: string;
  targetName?: string;
  details?: string;
  ipAddress: string;
  timestamp: string;
}

export const auditLogs: AuditLog[] = [
  {
    id: 'log1',
    action: 'user_login',
    userId: '1',
    userName: 'Admin Principal',
    userRole: 'Administrador',
    ipAddress: '192.168.1.100',
    timestamp: '2025-01-14 10:30:00',
  },
  {
    id: 'log2',
    action: 'data_uploaded',
    userId: '9',
    userName: 'Roberto Analista',
    userRole: 'Analista',
    targetType: 'upload',
    targetId: 'u1',
    targetName: 'productos_enero_14.csv',
    details: '89 productos cargados',
    ipAddress: '192.168.1.105',
    timestamp: '2025-01-14 09:30:00',
  },
  {
    id: 'log3',
    action: 'user_created',
    userId: '1',
    userName: 'Admin Principal',
    userRole: 'Administrador',
    targetType: 'user',
    targetId: '8',
    targetName: 'José Hernández',
    details: 'Nuevo usuario registrado con rol Usuario',
    ipAddress: '192.168.1.100',
    timestamp: '2025-01-13 16:45:00',
  },
  {
    id: 'log4',
    action: 'user_status_changed',
    userId: '1',
    userName: 'Admin Principal',
    userRole: 'Administrador',
    targetType: 'user',
    targetId: '5',
    targetName: 'Ana Martínez',
    details: 'Estado cambiado de activo a inactivo',
    ipAddress: '192.168.1.100',
    timestamp: '2025-01-13 14:20:00',
  },
  {
    id: 'log5',
    action: 'user_login',
    userId: '9',
    userName: 'Roberto Analista',
    userRole: 'Analista',
    ipAddress: '192.168.1.105',
    timestamp: '2025-01-13 09:15:00',
  },
  {
    id: 'log6',
    action: 'supermarket_updated',
    userId: '1',
    userName: 'Admin Principal',
    userRole: 'Administrador',
    targetType: 'supermarket',
    targetId: '1',
    targetName: 'Excelsior Gama',
    details: 'Color actualizado',
    ipAddress: '192.168.1.100',
    timestamp: '2025-01-12 11:30:00',
  },
  {
    id: 'log7',
    action: 'data_uploaded',
    userId: '9',
    userName: 'Roberto Analista',
    userRole: 'Analista',
    targetType: 'upload',
    targetId: 'u2',
    targetName: 'actualizacion_precios.csv',
    details: '234 productos actualizados',
    ipAddress: '192.168.1.105',
    timestamp: '2025-01-12 10:00:00',
  },
  {
    id: 'log8',
    action: 'user_logout',
    userId: '2',
    userName: 'Usuario Demo',
    userRole: 'Usuario',
    ipAddress: '192.168.1.110',
    timestamp: '2025-01-11 18:30:00',
  },
  {
    id: 'log9',
    action: 'role_changed',
    userId: '1',
    userName: 'Admin Principal',
    userRole: 'Administrador',
    targetType: 'user',
    targetId: '9',
    targetName: 'Roberto Analista',
    details: 'Rol cambiado de Usuario a Analista',
    ipAddress: '192.168.1.100',
    timestamp: '2025-01-10 15:45:00',
  },
  {
    id: 'log10',
    action: 'supermarket_created',
    userId: '1',
    userName: 'Admin Principal',
    userRole: 'Administrador',
    targetType: 'supermarket',
    targetId: '6',
    targetName: 'Locatel',
    details: 'Nuevo supermercado agregado al sistema',
    ipAddress: '192.168.1.100',
    timestamp: '2025-01-10 10:00:00',
  },
  {
    id: 'log11',
    action: 'password_changed',
    userId: '3',
    userName: 'María García',
    userRole: 'Usuario',
    details: 'Contraseña actualizada por el usuario',
    ipAddress: '192.168.1.115',
    timestamp: '2025-01-09 14:20:00',
  },
  {
    id: 'log12',
    action: 'user_deleted',
    userId: '1',
    userName: 'Admin Principal',
    userRole: 'Administrador',
    targetType: 'user',
    targetId: '99',
    targetName: 'Usuario Prueba',
    details: 'Usuario eliminado del sistema',
    ipAddress: '192.168.1.100',
    timestamp: '2025-01-08 16:00:00',
  },
];
