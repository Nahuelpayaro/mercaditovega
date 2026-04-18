import { PromotionForm } from "@/app/admin/promos/promotion-form";
import { db } from "@/lib/db";

export default async function NewPromoPage() {
  const [products, categories] = await Promise.all([
    db.product.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return <PromotionForm products={products} categories={categories} />;
}
