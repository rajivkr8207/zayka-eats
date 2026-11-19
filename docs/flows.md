# Swiggy-Style Food Delivery Platform --- Product & System Flows

**Document:** Product Flow / Functional Requirements\
**Version:** 1.0\
**Scope:** Customer app, Restaurant panel, Delivery partner app, Admin
panel, backend workflows

------------------------------------------------------------------------

## 1. Platform Overview

The platform consists of four user-facing applications/panels and a
shared backend:

1.  **Customer App** --- discover restaurants and food, manage cart,
    checkout, pay, track deliveries, review.
2.  **Restaurant Panel** --- onboard restaurant, manage
    menu/availability, receive and prepare orders.
3.  **Delivery Partner App** --- onboarding/KYC, online availability,
    accept delivery tasks, pickup, delivery, earnings.
4.  **Admin Panel** --- platform oversight, approvals, order operations,
    discounts, finance, support, analytics.
5.  **Backend & Realtime Infrastructure** --- authentication, business
    rules, order lifecycle, payments, assignment, notifications,
    maps/tracking, reporting.

------------------------------------------------------------------------

## 2. Customer App --- End-to-End Flow

### 2.1 Onboarding & Authentication

1.  Open app.
2.  Display splash/loading screen.
3.  Check existing session.
4.  If unauthenticated, show onboarding/login.
5.  Enter phone number.
6.  Send OTP.
7.  Verify OTP.
8.  Create/update customer profile (name, email, optional photo).
9.  Request location permission.
10. Fetch current location or let user select location manually.
11. Open home page.

### 2.2 Home & Discovery

1.  Display active delivery address.
2.  Allow address switching.
3.  Display search.
4.  Display banners and promotions.
5.  Display categories.
6.  Display nearby/popular/recommended restaurants.
7.  Display restaurant cards with rating, ETA, delivery fee, distance,
    and open/closed status.
8.  Provide cuisine, veg/non-veg, rating, price, delivery-time and offer
    filters.
9.  Open restaurant or search result.

### 2.3 Search

1.  Enter food or restaurant name.
2.  Show autocomplete suggestions and recent searches.
3.  Search restaurants and menu items.
4.  Apply filters/sort.
5.  Open selected restaurant/item.

### 2.4 Restaurant Details & Menu

1.  Display restaurant details, ratings, delivery estimate, distance,
    fee, minimum order (if applicable), hours, and availability.
2.  Display menu sections and items.
3.  Show food photo, description, price, dietary tag, bestseller tag and
    availability.
4.  Select item.
5.  Select required variant (size, etc.).
6.  Select optional/required add-ons.
7.  Select quantity and spice/customization options where supported.
8.  Enter item-level instructions.
9.  Add to cart.
10. Update cart count and subtotal.

### 2.5 Cart

1.  Open cart.
2.  List items, variants, add-ons, quantities, and item notes.
3.  Edit quantity or customizations.
4.  Remove item.
5.  Validate restaurant/cart rules (one restaurant per cart unless
    multi-restaurant cart is explicitly supported).
6.  Validate item availability and prices.
7.  Apply coupon.
8.  Calculate item subtotal, packaging, delivery fee, platform fee,
    taxes, discount and total.
9.  Show checkout CTA.

### 2.6 Address Selection

1.  Show saved addresses.
2.  Select Home/Work/Other or add address.
3.  Pick point on map or use GPS.
4.  Enter flat/house, street, landmark, label and instructions.
5.  Save address.
6.  Check delivery serviceability and restaurant coverage.
7.  Confirm address for checkout.

### 2.7 Checkout & Payment

1.  Show order summary, selected address and cost breakdown.
2.  Select payment method (UPI, card, wallet if supported, COD if
    enabled).
3.  Initiate online payment using provider.
4.  Verify payment on server via provider callback/webhook.
5.  Handle success/failure/pending and retry.
6.  Prevent duplicate payment/order through idempotency.
7.  Confirm order and show order ID.
8.  Send order confirmation notifications.

### 2.8 Order Tracking

Customer-facing status timeline: - Order Placed - Payment Confirmed /
Payment Pending (as applicable) - Restaurant Confirmed - Preparing -
Ready for Pickup - Delivery Partner Assigned - Rider Arrived at
Restaurant - Picked Up - On the Way - Delivered

