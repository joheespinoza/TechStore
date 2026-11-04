
/**
 * TECHSTORE
 * Catálogo de productos informáticos
 *
 * Datos estáticos utilizados durante el desarrollo
 * del frontend con React y TypeScript.
 *
 * Posteriormente se obtendrán desde Spring Boot.
 */

// ============================================
// CATEGORÍAS
// ============================================

export type Category =
  | "Laptops"
  | "Desktops"
  | "Monitores"
  | "Teclados"
  | "Mouse"
  | "Auriculares"
  | "Almacenamiento"
  | "Redes"
  | "Impresoras"
  | "Accesorios";

// ============================================
// MODELO DE PRODUCTO
// ============================================

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: Category;
  price: number;
  originalPrice: number;
  stock: number;
  description: string;
  image: string;
  rating: number;
  reviews: number;
}

// ============================================
// RUTAS DE IMÁGENES
// ============================================

const IMAGE_PATH = "/images/products";

/**
 * Codifica correctamente nombres de archivos
 * que contienen espacios o caracteres especiales.
 */
const productImage = (filename: string): string => {
  return `${IMAGE_PATH}/${encodeURIComponent(filename)}`;
};

// ============================================
// CATÁLOGO DE PRODUCTOS
// ============================================

export const products: Product[] = [
  // ------------------------------------------
  // PRODUCTO 1 - DELL
  // ------------------------------------------

  {
    id: 1,
    name: "Dell XPS 15 9530",
    brand: "Dell",
    category: "Laptops",
    price: 6269.97,
    originalPrice: 7124.96,
    stock: 12,
    description:
      "Laptop profesional con pantalla OLED de 15.6 pulgadas.",
    image: productImage("dell-xps-15.jpg"),
    rating: 4.7,
    reviews: 19,
  },

  // ------------------------------------------
  // PRODUCTO 2 - LENOVO
  // ------------------------------------------

  {
    id: 2,
    name: "Lenovo ThinkPad X1 Carbon",
    brand: "Lenovo",
    category: "Laptops",
    price: 5445.0,
    originalPrice: 6187.5,
    stock: 8,
    description:
      "Ultrabook empresarial ultraligero.",
    image: productImage("Lenovo ThinkPad X1 Carbon.jpg"),
    rating: 4.8,
    reviews: 26,
  },

  // ------------------------------------------
  // PRODUCTO 3 - SAMSUNG MONITOR
  // ------------------------------------------

  {
    id: 3,
    name: "Samsung Odyssey G7 32″",
    brand: "Samsung",
    category: "Monitores",
    price: 2744.97,
    originalPrice: 3119.28,
    stock: 5,
    description:
      "Monitor gaming curvo de alta tasa de refresco.",
    image: productImage("Samsung Odyssey G7 32.jpg"),
    rating: 4.6,
    reviews: 33,
  },

  // ------------------------------------------
  // PRODUCTO 4 - HP
  // ------------------------------------------

  {
    id: 4,
    name: "HP EliteDesk 800 G9",
    brand: "HP",
    category: "Desktops",
    price: 4286.7,
    originalPrice: 4871.25,
    stock: 3,
    description:
      "PC empresarial de alto rendimiento.",
    image: productImage("HP EliteDesk 800 G9.jpg"),
    rating: 4.5,
    reviews: 40,
  },

  // ------------------------------------------
  // PRODUCTO 5 - LOGITECH TECLADO
  // ------------------------------------------

  {
    id: 5,
    name: "Logitech MX Keys Advanced",
    brand: "Logitech",
    category: "Teclados",
    price: 412.46,
    originalPrice: 468.75,
    stock: 25,
    description:
      "Teclado inalámbrico retroiluminado.",
    image: productImage("Logitech MX Keys Advanced.jpg"),
    rating: 4.7,
    reviews: 47,
  },

  // ---------------------------A---------------
  // PRODUCTO 6 - LOGITECH MOUSE
  // ------------------------------------------

  {
    id: 6,
    name: "Logitech MX Master 3S",
    brand: "Logitech",
    category: "Mouse",
    price: 337.46,
    originalPrice: 383.48,
    stock: 30,
    description:
      "Mouse ergonómico de alta precisión.",
    image: productImage("Logitech MX Master 3S.jpg"),
    rating: 4.9,
    reviews: 54,
  },

  // ------------------------------------------
  // PRODUCTO 7 - ASUS
  // ------------------------------------------

  {
    id: 7,
    name: "ASUS ROG Zephyrus G16",
    brand: "ASUS",
    category: "Laptops",
    price: 7256.7,
    originalPrice: 8246.25,
    stock: 4,
    description:
      "Laptop gamer potente y ligera.",
    image: productImage("ASUS ROG Zephyrus G16.png"),
    rating: 4.8,
    reviews: 29,
  },

  // ------------------------------------------
  // PRODUCTO 8 - SONY
  // ------------------------------------------

  {
    id: 8,
    name: "Sony WH-1000XM5",
    brand: "Sony",
    category: "Auriculares",
    price: 1399.0,
    originalPrice: 1590.0,
    stock: 9,
    description:
      "Auriculares con cancelación de ruido.",
    image: productImage("Sony WH-1000XM5.jpg"),
    rating: 4.7,
    reviews: 44,
  },

  // ------------------------------------------
  // PRODUCTO 9 - SAMSUNG SSD
  // ------------------------------------------

  {
    id: 9,
    name: "Samsung SSD 990 PRO 1TB",
    brand: "Samsung",
    category: "Almacenamiento",
    price: 469.0,
    originalPrice: 532.95,
    stock: 18,
    description:
      "Unidad SSD NVMe de alta velocidad.",
    image: productImage("Samsung SSD 990 PRO 1TB.jpg"),
    rating: 4.8,
    reviews: 35,
  },

  // ------------------------------------------
  // PRODUCTO 10 - TP-LINK
  // ------------------------------------------

  {
    id: 10,
    name: "TP-Link Archer AX55",
    brand: "TP-Link",
    category: "Redes",
    price: 329.0,
    originalPrice: 373.86,
    stock: 11,
    description:
      "Router Wi-Fi 6 para el hogar.",
    image: productImage("TP-Link Archer AX55.jpg"),
    rating: 4.5,
    reviews: 20,
  },

  // ------------------------------------------
  // PRODUCTO 11 - EPSON
  // ------------------------------------------

  {
    id: 11,
    name: "Epson EcoTank L3250",
    brand: "Epson",
    category: "Impresoras",
    price: 899.0,
    originalPrice: 1021.59,
    stock: 6,
    description:
      "Impresora multifuncional de tanque de tinta.",
    image: productImage("Epson EcoTank L3250.jpg"),
    rating: 4.6,
    reviews: 31,
  },
];

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Formatea un precio en soles peruanos.
 *
 * Ejemplo:
 * money(6269.97) -> S/ 6,269.97
 */
