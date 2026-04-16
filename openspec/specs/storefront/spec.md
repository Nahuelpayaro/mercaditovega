# Storefront Specification

## Purpose

Define the customer-facing browsing, cart, and promo behavior for the neighborhood grocery MVP.

## Requirements

### Requirement: Mobile-first product discovery

The system MUST present a mobile-first storefront with featured promos, category navigation, searchable products, and only active sellable items.

#### Scenario: Browse featured and categories
- GIVEN the storefront has active products, categories, and promos
- WHEN a customer opens the home screen
- THEN the system shows featured promos, visible categories, and product listings optimized for mobile

#### Scenario: Empty search result
- GIVEN a customer enters a search term with no matching active products
- WHEN the search is submitted
- THEN the system shows no matching products and preserves access to categories and cart

### Requirement: Product card add-to-cart actions

The system MUST show product cards with essential purchase data and SHALL let customers add items to the cart from listing views with immediate feedback.

#### Scenario: Add from card
- GIVEN a visible product card for an in-stock product
- WHEN the customer adds one unit
- THEN the cart quantity and subtotal update immediately and the customer remains in context

#### Scenario: Prevent unavailable purchase
- GIVEN a product is inactive or unavailable
- WHEN the customer views its card or attempts to add it
- THEN the system MUST NOT add the item and SHALL communicate that it is unavailable

### Requirement: Persistent cart and promo application

The system MUST persist the guest cart across refreshes on the same device and SHALL apply at most one valid promo according to its rules.

#### Scenario: Restore cart
- GIVEN a customer previously added items on the same device
- WHEN the storefront is reopened or refreshed
- THEN the saved cart contents and totals are restored

#### Scenario: Reject invalid promo
- GIVEN a cart with items and an expired, ineligible, or unknown promo
- WHEN the customer applies that promo
- THEN the cart remains unchanged except for a clear validation message
