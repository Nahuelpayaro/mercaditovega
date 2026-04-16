import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z.string().min(1),
  ADMIN_CONTACT_NAME: z.string().default("Mostrador"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_STORE_NAME: z.string().default("Almacén de Barrio"),
  NEXT_PUBLIC_STORE_WHATSAPP_PHONE: z.string().min(8),
  NEXT_PUBLIC_STORE_CURRENCY: z.string().default("ARS"),
});

export const serverEnv = serverSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/negocio",
  ADMIN_CONTACT_NAME: process.env.ADMIN_CONTACT_NAME,
});

export const publicEnv = clientSchema.parse({
  NEXT_PUBLIC_STORE_NAME: process.env.NEXT_PUBLIC_STORE_NAME ?? "Almacén de Barrio",
  NEXT_PUBLIC_STORE_WHATSAPP_PHONE: process.env.NEXT_PUBLIC_STORE_WHATSAPP_PHONE ?? "5491122334455",
  NEXT_PUBLIC_STORE_CURRENCY: process.env.NEXT_PUBLIC_STORE_CURRENCY ?? "ARS",
});
