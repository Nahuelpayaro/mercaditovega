import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { publicEnv } from "@/lib/env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(valueInCents: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: publicEnv.NEXT_PUBLIC_STORE_CURRENCY,
    maximumFractionDigits: 0,
  }).format(valueInCents / 100);
}

export function formatDateTime(value: string | Date) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function cleanPhone(value: string) {
  return value.replace(/\D/g, "");
}

export function formatPaymentMethod(value: "cash" | "transfer" | "mercado_pago_link") {
  const labels = {
    cash: "Efectivo",
    transfer: "Transferencia",
    mercado_pago_link: "Link Mercado Pago",
  } as const;

  return labels[value];
}

export function generateOrderCode() {
  return `ALM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