Tracking screen includes live map (when available), ETA, rider details,
call/chat options, restaurant and order details, support, and
policy-based cancellation.

### 2.9 Delivery Completion & Post-Order

1.  Rider reaches customer.
2.  Generate/validate delivery OTP or other proof of delivery if
    enabled.
3.  Mark delivered after valid proof.
4.  Finalize order status.
5.  Initiate financial ledger/settlement entries.
6.  Show rating/review screen.
7.  Allow rating restaurant and rider, written feedback, photos (if
    supported), complaint, invoice and reorder.
8.  Store order in history.

------------------------------------------------------------------------

## 3. Restaurant Panel --- End-to-End Flow

### 3.1 Onboarding

1.  Register and verify phone/email.
2.  Enter owner and restaurant details.
3.  Enter branch address and pin map location.
4.  Upload business/licensing/KYC documents (requirements configurable).
5.  Add tax/bank information as required.
6.  Set operating hours, delivery coverage and preparation settings.
7.  Create menu and upload photos.
8.  Submit application.
9.  Admin review, approve/reject/request correction.
10. Approved restaurant becomes eligible to go live.

### 3.2 Dashboard

Show new, active, completed and cancelled orders; sales/revenue
summaries; pending settlement; ratings; popular items;
availability/online toggle.

### 3.3 Order Handling

1.  Receive new-order alert.
2.  Display order items, quantities, customizations, instructions and
    payment state.
3.  Accept or reject with reason.
4.  On acceptance, confirm prep time.
5.  Move order to preparing.
6.  Mark ready for pickup.
7.  Verify rider/pickup details as configured.
8.  Hand order to rider.
9.  Track order completion and settlement status.

### 3.4 Menu Management

-   Create/edit/delete categories.
-   Create/edit/archive food items.
-   Manage photos, descriptions, price and dietary labels.
-   Configure variants and add-on groups.
-   Set item preparation time.
-   Set availability, stock and schedule.
-   Manage item/restaurant promotions where authorized.

### 3.5 Finance & Reporting

-   Order sales and gross amount.
-   Platform commission.
-   Applicable taxes/fees.
-   Restaurant-funded discounts.
-   Refunds and adjustments.
-   Net payable and settlement status.
-   Statements and exportable reports.

------------------------------------------------------------------------

## 4. Delivery Partner App --- End-to-End Flow

### 4.1 Onboarding & Verification

1.  Sign up and verify phone.
2.  Complete profile.
3.  Upload required identity, driving and vehicle documents.
4.  Add vehicle details and payout account.
5.  Submit verification.
6.  Admin reviews.
7.  Approve, reject or request corrections.
8.  Approved rider becomes eligible to go online.

### 4.2 Go Online & Assignment

1.  Rider logs in.
2.  Fetch current location.
3.  Review availability and permissions.
4.  Go online.
5.  Backend marks rider available.
6.  Assignment engine finds eligible riders (distance, availability,
    capacity, fairness and other configurable factors).
7.  Send delivery request with pickup/drop summary, distance and
    estimated earning.
8.  Rider accepts or declines within request timeout.
9.  On acceptance, assignment is locked and order/rider states update.
10. If declined/timed out, offer to another eligible rider or escalate.

### 4.3 Pickup

1.  Navigate to restaurant.
2.  Mark arrived (geofence or explicit action).
3.  Verify order code and pickup details.
4.  Receive food.
5.  Confirm pickup (OTP/PIN or partner confirmation if enabled).
6.  Backend sets picked-up status.
7.  Customer receives notification.
8.  Navigate to drop-off.

### 4.4 Delivery

1.  Provide route and customer location.
2.  Update location at controlled intervals while on active delivery.
3.  Provide ETA to customer.
4.  Contact customer where permitted.
5.  Reach drop-off.
6.  Validate delivery OTP/proof if configured.
7.  Mark delivered.
8.  Close assignment and update rider availability.
9.  Calculate earnings and incentives.

### 4.5 Earnings

Display completed trips, base pay, distance component, incentives, tips,
adjustments, daily/weekly totals, wallet/ledger, payout status and
history.

