import { afterEach, describe, expect, it } from "vitest";
import { CART_STORAGE_KEY, readCartStorage, writeCartStorage } from "@/lib/cart/storage";

function createStorage() {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

afterEach(() => {
  (globalThis as { window?: unknown }).window = undefined;
});

describe("cart storage", () => {
  it("restores saved cart items and promo code from localStorage", () => {
    const localStorage = createStorage();
    (globalThis as { window?: unknown }).window = { localStorage };

    writeCartStorage({
      items: [{ productId: "prod-1", categoryId: "cat-1", slug: "yerba", name: "Yerba", priceCents: 2500, quantity: 2 }],
      promoCode: "BARRIO10",
    });

    expect(localStorage.getItem(CART_STORAGE_KEY)).toContain("BARRIO10");
    expect(readCartStorage()).toEqual({
      items: [{ productId: "prod-1", categoryId: "cat-1", slug: "yerba", name: "Yerba", priceCents: 2500, quantity: 2 }],
      promoCode: "BARRIO10",
    });
  });

  it("falls back to an empty cart when persisted data is malformed", () => {
    const localStorage = createStorage();
    (globalThis as { window?: unknown }).window = { localStorage };
    localStorage.setItem(CART_STORAGE_KEY, "{broken-json");

    expect(readCartStorage()).toEqual({ items: [] });
  });
});
