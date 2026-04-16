import type { PaymentMethod } from "@prisma/client";
import { db } from "@/lib/db";
import { checkoutSchema, type CheckoutInput } from "@/lib/validators/checkout";
import { priceCart } from "@/lib/pricing/cart-pricing";
import { buildOrderMessage } from "@/lib/whatsapp/build-order-message";
import { generateOrderCode } from "@/lib/utils";
import { getPaymentProvider } from "@/lib/payments/provider";

export async function createOrder(rawInput: CheckoutInput) {
  const input = checkoutSchema.parse(rawInput);

  const products = await db.product.findMany({
    where: { id: { in: input.items.map((item) => item.productId) }, isActive: true, isPublished: true, stockMode: "in_stock" },
    include: { category: true },
  });

  if (products.length !== input.items.length) {
    throw new Error("Hay productos no disponibles en tu carrito.");
  }

  const promotions = await db.promotion.findMany({
    where: { isActive: true },
    include: { products: true, categories: true },
  });

  const pricing = priceCart({
    items: products.map((product) => {
      const cartItem = input.items.find((item) => item.productId === product.id)!;
      return {
        productId: product.id,
        categoryId: product.categoryId,
        quantity: cartItem.quantity,
        unitPriceCents: product.priceCents,
      };
    }),
    promotions: promotions.map((promotion) => ({
      id: promotion.id,
      code: promotion.code,
      type: promotion.type,
      scope: promotion.scope,
      amount: promotion.amount,
      minSubtotalCents: promotion.minSubtotalCents,
      startsAt: promotion.startsAt,
      endsAt: promotion.endsAt,
      isActive: promotion.isActive,
      productIds: promotion.products.map((item) => item.id),
      categoryIds: promotion.categories.map((item) => item.id),
    })),
    promoCode: input.promoCode,
  });

  if (pricing.promoMessage) {
    throw new Error(pricing.promoMessage);
  }

  if (pricing.deliveryMessage) {
    throw new Error(pricing.deliveryMessage);
  }

  const customer = await db.customer.create({
    data: {
      fullName: input.fullName,
      ...(input.phone ? { phone: input.phone } : {}),
      ...(input.email ? { email: input.email } : {}),
      ...(input.notes ? { notes: input.notes } : {}),
    },
  });

  const order = await db.order.create({
    data: {
      code: generateOrderCode(),
      customerId: customer.id,
      fulfillmentType: input.fulfillmentType,
      paymentMethod: input.paymentMethod as PaymentMethod,
      promotionId: pricing.promotion?.id,
      addressLine: input.addressLine,
      postalCode: input.postalCode,
      notes: input.notes,
      subtotalCents: pricing.subtotalCents,
      discountCents: pricing.discountCents,
      deliveryFeeCents: pricing.deliveryFeeCents,
      totalCents: pricing.totalCents,
      items: {
        create: products.map((product) => {
          const cartItem = input.items.find((item) => item.productId === product.id)!;
          return {
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            unitPriceCents: product.priceCents,
            quantity: cartItem.quantity,
            lineTotalCents: product.priceCents * cartItem.quantity,
          };
        }),
      },
    },
    include: { customer: true, items: true },
  });

  if (input.paymentMethod === "mercado_pago_link") {
    await getPaymentProvider().createIntent(order.id);
  }

  const whatsappUrl = buildOrderMessage(order);

  return db.order.update({
    where: { id: order.id },
    data: { whatsappUrl },
    include: { customer: true, items: true, promotion: true },
  });
}
