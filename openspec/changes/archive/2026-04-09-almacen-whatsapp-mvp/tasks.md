# Tasks: Almacén WhatsApp MVP

## Phase 1: Bootstrap / Foundation

- [x] 1.1 Initialize `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.*`, `tailwind.config.*`, and `app/layout.tsx` for a single Next.js App Router app.
- [x] 1.2 Add `prisma.config.*`, `.env.example`, `lib/db.ts`, and `lib/env.ts` for PostgreSQL/Prisma connectivity and typed runtime config.
- [x] 1.3 Create shared shell files `app/globals.css`, `components/ui/*`, `components/storefront/store-shell.tsx`, and `components/admin/admin-shell.tsx`.
- [x] 1.4 Set up baseline quality/dev scripts plus placeholders in `package.json`, `eslint.config.*`, and `prisma/seed.ts` so later tasks have runnable entry points.

## Phase 2: Data Model / Core Domain

- [x] 2.1 Define `prisma/schema.prisma` models/enums for `Category`, `Product`, `ProductImage`, `Promotion`, `DeliveryZone`, `Customer`, `Order`, and `OrderItem`.
- [x] 2.2 Create `lib/validators/{product,promotion,zone,checkout}.ts` with Zod schemas matching admin and checkout requirements.
- [x] 2.3 Implement `lib/pricing/{cart-pricing,promotions,delivery}.ts` for subtotal, single-promo validation, zone fee/minimum, and authoritative totals.
- [x] 2.4 Implement `lib/orders/{create-order,status-machine}.ts` plus `lib/payments/provider.ts` contract for order persistence and allowed status transitions.

## Phase 3: Storefront / Cart / Checkout

- [x] 3.1 Build catalog routes `app/(storefront)/page.tsx`, `categoria/[slug]/page.tsx`, `buscar/page.tsx`, and `producto/[slug]/page.tsx` with active-only listings.
- [x] 3.2 Add cart state in `components/storefront/cart-provider.tsx`, `lib/cart/storage.ts`, and `app/(storefront)/carrito/page.tsx` with localStorage restore/update feedback.
- [x] 3.3 Build checkout UI in `app/(storefront)/checkout/page.tsx` and `components/storefront/checkout-form.tsx` with delivery vs pickup conditional fields.
- [x] 3.4 Implement checkout mutation in `app/(storefront)/checkout/actions.ts`, reprice on the server, persist order/customer, and redirect to `pedido/[code]/page.tsx`.
- [x] 3.5 Create `lib/whatsapp/build-order-message.ts` and confirmation UI that shows order code, summary, and `wa.me` handoff only after persistence.

## Phase 4: Admin Operations

- [x] 4.1 Create `app/admin/page.tsx`, `pedidos/page.tsx`, and `pedidos/[id]/page.tsx` with order list/detail views backed by Prisma queries.
- [x] 4.2 Add admin order actions in `app/admin/pedidos/actions.ts` using `lib/orders/status-machine.ts` to allow only valid manual transitions.
- [x] 4.3 Build product/category CRUD in `app/admin/productos/*` plus forms/tables using `lib/validators/product.ts`.
- [x] 4.4 Build promo and zone CRUD in `app/admin/promos/*` and `app/admin/zonas/*`, ensuring checkout only exposes active configured zones.
- [x] 4.5 Add `app/admin/clientes/page.tsx` read-only lookup for persisted checkout customers and recent orders.

## Phase 5: Polish / Seeding / Verification

- [x] 5.1 Populate `prisma/seed.ts` with demo categories, products, two delivery zones, one promo, and sample orders/customers.
- [x] 5.2 Add `app/api/uploads/route.ts` contract stub plus product image metadata flow for future signed uploads without blocking MVP launch.
- [x] 5.3 Create focused tests for `lib/pricing/*`, `lib/whatsapp/build-order-message.ts`, `lib/orders/status-machine.ts`, and checkout validation scenarios.
- [x] 5.4 Verify spec scenarios end-to-end: browse/search, add unavailable item rejection, cart restore, conditional checkout, WhatsApp confirmation, and invalid admin transition handling.
