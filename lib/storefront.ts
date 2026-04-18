import { db } from "@/lib/db";

export const STOREFRONT_PRODUCTS_PER_PAGE = 24;
export const STOREFRONT_SEARCH_MIN_QUERY_LENGTH = 2;

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

function getPromotionWindowWhere(now: Date) {
  return {
    isActive: true,
    startsAt: { lte: now },
    endsAt: { gte: now },
  };
}

const storefrontProductCardSelect = {
  id: true,
  slug: true,
  name: true,
  shortDescription: true,
  priceCents: true,
  compareAtCents: true,
  stockMode: true,
  category: { select: { id: true, name: true } },
  images: { select: { url: true, alt: true }, orderBy: { position: "asc" as const }, take: 1 },
} as const;

export async function getHomeData() {
  const now = new Date();

  const [categories, products, promotions] = await Promise.all([
    db.category.findMany({
      where: {
        isActive: true,
        products: { some: visibleCategoryProductWhere },
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    }),
    db.product.findMany({
      where: visibleStorefrontProductWhere,
      select: storefrontProductCardSelect,
      orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
      take: 12,
    }),
    db.promotion.findMany({
      where: getPromotionWindowWhere(now),
      orderBy: { startsAt: "desc" },
      take: 3,
      select: {
        id: true,
        name: true,
        description: true,
      },
    }),
  ]);

  return { categories, products, promotions };
}

export async function getCategoryPageData(slug: string, page: number, pageSize = STOREFRONT_PRODUCTS_PER_PAGE) {
  const category = await db.category.findFirst({
    where: {
      slug,
      isActive: true,
      products: { some: visibleCategoryProductWhere },
    },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });

  if (!category) {
    return null;
  }

  const where = {
    ...visibleStorefrontProductWhere,
    categoryId: category.id,
  };
  const totalProducts = await db.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));
  const currentPage = Math.min(page, totalPages);
  const products = await db.product.findMany({
    where,
    select: storefrontProductCardSelect,
    orderBy: { name: "asc" },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  return {
    ...category,
    currentPage,
    totalPages,
    totalProducts,
    products,
  };
}

export async function searchProducts(query: string, page: number, pageSize = STOREFRONT_PRODUCTS_PER_PAGE) {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < STOREFRONT_SEARCH_MIN_QUERY_LENGTH) {
    return { products: [], totalProducts: 0, normalizedQuery, currentPage: 1, totalPages: 1 };
  }

  const where = {
    ...visibleStorefrontProductWhere,
    OR: [
      { name: { contains: normalizedQuery, mode: "insensitive" as const } },
      { description: { contains: normalizedQuery, mode: "insensitive" as const } },
    ],
  };

  const totalProducts = await db.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));
  const currentPage = Math.min(page, totalPages);
  const products = await db.product.findMany({
    where,
    select: storefrontProductCardSelect,
    orderBy: { name: "asc" },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });

  return {
    currentPage,
    totalPages,
    products,
    totalProducts,
    normalizedQuery,
  };
}

export async function getProductsByCategory(slug: string) {
  const result = await getCategoryPageData(slug, 1, STOREFRONT_PRODUCTS_PER_PAGE);

  if (!result) {
    return null;
  }

  return {
    ...result,
    products: result.products,
  };
}

export async function getProductBySlug(slug: string) {
  return db.product.findFirst({
    where: {
      slug,
      ...visibleStorefrontProductWhere,
    },
    include: { images: { orderBy: { position: "asc" } }, category: { select: { id: true, name: true } } },
  });
}

export async function getActivePromotions() {
  const now = new Date();

  return db.promotion.findMany({
    where: getPromotionWindowWhere(now),
    select: {
      id: true,
      code: true,
      type: true,
      scope: true,
      amount: true,
      minSubtotalCents: true,
      startsAt: true,
      endsAt: true,
      isActive: true,
      products: { select: { id: true } },
      categories: { select: { id: true } },
    },
    orderBy: { startsAt: "desc" },
  });
}

export async function getOrderByCode(code: string) {
  return db.order.findUnique({
    where: { code },
    include: { customer: true, items: true, promotion: true },
  });
}
