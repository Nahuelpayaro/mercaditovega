# Apply Progress: Almacén WhatsApp MVP

## Mode

Standard (OpenSpec)

## Completed Tasks

- [x] 1.1 Initialize Next.js App Router bootstrap files
- [x] 1.2 Add Prisma/PostgreSQL env and client wiring
- [x] 1.3 Create shared storefront/admin shells and shadcn-style primitives
- [x] 1.4 Add lint/typecheck/test/dev scripts and seed entrypoints
- [x] 2.1 Define Prisma schema for catalog, promos, customers, orders, and zones
- [x] 2.2 Add Zod validators for products, promos, zones, and checkout
- [x] 2.3 Implement pricing, promo, and delivery calculation modules
- [x] 2.4 Implement order creation/status machine/payment provider contract
- [x] 3.1 Build storefront home, category, search, and product pages
- [x] 3.2 Implement persistent localStorage cart and cart page
- [x] 3.3 Build guest checkout form with delivery/pickup branching
- [x] 3.4 Reprice and persist orders via server action, then redirect to confirmation
- [x] 3.5 Generate WhatsApp handoff only after order persistence
- [x] 4.1 Build admin dashboard, order list, and order detail views
- [x] 4.2 Restrict admin manual transitions through the status machine
- [x] 4.3 Build product/category CRUD flows
- [x] 4.4 Build promo and delivery zone CRUD flows
- [x] 4.5 Add read-only customer lookup with recent orders
- [x] 5.1 Seed realistic demo data for storefront/admin validation
- [x] 5.2 Add upload API stub and keep image flow integration-ready
- [x] 5.3 Add focused Vitest coverage for pricing, checkout validation, status machine, and WhatsApp formatting
- [x] 5.4 Verify implemented scenarios via route/action wiring plus lint/typecheck/test passes

## Files Changed

- `app/(storefront)/*` — storefront routes for browse, search, cart, checkout, and confirmation
- `app/admin/*` — admin dashboard plus CRUD/order/customer pages and actions
- `app/api/uploads/route.ts` — future upload signature stub
- `components/storefront/*` — client cart state, product cards, checkout UI, confirmation cleanup
- `components/admin/*` — admin shell and status badges
- `components/ui/*` — shared MVP UI primitives
- `lib/{cart,db,env,orders,payments,pricing,validators,whatsapp}/*` — domain logic and contracts
- `prisma/schema.prisma` — PostgreSQL schema
- `prisma/seed.ts` — realistic demo dataset
- `package.json`, `eslint.config.mjs`, `vitest.config.ts`, `tailwind.config.ts`, `postcss.config.mjs` — tooling bootstrap

## Deviations from Design

- Admin authentication remains intentionally unimplemented, matching the open question in design and the explicit no-customer-auth constraint.
- Mercado Pago and uploads are integration-ready stubs, not live external integrations, per MVP scope.

## Issues Found

- Pure-module tests initially failed because top-level env parsing required a live `DATABASE_URL`; this was fixed with safe development defaults in `lib/env.ts`.

## Follow-up Adjustments (post-verify)

- Added repository-seam integration coverage for `createOrder` so checkout persistence, repricing, customer upsert, promo handling, Mercado Pago intent creation, and WhatsApp URL persistence now have runtime evidence.
- Added focused runtime verification for storefront browse/search rendering, cart storage restore/fallback, and confirmation-page WhatsApp gating.
- Changed admin order status updates to redirect back with a clear success/error message instead of failing as an opaque server throw on invalid transitions.
- Updated Vitest JSX handling so route/component rendering tests run cleanly without introducing build-only steps.
- Added node-only runtime proof for add-from-card behavior, unavailable purchase prevention from listing controls, invalid promo cart feedback/pricing, active delivery-zone eligibility, and checkout delivery-zone rendering.
- Expanded admin product/promo/zone mutations to revalidate the affected storefront and checkout paths so publish operations now have direct propagation evidence.

## Verification

- `npm run db:generate`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run typecheck` (follow-up)
- `npm run lint` (follow-up)
- `npm test` (follow-up, 10 files / 17 tests passed)
- `npm run typecheck` (focused follow-up)
- `npm run lint` (focused follow-up)
- `npm test` (focused follow-up, 15 files / 24 tests passed)

## Status

22/22 tasks complete. Critical spec-evidence gaps addressed in follow-up; ready for re-verify.
