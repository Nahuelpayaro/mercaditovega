"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/components/storefront/cart-provider";

export function OrderSuccessClient() {
  const { clearCart } = useCart();
  const hasClearedRef = useRef(false);

  useEffect(() => {
    if (hasClearedRef.current) return;
    hasClearedRef.current = true;
    clearCart();
  }, [clearCart]);

  return null;
}
