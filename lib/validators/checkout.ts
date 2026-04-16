import { z } from "zod";
import { cleanPhone } from "@/lib/utils";

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  priceCents: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
});

export const checkoutSchema = z
  .object({
    fullName: z.string().min(2, "Ingresá tu nombre completo."),
    phone: z
      .string()
      .optional()
      .or(z.literal(""))
      .transform((value) => {
        const cleaned = cleanPhone(value ?? "");
        return cleaned || undefined;
      }),
    email: z.string().email().optional().or(z.literal("")),
    fulfillmentType: z.enum(["delivery", "pickup"]),
    addressLine: z.string().optional(),
    postalCode: z.string().optional(),
    notes: z.string().optional(),
    paymentMethod: z.enum(["cash", "transfer", "mercado_pago_link"]),
    promoCode: z.string().optional().transform((value) => value?.trim().toUpperCase() || undefined),
    items: z.array(cartItemSchema).min(1, "Tu carrito está vacío."),
  })
  .superRefine((value, ctx) => {
    if (value.fulfillmentType === "delivery") {
      if (!value.addressLine) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["addressLine"], message: "Ingresá la dirección." });
      }
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
