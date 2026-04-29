// ============================================
// DATOS MOCK - Vista de Usuario
// Productos con precios multi-supermercado
// ============================================

import { mockSupermarkets } from './mockData';

// ============================================
// INTERFACES
// ============================================

export interface UserCategory {
  id: string;
  name: string;
  iconName: string;
  color: string;
  bgColor: string;
  productCount: number;
}

export interface SupermarketPrice {
  supermarketId: string;
  supermarketName: string;
  supermarketColor: string;
  price: number;
  lastUpdated: string; // ISO date string
}

export interface UserProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryId: string;
  unit: string;
  prices: SupermarketPrice[];
  isFeatured: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  prices: SupermarketPrice[];
}

export interface UserCart {
  id: string;
  name: string;
  items: CartItem[];
  createdAt: string;
}

// ============================================
// CATEGORIAS
// ============================================

export const userCategories: UserCategory[] = [
  { id: 'cat1', name: 'Lacteos', iconName: 'Milk', color: '#3B82F6', bgColor: '#DBEAFE', productCount: 5 },
  { id: 'cat2', name: 'Carnes', iconName: 'Beef', color: '#EF4444', bgColor: '#FEE2E2', productCount: 3 },
  { id: 'cat3', name: 'Frutas y Verduras', iconName: 'Apple', color: '#22C55E', bgColor: '#DCFCE7', productCount: 3 },
  { id: 'cat4', name: 'Panaderia', iconName: 'Croissant', color: '#F59E0B', bgColor: '#FEF3C7', productCount: 2 },
  { id: 'cat5', name: 'Bebidas', iconName: 'CupSoda', color: '#8B5CF6', bgColor: '#EDE9FE', productCount: 3 },
  { id: 'cat6', name: 'Limpieza', iconName: 'SprayCan', color: '#06B6D4', bgColor: '#CFFAFE', productCount: 2 },
  { id: 'cat7', name: 'Higiene Personal', iconName: 'Heart', color: '#EC4899', bgColor: '#FCE7F3', productCount: 2 },
  { id: 'cat8', name: 'Abarrotes', iconName: 'Package', color: '#78716C', bgColor: '#F5F5F4', productCount: 4 },
  { id: 'cat9', name: 'Cereales', iconName: 'Wheat', color: '#D97706', bgColor: '#FEF3C7', productCount: 2 },
  { id: 'cat10', name: 'Enlatados', iconName: 'CircleDot', color: '#64748B', bgColor: '#F1F5F9', productCount: 1 },
];

// ============================================
// HELPERS
// ============================================

function makePrice(supermarketId: string, price: number, daysAgo: number): SupermarketPrice {
  const sm = mockSupermarkets.find(s => s.id === supermarketId);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60));
  return {
    supermarketId,
    supermarketName: sm?.name || 'Desconocido',
    supermarketColor: sm?.color || '#888',
    price,
    lastUpdated: date.toISOString(),
  };
}

// ============================================
// PRODUCTOS CON PRECIOS MULTI-SUPERMERCADO
// ============================================