------------------------------------------------------------------------

## 5. Admin Panel --- Functional Flow

### 5.1 Admin Authentication & Roles

-   Secure login and optional 2FA.
-   Role-based access and permissions.
-   Audit log for privileged actions.

### 5.2 Dashboard

-   Customer, restaurant and rider counts.
-   Online/active counts.
-   Order totals and status counts.
-   GMV, platform revenue, refunds and payouts.
-   Trends and operational metrics.

### 5.3 Customer Management

-   Search/list/profile.
-   Addresses (access controlled).
-   Order history and spending.
-   Reviews and support tickets.
-   Suspend/restore actions and audit trail.

### 5.4 Restaurant Management

-   Application queue.
-   Document review.
-   Approve/reject/request corrections.
-   Profile, branch, menu and availability.
-   Commission/contract configuration.
-   Suspend/reactivate.
-   Sales and settlements.

### 5.5 Rider Management

-   Application and KYC review.
-   Approve/reject/request corrections.
-   Profile/vehicle and status.
-   Delivery history and earnings.
-   Performance and support.
-   Suspend/reactivate with audit trail.

### 5.6 Order Operations

-   Order search and status filters.
-   View timeline, items, payment and assignment.
-   Cancellation reason and policy.
-   Refund/dispute handling.
-   Controlled support intervention with audit trail.

### 5.7 Promotions

-   Coupon creation.
-   Flat/percentage discount.
-   Max discount and minimum basket.
-   Start/end time.
-   Global, restaurant-specific, new-user or targeted rules.
-   Usage limits and analytics.
-   Banner/campaign management.

### 5.8 Finance, Support & Configuration

-   Commission and delivery fee rules.
-   Taxes/fees configuration (admin-controlled and reviewed).
-   Payment reconciliation.
-   Restaurant/rider settlements.
-   Refunds and adjustments.
-   Support tickets.
-   Notifications and CMS.
-   Review moderation.
-   Audit logs, roles, permissions, city/zone and report exports.

------------------------------------------------------------------------

## 6. Backend Order Lifecycle & State Rules

### 6.1 Typical Successful Lifecycle

`CREATED → PAYMENT_PENDING (if online) → CONFIRMED → PREPARING → READY_FOR_PICKUP → RIDER_ASSIGNED → RIDER_ARRIVED → PICKED_UP → ON_THE_WAY → DELIVERED`

Actual state ordering may vary if rider assignment runs in parallel with
preparation. Each transition must be validated server-side.

### 6.2 Cancellation/Exception States

-   `PAYMENT_FAILED`
-   `CANCELLED_BY_CUSTOMER`
-   `CANCELLED_BY_RESTAURANT`
-   `CANCELLED_BY_ADMIN`
-   `CANCELLED_BY_SYSTEM`
-   `DELIVERY_FAILED`
-   `REFUND_PENDING`
-   `REFUNDED`
-   `PARTIALLY_REFUNDED`

### 6.3 Order Creation / Checkout Backend Sequence

1.  Authenticate requester.
2.  Validate customer and delivery address.
3.  Validate restaurant/branch and serviceability.
4.  Validate restaurant operating/accepting status.
5.  Fetch authoritative food items and current prices.
6.  Validate availability, variants, add-ons and quantities.
7.  Enforce cart/restaurant rules.
8.  Validate coupon and usage limits.
9.  Compute subtotal, packaging, delivery fee, platform fee, tax,
    discount and total on server.
10. Create order and immutable item-price/customization snapshots.
11. Create payment attempt/record.
12. Initiate payment if online.
13. Verify gateway webhook signature and transaction state.
14. Apply idempotency to payment and order operations.
15. Confirm order only under the configured payment/COD rules.
16. Notify restaurant and customer.
17. Handle restaurant acceptance, rejection or timeout.
18. Initiate rider assignment.
19. Persist all status transitions in order history.
20. Deliver realtime events and push notifications.
21. Complete delivery after required proof.
22. Create ledger entries and settlement calculations.
23. Enable review, receipt, support and reorder.

### 6.4 Reliability & Security Rules

