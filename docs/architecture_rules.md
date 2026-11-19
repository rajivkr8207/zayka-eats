# Food Delivery Platform --- Architecture & Coding Structure Rules

**Purpose:** Follow this document as the project-wide rulebook for
folder organization, feature development, state management, database
access, API handling, and styling. Keep the existing backend/frontend
architecture consistent.

------------------------------------------------------------------------

## 1. Core Architecture Rules

-   Use a **module/feature-based structure** rather than putting all
    code of the same type into giant global folders.
-   Keep business logic out of controllers and UI components.
-   Use shared folders only for genuinely reusable code.
-   Do not create duplicate helpers, components, validators, or API
    logic when a shared implementation already exists.
-   Follow the existing naming, import, error-handling, and response
    conventions.
-   A feature should be self-contained and easy to locate, maintain,
    test, and extend.
-   Add files only when needed; do not create empty or speculative
    layers.

------------------------------------------------------------------------

## 2. Backend Folder Structure (Node.js + Express + Mongoose)

Keep the current backend layout and organize feature-specific files
inside `src/modules/<feature>`.

``` text
backend/
├── src/
│   ├── config/
│   │   ├── logger.js
│   │   ├── mail.js
│   │   ├── redis.js
│   │   ├── socket.js
│   │   └── validate.js
│   ├── constants/
│   │   └── roles.js
│   ├── middlewares/
│   │   └── error.middleware.js
│   ├── modules/
│   │   ├── activityLog/
│   │   ├── health/
│   │   │   ├── health.controller.js
│   │   │   └── health.route.js
│   │   ├── user/
│   │   │   ├── user.controller.js
│   │   │   ├── user.model.js
│   │   │   ├── user.route.js
│   │   │   ├── user.service.js
│   │   │   └── user.validate.js
│   │   ├── restaurant/
│   │   ├── menu/
│   │   ├── cart/
│   │   ├── order/
│   │   ├── payment/
│   │   ├── delivery/
│   │   └── ...
│   ├── services/
│   │   └── shared integrations/services only
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   ├── cache.js
│   │   └── ...
│   ├── app.js
│   ├── app.middleware.js
│   └── app.routes.js
├── .env
├── .env.example
├── Dockerfile
└── ...
```

### Backend module rule

A module owns its route/controller/service/model/validation files.
Example:

``` text
src/modules/order/
├── order.controller.js
├── order.model.js
├── order.route.js
├── order.service.js
└── order.validate.js
```

### Responsibility of each file

-   **`*.route.js`** --- declare endpoints, attach middleware and
    controller handlers. Keep business logic out.
-   **`*.controller.js`** --- read request parameters/body, call
    service, send response. Avoid business rules and direct complex
    database operations.
-   **`*.service.js`** --- business logic, workflow, database
    coordination, calculations, and calls to other modules.
-   **`*.model.js`** --- Mongoose schema/model, indexes, schema-level
    configuration.
-   **`*.validate.js`** --- validate request payloads, params and query
    inputs using the project's validation setup.
-   **`src/config/`** --- application configuration and external
    connections (DB, Redis, mail, socket, logger).
-   **`src/constants/`** --- stable constants such as role names and
    system-wide values.
-   **`src/middlewares/`** --- shared Express middleware (auth,
    authorization, errors, rate limits, etc.).
-   **`src/services/`** --- shared/integration services used by multiple
    modules; feature-specific logic belongs inside the feature module.
-   **`src/utils/`** --- small reusable helpers, response/error
    wrappers, and utilities. Avoid business-specific logic here.
-   **`app.routes.js`** --- central route mounting only.
-   **`app.js`** --- application assembly/configuration; do not turn it
    into a feature implementation file.

### Backend coding rules

1.  Routes use the existing route naming pattern and are mounted
    centrally.
2.  Controllers stay thin; business logic belongs in services.
3.  Use the project's `asyncHandler` pattern for async handlers if
    already established.
4.  Use the shared `ApiError`/`ApiResponse` conventions instead of
    inventing response shapes.
5.  Keep validation near the owning module and validate at the API
    boundary.
6.  Protect routes with authentication and role/permission middleware as
    appropriate.
7.  Do not trust client-provided price, role, ownership, totals, payment
    state, or order status.
8.  Use Mongoose models for persistence. Do not mix raw DB access
    patterns without a clear reason.
9.  Put indexes and schema constraints on the relevant model; consider
    query patterns before adding indexes.
10. Avoid circular module imports. Prefer explicit service boundaries.
11. Keep secrets and credentials in environment variables;
    `.env.example` contains keys/placeholders only, never real secrets.
12. Add tests for service/business logic and important API flows.
13. Use transactions where multiple database writes must succeed/fail
    together and the deployment supports them.
14. Add logs that are useful for troubleshooting; never log passwords,
    OTPs, tokens, or sensitive payment details.

------------------------------------------------------------------------

## 3. Mongoose Database Rules

-   Use a consistent model and collection naming convention across the
    project.
-   Keep schema definitions in the owning module's `*.model.js`.
-   Define required fields, enum values, defaults, validation and
    timestamps where appropriate.