export const money = (amount: number): string => {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Busca un producto por su ID.
 */
export const getProductById = (
  id: number
): Product | undefined => {
  return products.find((product) => product.id === id);
};

/**
 * Devuelve todos los productos de una categoría.
 */
export const getProductsByCategory = (
  category: Category
): Product[] => {
  return products.filter(
    (product) => product.category === category
  );
};

/**
 * Devuelve productos que tienen stock disponible.
 */
export const getAvailableProducts = (): Product[] => {
  return products.filter((product) => product.stock > 0);
};

/**
 * Devuelve productos con stock bajo.
 */
export const getLowStockProducts = (
  limit: number = 5
): Product[] => {
  return products.filter(
    (product) =>
      product.stock > 0 && product.stock <= limit
  );
};

/**
 * Obtiene las marcas disponibles.
 */
export const getBrands = (): string[] => {
  return [...new Set(products.map((p) => p.brand))].sort();
};

/**
 * Calcula el porcentaje de descuento.
 */
export const getDiscountPercentage = (
  product: Product
): number => {
  if (product.originalPrice <= 0) {
    return 0;
  }

  const discount =
    ((product.originalPrice - product.price) /
      product.originalPrice) *
    100;

  return Math.max(0, Math.round(discount));
};
// ============================================
// ADMINISTRACIÓN DEL CATÁLOGO (datos de demostración)
// ============================================

export const CATEGORY_LIST: Category[] = [
  "Laptops",
  "Desktops",
  "Monitores",
  "Teclados",
  "Mouse",
  "Auriculares",
  "Almacenamiento",
  "Redes",
  "Impresoras",
  "Accesorios",
];

const CATEGORY_PREFIX: Record<Category, string> = {
  Laptops: "LAP",
  Desktops: "DES",
  Monitores: "MON",
  Teclados: "TEC",
  Mouse: "MOU",
  Auriculares: "AUR",
  Almacenamiento: "ALM",
  Redes: "RED",
  Impresoras: "IMP",
  Accesorios: "ACC",
};

/** Código automático del producto. Ejemplo: LAP-0001 */
export const productCode = (product: Product): string =>
  `${CATEGORY_PREFIX[product.category]}-${String(product.id).padStart(4, "0")}`;

/** Siguiente identificador disponible. */
export const nextProductId = (): number =>
  products.reduce((max, p) => Math.max(max, p.id), 0) + 1;

const CATALOG_KEY = "techstore-demo-catalog-v1";

/** Guarda el catálogo y actualiza la lista en memoria. */
export function saveCatalog(list: Product[]): void {
  try {
    localStorage.setItem(CATALOG_KEY, JSON.stringify(list));
  } catch {
    /* sin almacenamiento disponible */
  }
  products.splice(0, products.length, ...list);
}

/** Si el admin ya modificó el catálogo, se carga al iniciar. */
try {
  const raw = localStorage.getItem(CATALOG_KEY);
  if (raw) {
    const saved: unknown = JSON.parse(raw);
    if (Array.isArray(saved)) {
      products.splice(0, products.length, ...(saved as Product[]));
    }
  }
} catch {
  /* se mantiene el catálogo de demostración */
}