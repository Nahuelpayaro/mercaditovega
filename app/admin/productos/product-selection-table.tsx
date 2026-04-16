"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { setProductPublished, setSelectedProductsPublished } from "@/app/admin/productos/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TBody, TD, TH, THead } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

type ProductRow = {
  id: string;
  sku: string | null;
  name: string;
  priceCents: number;
  stockQuantity: number;
  isPublished: boolean;
  isActive: boolean;
  stockMode: string;
  category: {
    name: string;
  };
};

const publicationBadgeClassName: Record<string, string> = {
  published: "border-green-200 bg-green-50 text-green-700",
  unpublished: "border-amber-200 bg-amber-50 text-amber-700",
};

export function ProductSelectionTable({ products, redirectTo }: { products: ProductRow[]; redirectTo: string }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectAllRef = useRef<HTMLInputElement>(null);

  const selectableIds = products.map((product) => product.id);
  const allSelected = selectableIds.length > 0 && selectedIds.length === selectableIds.length;
  const hasPartialSelection = selectedIds.length > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = hasPartialSelection;
    }
  }, [hasPartialSelection]);

  function toggleSelection(productId: string) {
    setSelectedIds((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId],
    );
  }

  function toggleSelectAll() {
    setSelectedIds((current) => (current.length === selectableIds.length ? [] : selectableIds));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-[24px] border border-border bg-white/80 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">Selección manual sobre la vista actual</p>
          <p className="text-sm text-muted-foreground">
            {selectedIds.length} seleccionados de {products.length} visibles. La acción respeta los filtros activos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2 text-sm font-medium text-foreground">
            <input
              ref={selectAllRef}
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              aria-label="Seleccionar productos visibles"
            />
            Seleccionar visibles
          </label>

          <form action={setSelectedProductsPublished}>
            {selectedIds.map((productId) => (
              <input key={productId} type="hidden" name="productIds" value={productId} />
            ))}
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <input type="hidden" name="isPublished" value="true" />
            <Button type="submit" disabled={selectedIds.length === 0}>
              Publicar seleccionados
            </Button>
          </form>
          <form action={setSelectedProductsPublished}>
            {selectedIds.map((productId) => (
              <input key={productId} type="hidden" name="productIds" value={productId} />
            ))}
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <input type="hidden" name="isPublished" value="false" />
            <Button type="submit" variant="outline" disabled={selectedIds.length === 0}>
              Despublicar seleccionados
            </Button>
          </form>
        </div>
      </div>

      <Table>
        <THead>
          <tr>
            <TH className="w-14">
              <span className="sr-only">Seleccionar</span>
            </TH>
            <TH>Código</TH>
            <TH>Producto</TH>
            <TH>Categoría</TH>
            <TH>Precio</TH>
            <TH>Stock</TH>
            <TH>Publicación</TH>
            <TH>Estado</TH>
            <TH></TH>
          </tr>
        </THead>
        <TBody>
          {products.map((product) => {
            const isSelected = selectedIds.includes(product.id);

            return (
              <tr key={product.id} className={isSelected ? "bg-brand/5" : undefined}>
                <TD>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelection(product.id)}
                    aria-label={`Seleccionar ${product.name}`}
                  />
                </TD>
                <TD>{product.sku ?? "—"}</TD>
                <TD>{product.name}</TD>
                <TD>{product.category.name}</TD>
                <TD>{formatCurrency(product.priceCents)}</TD>
                <TD>{product.stockQuantity}</TD>
                <TD>
                  <Badge className={product.isPublished ? publicationBadgeClassName.published : publicationBadgeClassName.unpublished}>
                    {product.isPublished ? "Publicado" : "Sin publicar"}
                  </Badge>
                </TD>
                <TD>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={product.isActive ? "border-cyan-200 bg-cyan-50 text-cyan-700" : "border-slate-200 bg-slate-100 text-slate-700"}>
                      {product.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                    <Badge className={product.stockMode === "in_stock" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}>
                      {product.stockMode === "in_stock" ? "Con stock" : "Sin stock"}
                    </Badge>
                  </div>
                </TD>
                <TD>
                  <div className="flex flex-wrap items-center gap-3">
                    <form action={setProductPublished}>
                      <input type="hidden" name="id" value={product.id} />
                      <input type="hidden" name="isPublished" value={product.isPublished ? "false" : "true"} />
                      <input type="hidden" name="redirectTo" value={redirectTo} />
                      <button className="font-semibold text-brand" type="submit">
                        {product.isPublished ? "Despublicar" : "Publicar"}
                      </button>
                    </form>
                    <Link href={`/admin/productos/${product.id}`} className="font-semibold text-brand">
                      Editar
                    </Link>
                  </div>
                </TD>
              </tr>
            );
          })}
        </TBody>
      </Table>
    </div>
  );
}
