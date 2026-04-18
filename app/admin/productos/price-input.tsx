"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

export function PriceInput({
  name,
  defaultCents,
  required,
  placeholder = "0.00",
}: {
  name: string;
  defaultCents?: number | null;
  required?: boolean;
  placeholder?: string;
}) {
  const [pesos, setPesos] = useState(
    defaultCents != null ? (defaultCents / 100).toFixed(2) : "",
  );

  const cents = pesos.trim() ? String(Math.round(parseFloat(pesos) * 100)) : "";

  return (
    <>
      <Input
        type="number"
        step="0.01"
        min="0"
        value={pesos}
        onChange={(e) => setPesos(e.target.value)}
        required={required}
        placeholder={placeholder}
      />
      <input type="hidden" name={name} value={cents} />
    </>
  );
}
