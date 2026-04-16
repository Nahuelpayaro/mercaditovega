import { notFound } from "next/navigation";
import { ProductCard } from "@/components/storefront/product-card";
import { PageHeader } from "@/components/ui/page-header";
import { getProductsByCategory } from "@/lib/storefront";

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getProductsByCategory(slug);

  if (!category) notFound();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Categoría"
        title={category.name}
        description={category.description || "Todo lo que está activo hoy, ordenado para comprar rápido desde el celu."}
        actions={<div className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-muted-foreground">{category.products.length} productos</div>}
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
        {category.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
