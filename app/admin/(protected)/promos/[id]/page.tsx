import { notFound } from "next/navigation";
import { PromotionForm } from "@/app/admin/promos/promotion-form";
import { db } from "@/lib/db";

export default async function EditPromoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [promotion, products, categories] = await Promise.all([
    db.promotion.findUnique({ where: { id }, include: { products: true, categories: true } }),
    db.product.findMany({ orderBy: { name: "asc" } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!promotion) notFound();

  return <PromotionForm promotion={promotion} products={products} categories={categories} />;
}
