# Swiggy-Style Food Delivery Platform --- Phase-by-Phase Development Plan

**Document:** Implementation Roadmap\
**Version:** 1.1\
**Purpose:** Build the platform in manageable, testable phases with
clear deliverables and acceptance criteria.

> **Technology stack corrected to match the existing project:**
> Node.js + Express + Mongoose (MongoDB) backend, React frontend, Redux
> Toolkit for state management, and Tailwind CSS. This plan does not use
> PostgreSQL, Prisma, or NestJS.

------------------------------------------------------------------------

## Guiding Rules

-   Build a **modular monolith** first; avoid premature microservices.
-   Complete one phase and its acceptance checks before expanding scope.
-   Backend validation is the source of truth.
-   Design payment, order-state, and delivery assignment carefully.
-   Keep secrets/configuration out of committed code.
-   Include automated tests in every phase---not only at the end.
-   Treat integrations (payment, maps, push notifications) as
    replaceable adapters.
-   Follow the existing backend `src/modules/<feature>` structure and
    frontend `src/features/<feature>` structure.
-   Use **MongoDB with Mongoose** for persistence and schemas.
-   Use Redux Toolkit for shared frontend state; use local component
    state for temporary UI state.
-   Use Tailwind CSS for component styling.

------------------------------------------------------------------------

## Phase 0 --- Scope, UX & Project Setup

### Tasks

1.  Confirm MVP scope and exclusions.
2.  Define user roles: customer, restaurant staff/owner, rider, admin.
3.  Define main user journeys and order state machine.
4.  Create wireframes for all primary screens.
5.  Set up repository and branching conventions.
6.  Set up issue tracker and task labels.
7.  Set up development/staging environments.
8.  Establish coding standards, linting and formatting.
9.  Create architecture overview and `.env.example`.
10. Define testing strategy and CI pipeline.
11. Confirm existing backend/frontend folder structures and avoid
    unnecessary restructuring.

### Deliverables

-   MVP scope document.
-   Wireframes/flow diagrams.
-   Repository skeleton using the existing structure.
-   CI checks.
-   Development environment instructions.

### Acceptance Criteria

-   Team agrees on MVP and state transitions.
-   Project can run locally from documented setup.
-   CI runs lint and initial tests.

------------------------------------------------------------------------

## Phase 1 --- Backend Foundation & Authentication

### Tasks

1.  Continue with the existing Node.js + Express backend structure.
2.  Configure MongoDB connection using the existing `src/config` setup.
3.  Configure Mongoose and connection lifecycle.
4.  Add environment/config validation.
5.  Implement health-check endpoint.
6.  Implement structured logging.
7.  Create Mongoose user schema and role definitions.
8.  Implement phone/email authentication approach.
9.  Implement OTP provider abstraction (development OTP only in local
    environment).
10. Implement access and refresh token/session handling.
11. Implement logout and token/session revocation.
12. Add RBAC middleware.
13. Add request validation and standardized errors.
14. Add rate limits to authentication endpoints.
15. Add basic unit/integration tests.

### Deliverables

-   Backend starter following `src/modules`.
-   Initial Mongoose models.
-   Authentication endpoints.
-   Role/permission enforcement.
-   API documentation.

### Acceptance Criteria

-   OTP/login flow works in test/dev setup.
-   Unauthorized requests are rejected.
-   Role-restricted endpoints enforce access.
-   Tests pass and MongoDB connection works reliably.

------------------------------------------------------------------------

## Phase 2 --- Customer Profile, Addresses & Serviceability

### Tasks

1.  Create customer profile APIs in `src/modules/user` or the
    appropriate feature module.
2.  Update profile API.
3.  Add address CRUD (embedded address subdocument or separate model;
    choose based on expected access patterns and growth).
4.  Store coordinates and address metadata using validated
    GeoJSON/coordinate format.
5.  Add map pin/address selection integration boundary.
6.  Implement delivery zone/serviceability checks.
7.  Validate address during checkout.
8.  Add profile/address tests.

### Deliverables

-   Profile screens/APIs.
-   Saved addresses.
-   Serviceability endpoint.

### Acceptance Criteria