-   Never trust client-submitted prices or totals.
-   Validate every status transition on backend.
-   Verify payment signatures and payment status.
-   Use idempotency for checkout, payments, webhooks and refunds.
-   Use transactions for critical database writes.
-   Store order item price/name/customization snapshots.
-   Restrict rider location access to operational need and active
    delivery.
-   Use RBAC and audit privileged actions.
-   Keep secrets out of source control.
-   Rate-limit authentication and sensitive endpoints.
-   Use retries and dead-letter handling for background jobs.
-   Monitor errors, latency, payment reconciliation and failed
    notifications.

------------------------------------------------------------------------

## 7. Suggested Database Entities

  Table                      Responsibility
  -------------------------- ----------------------------------------
  `users`                    Shared account records
  `user_roles`               Role/permission assignment
  `user_addresses`           Saved delivery addresses
  `restaurants`              Restaurant profile
  `restaurant_branches`      Branch/address/service area
  `restaurant_documents`     Verification documents
  `restaurant_hours`         Operating schedule
  `menus`                    Menu metadata
  `menu_categories`          Menu sections
  `food_items`               Products
  `food_variants`            Size/variant pricing
  `addon_groups`             Add-on selection groups
  `addons`                   Add-on options
  `carts`                    Active carts
  `cart_items`               Cart contents
  `coupons`                  Coupon configuration
  `coupon_usage`             Redemption records
  `orders`                   Main order
  `order_items`              Immutable ordered item snapshots
  `order_item_addons`        Ordered customization snapshots
  `order_status_history`     State-transition audit
  `payments`                 Payment attempts/transactions
  `refunds`                  Refund records
  `delivery_partners`        Rider profile
  `rider_documents`          Rider KYC/vehicle documents
  `delivery_assignments`     Rider-order allocation
  `rider_locations`          Location samples for active deliveries
  `reviews`                  Restaurant/rider reviews
  `notifications`            Notification records
  `wallets`                  Wallet accounts if supported
  `wallet_transactions`      Wallet ledger
  `restaurant_settlements`   Restaurant payouts
  `rider_earnings`           Rider income/ledger
  `support_tickets`          Customer/partner issues
  `banners`                  Home promotions
  `audit_logs`               Admin/security actions

------------------------------------------------------------------------

## 8. Realtime Events (Initial Catalogue)

Possible Socket.IO events; names are implementation conventions and can
be finalized during API design:

### Orders

-   `order:created`
-   `order:confirmed`
-   `order:rejected`
-   `order:preparing`
-   `order:ready`
-   `order:cancelled`
-   `order:picked_up`
-   `order:delivered`

### Delivery

-   `rider:assigned`
-   `rider:arrived`
-   `rider:location_updated`
-   `rider:request_received`
-   `rider:request_accepted`
-   `rider:online`
-   `rider:offline`

### Payments

-   `payment:success`
-   `payment:failed`
-   `payment:pending`
-   `refund:processed`

### Restaurant

-   `restaurant:online`
-   `restaurant:offline`

Events must be authorized, scoped to the correct audience, and backed by
persisted state; Socket.IO messages are not the source of truth.

------------------------------------------------------------------------

## 9. Recommended Initial Tech Stack

  -----------------------------------------------------------------------
  Layer                               Recommended
  ----------------------------------- -----------------------------------
  Customer App                        React Native or Flutter

  Rider App                           React Native or Flutter

  Restaurant Panel                    React / Next.js

  Admin Panel                         Next.js

  Backend                             NestJS (Node.js)

  API                                 REST

  Realtime                            Socket.IO

  Database                            PostgreSQL

  ORM                                 Prisma

  Cache / Presence                    Redis

  Background Jobs                     BullMQ

  File Storage                        S3-compatible storage / Cloudinary

  Auth                                Access + refresh tokens, RBAC

  Maps                                Google Maps / Mapbox

  Payments                            Razorpay (India-focused;
                                      integration subject to
                                      account/region)

  Push                                Firebase Cloud Messaging

  Deployment                          Docker, cloud/VPS

  Observability                       Logs, metrics, error tracking
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 10. Development Phases --- Summary

Follow the separate **Phase-by-Phase Development Plan** document for
scope, tasks, dependencies, acceptance criteria and recommended build
order. Do not attempt every feature at once; first complete the MVP
order journey end-to-end.
