import { notFound } from "next/navigation";
import { PromotionForm } from "@/app/admin/promos/promotion-form";
import { ParamsPageProps } from "@/lib/next-page-props";
import { db } from "@/lib/db";

type EditPromoPageProps = ParamsPageProps<{ id: string }>;

export default async function EditPromoPage({ params }: EditPromoPageProps) {
  const { id } = await params;
  const [promotion, products, categories] = await Promise.all([
    db.promotion.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
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
    }),
    db.product.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    db.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!promotion) notFound();

  return <PromotionForm promotion={promotion} products={products} categories={categories} />;
}
