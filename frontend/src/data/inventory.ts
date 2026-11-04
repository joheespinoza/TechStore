import { getProductById, products, saveCatalog } from "./products";

/* ---------- Estado del stock ---------- */

export const LOW_STOCK = 5;

export type StockKey = "ok" | "low" | "out";

export function stockState(stock: number): { key: StockKey; label: string } {
  if (stock <= 0) return { key: "out", label: "Agotado" };
  if (stock <= LOW_STOCK) return { key: "low", label: "Stock bajo" };
  return { key: "ok", label: "Disponible" };
}

/* ---------- Historial de movimientos ---------- */

export type MovementType =
  | "INITIAL"
  | "SALE"
  | "RESTOCK"
  | "ADJUSTMENT"
  | "CANCELLATION";

export const MOVEMENT_LABEL: Record<MovementType, string> = {
  INITIAL: "Stock inicial",
  SALE: "Venta",
  RESTOCK: "Reposición",
  ADJUSTMENT: "Corrección",
  CANCELLATION: "Devolución por cancelación",
};

export type StockMovement = {
  id: string;
  productId: number;
  productName: string;
  type: MovementType;
  /* Positivo = entra al inventario, negativo = sale */
  quantity: number;
  before: number;
  after: number;
  note: string;
  by: string;
  createdAt: string;
};

const KEY = "techstore-demo-stock-movements-v1";
const MAX_MOVEMENTS = 300;

/* Del más reciente al más antiguo */
export function getMovements(): StockMovement[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function logMovement(
  entry: Omit<StockMovement, "id" | "createdAt">
): StockMovement {
  const movement: StockMovement = {
    ...entry,
    id: `mov-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(
      KEY,
      JSON.stringify([movement, ...getMovements()].slice(0, MAX_MOVEMENTS))
    );
  } catch {
    /* sin almacenamiento disponible */
  }

  return movement;
}

/* ---------- Cambios de stock ---------- */

export type ChangeResult =
  | { ok: true; before: number; after: number }
  | { ok: false; reason: string };

/* Única función que modifica el stock de un producto */
export function changeStock(
  productId: number,
  delta: number,
  type: MovementType,
  note: string,
  by: string
): ChangeResult {
  const product = getProductById(productId);

  if (!product) {
    return { ok: false, reason: "El producto ya no existe en el catálogo." };
  }

  if (!Number.isInteger(delta) || delta === 0) {
    return {
      ok: false,
      reason: "La cantidad debe ser un número entero distinto de cero.",
    };
  }

  const before = product.stock;
  const after = before + delta;

  if (after < 0) {
    return {
      ok: false,
      reason: `No hay stock suficiente de “${product.name}”. Disponible: ${before}.`,
    };
  }

  saveCatalog(
    products.map((p) => (p.id === productId ? { ...p, stock: after } : p))
  );

  logMovement({
    productId,
    productName: product.name,
    type,
    quantity: delta,
    before,
    after,
    note,
    by,
  });

  return { ok: true, before, after };
}

/* ---------- Operaciones para pedidos ---------- */

type StockLine = { productId: number; name: string; quantity: number };

/* Devuelve un mensaje si algún producto no tiene stock suficiente */
export function checkStock(items: StockLine[]): string | null {
  for (const item of items) {
    const product = getProductById(item.productId);

    if (!product) {
      return `“${item.name}” ya no está disponible.`;
    }

    if (item.quantity > product.stock) {
      return product.stock <= 0
        ? `“${item.name}” se agotó.`
        : `Solo quedan ${product.stock} unidades de “${item.name}”.`;
    }
  }

  return null;
}

export function deductStock(items: StockLine[], orderNumber: string) {
  for (const item of items) {
    changeStock(
      item.productId,
      -item.quantity,
      "SALE",
      `Pedido ${orderNumber}`,
      "Compra en tienda"
    );
  }
}

export function restoreStock(items: StockLine[], orderNumber: string) {
  for (const item of items) {
    if (!getProductById(item.productId)) continue;

    changeStock(
      item.productId,
      item.quantity,
      "CANCELLATION",
      `Pedido ${orderNumber} cancelado`,
      "Administración"
    );
  }
}