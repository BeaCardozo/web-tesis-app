import {
  Apple,
  Beef,
  Milk,
  Wine,
  Coffee,
  Croissant,
  Cookie,
  Wheat,
  Fish,
  Egg,
  IceCream,
  Candy,
  Droplets,
  SprayCanIcon,
  Baby,
  Dog,
  Snowflake,
  Sandwich,
  Salad,
  UtensilsCrossed,
  ShoppingBasket,
  Package,
  type LucideIcon,
} from 'lucide-react';

interface CategoryIconRule {
  keywords: string[];
  icon: LucideIcon;
}

const rules: CategoryIconRule[] = [
  { keywords: ['fruta', 'verdura', 'vegetal', 'hortaliza'], icon: Apple },
  { keywords: ['carne', 'res', 'pollo', 'cerdo', 'embutido', 'charcutería'], icon: Beef },
  { keywords: ['lácteo', 'lacteo', 'leche', 'queso', 'yogur'], icon: Milk },
  { keywords: ['bebida', 'refresco', 'jugo', 'agua', 'gaseosa'], icon: Wine },
  { keywords: ['café', 'cafe', 'te', 'infusi'], icon: Coffee },
  { keywords: ['pan', 'panadería', 'panaderia', 'bollería'], icon: Croissant },
  { keywords: ['galleta', 'snack', 'botana'], icon: Cookie },
  { keywords: ['cereal', 'avena', 'granola'], icon: Wheat },
  { keywords: ['pescado', 'marisco', 'atún', 'sardina'], icon: Fish },
  { keywords: ['huevo'], icon: Egg },
  { keywords: ['helado', 'postre'], icon: IceCream },
  { keywords: ['dulce', 'caramelo', 'chocolate', 'golosina', 'confitería'], icon: Candy },
  { keywords: ['aceite', 'grasa', 'mantequilla', 'margarina'], icon: Droplets },
  { keywords: ['limpieza', 'detergente', 'jabón', 'desinfectante', 'hogar'], icon: SprayCanIcon },
  { keywords: ['bebé', 'bebe', 'infantil', 'pañal'], icon: Baby },
  { keywords: ['mascota', 'perro', 'gato', 'animal'], icon: Dog },
  { keywords: ['congelado', 'frozen'], icon: Snowflake },
  { keywords: ['sandwich', 'preparado', 'deli'], icon: Sandwich },
  { keywords: ['ensalada', 'orgánico', 'organico', 'natural'], icon: Salad },
  { keywords: ['condimento', 'salsa', 'especia', 'aderezo', 'sazonador'], icon: UtensilsCrossed },
  { keywords: ['harina', 'arroz', 'pasta', 'grano', 'legumbre'], icon: ShoppingBasket },
];

export function getCategoryIcon(categoryName: string): LucideIcon {
  const name = categoryName.toLowerCase();
  for (const rule of rules) {
    if (rule.keywords.some((kw) => name.includes(kw))) {
      return rule.icon;
    }
  }
  return Package;
}