-   Customer can create/update profile and manage addresses.
-   Invalid/out-of-zone addresses are rejected clearly.
-   Customer can choose an address for ordering.

------------------------------------------------------------------------

## Phase 3 --- Restaurant Onboarding & Management

### Tasks

1.  Restaurant account and Mongoose schema.
2.  Branch/address schema (embed or separate collection as appropriate).
3.  Document upload/storage integration.
4.  Operating hours.
5.  Delivery zones or coverage rules.
6.  Restaurant onboarding APIs.
7.  Admin approval/rejection/request-correction workflow.
8.  Restaurant online/offline and accepting-orders controls.
9.  Restaurant dashboard summary endpoints.
10. Tests for permissions and approval lifecycle.

### Deliverables

-   Restaurant onboarding.
-   Admin review workflow.
-   Restaurant dashboard foundation.

### Acceptance Criteria

-   Restaurant application can be submitted.
-   Admin can approve/reject/request correction.
-   Only approved/eligible restaurants can go live.
-   Status and operating controls are enforced by backend.

------------------------------------------------------------------------

## Phase 4 --- Menu, Categories, Items & Customizations

### Tasks

1.  Create Mongoose menu/category schema or models.
2.  Create food item schema.
3.  Add variants (sizes/options).
4.  Add add-on groups and options.
5.  Add dietary tags.
6.  Add item images.
7.  Implement CRUD endpoints.
8.  Implement item availability/stock toggle.
9.  Add menu listing for customers.
10. Validate customization selections and pricing on backend.
11. Test item/variant/add-on pricing.

### Deliverables

-   Restaurant menu management.
-   Customer-facing menu APIs.

### Acceptance Criteria

-   Restaurant can manage categories and items.
-   Customer sees only active/available items.
-   Server validates every selection and authoritative price.

------------------------------------------------------------------------

## Phase 5 --- Customer Discovery, Search & Restaurant Details

### Tasks

1.  Home feed endpoint.
2.  Restaurant listing.
3.  Restaurant cards data.
4.  Cuisine/category filters.
5.  Veg/non-veg filters.
6.  Rating/price/delivery-time filters (where data exists).
7.  Search restaurant and food item.
8.  Autocomplete/recent searches (optional MVP).
9.  Restaurant detail endpoint.
10. MongoDB indexes and pagination.
11. Frontend home, search, list and detail screens.
12. Test search/list behavior.

### Deliverables

-   Customer home.
-   Restaurant discovery.
-   Search and filters.
-   Restaurant details/menu.

### Acceptance Criteria

-   Customer can find restaurants and items.
-   Filters/sort work predictably.
-   Pagination avoids unbounded list responses.
-   Out-of-service restaurants/items are not orderable.

------------------------------------------------------------------------

## Phase 6 --- Cart & Pricing Engine

### Tasks

1.  Decide single-restaurant cart rule for MVP.
2.  Implement cart schema/API or a server-validated client cart
    strategy.
3.  Add item/variant/add-on quantities.
4.  Add cart validation.
5.  Enforce item availability.
6.  Enforce restaurant/cart consistency.
7.  Create centralized price calculation service.
8.  Calculate item subtotal.
9.  Calculate packaging fee.
10. Calculate delivery fee.
11. Calculate platform fee.
12. Calculate tax.
13. Calculate discounts.
14. Add coupon rules and redemption limits.
15. Return a detailed price breakdown.
16. Test boundary cases and pricing accuracy.

### Deliverables

-   Cart APIs/screens.
-   Coupon validation.
-   Pricing breakdown service.

### Acceptance Criteria

-   Cart edits are validated.
-   Price is calculated by backend, not trusted from client.
-   Invalid/expired/over-limit coupons are rejected.
-   Totals are deterministic and test-covered.

------------------------------------------------------------------------

## Phase 7 --- Checkout, Orders & Payment

### Tasks

1.  Define Mongoose order and order-item snapshot models.
2.  Define order state machine and transition rules.
3.  Create checkout endpoint.
4.  Validate address, restaurant, items, price, coupon and
    serviceability again.
5.  Create order using transaction/idempotency key (MongoDB transaction
    deployment requirements must be verified).
