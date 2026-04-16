import { notFound } from "next/navigation";
import { ProductForm } from "@/app/admin/productos/product-form";
import { db } from "@/lib/db";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    db.product.findUnique({ include: { images: true }, where: { id } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  return <ProductForm categories={categories} product={product} />;
}
