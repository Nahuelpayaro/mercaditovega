"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type Scope = "order" | "category" | "product";
type Item = { id: string; name: string };

const SEARCH_RESULTS_LIMIT = 40;
const SEARCH_MIN_LENGTH = 2;

export function PromotionTargetFields({
  products,
  categories,
  initialScope,
  initialProductIds,
  initialCategoryIds,
}: {
  products: Item[];
  categories: Item[];
  initialScope: Scope;
  initialProductIds: string[];
  initialCategoryIds: string[];
}) {
  const [scope, setScope] = useState<Scope>(initialScope);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(initialProductIds);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(initialCategoryIds);
  const [productQuery, setProductQuery] = useState("");
  const [categoryQuery, setCategoryQuery] = useState("");

  const productItemsById = useMemo(() => new Map(products.map((item) => [item.id, item] as const)), [products]);
  const categoryItemsById = useMemo(() => new Map(categories.map((item) => [item.id, item] as const)), [categories]);

  return (
    <section className="grid gap-4 rounded-[24px] border border-border bg-white/80 p-4">
      <div className="max-w-sm">
        <Label htmlFor="scope">Aplica a</Label>
        <Select id="scope" name="scope" value={scope} onChange={(event) => setScope(event.target.value as Scope)}>
          <option value="order">Pedido completo</option>
          <option value="category">Categorías</option>
          <option value="product">Productos</option>
        </Select>
      </div>

      {scope === "order" ? (
        <div className="rounded-[22px] border border-border/70 bg-background-muted/70 p-4 text-sm text-muted-foreground">
          Esta promo aplica al pedido completo. No hace falta vincular nada más.
        </div>
      ) : null}

      {scope === "product" ? (
        <TargetPicker
          items={products}
           itemsById={productItemsById}
            label="Productos vinculados"
            helper="Buscá por nombre y agregá sólo lo necesario."
          inputName="productIds"
          query={productQuery}
          onQueryChange={setProductQuery}
          searchPlaceholder="Buscá productos por nombre..."
          selectedIds={selectedProductIds}
          onSelectedIdsChange={setSelectedProductIds}
        />
      ) : null}

      {scope === "category" ? (
        <TargetPicker
          items={categories}
            itemsById={categoryItemsById}
            label="Categorías vinculadas"
            helper="Elegí sólo las categorías objetivo."
          inputName="categoryIds"
          query={categoryQuery}
          onQueryChange={setCategoryQuery}
          searchPlaceholder="Buscá categorías por nombre..."
          selectedIds={selectedCategoryIds}
          onSelectedIdsChange={setSelectedCategoryIds}
        />
      ) : null}
    </section>
  );
}

function TargetPicker({
  items,
  itemsById,
  label,
  helper,
  inputName,
  query,
  onQueryChange,
  searchPlaceholder,
  selectedIds,
  onSelectedIdsChange,
}: {
  items: Item[];
  itemsById: Map<string, Item>;
  label: string;
  helper: string;
  inputName: string;
  query: string;
  onQueryChange: (value: string) => void;
  searchPlaceholder: string;
  selectedIds: string[];
  onSelectedIdsChange: (value: string[]) => void;
}) {
  const normalizedQuery = query.trim().toLowerCase();
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const selectedItems = selectedIds
    .map((id) => itemsById.get(id))
    .filter((item): item is Item => Boolean(item));

  const visibleResults = useMemo(() => {
    if (normalizedQuery.length < SEARCH_MIN_LENGTH) {
      return [];
    }

    return items.filter((item) => !selectedSet.has(item.id) && item.name.toLowerCase().includes(normalizedQuery)).slice(0, SEARCH_RESULTS_LIMIT);
  }, [items, normalizedQuery, selectedSet]);

  const hasMoreMatches =
    normalizedQuery.length >= SEARCH_MIN_LENGTH &&
    items.filter((item) => !selectedSet.has(item.id) && item.name.toLowerCase().includes(normalizedQuery)).length > SEARCH_RESULTS_LIMIT;

  function addItem(id: string) {
    onSelectedIdsChange([...selectedIds, id]);
  }

  function removeItem(id: string) {
    onSelectedIdsChange(selectedIds.filter((entry) => entry !== id));
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label>{label}</Label>
        <p className="text-sm text-muted-foreground">{helper}</p>
      </div>

      {selectedIds.map((id) => (
        <input key={id} type="hidden" name={inputName} value={id} />
      ))}

      <div className="rounded-[22px] border border-border bg-background-muted/60 p-4">
        <Input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder={searchPlaceholder} />
        <p className="mt-2 text-xs text-muted-foreground">
          {items.length} opciones disponibles. Escribí al menos {SEARCH_MIN_LENGTH} letras para filtrar.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Seleccionados ({selectedItems.length})</p>
        {selectedItems.length ? (
          <div className="flex flex-wrap gap-2">
            {selectedItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => removeItem(item.id)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground"
              >
                <span>{item.name}</span>
                <span className="text-muted-foreground">×</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="rounded-[22px] border border-dashed border-border bg-white/80 p-4 text-sm text-muted-foreground">Todavía no seleccionaste nada.</p>
        )}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Resultados</p>
        {normalizedQuery.length < SEARCH_MIN_LENGTH ? (
          <p className="rounded-[22px] border border-dashed border-border bg-white/80 p-4 text-sm text-muted-foreground">
            Escribí un término corto para filtrar rápido.
          </p>
        ) : visibleResults.length ? (
          <div className="grid gap-2">
            {visibleResults.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-[22px] border border-border bg-white p-3">
                <span className="text-sm font-medium text-foreground">{item.name}</span>
                <Button type="button" size="sm" variant="outline" onClick={() => addItem(item.id)}>
                  Agregar
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-[22px] border border-dashed border-border bg-white/80 p-4 text-sm text-muted-foreground">
            No encontramos coincidencias con esa búsqueda.
          </p>
        )}

        {hasMoreMatches ? <p className="text-xs text-muted-foreground">Mostramos los primeros {SEARCH_RESULTS_LIMIT} resultados. Afiná la búsqueda para encontrar más rápido.</p> : null}
      </div>
    </div>
  );
}
