# Wanchai MVP verification

## Scope
Vite, React and TypeScript storefront and single-device operations workspace, built from both supplied input files. Original menu prices, Hai Ya pickup address, opening hours and the single-kitchen/single-pickup model were retained.

## Passing checks
- `npm run build`: TypeScript and production bundle pass.
- `npm run lint`: passes.
- `npm audit --omit=dev --audit-level=high`: zero vulnerabilities reported at execution.
- `node scripts/audit.mjs`: Chromium end-to-end checks pass with zero uncaught page errors.
- Order creation, local persistence, stock decrement, kitchen status transitions, POS quantity input, weekly-plan creation, Thai language switching, mobile navigation, and real offline page reload verified.
- axe-core WCAG 2 A/AA and 2.1 AA checks: zero violations in 17 tested states, including storefront, checkout, orders, kitchen, POS, subscriptions, admin, dark-mode variants, Thai dark storefront, comfort preferences, enlarged/high-contrast storefront and mobile storefront.
- No horizontal overflow at the tested 390px mobile viewport.
- Native dialog semantics provide focus containment, Escape dismissal and trigger-focus restoration.

Automated checks are not a complete accessibility certification; manual screen reader, device and user testing is still recommended.

## Fixes and optimizations
- Corrected low-contrast secondary text in light and dark themes, order status badges, savings text and contrast previews.
- Removed unused routing and animation dependencies, including an inherited dependency with security advisories.
- Corrected invalid font import order and existing configuration lint errors.
- Replaced blob-URL service worker registration from the input prototype with a same-origin `/sw.js` file.
- Network-first navigation with an offline shell fallback; cache-first local assets with background refresh. No unsupported claims of server synchronization.
- Optimized generated photography to WebP: approximately 68 KB hero and 24 KB sesame image instead of approximately 2 MB each. Hero is preloaded; menu imagery is lazy-loaded.
- Accessibility engine is dynamically imported, keeping its approximately 194 KB gzipped payload outside the initial application bundle. The build warning for this optional audit-only chunk does not affect storefront loading.
- Validates phone digits, window capacity and stock before checkout.
- Prevents duplicate active pickup-plan records when requesting a subsequent plan pickup; editing a plan bag removes its plan discount.

## Operational boundaries
This deployment is a fully interactive frontend/local workspace, not a connected multi-user commerce backend. Orders, customer details, stock, settings, and pickup-plan preferences are saved in browser localStorage on the current device. They are not transmitted to a remote kitchen. No authentication, shared database, live inventory synchronization, online payment processing, automatic recurring orders, automatic billing, SMS, or email delivery is connected. Weekly plans require confirmation of each future pickup and payment at pickup. These boundaries are disclosed in the UI.

Before accepting real remote customer orders, connect an authenticated backend and persistent database; implement server-side capacity/stock transactions and idempotency; protect staff operations with role-based authorization; configure notification delivery and the business's verified contact information; and add payment/billing only with merchant credentials and consent. No credentials were present in either supplied file.

## Reproduction
Run `npm run build`, then `node scripts/audit.mjs`. The script starts an ephemeral static production server, executes tests, saves screenshots and `audit/results.json`, and shuts down the browser and server on completion.
