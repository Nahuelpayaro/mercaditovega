# Proposal: Almacén WhatsApp MVP

## Intent

Launch a SIMPLE mobile-first ordering MVP for a neighborhood grocery store that lets customers browse products, keep a cart, place guest orders, and continue checkout in WhatsApp while the store manages catalog, promos, zones, and order statuses from an admin dashboard.

## Scope

### In Scope
- Mobile-first storefront: home, search, categories, promos, product cards/grid, cart persistence.
- Guest checkout: customer + fulfillment + payment data, DB order persistence, WhatsApp summary link.
- Admin dashboard: orders, manual status changes, products, promos, delivery zones, customer persistence.

### Out of Scope
- Customer auth, marketplace/multi-store, online payment capture, real-time courier tracking.
- Full loyalty engine, notifications automation, ERP/POS integrations, advanced analytics.

## Approach

Use Next.js App Router + TypeScript with Tailwind/shadcn for a fast responsive UI. Persist catalog, customers, orders, promos, and zones in PostgreSQL via Prisma; validate writes with Zod through Server Actions/Route Handlers. Keep client state minimal: localStorage cart + server-sourced data. Define a payment adapter boundary so Mercado Pago can be added later without changing checkout flow.

Phasing: **Phase 1** storefront + cart + checkout + DB + WhatsApp summary. **Phase 2** admin CRUD + order status workflow + delivery zone rules. **Later** payments, auth, loyalty automation.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/(storefront)/*` | New | Customer browsing, cart, checkout screens |
| `app/admin/*` | New | Admin orders, products, promos, zones |
| `prisma/schema.prisma` | New | Orders, customers, products, promos, zones models |
| `lib/checkout`, `lib/whatsapp`, `lib/payments` | New | Validation, message builder, payment adapter boundary |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Checkout becomes too complex for MVP | Med | Keep guest-only flow; defer auth/payments automation |
| Dirty catalog/order data | Med | Zod validation + constrained admin forms |
| Delivery rules confuse users | Med | Limit to simple pickup/delivery + zone coverage |

## Rollback Plan

Disable checkout/admin routes, keep storefront read-only, and revert schema/app changes in one release if order capture is unstable.

## Dependencies

- Next.js App Router, Tailwind/shadcn, PostgreSQL, Prisma, Zod.
- WhatsApp click-to-chat format and store phone number.

## Success Criteria

- [ ] Customer can browse, search, add to cart, and complete guest checkout on mobile.
- [ ] Order, customer, fulfillment, and payment-selection data are stored in DB.
- [ ] Checkout generates a correct WhatsApp summary message for the store.
- [ ] Admin can manage products/promos/zones and update order status manually.
