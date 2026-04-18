import { beforeEach, describe, expect, it, vi } from "vitest";

const { dbMock, paymentIntentMock, state } = vi.hoisted(() => {
  const state = {
    categories: [] as Array<{ id: string; name: string; slug: string }>,
    products: [] as Array<{
      id: string;
      categoryId: string;
      name: string;
      slug: string;
      priceCents: number;
      isActive: boolean;
      isPublished: boolean;
      stockMode: "in_stock" | "out_of_stock";
    }>,
    promotions: [] as Array<{
      id: string;
      code: string;
      type: "percentage" | "fixed";
      scope: "order" | "category" | "product";
      amount: number;
      minSubtotalCents: number | null;
      startsAt: Date;
      endsAt: Date;
      isActive: boolean;
        products: Array<{ id: string }>;
        categories: Array<{ id: string }>;
    }>,
    customers: [] as Array<{
      id: string;
      fullName: string;
      phone: string | null;
      email: string | null;
      notes: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>,
    orders: [] as Array<Record<string, unknown>>,
  };

  const paymentIntentMock = vi.fn(async () => ({ reference: "mp-intent" }));

  const dbMock = {
    product: {
      findMany: vi.fn(async ({ where }: { where: { id: { in: string[] }; isActive: boolean; isPublished: boolean; stockMode: "in_stock" } }) =>
        state.products
          .filter(
            (product) =>
              where.id.in.includes(product.id) && product.isActive === where.isActive && product.isPublished === where.isPublished && product.stockMode === where.stockMode,
          )
          .map((product) => ({ ...product })),
      ),
    },
    promotion: {
      findUnique: vi.fn(async ({ where }: { where: { code: string } }) => state.promotions.find((promotion) => promotion.code === where.code) ?? null),
    },
    customer: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        const now = new Date();
        const customer = {
          id: `cust-${state.customers.length + 1}`,
          fullName: data.fullName as string,
          phone: (data.phone as string | null | undefined) ?? null,
          email: (data.email as string | null | undefined) ?? null,
          notes: (data.notes as string | null | undefined) ?? null,
          createdAt: now,
          updatedAt: now,
        };

        state.customers.push(customer);
        return customer;
      }),
    },
    order: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        const now = new Date();
        const orderId = `ord-${state.orders.length + 1}`;
        const orderItems = ((data.items as { create: Array<Record<string, unknown>> }).create ?? []).map((item, index) => ({
          id: `item-${index + 1}`,
          orderId,
          ...item,
        }));
        const order = {
          id: orderId,
          code: data.code,
          channel: "storefront",
          status: "placed",
          fulfillmentType: data.fulfillmentType,
          paymentMethod: data.paymentMethod,
          customerId: data.customerId,
          promotionId: data.promotionId ?? null,
          addressLine: data.addressLine ?? null,
          postalCode: data.postalCode ?? null,
          notes: data.notes ?? null,
          internalNote: null,
          subtotalCents: data.subtotalCents,
          discountCents: data.discountCents,
          deliveryFeeCents: data.deliveryFeeCents,
          totalCents: data.totalCents,
          whatsappUrl: null,
          createdAt: now,
          updatedAt: now,
          items: orderItems,
        };

        state.orders.push(order);

        return {
          ...order,
          customer: state.customers.find((customer) => customer.id === order.customerId),
        };
      }),
      update: vi.fn(async ({ where, data }: { where: { id: string }; data: { whatsappUrl: string } }) => {
        const order = state.orders.find((entry) => entry.id === where.id)! as Record<string, unknown> & { items: Array<Record<string, unknown>> };
        order.whatsappUrl = data.whatsappUrl;

        return {
          ...order,
          customer: state.customers.find((customer) => customer.id === order.customerId),
          promotion: state.promotions.find((promotion) => promotion.id === order.promotionId) ?? null,
        };
      }),
    },
  };

  return { dbMock, paymentIntentMock, state };
});

vi.mock("@/lib/db", () => ({ db: dbMock }));
vi.mock("@/lib/payments/provider", () => ({ getPaymentProvider: () => ({ createIntent: paymentIntentMock }) }));
vi.mock("@/lib/utils", async () => {
  const actual = await vi.importActual<typeof import("@/lib/utils")>("@/lib/utils");
  return { ...actual, generateOrderCode: () => "ALM-TEST1" };
});

