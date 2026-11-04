import { getProductById, money, type Product } from "./products";
import { restoreStock } from "./inventory";

export type OrderStatus =
  | "RECEIVED"
  | "PAID"
  | "PREPARING"
  | "SHIPPED"
  | "NEARBY"
  | "DELIVERED"
  | "CANCELLED";

export const ORDER_FLOW: OrderStatus[] = [
  "RECEIVED",
  "PAID",
  "PREPARING",
  "SHIPPED",
  "NEARBY",
  "DELIVERED",
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  RECEIVED: "Pedido recibido",
  PAID: "Pago confirmado",
  PREPARING: "En preparación",
  SHIPPED: "Enviado",
  NEARBY: "Cerca de ti",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export const STATUS_HELP: Record<OrderStatus, string> = {
  RECEIVED: "Registramos tu pedido y estamos validando los datos.",
  PAID: "Confirmamos tu pago. Pronto empezaremos a prepararlo.",
  PREPARING: "Estamos empaquetando tus productos.",
  SHIPPED: "Tu pedido salió de nuestro almacén.",
  NEARBY: "Tu pedido está cerca de tu dirección. Mantente atento a la entrega.",
  DELIVERED: "Tu pedido fue entregado.",
  CANCELLED: "Este pedido fue cancelado.",
};

export type OrderItem = {
  productId: number;
  name: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  number: string;
  customerEmail: string;
  customerName: string;
  address: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  /* true si este pedido descontó stock al crearse (los de demostración no) */
  stockDeducted?: boolean;
};

const KEY = "techstore-demo-orders-v2";

/* Mismo formato de precio que el catálogo */
export const formatPrice = money;

export function getOrders(): Order[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveOrders(orders: Order[]) {
  localStorage.setItem(KEY, JSON.stringify(orders));
}

export function getOrdersByEmail(email: string): Order[] {
  return getOrders()
    .filter((o) => o.customerEmail.toLowerCase() === email.toLowerCase())
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/* Un pedido cancelado es final. Al cancelar se devuelve el stock
   solo si el pedido lo había descontado. */
export function updateOrderStatus(id: string, status: OrderStatus) {
  const orders = getOrders();
  const target = orders.find((o) => o.id === id);

  if (!target || target.status === "CANCELLED" || target.status === status) {
    return;
  }

  if (status === "CANCELLED" && target.stockDeducted) {
    restoreStock(target.items, target.number);
  }

  saveOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
}

function nextNumber(orders: Order[]) {
  return `TS-${String(1001 + orders.length)}`;
}

export function getOrderTotal(items: OrderItem[]) {
  return items.reduce((sum, it) => sum + it.price * it.quantity, 0);
}

/* Convierte los productos del carrito en items de pedido */
export function orderItemsFromCart(
  cart: { product: Product; qty: number }[]
): OrderItem[] {
  return cart.map(({ product, qty }) => ({
    productId: product.id,
    name: product.name,
    quantity: qty,
    price: product.price,
  }));
}

/* Se usa desde Checkout.tsx al confirmar la compra.
   El descuento de stock se hace justo después con deductStock(). */
export function createOrder(
  data: Omit<
    Order,
    "id" | "number" | "createdAt" | "status" | "total" | "stockDeducted"
  >
): Order {
  const orders = getOrders();
  const order: Order = {
    ...data,
    id: `order-${Date.now()}`,
    number: nextNumber(orders),
    createdAt: new Date().toISOString(),
    status: "RECEIVED",
    total: getOrderTotal(data.items),
    stockDeducted: true,
  };
  saveOrders([...orders, order]);
  return order;
}

/* Solo para demostrar el seguimiento mientras no exista backend.
   No descuentan stock. */
function itemsFromCatalog(lines: Array<[number, number]>): OrderItem[] {
  const items: OrderItem[] = [];
  for (const [productId, quantity] of lines) {
    const product = getProductById(productId);
    if (product) {
      items.push({
        productId: product.id,
        name: product.name,
        quantity,
        price: product.price,
      });
    }
  }
  return items;
}

export function createDemoOrders(email: string, name: string) {
  const base = Date.now();
  const day = 86400000;

  const demo: Array<[OrderStatus, number, Array<[number, number]>]> = [
    ["NEARBY", 2, [[2, 1], [6, 1]]],
    ["PREPARING", 1, [[3, 1]]],
    ["DELIVERED", 9, [[1, 1], [9, 2]]],
  ];

  const orders = getOrders();
  const created: Order[] = demo.map(([status, daysAgo, lines], i) => {
    const items = itemsFromCatalog(lines);
    return {
      id: `demo-${base}-${i}`,
      number: `TS-${1001 + orders.length + i}`,
      customerEmail: email,
      customerName: name,
      address: "Av. Javier Prado 1234, San Isidro, Lima",
      createdAt: new Date(base - daysAgo * day).toISOString(),
      status,
      items,
      total: getOrderTotal(items),
    };
  });

  saveOrders([...orders, ...created]);
}