-   Use `createdAt`/`updatedAt` timestamps consistently.
-   Add indexes intentionally based on actual access patterns (lookup,
    filtering, sorting, uniqueness).
-   Use references (`ObjectId`) for relationships where appropriate;
    populate selectively, not indiscriminately.
-   Avoid unbounded arrays in documents for data that can grow
    indefinitely (e.g. logs, order histories, location history).
-   Keep money values in integer minor units (e.g. paise) or a carefully
    chosen Decimal representation; avoid floating-point arithmetic for
    financial calculations.
-   For orders, save snapshots of item names, selected variants,
    add-ons, and unit prices so historical orders do not change when the
    menu changes.
-   Use atomic updates or transactions for inventory/stock, coupon
    usage, payment and order operations when consistency matters.
-   Never expose internal fields, secrets, or sensitive documents in API
    responses.
-   Review query efficiency; avoid N+1 query patterns and
    over-populating large responses.

------------------------------------------------------------------------

## 4. Frontend Folder Structure (React + Feature-Based)

Follow the current `frontend/src` structure. Each feature should own its
pages, UI specific to that feature, hooks, Redux state, and
feature-level API logic.

``` text
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── store.js
│   │   ├── index.css
│   │   └── ...
│   ├── components/       # shared reusable UI components
│   ├── config/          # app config
│   ├── constants/       # shared constants
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── pages/
│   │   │   ├── auth.slice.js
│   │   │   ├── auth.thunk.js
│   │   │   └── ...
│   │   ├── customer/
│   │   ├── restaurant/
│   │   ├── menu/
│   │   ├── cart/
│   │   ├── order/
│   │   ├── delivery/
│   │   └── admin/
│   ├── lib/             # shared library wrappers/helpers
│   ├── routes/          # route definitions and guards
│   ├── seo/             # SEO helpers/meta defaults
│   ├── theme/           # theme tokens/config
│   └── ...
├── .env.example
├── Dockerfile
└── ...
```

### Feature folder rule

Keep feature-specific code together. Example:

``` text
src/features/cart/
├── components/
│   ├── CartItem.jsx
│   └── CartSummary.jsx
├── hooks/
│   └── useCart.js
├── pages/
│   └── CartPage.jsx
├── cart.slice.js
├── cart.thunk.js
├── cart.api.js
├── cart.selectors.js
└── ...
```

A feature does not need every folder/file. Add only what the feature
uses.

### Frontend folder responsibilities

-   **`app/`** --- app entry, Redux store setup, root app, global CSS
    import.
-   **`components/`** --- reusable components shared across multiple
    features (buttons, dialogs, loaders, common layout).
-   **`config/`** --- environment/app configuration.
-   **`constants/`** --- shared constants (roles, route names, stable
    enums).
-   **`features/`** --- domain features; pages, components, hooks, Redux
    slice/thunks, feature APIs.
-   **`lib/`** --- shared utility libraries and configured wrappers
    (HTTP client, date helpers, storage helpers).
-   **`routes/`** --- route map, route guards, protected layouts.
-   **`seo/`** --- title/meta defaults and SEO helpers.
-   **`theme/`** --- design tokens or theme configuration.

------------------------------------------------------------------------

## 5. Redux Toolkit Rules

Use **Redux Toolkit** for shared/global state. Keep feature state inside
its feature folder.

### File conventions

-   `*.slice.js` --- state, reducers, synchronous actions.
-   `*.thunk.js` --- async workflows (`createAsyncThunk`) and API calls
    orchestration.
-   `*.selectors.js` --- selectors and derived state.
-   `*.api.js` --- feature-specific API functions (optional if API calls
    are already organized in thunks or a shared API layer).

### State guidelines

Use Redux for state that multiple parts of the app need, such as: -
authenticated user/session (tokens/session handling per security
design) - cart (if shared across screens) - order lifecycle/tracking -
user preferences shared across views - admin/restaurant/rider data when
needed across components

Keep local React state (`useState`) for ephemeral UI state: - modal
open/close - tab selection - temporary form input before submit -
hover/accordion state - local pagination/filter state when not shared

### Redux rules

1.  Use Redux Toolkit `configureStore` and `createSlice`.
2.  Keep the store configuration in `src/app/store.js`.
3.  Register reducers by feature.
4.  Avoid hand-written Redux boilerplate.
5.  Use thunks for async requests/workflows.
6.  Use selectors rather than reaching into store state from many
    components.
7.  Keep state serializable; do not store functions, class instances,
    sockets, or raw `Error` objects.
8.  Track loading/error/success states consistently.
9.  Do not duplicate server data unnecessarily across unrelated slices.
10. Clear/reset sensitive state on logout.
11. Avoid making components perform the same API call independently when
    shared state/cache is appropriate.
12. Add tests for reducers, thunks and important state transitions.

------------------------------------------------------------------------

## 6. Tailwind CSS Rules

Use **Tailwind CSS** for styling. Avoid introducing another styling
approach without an explicit project decision.

### Styling rules