import { createOrder } from "@/lib/orders/create-order";

describe("createOrder integration seam", () => {
  beforeEach(() => {
    state.categories = [{ id: "cat-1", name: "Almacén", slug: "almacen" }];
    state.products = [
      {
        id: "prod-1",
        categoryId: "cat-1",
        name: "Yerba",
        slug: "yerba",
        priceCents: 2500,
        isActive: true,
        isPublished: true,
        stockMode: "in_stock",
      },
    ];
    state.promotions = [
      {
        id: "promo-1",
        code: "BARRIO10",
        type: "percentage",
        scope: "order",
        amount: 10,
        minSubtotalCents: 3000,
        startsAt: new Date("2026-01-01T00:00:00.000Z"),
        endsAt: new Date("2026-12-31T23:59:59.000Z"),
        isActive: true,
        products: [],
        categories: [],
      },
    ];
    state.customers = [];
    state.orders = [];
    paymentIntentMock.mockClear();
    Object.values(dbMock).forEach((model) => Object.values(model).forEach((fn) => fn.mockClear()));
  });

  it("persists a repriced order, customer, and WhatsApp handoff", async () => {
    const order = await createOrder({
      fullName: "Ana Pérez",
      email: "ana@example.com",
      fulfillmentType: "delivery",
      addressLine: "Calle 123",
      postalCode: "1405",
      notes: "Sin apuro",
      paymentMethod: "mercado_pago_link",
      promoCode: "BARRIO10",
      items: [{ productId: "prod-1", name: "Yerba", slug: "yerba", priceCents: 1000, quantity: 2 }],
    });

    expect(state.customers).toHaveLength(1);
    expect(state.orders).toHaveLength(1);
    expect(order.code).toBe("ALM-TEST1");
    expect(order.subtotalCents).toBe(5000);
    expect(order.discountCents).toBe(500);
    expect(order.deliveryFeeCents).toBe(0);
    expect(order.totalCents).toBe(4500);
    expect(order.promotionId).toBe("promo-1");
    expect(order.whatsappUrl).toContain("https://wa.me/");
    expect(decodeURIComponent(order.whatsappUrl ?? "")).toContain("ALM-TEST1");
    expect(paymentIntentMock).toHaveBeenCalledWith("ord-1");
    expect(dbMock.promotion.findUnique).toHaveBeenCalledWith({
      where: { code: "BARRIO10" },
      select: expect.any(Object),
    });
  });

  it("rejects invalid promo submissions before persisting the order", async () => {
    state.promotions[0] = {
      ...state.promotions[0],
      isActive: false,
    };

    await expect(
      createOrder({
        fullName: "Ana Pérez",
        email: "ana@example.com",
        fulfillmentType: "pickup",
        paymentMethod: "cash",
        promoCode: "BARRIO10",
        items: [{ productId: "prod-1", name: "Yerba", slug: "yerba", priceCents: 2500, quantity: 1 }],
      }),
    ).rejects.toThrow("Ese promo ya no está disponible.");

    expect(state.orders).toHaveLength(0);
  });

  it("rejects unpublished products from stale carts", async () => {
    state.products[0] = { ...state.products[0], isPublished: false };

    await expect(
      createOrder({
        fullName: "Ana Pérez",
        email: "ana@example.com",
        fulfillmentType: "pickup",
        paymentMethod: "cash",
        items: [{ productId: "prod-1", name: "Yerba", slug: "yerba", priceCents: 2500, quantity: 1 }],
      }),
    ).rejects.toThrow("Hay productos no disponibles en tu carrito.");
  });

  it("skips promo lookup entirely when the cart has no promo code", async () => {
    await createOrder({
      fullName: "Ana Pérez",
      email: "ana@example.com",
      fulfillmentType: "pickup",
      paymentMethod: "cash",
      items: [{ productId: "prod-1", name: "Yerba", slug: "yerba", priceCents: 2500, quantity: 1 }],
    });

    expect(dbMock.promotion.findUnique).not.toHaveBeenCalled();
  });
});
