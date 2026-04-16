# Admin Specification

## Purpose

Define the manual back-office workflows for orders, catalog, promos, and delivery coverage in the MVP.

## Requirements

### Requirement: Manual order operations

The system MUST provide an admin orders list with persisted order details and SHALL support manual status transitions through the allowed workflow states.

#### Scenario: Review and update order
- GIVEN an admin views existing orders
- WHEN the admin opens an order and changes it to the next allowed status
- THEN the new status is persisted and visible in the orders list

#### Scenario: Reject invalid status transition
- GIVEN an order is already in a terminal or incompatible state
- WHEN the admin attempts a disallowed transition
- THEN the system MUST NOT persist the change and SHALL explain the restriction

### Requirement: Catalog and promo management

The system MUST let admins create, update, activate, deactivate, and remove products, categories, and promos used by the storefront and checkout.

#### Scenario: Publish catalog change
- GIVEN an admin saves a valid product, category, or promo change
- WHEN the save completes
- THEN the persisted data becomes available to the relevant storefront or checkout experience

### Requirement: Delivery zone management

The system MUST let admins manage delivery zones that determine delivery availability during checkout.

#### Scenario: Zone affects checkout eligibility
- GIVEN an admin has activated supported delivery zones
- WHEN a customer selects delivery during checkout
- THEN only configured zones are available for selection
