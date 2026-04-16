import { CartProvider } from "@/components/storefront/cart-provider";
import { StoreShell } from "@/components/storefront/store-shell";

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <StoreShell>{children}</StoreShell>
    </CartProvider>
  );
}
