import { notFound } from "next/navigation";
import { ProductCard } from "@/components/storefront/product-card";
import { PageHeader } from "@/components/ui/page-header";
import { ParamsPageProps } from "@/lib/next-page-props";
import { getProductsByCategory } from "@/lib/storefront";

type CategoryPageProps = ParamsPageProps<{ slug: string }>;
type CategoryData = NonNullable<Awaited<ReturnType<typeof getProductsByCategory>>>;
type CategoryProduct = CategoryData["products"][number];

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getProductsByCategory(slug);

  if (!category) notFound();

  const products: CategoryProduct[] = category.products;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Categoría"
        title={category.name}
        description={category.description || "Todo lo que está activo hoy, ordenado para comprar rápido desde el celu."}
        actions={<div className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-muted-foreground">{products.length} productos</div>}
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
