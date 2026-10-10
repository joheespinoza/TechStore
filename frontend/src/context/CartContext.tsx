
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  products,
  type Product,
} from "../data/products";

type Item = {
  id: number;
  qty: number;
};

type CartContextType = {
  items: {
    product: Product;
    qty: number;
  }[];
  count: number;
  total: number;
  add: (product: Product) => void;
  update: (id: number, qty: number) => void;
  remove: (id: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [stored, setStored] = useState<Item[]>(() => {
    try {
      const value = JSON.parse(
        localStorage.getItem("techstore-cart-v1") || "[]"
      );

      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "techstore-cart-v1",
      JSON.stringify(stored)
    );
  }, [stored]);

  const items = stored.flatMap((item) => {
    const product = products.find((p) => p.id === item.id);

    return product
      ? [{
          product,
          qty: Math.min(item.qty, product.stock),
        }]
      : [];
  });

  const add = (product: Product) => {
    setStored((previous) => {
      const current = previous.find(
        (item) => item.id === product.id
      );

      if (
        product.stock < 1 ||
        current?.qty === product.stock
      ) {
        return previous;
      }

      if (current) {
        return previous.map((item) =>
          item.id === product.id
            ? {
                ...item,
                qty: Math.min(
                  item.qty + 1,
                  product.stock
                ),
              }
            : item
        );
      }

      return [...previous, { id: product.id, qty: 1 }];
    });
  };

  const update = (id: number, qty: number) => {
    setStored((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              qty: Math.min(
                Math.max(1, qty),
                products.find((p) => p.id === id)?.stock ?? 1
              ),
            }
          : item
      )
    );
  };

  const remove = (id: number) => {
    setStored((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  const clear = () => setStored([]);

  const count = items.reduce(
    (total, item) => total + item.qty,
    0
  );

  const total = items.reduce(
    (sum, item) =>
      sum + item.product.price * item.qty,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        total,
        add,
        update,
        remove,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("CartProvider faltante");
  }

  return context;
}
