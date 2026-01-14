// ============================================
// DATOS MOCK - Reemplazar con llamadas a API
// ============================================

export type UserRole = 'Administrador' | 'Usuario';

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
