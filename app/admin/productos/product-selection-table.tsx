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
    <div className="space-y-3">
      {/* Barra de acciones masivas — solo aparece cuando hay selección activa */}
      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-[22px] border border-brand/30 bg-brand/5 px-4 py-3">
          <span className="text-sm font-semibold text-foreground">
            {selectedIds.length} seleccionado{selectedIds.length !== 1 ? "s" : ""}
          </span>
          <form action={setSelectedProductsPublished} className="w-full sm:w-auto">
            {selectedIds.map((productId) => (
              <input key={productId} type="hidden" name="productIds" value={productId} />
            ))}
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <input type="hidden" name="isPublished" value="true" />
            <Button className="w-full sm:w-auto" type="submit" size="sm">
              Publicar
            </Button>
          </form>
          <form action={setSelectedProductsPublished} className="w-full sm:w-auto">
            {selectedIds.map((productId) => (
              <input key={productId} type="hidden" name="productIds" value={productId} />
            ))}
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <input type="hidden" name="isPublished" value="false" />
            <Button className="w-full sm:w-auto" type="submit" size="sm" variant="outline">
              Despublicar
            </Button>
          </form>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="ml-auto text-sm text-muted-foreground underline-offset-2 hover:underline"
          >
            Limpiar selección
          </button>
        </div>
      ) : null}

      {products.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-border bg-background-muted/60 p-6 text-sm text-muted-foreground">
          No hay productos para los filtros actuales en esta página. Probá ajustar categoría, publicación o búsqueda.
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:hidden">
            {/* Select-all mobile */}
            <label className="flex items-center gap-3 px-1 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="size-5 rounded border-border"
                checked={allSelected}
                onChange={toggleSelectAll}
                aria-label="Seleccionar todos"
              />
              Seleccionar todos
            </label>
            {products.map((product) => {
              const isSelected = selectedIds.includes(product.id);

              return (
                <article key={product.id} className={isSelected ? "rounded-[22px] border border-brand/40 bg-brand/5 p-4 shadow-[0_12px_28px_rgba(214,109,49,0.12)]" : "admin-soft-panel rounded-[22px] p-4"}>
                  <div className="flex items-start justify-between gap-3">
                    <label className="flex min-h-11 min-w-0 flex-1 items-start gap-3">
                      <input
                        type="checkbox"
                        className="mt-0.5 size-5 rounded border-border"
                        checked={isSelected}
                        onChange={() => toggleSelection(product.id)}
                        aria-label={`Seleccionar ${product.name}`}
                      />
                      <span className="min-w-0">
                        <span className="block text-base font-bold text-foreground">{product.name}</span>
                        <span className="block text-sm text-muted-foreground">{product.sku ?? "Sin SKU"} · {product.category.name}</span>
                      </span>
                    </label>
                    <Badge className={product.isPublished ? publicationBadgeClassName.published : publicationBadgeClassName.unpublished}>
                      {product.isPublished ? "Publicado" : "Sin publicar"}
                    </Badge>
                  </div>

                  <div className="mt-4 grid gap-3 rounded-[20px] border border-border/70 bg-background-muted/60 p-3 text-sm">
                    <InfoRow label="Precio" value={formatCurrency(product.priceCents)} />
                    <InfoRow label="Stock" value={String(product.stockQuantity)} />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge className={product.isActive ? "border-cyan-200 bg-cyan-50 text-cyan-700" : "border-slate-200 bg-slate-100 text-slate-700"}>
                      {product.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                    <Badge className={product.stockMode === "in_stock" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}>
                      {product.stockMode === "in_stock" ? "Con stock" : "Sin stock"}
                    </Badge>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <form action={setProductPublished} className="w-full sm:w-auto">
                      <input type="hidden" name="id" value={product.id} />
                      <input type="hidden" name="isPublished" value={product.isPublished ? "false" : "true"} />
                      <input type="hidden" name="redirectTo" value={redirectTo} />
                      <Button className="w-full sm:w-auto" type="submit" variant={product.isPublished ? "outline" : "default"}>
                        {product.isPublished ? "Despublicar" : "Publicar"}
                      </Button>
                    </form>
                    <Link href={`/admin/productos/${product.id}`} className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground">
                      Editar
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hidden md:block">
            <Table>
              <THead>
                <tr>
                  <TH className="w-10">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      className="size-4 rounded border-border"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      aria-label="Seleccionar todos"
                    />
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
                          className="size-5 rounded border-border"
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
                            <button className="min-h-11 font-semibold text-brand" type="submit">
                              {product.isPublished ? "Despublicar" : "Publicar"}
                            </button>
                          </form>
                          <Link href={`/admin/productos/${product.id}`} className="inline-flex min-h-11 items-center font-semibold text-brand">
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
        </>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold text-foreground">{value}</span>
    </div>
  );
}
