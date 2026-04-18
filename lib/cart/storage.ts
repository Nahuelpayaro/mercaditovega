export const CART_STORAGE_KEY = "negocio-cart";

export type StoredCartItem = {
  productId: string;
  categoryId?: string;
  slug: string;
  name: string;
  priceCents: number;
  quantity: number;
  imageUrl?: string;
};

export type StoredCart = {
  items: StoredCartItem[];
  promoCode?: string;
};

export function readCartStorage(): StoredCart {
  if (typeof window === "undefined") {
    return { items: [] };
  }

  const raw = window.localStorage.getItem(CART_STORAGE_KEY);

  if (!raw) {
    return { items: [] };
  }

  try {
    const parsed = JSON.parse(raw) as StoredCart;
    return { items: parsed.items ?? [], promoCode: parsed.promoCode };
  } catch {
    return { items: [] };
  }
}

export function writeCartStorage(value: StoredCart) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(value));
}
