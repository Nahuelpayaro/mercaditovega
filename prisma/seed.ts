import { PrismaClient } from "@prisma/client";
import { buildOrderMessage } from "@/lib/whatsapp/build-order-message";

const prisma = new PrismaClient();

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.category.deleteMany();

  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Almacén", slug: "almacen", description: "Lo básico para todos los días" } }),
    prisma.category.create({ data: { name: "Bebidas", slug: "bebidas", description: "Gaseosas, aguas y jugos" } }),
    prisma.category.create({ data: { name: "Limpieza", slug: "limpieza", description: "Para la casa" } }),
  ]);

  const [almacen, bebidas, limpieza] = categories;

  const products = await Promise.all([
    prisma.product.create({
      data: {
        categoryId: almacen.id,
        name: "Yerba Tradicional 1kg",
        slug: "yerba-tradicional-1kg",
        shortDescription: "Rinde para toda la semana",
        description: "Yerba suave y rendidora para el mate de todos los días.",
        priceCents: 6900,
        compareAtCents: 7600,
        unitLabel: "1kg",
        isFeatured: true,
        isPublished: true,
        images: { create: { url: "https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=900&q=80", alt: "Paquete de yerba" } },
      },
    }),
    prisma.product.create({
      data: {
        categoryId: almacen.id,
        name: "Galletitas surtidas",
        slug: "galletitas-surtidas",
        shortDescription: "Para la merienda",
        description: "Mix dulce ideal para compartir.",
        priceCents: 3200,
        unitLabel: "pack",
        isPublished: true,
        images: { create: { url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80", alt: "Galletitas" } },
      },
    }),
    prisma.product.create({
      data: {
        categoryId: bebidas.id,
        name: "Gaseosa cola 2.25L",
        slug: "gaseosa-cola-225l",
        shortDescription: "Bien fría, va como piña",
        description: "Botella familiar retornable.",
        priceCents: 4100,
        unitLabel: "2.25L",
        isFeatured: true,
        isPublished: true,
        images: { create: { url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80", alt: "Gaseosa" } },
      },
    }),
    prisma.product.create({
      data: {
        categoryId: limpieza.id,
        name: "Detergente limón 750ml",
        slug: "detergente-limon-750ml",
        shortDescription: "Rinde y limpia bien",
        description: "Poder desengrasante con fragancia a limón.",
        priceCents: 2800,
        unitLabel: "750ml",
        isPublished: true,
        images: { create: { url: "https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=900&q=80", alt: "Detergente" } },
      },
    }),
  ]);

  const [yerba, galletitas, gaseosa] = products;

  const promo = await prisma.promotion.create({
    data: {
      code: "COMBO-FERNET",
      name: "Fernet + Coca + Hielo",
      description: "Llevando el combo, pagás un precio especial.",
      type: "fixed",
      scope: "order",
      amount: 2500,
      minSubtotalCents: 12000,
      startsAt: new Date("2026-04-01T00:00:00.000Z"),
      endsAt: new Date("2026-12-31T23:59:59.000Z"),
      products: { connect: [{ id: gaseosa.id }] },
    },
  });

  const customer = await prisma.customer.create({
    data: { fullName: "Lucía Fernández", phone: "5493515551234", email: "lucia@example.com" },
  });

  const order = await prisma.order.create({
    data: {
      code: "ALM-DEMO1",
      customerId: customer.id,
      promotionId: promo.id,
      fulfillmentType: "delivery",
      paymentMethod: "transfer",
      addressLine: "Av. Siempre Viva 742",
      subtotalCents: 11000,
      discountCents: 690,
      deliveryFeeCents: 0,
      totalCents: 10310,
      status: "confirmed",
      items: {
        create: [
          {
            productId: yerba.id,
            productName: yerba.name,
            productSlug: yerba.slug,
            unitPriceCents: yerba.priceCents,
            quantity: 1,
            lineTotalCents: yerba.priceCents,
          },
          {
            productId: galletitas.id,
            productName: galletitas.name,
            productSlug: galletitas.slug,
            unitPriceCents: galletitas.priceCents,
            quantity: 1,
            lineTotalCents: galletitas.priceCents,
          },
        ],
      },
    },
    include: { customer: true, items: true },
  });

  await prisma.order.update({ where: { id: order.id }, data: { whatsappUrl: buildOrderMessage(order) } });

  await prisma.order.create({
    data: {
      code: "ALM-DEMO2",
      customerId: customer.id,
      fulfillmentType: "pickup",
      paymentMethod: "cash",
      subtotalCents: gaseosa.priceCents,
      totalCents: gaseosa.priceCents,
      status: "placed",
      items: {
        create: {
          productId: gaseosa.id,
          productName: gaseosa.name,
          productSlug: gaseosa.slug,
          unitPriceCents: gaseosa.priceCents,
          quantity: 1,
          lineTotalCents: gaseosa.priceCents,
        },
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
