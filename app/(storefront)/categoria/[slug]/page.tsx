import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListPagination } from "@/components/storefront/list-pagination";
import { ProductCard } from "@/components/storefront/product-card";
import { PageHeader } from "@/components/ui/page-header";
import { publicEnv } from "@/lib/env";
import { ParamsAndSearchPageProps } from "@/lib/next-page-props";
import { getCategoryPageData, STOREFRONT_PRODUCTS_PER_PAGE } from "@/lib/storefront";

type CategoryPageProps = ParamsAndSearchPageProps<{ slug: string }, { page?: string }>;
type CategoryData = NonNullable<Awaited<ReturnType<typeof getCategoryPageData>>>;
type CategoryProduct = CategoryData["products"][number];

export const revalidate = 120;

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryPageData(slug, 1, 1);

  if (!category) return {};

  const storeName = publicEnv.NEXT_PUBLIC_STORE_NAME;
  const description =
    category.description ??
    `${category.totalProducts} productos en ${category.name}. Comprá fácil desde el celu.`;

  return {
    title: category.name,
    description,
    openGraph: {
      title: `${category.name} — ${storeName}`,
      description,
      type: "website",
    },
  };
}

function parsePage(value?: string) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return 1;
  }

  return parsed;
}

function buildCategoryHref(slug: string, page: number) {
  return page > 1 ? `/categoria/${slug}?page=${page}` : `/categoria/${slug}`;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page: rawPage } = await searchParams;
  const category = await getCategoryPageData(slug, parsePage(rawPage));

  if (!category) notFound();

  const products: CategoryProduct[] = category.products;
  const listStart = category.totalProducts === 0 ? 0 : (category.currentPage - 1) * STOREFRONT_PRODUCTS_PER_PAGE + 1;
  const listEnd = category.totalProducts === 0 ? 0 : listStart + products.length - 1;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Categoría"
        title={category.name}
        description={category.description || "Todo lo que está activo hoy, ordenado para comprar rápido desde el celu."}
        actions={<div className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-muted-foreground">{category.totalProducts} productos</div>}
      />

      <div className="rounded-[24px] border border-border bg-white/80 p-4 text-sm text-muted-foreground">
        Mostrando {listStart}-{listEnd} de {category.totalProducts} productos para cuidar TTFB y no inflar HTML al santo botón.
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <ListPagination
        currentPage={category.currentPage}
        totalPages={category.totalPages}
        previousHref={category.currentPage > 1 ? buildCategoryHref(slug, category.currentPage - 1) : undefined}
        nextHref={category.currentPage < category.totalPages ? buildCategoryHref(slug, category.currentPage + 1) : undefined}
        summary={`Vista paginada de a ${STOREFRONT_PRODUCTS_PER_PAGE} productos para mantener liviana la categoría.`}
      />
    </div>
  );
}