1.  Prefer Tailwind utility classes in JSX.
2.  Use the existing theme/design tokens where configured.
3.  Use consistent spacing, typography, colors, borders, radius and
    shadow scales.
4.  Avoid arbitrary values unless a design genuinely requires them.
5.  Avoid inline styles except for dynamic values that Tailwind cannot
    express cleanly.
6.  Do not add large global CSS rules for individual feature components.
7.  Global CSS is reserved for resets, base styles, fonts, global theme
    variables and Tailwind directives/imports.
8.  Reuse shared UI components for repeated patterns (buttons, inputs,
    badges, modals, cards).
9.  Keep responsive layouts mobile-first.
10. Check hover, focus, disabled, loading, error and empty states.
11. Ensure keyboard accessibility and visible focus indicators.
12. Do not concatenate dynamic Tailwind class names in ways that prevent
    class scanning; use explicit class mappings for variants.
13. Avoid conflicting utility classes and unnecessary `!important`.

------------------------------------------------------------------------

## 7. API & Response Handling Rules

-   Use the existing shared API client/wrapper if one exists.
-   Keep endpoint calls organized by feature.
-   Do not place raw `fetch`/Axios calls throughout UI components.
-   Handle loading, success, empty and error states.
-   Use a consistent response and error format.
-   Validate request/response boundaries.
-   Avoid leaking backend stack traces to users.
-   Keep API base URLs in environment/config, not hard-coded.
-   Do not log auth tokens or personal/payment data.
-   Use pagination for large collections.

------------------------------------------------------------------------

## 8. Naming & File Rules

### Backend

-   Keep current suffix conventions: `*.controller.js`, `*.model.js`,
    `*.route.js`, `*.service.js`, `*.validate.js`.
-   Use clear lower-case module folder names (e.g. `user`, `restaurant`,
    `order`).
-   Follow the established camelCase naming for variables/functions.

### Frontend

-   React components/pages: PascalCase file and component names
    (e.g. `CartItem.jsx`, `CheckoutPage.jsx`).
-   Hooks: prefix with `use` (e.g. `useCart.js`).
-   Redux files: feature prefix and conventional suffix
    (`cart.slice.js`, `cart.thunk.js`, `cart.selectors.js`).
-   Utilities: descriptive camelCase names.
-   Avoid vague names such as `data.js`, `helper.js`, `common2.js`,
    `temp.js`.

------------------------------------------------------------------------

## 9. Feature Development Workflow (Required)

When starting a new feature:

1.  Confirm the user flow and acceptance criteria.
2.  Identify the backend module and frontend feature folder.
3.  Add/adjust Mongoose schema and indexes if persistence is needed.
4.  Add request validation.
5.  Implement service/business logic.
6.  Implement controller.
7.  Add routes and authorization.
8.  Add tests.
9.  Implement feature API calls on frontend.
10. Add Redux slice/thunk/selectors if shared state or async state
    requires them.
11. Build feature pages and feature components.
12. Use shared components when appropriate.
13. Style with Tailwind.
14. Connect the flow end-to-end.
15. Test success, validation, failure, loading, empty and permission
    cases.
16. Update docs/API notes if behavior or contract changed.

------------------------------------------------------------------------

## 10. Rules for AI/Developer Contributions

Any AI assistant or developer contributing code to this project must:

-   Inspect the existing structure and related files before creating new
    files.
-   Follow the architecture in this document and the codebase's current
    conventions.
-   Avoid refactoring unrelated code while implementing a requested
    feature.
-   Do not change libraries, architecture, naming patterns or styling
    systems without approval.
-   Do not create duplicate shared utilities/components.
-   Do not skip validation, authorization or tests for convenience.
-   Keep changes scoped to the current feature.
-   Explain which files were created/changed and why.
-   Flag assumptions rather than silently deciding important product
    behavior.
-   Prefer incremental, reviewable changes.

------------------------------------------------------------------------

## 11. Definition of Done (Feature Checklist)

A feature is considered done when:

-   [ ] Flow/acceptance criteria implemented.
-   [ ] Backend validation and authorization included.
-   [ ] Database schema/migrations (if needed) reviewed.
-   [ ] Business logic is in service layer, not controller.
-   [ ] API responses follow project conventions.
-   [ ] Frontend feature folder is organized correctly.
-   [ ] Redux state is added only where needed.
-   [ ] Tailwind styling follows shared design conventions.
-   [ ] Loading/error/empty/success states handled.
-   [ ] Responsive and accessibility basics checked.
-   [ ] Tests pass.
-   [ ] No secrets or sensitive logs.
-   [ ] Documentation updated if necessary.

------------------------------------------------------------------------

## 12. Project Rule Summary

**Backend:** Express routes → controllers → services → Mongoose models;
validate inputs; central middleware/config/utils.

**Frontend:** React app → feature-based folders → feature
pages/components/hooks/API → Redux Toolkit slice/thunks/selectors for
shared state.

**Styling:** Tailwind CSS only by default; shared theme and reusable
components; responsive and accessible.

**Working method:** Inspect existing code first, implement one feature
at a time, test it, and keep architecture consistent.