export const userProducts: UserProduct[] = [
  // --- LACTEOS ---
  {
    id: 'up1',
    name: 'Leche Completa 1L',
    description: 'Leche entera pasteurizada, ideal para toda la familia.',
    category: 'Lacteos',
    categoryId: 'cat1',
    unit: '1 L',
    isFeatured: true,
    prices: [
      makePrice('1', 3.50, 0),
      makePrice('2', 3.65, 0),
      makePrice('3', 3.40, 1),
      makePrice('4', 3.30, 0),
      makePrice('5', 3.75, 1),
    ],
  },
  {
    id: 'up2',
    name: 'Queso Blanco',
    description: 'Queso blanco fresco rallado o en bloque, producto nacional.',
    category: 'Lacteos',
    categoryId: 'cat1',
    unit: '1 kg',
    isFeatured: true,
    prices: [
      makePrice('1', 7.25, 0),
      makePrice('2', 7.50, 0),
      makePrice('3', 6.90, 1),
      makePrice('4', 7.10, 0),
      makePrice('6', 7.80, 2),
    ],
  },
  {
    id: 'up3',
    name: 'Yogurt Natural 500g',
    description: 'Yogurt natural sin azucar anadida, fuente de calcio.',
    category: 'Lacteos',
    categoryId: 'cat1',
    unit: '500 g',
    isFeatured: false,
    prices: [
      makePrice('1', 2.40, 0),
      makePrice('2', 2.55, 1),
      makePrice('3', 2.30, 0),
      makePrice('5', 2.60, 1),
    ],
  },
  {
    id: 'up4',
    name: 'Mantequilla 250g',
    description: 'Mantequilla con sal, ideal para untar y cocinar.',
    category: 'Lacteos',
    categoryId: 'cat1',
    unit: '250 g',
    isFeatured: false,
    prices: [
      makePrice('1', 3.80, 1),
      makePrice('2', 3.95, 0),
      makePrice('4', 3.60, 0),
      makePrice('6', 4.10, 1),
    ],
  },
  {
    id: 'up5',
    name: 'Queso Amarillo Tajado',
    description: 'Queso amarillo tipo americano, tajado para sandwiches.',
    category: 'Lacteos',
    categoryId: 'cat1',
    unit: '450 g',
    isFeatured: false,
    prices: [
      makePrice('1', 5.20, 0),
      makePrice('2', 5.40, 1),
      makePrice('3', 4.95, 0),
      makePrice('5', 5.50, 2),
    ],
  },
  // --- CARNES ---
  {
    id: 'up6',
    name: 'Pollo Entero',
    description: 'Pollo entero limpio y fresco, criado sin hormonas.',
    category: 'Carnes',
    categoryId: 'cat2',
    unit: '1 kg',
    isFeatured: true,
    prices: [
      makePrice('1', 5.80, 0),
      makePrice('2', 5.60, 0),
      makePrice('3', 5.95, 1),
      makePrice('4', 5.45, 0),
    ],
  },
  {
    id: 'up7',
    name: 'Carne Molida',
    description: 'Carne molida de res, ideal para hamburguesas y salsas.',
    category: 'Carnes',
    categoryId: 'cat2',
    unit: '1 kg',
    isFeatured: false,
    prices: [
      makePrice('1', 8.50, 1),
      makePrice('2', 8.20, 0),
      makePrice('3', 8.75, 1),
      makePrice('4', 7.90, 0),
    ],
  },
  {
    id: 'up8',
    name: 'Chuleta de Cerdo',
    description: 'Chuleta de cerdo ahumada, corte grueso.',
    category: 'Carnes',
    categoryId: 'cat2',
    unit: '1 kg',
    isFeatured: false,
    prices: [
      makePrice('1', 9.20, 0),
      makePrice('2', 9.50, 1),
      makePrice('4', 8.80, 0),
    ],
  },
  // --- FRUTAS Y VERDURAS ---
  {
    id: 'up9',
    name: 'Platano Maduro',
    description: 'Platano maduro fresco, perfecto para freir o hornear.',
    category: 'Frutas y Verduras',
    categoryId: 'cat3',
    unit: '1 kg',
    isFeatured: false,
    prices: [
      makePrice('1', 1.80, 0),
      makePrice('2', 1.95, 0),
      makePrice('3', 1.70, 1),
      makePrice('4', 1.65, 0),
    ],
  },
  {
    id: 'up10',
    name: 'Tomate',
    description: 'Tomate fresco tipo perita, ideal para ensaladas y salsas.',
    category: 'Frutas y Verduras',
    categoryId: 'cat3',
    unit: '1 kg',
    isFeatured: false,
    prices: [
      makePrice('1', 2.20, 0),
      makePrice('2', 2.10, 1),
      makePrice('3', 2.35, 0),
      makePrice('4', 1.95, 0),
    ],
  },
  {
    id: 'up11',
    name: 'Cebolla',
    description: 'Cebolla blanca fresca, ingrediente esencial en la cocina.',
    category: 'Frutas y Verduras',
    categoryId: 'cat3',
    unit: '1 kg',
    isFeatured: false,
    prices: [
      makePrice('1', 1.50, 0),
      makePrice('2', 1.60, 1),
      makePrice('3', 1.45, 0),
      makePrice('4', 1.40, 0),
    ],
  },
  // --- PANADERIA ---
  {
    id: 'up12',
    name: 'Pan de Sandwich',
    description: 'Pan blanco de sandwich tajado, suave y fresco.',
    category: 'Panaderia',
    categoryId: 'cat4',
    unit: '500 g',
    isFeatured: false,
    prices: [
      makePrice('1', 1.80, 0),
      makePrice('2', 1.90, 0),
      makePrice('3', 1.75, 1),
      makePrice('5', 2.00, 1),
    ],
  },
  {
    id: 'up13',
    name: 'Pan Campesino',
    description: 'Pan campesino artesanal, crujiente por fuera y suave por dentro.',
    category: 'Panaderia',
    categoryId: 'cat4',
    unit: '1 unidad',
    isFeatured: false,
    prices: [
      makePrice('1', 2.50, 0),
      makePrice('2', 2.30, 1),
      makePrice('3', 2.60, 0),
    ],
  },
  // --- BEBIDAS ---
  {
    id: 'up14',
    name: 'Refresco Cola 2L',
    description: 'Refresco de cola, presentacion familiar de 2 litros.',
    category: 'Bebidas',
    categoryId: 'cat5',
    unit: '2 L',
    isFeatured: true,
    prices: [
      makePrice('1', 2.50, 0),
      makePrice('2', 2.70, 0),
      makePrice('3', 2.40, 1),
      makePrice('4', 2.35, 0),
      makePrice('5', 2.80, 1),
    ],
  },
  {
    id: 'up15',
    name: 'Agua Mineral 1.5L',
    description: 'Agua mineral natural sin gas, hidratacion pura.',
    category: 'Bebidas',
    categoryId: 'cat5',
    unit: '1.5 L',
    isFeatured: false,
    prices: [
      makePrice('1', 1.20, 0),
      makePrice('2', 1.30, 0),
      makePrice('3', 1.15, 1),
      makePrice('4', 1.10, 0),
      makePrice('5', 1.35, 1),
    ],
  },
  {
    id: 'up16',
    name: 'Jugo de Naranja 1L',
    description: 'Jugo de naranja pasteurizado, sin conservantes artificiales.',
    category: 'Bebidas',
    categoryId: 'cat5',
    unit: '1 L',
    isFeatured: false,
    prices: [
      makePrice('1', 3.20, 0),
      makePrice('2', 3.40, 1),
      makePrice('3', 3.10, 0),
      makePrice('5', 3.50, 1),
    ],
  },
  // --- LIMPIEZA ---
  {
    id: 'up17',
    name: 'Detergente Liquido 1L',
    description: 'Detergente liquido multiusos para ropa, aroma fresco.',
    category: 'Limpieza',
    categoryId: 'cat6',
    unit: '1 L',
    isFeatured: false,
    prices: [
      makePrice('1', 4.80, 0),
      makePrice('2', 4.60, 0),
      makePrice('5', 4.50, 1),
      makePrice('6', 4.90, 0),
    ],
  },
  {
    id: 'up18',
    name: 'Cloro 1L',
    description: 'Cloro concentrado para desinfeccion del hogar.',
    category: 'Limpieza',
    categoryId: 'cat6',
    unit: '1 L',
    isFeatured: false,
    prices: [
      makePrice('1', 1.90, 0),
      makePrice('2', 2.00, 1),
      makePrice('5', 1.85, 0),
      makePrice('6', 2.10, 1),
    ],
  },
  // --- HIGIENE PERSONAL ---
  {
    id: 'up19',
    name: 'Jabon de Bano 3-pack',
    description: 'Jabon de bano antibacterial, paquete de 3 unidades.',
    category: 'Higiene Personal',
    categoryId: 'cat7',
    unit: '3 unidades',
    isFeatured: false,
    prices: [
      makePrice('1', 3.25, 1),
      makePrice('5', 3.10, 0),
      makePrice('6', 3.40, 0),
    ],
  },
  {
    id: 'up20',
    name: 'Papel Higienico 12 rollos',
    description: 'Papel higienico doble hoja, suave y resistente.',
    category: 'Higiene Personal',
    categoryId: 'cat7',
    unit: '12 rollos',
    isFeatured: true,
    prices: [
      makePrice('1', 5.90, 0),
      makePrice('2', 6.10, 0),
      makePrice('5', 5.70, 1),
      makePrice('6', 5.80, 0),
    ],
  },
  // --- ABARROTES ---
  {
    id: 'up21',
    name: 'Arroz Premium 1kg',
    description: 'Arroz de grano largo tipo premium, rendidor y suelto.',
    category: 'Abarrotes',
    categoryId: 'cat8',
    unit: '1 kg',
    isFeatured: true,
    prices: [
      makePrice('1', 2.80, 0),
      makePrice('2', 2.75, 0),
      makePrice('3', 2.90, 1),
      makePrice('4', 2.60, 0),
    ],
  },
  {
    id: 'up22',
    name: 'Harina PAN 1kg',
    description: 'Harina de maiz precocida, para arepas y empanadas.',
    category: 'Abarrotes',
    categoryId: 'cat8',
    unit: '1 kg',
    isFeatured: true,
    prices: [
      makePrice('1', 2.15, 0),
      makePrice('2', 2.10, 0),
      makePrice('3', 2.25, 1),
      makePrice('4', 2.00, 0),
      makePrice('5', 2.30, 1),
    ],
  },
  {
    id: 'up23',
    name: 'Aceite Vegetal 1L',
    description: 'Aceite vegetal refinado para freir y cocinar.',
    category: 'Abarrotes',
    categoryId: 'cat8',
    unit: '1 L',
    isFeatured: false,
    prices: [
      makePrice('1', 4.25, 0),
      makePrice('2', 4.50, 0),
      makePrice('3', 4.10, 1),
      makePrice('4', 4.00, 0),
    ],
  },
  {
    id: 'up24',
    name: 'Azucar 1kg',
    description: 'Azucar refinada blanca, ideal para reposteria y bebidas.',
    category: 'Abarrotes',
    categoryId: 'cat8',
    unit: '1 kg',
    isFeatured: false,
    prices: [
      makePrice('1', 1.95, 0),
      makePrice('2', 2.05, 0),
      makePrice('3', 1.90, 1),
      makePrice('4', 1.85, 0),
    ],
  },
  // --- CEREALES ---
  {
    id: 'up25',
    name: 'Cereal de Maiz 500g',
    description: 'Cereal de maiz en hojuelas, crujiente y nutritivo.',
    category: 'Cereales',
    categoryId: 'cat9',
    unit: '500 g',
    isFeatured: false,
    prices: [
      makePrice('1', 4.15, 0),
      makePrice('2', 4.30, 1),
      makePrice('5', 4.00, 0),
    ],
  },
  {
    id: 'up26',
    name: 'Avena en Hojuelas 400g',
    description: 'Avena en hojuelas para preparar desayunos saludables.',
    category: 'Cereales',
    categoryId: 'cat9',
    unit: '400 g',
    isFeatured: false,
    prices: [
      makePrice('1', 2.90, 0),
      makePrice('2', 3.10, 0),
      makePrice('5', 2.80, 1),
      makePrice('6', 3.20, 1),
    ],
  },
  // --- ENLATADOS ---
  {
    id: 'up27',
    name: 'Atun en Lata 170g',
    description: 'Atun en aceite vegetal, listo para ensaladas y pastas.',
    category: 'Enlatados',
    categoryId: 'cat10',
    unit: '170 g',
    isFeatured: false,
    prices: [
      makePrice('1', 2.90, 0),
      makePrice('2', 3.00, 0),
      makePrice('3', 2.80, 1),
      makePrice('4', 2.75, 0),
      makePrice('5', 3.10, 1),
    ],
  },
];