6.  Create payment attempt record/model.
7.  Integrate payment provider sandbox.
8.  Implement payment success/failure/pending handling.
9.  Implement webhook endpoint and signature validation.
10. Ensure duplicate webhooks are harmless.
11. Confirm order according to payment/COD rules.
12. Implement cancellation rules and reasons.
13. Implement order status history.
14. Create customer order history/detail endpoints.
15. Create restaurant order list/detail endpoints.
16. Add tests for payment/order edge cases.

### Deliverables

-   Checkout.
-   Order creation.
-   Payment integration in sandbox.
-   Order history.
-   Order lifecycle APIs.

### Acceptance Criteria

-   Successful payment confirms the order once.
-   Failed/pending payment does not incorrectly confirm.
-   Duplicate requests/webhooks do not duplicate orders/charges.
-   State transitions are enforced server-side.
-   Order snapshots preserve price/name/customization at purchase time.

------------------------------------------------------------------------

## Phase 8 --- Restaurant Order Operations

### Tasks

1.  New-order queue.
2.  Realtime/push alert.
3.  Accept/reject order.
4.  Rejection reason.
5.  Prep-time selection.
6.  Preparing status.
7.  Ready-for-pickup status.
8.  Order details and customizations.
9.  Restaurant online/offline controls.
10. Order timeout policy.
11. Realtime updates.
12. Tests for race conditions and restaurant permissions.

### Deliverables

-   Restaurant order panel.
-   Kitchen workflow.

### Acceptance Criteria

-   Restaurant receives new orders.
-   Accept/reject updates are valid and recorded.
-   Customer sees correct order status.
-   Only authorized restaurant staff can act on their orders.

------------------------------------------------------------------------

## Phase 9 --- Delivery Partner Onboarding & Availability

### Tasks

1.  Rider profile Mongoose schema.
2.  Vehicle schema/details.
3.  KYC document uploads.
4.  Rider approval workflow.
5.  Rider app authentication.
6.  Online/offline state.
7.  Location permission and location update strategy.
8.  Rider availability storage/cache.
9.  Admin rider list/review screen.
10. Tests for approval and availability.

### Deliverables

-   Rider onboarding.
-   Verification.
-   Online/offline functionality.

### Acceptance Criteria

-   Unverified rider cannot accept deliveries.
-   Rider can go online/offline.
-   Backend availability is updated and access-controlled.

------------------------------------------------------------------------

## Phase 10 --- Rider Assignment & Pickup/Delivery

### Tasks

1.  Define assignment strategy and eligibility rules.
2.  Search eligible nearby riders (MongoDB geospatial indexes/queries
    where suitable).
3.  Create assignment request and expiry.
4.  Notify rider.
5.  Accept/reject/timeout handling.
6.  Prevent multiple riders claiming same delivery.
7.  Retry assignment and fallback escalation.
8.  Rider navigation/pickup screen.
9.  Arrival and pickup confirmation.
10. Update picked-up status.
11. Customer live tracking view.
12. Rider location update API/socket event.
13. Restrict location sharing to active deliveries.
14. Delivery OTP/proof verification.
15. Delivered status.
16. Rider earnings ledger entries.
17. Test race conditions, lost connectivity and assignment timeouts.

### Deliverables

-   Rider assignment.
-   Pickup/delivery workflow.
-   Live tracking.
-   Proof of delivery.

### Acceptance Criteria

-   One active rider assignment per order (unless explicitly designed
    otherwise).
-   Expired requests are not accepted.
-   Pickup and delivery transitions are verified.
-   Tracking is scoped to authorized customer, rider and operations
    users.
-   Delivery cannot complete without configured proof.

------------------------------------------------------------------------

## Phase 11 --- Notifications & Realtime

### Tasks

1.  Notification service abstraction.
2.  Push provider setup.
3.  Device token registration.
4.  Notification templates.
5.  Order status notifications.
6.  Restaurant new-order notifications.
7.  Rider delivery-request notifications.
8.  Retry/failure handling.
9.  Socket.IO authentication.
10. Room/channel access control.
11. Event persistence where required.
12. Reconnect and state resync strategy.
13. Notification preference management (where applicable).
14. Tests for event authorization and retries.

### Deliverables

-   Push notifications.
-   Realtime status updates.
-   Reliable event handling.

