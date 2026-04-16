# Checkout Specification

## Purpose

Define guest checkout, order persistence, WhatsApp summary generation, and customer record capture for the MVP.

## Requirements

### Requirement: Guest checkout form validation

The system MUST allow checkout without customer authentication and SHALL validate customer, fulfillment, and payment-selection fields before order creation.

#### Scenario: Delivery with conditional fields
- GIVEN a customer chooses delivery
- WHEN the checkout form is validated
- THEN full name, phone, delivery zone, street address, and payment selection are required

#### Scenario: Pickup omits delivery fields
- GIVEN a customer chooses pickup
- WHEN the checkout form is validated
- THEN delivery address and delivery zone MUST NOT be required

### Requirement: Order and customer persistence

The system MUST create a persisted order from the final cart and SHALL persist customer contact data for future loyalty or repeat orders.

#### Scenario: Create order successfully
- GIVEN a valid cart and valid guest checkout data
- WHEN the customer confirms the order
- THEN the system stores the order, line items, totals, fulfillment choice, promo effect, and customer record

#### Scenario: Reject empty or invalid order
- GIVEN the cart is empty or required checkout data is invalid
- WHEN the customer attempts to confirm
- THEN the system MUST NOT create an order and SHALL explain what must be fixed

### Requirement: WhatsApp handoff and confirmation

The system MUST generate a WhatsApp-ready summary from the persisted order and SHALL show a confirmation screen after successful creation.

#### Scenario: Generate WhatsApp summary
- GIVEN an order was created successfully
- WHEN the confirmation step is reached
- THEN the system shows the order reference, summary details, and a control to continue the conversation in WhatsApp

#### Scenario: Prevent premature WhatsApp handoff
- GIVEN no order was persisted
- WHEN the customer reaches checkout failure or abandons required fields
- THEN the system MUST NOT generate a confirmation-ready WhatsApp summary

### Requirement: MVP experience constraints

The storefront and checkout SHOULD prioritize fast, simple, mobile-first interactions and MUST NOT require customer sign-in.

#### Scenario: Guest-first completion
- GIVEN a first-time customer on a mobile device
- WHEN they browse, add items, and check out
- THEN the primary flow can be completed without authentication or non-essential steps