// ============================================
// CARRITOS MOCK
// ============================================

export const userCarts: UserCart[] = [
  {
    id: 'cart1',
    name: 'Compra Semanal',
    createdAt: '2025-01-10',
    items: [
      {
        id: 'ci1',
        productId: 'up1',
        productName: 'Leche Completa 1L',
        unit: '1 L',
        quantity: 3,
        prices: userProducts.find(p => p.id === 'up1')?.prices || [],
      },
      {
        id: 'ci2',
        productId: 'up22',
        productName: 'Harina PAN 1kg',
        unit: '1 kg',
        quantity: 2,
        prices: userProducts.find(p => p.id === 'up22')?.prices || [],
      },
      {
        id: 'ci3',
        productId: 'up6',
        productName: 'Pollo Entero',
        unit: '1 kg',
        quantity: 2,
        prices: userProducts.find(p => p.id === 'up6')?.prices || [],
      },
      {
        id: 'ci4',
        productId: 'up21',
        productName: 'Arroz Premium 1kg',
        unit: '1 kg',
        quantity: 1,
        prices: userProducts.find(p => p.id === 'up21')?.prices || [],
      },
      {
        id: 'ci5',
        productId: 'up14',
        productName: 'Refresco Cola 2L',
        unit: '2 L',
        quantity: 2,
        prices: userProducts.find(p => p.id === 'up14')?.prices || [],
      },
    ],
  },
  {
    id: 'cart2',
    name: 'Limpieza del Hogar',
    createdAt: '2025-01-12',
    items: [
      {
        id: 'ci6',
        productId: 'up17',
        productName: 'Detergente Liquido 1L',
        unit: '1 L',
        quantity: 1,
        prices: userProducts.find(p => p.id === 'up17')?.prices || [],
      },
      {
        id: 'ci7',
        productId: 'up18',
        productName: 'Cloro 1L',
        unit: '1 L',
        quantity: 2,
        prices: userProducts.find(p => p.id === 'up18')?.prices || [],
      },
      {
        id: 'ci8',
        productId: 'up20',
        productName: 'Papel Higienico 12 rollos',
        unit: '12 rollos',
        quantity: 1,
        prices: userProducts.find(p => p.id === 'up20')?.prices || [],
      },
    ],
  },
];

// ============================================
// HELPERS PARA PRODUCTOS
// ============================================

export function getLowestPrice(product: UserProduct): SupermarketPrice | null {
  if (product.prices.length === 0) return null;
  return product.prices.reduce((min, p) => p.price < min.price ? p : min, product.prices[0]);
}

export function getHighestPrice(product: UserProduct): SupermarketPrice | null {
  if (product.prices.length === 0) return null;
  return product.prices.reduce((max, p) => p.price > max.price ? p : max, product.prices[0]);
}

export function getSavingsPercent(product: UserProduct): number {
  const low = getLowestPrice(product);
  const high = getHighestPrice(product);
  if (!low || !high || high.price === 0) return 0;
  return Math.round(((high.price - low.price) / high.price) * 100);
}

export function formatTimeAgo(isoDate: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays === 1) return 'ayer';
  return `hace ${diffDays} dias`;
}

// Tasa de cambio mock USD -> Bs
export const EXCHANGE_RATE = 36.50;

export function formatPrice(price: number, currency: 'USD' | 'Bs'): string {
  if (currency === 'Bs') {
    return `Bs. ${(price * EXCHANGE_RATE).toFixed(2)}`;
  }
  return `$${price.toFixed(2)}`;
}