### Acceptance Criteria

-   Relevant users receive notifications.
-   Unauthorized users cannot subscribe to other users' orders.
-   Clients recover current state after disconnect/reconnect.
-   Notifications can fail without corrupting order state.

------------------------------------------------------------------------

## Phase 12 --- Admin Panel & Operational Tools

### Tasks

1.  Admin authentication.
2.  RBAC/permission UI.
3.  Admin dashboard metrics.
4.  Customer search/details.
5.  Restaurant application review.
6.  Rider application review.
7.  Restaurant/rider status controls.
8.  Order list/detail/timeline.
9.  Cancellation/refund support actions.
10. Coupon/promotion management.
11. Commission/delivery-fee configuration.
12. Support tickets.
13. Audit log viewer.
14. Report export.
15. Tests for permissions and auditability.

### Deliverables

-   Admin panel MVP.
-   Operational workflows.
-   Audited privileged actions.

### Acceptance Criteria

-   Admin can manage core entities.
-   Sensitive actions require permissions.
-   Changes are auditable.
-   Metrics reconcile with underlying data.

------------------------------------------------------------------------

## Phase 13 --- Reviews, Support, Refunds & Settlements

### Tasks

1.  Customer review/rating.
2.  Review eligibility rules.
3.  Restaurant and rider review support.
4.  Review moderation.
5.  Support ticket creation and status.
6.  Refund request workflow.
7.  Refund provider integration.
8.  Refund status reconciliation.
9.  Restaurant commission ledger.
10. Rider earning ledger.
11. Settlement calculation.
12. Payout/reconciliation process.
13. Exportable finance reports.
14. Tests for financial calculations and adjustments.

### Deliverables

-   Reviews.
-   Support.
-   Refunds.
-   Financial ledgers and settlement workflows.

### Acceptance Criteria

-   Only eligible orders can be reviewed.
-   Refunds are tracked and reconciled.
-   Earnings/settlements are based on ledger entries.
-   Financial changes are traceable.

------------------------------------------------------------------------

## Phase 14 --- QA, Security, Performance & Production Release

### Tasks

1.  Full customer-to-delivery E2E testing.
2.  Restaurant and rider workflow testing.
3.  API validation and authorization review.
4.  Payment/webhook security review.
5.  Rate limiting and abuse prevention.
6.  MongoDB indexes and query review.
7.  Load testing for peak ordering.
8.  Failure/retry testing.
9.  Backup/restore test.
10. Monitoring and alerting.
11. Error tracking.
12. CI/CD deployment pipeline.
13. Staging smoke tests.
14. Production configuration review.
15. Rollback plan.
16. Pilot launch with limited restaurants/zone.
17. Collect feedback and fix issues.
18. Expand rollout gradually.

### Deliverables

-   Release candidate.
-   Test report.
-   Deployment and rollback guide.
-   Production monitoring.
-   Pilot launch checklist.

### Acceptance Criteria

-   Critical end-to-end journeys pass.
-   No known critical security defects.
-   Payment reconciliation is verified.
-   Backups and rollback are tested.
-   Monitoring/alerts are active.
-   Pilot operations have support and escalation procedures.

------------------------------------------------------------------------

## 15. MVP Release Checklist

### Customer

-   [ ] Login/OTP
-   [ ] Profile
-   [ ] Address selection
-   [ ] Restaurant list
-   [ ] Search
-   [ ] Menu
-   [ ] Customization
-   [ ] Cart
-   [ ] Coupon (basic)
-   [ ] Checkout
-   [ ] Payment/COD
-   [ ] Order history
-   [ ] Order tracking
-   [ ] Delivery confirmation
-   [ ] Review

### Restaurant

-   [ ] Signup/onboarding
-   [ ] Admin approval
-   [ ] Menu/category CRUD
-   [ ] Availability
-   [ ] Receive order
-   [ ] Accept/reject
-   [ ] Preparing
-   [ ] Ready for pickup
-   [ ] Order history

### Rider

-   [ ] Signup
-   [ ] KYC
-   [ ] Approval
-   [ ] Online/offline
-   [ ] Delivery request
-   [ ] Accept task
-   [ ] Pickup confirmation
-   [ ] Live location
-   [ ] Delivery OTP
-   [ ] Earnings view

