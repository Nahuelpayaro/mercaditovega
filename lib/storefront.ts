import { db } from "@/lib/db";

const visibleStorefrontProductWhere = {
  isActive: true,
  isPublished: true,
  stockMode: "in_stock" as const,
  category: {
    isActive: true,
  },
};

const visibleCategoryProductWhere = {
  isActive: true,
  isPublished: true,
  stockMode: "in_stock" as const,
};

export async function getHomeData() {
  const [categories, products, promotions] = await Promise.all([
    db.category.findMany({
      where: {
        isActive: true,
        products: { some: visibleCategoryProductWhere },
      },
      orderBy: { name: "asc" },
    }),
    db.product.findMany({
      where: visibleStorefrontProductWhere,
      include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
      take: 12,
    }),
    db.promotion.findMany({ where: { isActive: true }, orderBy: { startsAt: "desc" }, take: 3 }),
  ]);

  return { categories, products, promotions };
}

export async function getProductsByCategory(slug: string) {
  return db.category.findFirst({
    where: {
      slug,
      isActive: true,
      products: { some: visibleCategoryProductWhere },
    },
    include: {
      products: {
        where: visibleStorefrontProductWhere,
        include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
        orderBy: { name: "asc" },
      },
    },
  });
}

export async function searchProducts(query: string) {
  return db.product.findMany({
    where: {
      ...visibleStorefrontProductWhere,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    include: { images: { orderBy: { position: "asc" }, take: 1 }, category: true },
    orderBy: { name: "asc" },
  });
}

export async function getProductBySlug(slug: string) {
  return db.product.findFirst({
    where: { slug, ...visibleStorefrontProductWhere },
    include: { images: { orderBy: { position: "asc" } }, category: true },
  });
}

export async function getActivePromotions() {
  return db.promotion.findMany({
    where: { isActive: true },
    include: { categories: true, products: true },
    orderBy: { startsAt: "desc" },
  });
}

export async function getOrderByCode(code: string) {
  return db.order.findUnique({
    where: { code },
    include: { customer: true, items: true, promotion: true },
  });
}
