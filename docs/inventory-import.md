# Importación de inventario real

La app puede sincronizar productos desde el export tabulado del sistema del local (`.xls` textual en ISO-8859-1, separado por tabs).

## Fuente esperada

Columnas obligatorias:

- `Codigo`
- `Descripcion`
- `Precio Costo`
- `Precio Venta`
- `Precio Mayoreo`
- `Inventario`
- `Inv. Minimo`
- `Departamento`

## Comandos

Preview sin escribir en DB:

```bash
pnpm inventory:import --file "/Users/nahuelpayaro/Downloads/InventariomV.xls" --dry-run
```

Importación real:

```bash
pnpm inventory:import --file "/Users/nahuelpayaro/Downloads/InventariomV.xls"
```

## Política de importación

- `Codigo` se usa como identificador estable y se guarda en `Product.sku`.
- `Departamento` crea o reutiliza categorías por `slug`.
- El importador hace upsert por `sku`.
- Actualiza categoría, nombre, costo, precio de venta, precio mayorista, stock actual, stock mínimo y `stockMode`.
- `stockMode` se deriva automáticamente: stock `> 0` => `in_stock`; stock `<= 0` => `out_of_stock`.
- Los slugs de productos importados se generan una sola vez en altas nuevas usando `descripcion + codigo`; en updates no se pisan para mantener URLs estables.
- No elimina productos faltantes del archivo; solamente crea o actualiza.
- No toca imágenes ni textos comerciales (`description`, `shortDescription`) ya existentes.

## Recomendación operativa

Corré primero el `--dry-run` para validar cantidades y categorías nuevas antes de ejecutar la importación real.
