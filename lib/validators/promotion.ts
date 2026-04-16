import { z } from "zod";

export const promotionSchema = z
  .object({
    id: z.string().optional(),
    code: z.string().min(3).transform((value) => value.toUpperCase()),
    name: z.string().min(2),
    description: z.string().optional(),
    type: z.enum(["percentage", "fixed"]),
    scope: z.enum(["order", "category", "product"]),
    amount: z.coerce.number().int().positive(),
    minSubtotalCents: z.coerce.number().int().nonnegative().optional().nullable(),
    startsAt: z.string().min(1),
    endsAt: z.string().min(1),
    isActive: z.boolean().default(true),
    productIds: z.array(z.string()).default([]),
    categoryIds: z.array(z.string()).default([]),
  })
  .refine((value) => new Date(value.endsAt) > new Date(value.startsAt), {
    message: "La fecha de fin debe ser posterior al inicio.",
    path: ["endsAt"],
  });

export type PromotionInput = z.infer<typeof promotionSchema>;
