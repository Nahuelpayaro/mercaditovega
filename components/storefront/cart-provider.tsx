"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { readCartStorage, type StoredCartItem, writeCartStorage } from "@/lib/cart/storage";

type CartContextValue = {
  items: StoredCartItem[];
  promoCode?: string;
  message?: string;
  addItem: (item: StoredCartItem & { isAvailable?: boolean }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  applyPromoCode: (promoCode?: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotalCents: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [initialCart] = useState(readCartStorage);
  const [items, setItems] = useState<StoredCartItem[]>(initialCart.items);
  const [promoCode, setPromoCode] = useState<string | undefined>(initialCart.promoCode);
  const [message, setMessage] = useState<string | undefined>();

  useEffect(() => {
    writeCartStorage({ items, promoCode });
  }, [items, promoCode]);

  const clearCart = useCallback(() => {
    setItems([]);
    setPromoCode(undefined);
    setMessage(undefined);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      promoCode,
      message,
      addItem: (item) => {
        if (item.isAvailable === false) {
          setMessage("Este producto no está disponible ahora.");
          return;
        }

        setItems((current) => {
          const existing = current.find((entry) => entry.productId === item.productId);
          if (existing) {
            return current.map((entry) =>
              entry.productId === item.productId ? { ...entry, quantity: entry.quantity + 1 } : entry,
            );
          }

          return [...current, { ...item, quantity: 1 }];
        });
        setMessage(`${item.name} se sumó al carrito.`);
      },
      removeItem: (productId) => setItems((current) => current.filter((entry) => entry.productId !== productId)),
      updateQuantity: (productId, quantity) => {
        setItems((current) =>
          current
            .map((entry) => (entry.productId === productId ? { ...entry, quantity } : entry))
            .filter((entry) => entry.quantity > 0),
        );
      },
      applyPromoCode: (nextPromoCode) => {
        setPromoCode(nextPromoCode?.trim().toUpperCase() || undefined);
        setMessage(nextPromoCode ? "Promo guardado para validar en el pedido." : "Promo removido.");
      },
      clearCart,
      itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
      subtotalCents: items.reduce((acc, item) => acc + item.priceCents * item.quantity, 0),
    }),
    [clearCart, items, message, promoCode],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
}
