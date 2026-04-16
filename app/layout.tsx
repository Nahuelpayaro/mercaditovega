import type { Metadata } from "next";
import "@/app/globals.css";
import { publicEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: publicEnv.NEXT_PUBLIC_STORE_NAME,
  description: "Almacén barrial con pedidos por WhatsApp.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