### Admin

-   [ ] Dashboard
-   [ ] Customer management
-   [ ] Restaurant approvals
-   [ ] Rider approvals
-   [ ] Order management
-   [ ] Coupons
-   [ ] Basic refund handling
-   [ ] Settlement/report visibility
-   [ ] Support
-   [ ] Audit logs

------------------------------------------------------------------------

## 16. Recommended Sprint Planning

Treat the phases as milestones; actual sprint duration depends on team
size and experience.

  -----------------------------------------------------------------------
  Sprint                  Focus                   Target outcome
  ----------------------- ----------------------- -----------------------
  Sprint 1                Setup, scope, auth,     Backend foundation
                          roles                   

  Sprint 2                Profiles, addresses,    Accounts and locations
                          restaurant onboarding   

  Sprint 3                Menus, food items,      Catalog ready
                          variants                

  Sprint 4                Home, search,           Discovery ready
                          restaurant details      

  Sprint 5                Cart, pricing, coupons  Basket ready

  Sprint 6                Checkout, orders,       Order can be placed
                          payments                safely

  Sprint 7                Restaurant order        Kitchen flow working
                          operations              

  Sprint 8                Rider onboarding,       Delivery task flow
                          assignment              

  Sprint 9                Pickup, tracking,       End-to-end delivery
                          delivery OTP            

  Sprint 10               Notifications and admin Operations MVP

  Sprint 11               Reviews, support,       Post-order workflows
                          refunds, finance        

  Sprint 12               QA, security, pilot,    MVP release
                          launch                  
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 17. Suggested Repository Layout (Matches Current Stack)

This is a conceptual monorepo layout. Keep the actual backend and
frontend folders as they currently exist; do not restructure just to
match this illustration.

``` text
food-delivery/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── middlewares/
│   │   ├── modules/
│   │   │   ├── user/
│   │   │   ├── restaurant/
│   │   │   ├── menu/
│   │   │   ├── cart/
│   │   │   ├── order/
│   │   │   ├── payment/
│   │   │   ├── delivery/
│   │   │   └── ...
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   ├── app.middleware.js
│   │   └── app.routes.js
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── config/
│   │   ├── constants/
│   │   ├── features/
│   │   ├── lib/
│   │   ├── routes/
│   │   ├── seo/
│   │   └── theme/
│   ├── .env.example
│   └── Dockerfile
└── docs/
    ├── platform-flows.md
    ├── phase-development-plan.md
    ├── architecture-coding-rules.md
    ├── api-spec.md
    ├── database-design.md
    └── deployment-guide.md
```

Avoid duplicating business rules across applications; keep pricing,
order-state and permission checks in the backend.

------------------------------------------------------------------------

## 18. What to Build First (Immediate Next Steps)

1.  Confirm the MVP checklist and non-goals.
2.  Draw/approve the order lifecycle.
3.  Confirm existing repository structure and local setup.
4.  Verify Express/Mongoose connection and health endpoint.
5.  Implement authentication, roles and permissions.
6.  Add seed data for restaurants, categories and menu items.
7.  Build the customer discovery → restaurant → menu → cart journey.
8.  Add checkout/order/payment sandbox.
9.  Build restaurant accept/prepare/ready flow.
10. Add rider assignment, pickup and delivery confirmation.
11. Add realtime tracking and notifications.
12. Finish admin essentials, QA and pilot deployment.

**Milestone 1 goal:** A customer can place a valid order, a restaurant
can accept and prepare it, a rider can pick it up and deliver it, and
the customer can verify completion. Everything else is built around
making this core journey reliable.

------------------------------------------------------------------------

## 19. Stack Consistency Checklist

-   [x] Backend: Node.js + Express
-   [x] Database: MongoDB
-   [x] ODM: Mongoose
-   [x] Backend architecture: feature/module-based `src/modules`
-   [x] Frontend: React
-   [x] Frontend architecture: feature-based `src/features`
-   [x] Shared frontend state: Redux Toolkit
-   [x] Styling: Tailwind CSS
-   [ ] PostgreSQL --- not used
-   [ ] Prisma --- not used
-   [ ] NestJS --- not used
