---
title: 'SHA-8: Free-shipping progress bar and consistent shipping policy'
type: 'feature'
created: '2026-10-24'
status: 'ready-for-dev'
baseline_revision: 'fb2e3d6383d185db5f0e6a3d70b20d8e08bfb8fd'
review_loop_iteration: 0
followup_review_recommended: false
context: []
warnings: [oversized]
deferred: []
---

<intent-contract>

## Intent

**Problem:** The cart never tells shoppers how far they are from free shipping. The shipping rule also disagrees across the flow. `/cart` and `/checkout` make orders of $39 or more free, but `POST /api/checkout` only makes orders of $50 or more free. So a $39 cart shows "Free" and then Stripe charges $5.

**Approach:** Put the shipping policy in one pure module, `lib/shipping.ts`: free at a subtotal of 5000 cents or more, otherwise a flat 500 cents. The module also exports the progress and message helpers. The cart, the checkout summary, and the Stripe session builder all use it. The cart shows a progress bar and the remaining-amount message, both computed from the live subtotal. Unit tests cover subtotals below, exactly at, and above the threshold.

## Boundaries & Constraints

**Always:**
- The story's example sets the policy. "A $39 cart shows 'Add $11 more'" means the threshold is $50 (`5000` cents). Reaching it exactly qualifies, so the rule is `subtotal >= 5000`, which matches what the Stripe route already charges. Below the threshold, shipping is the existing flat `500` cents.
- Money is integer cents. Define `FREE_SHIPPING_THRESHOLD = 5000` and `FLAT_SHIPPING_COST = 500` once, in `lib/shipping.ts`. No other file may contain a shipping literal (`3900`, `5000`, `500`) or its own `>=` comparison for shipping.
- Exact copy: below the threshold, `Add $X more for free shipping.`; at or above it, `You’ve unlocked free shipping!` (with a typographic apostrophe, U+2019). `$X` is the remaining amount. Show whole dollars with no decimals when the cents are zero (`$11`), otherwise two decimals (`$11.50`).
- Progress is `min(subtotal / 5000, 1)`, rendered as a percentage width. The bar is full when free shipping is unlocked.
- The cart message and bar come from `useCart().totalPrice`. They update on every `+`, `-`, and Remove without a reload.
- `lib/shipping.ts` imports nothing: no React, no `@/` aliases, no Prisma or Stripe. That keeps it importable from client components, the route handler, and `tsx --test`.
- Use Tailwind tokens only: `navy-*` for the track and text, `coral-*` for the fill, as `AGENTS.md` requires. Give the bar `role="progressbar"` with `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`.

**Never:**
- Do not change product prices, the seed, `app/page.tsx`, the header promo banner, or the footer copy. Do not add a progress bar to `/checkout`. Checkout only has to agree on the shipping amount.
- Do not add a test framework dependency. Use Node's built-in `node:test` and `node:assert`, run through the existing `tsx` devDependency.
- Do not change Order status handling, the webhook, or the Prisma schema. Do not change the route to trust or re-price items any differently than it does today.

## I/O & Edge-Case Matrix

| Scenario | Subtotal (cents) | Shipping | Remaining | Progress | Message |
|----------|------------------|----------|-----------|----------|---------|
| Below: one shampoo | 3900 | 500 | 1100 | 0.78 | `Add $11 more for free shipping.` |
| Below: one conditioner | 2500 | 500 | 2500 | 0.5 | `Add $25 more for free shipping.` |
| Below: fractional remaining | 4950 | 500 | 50 | 0.99 | `Add $0.50 more for free shipping.` |
| Exactly at: two conditioners | 5000 | 0 | 0 | 1 | `You’ve unlocked free shipping!` |
| Above: two shampoos | 7800 | 0 | 0 | 1 (capped) | `You’ve unlocked free shipping!` |
| Empty | 0 | 500 | 5000 | 0 | `Add $50 more for free shipping.` (the cart page shows its empty state instead) |

</intent-contract>

## Code Map

- `lib/shipping.ts` -- NEW. Single source of the policy: constants, `getShippingCost(subtotal)`, `getFreeShippingRemaining(subtotal)`, `getFreeShippingProgress(subtotal)`, `getFreeShippingMessage(subtotal)`.
- `lib/shipping.test.ts` -- NEW. `node:test` cases for every matrix row. Import via a relative path (`./shipping`), because `tsx` does not resolve the `@/` alias.
- `app/cart/page.tsx:29-30` -- `const shippingCost = totalPrice >= 3900 ? 0 : 500` is the wrong threshold. `:97-101` holds the static text "Free shipping on orders over $39", which the progress block replaces. The order summary card starts at `:85`.
- `app/checkout/page.tsx:89-90` -- has the same wrong `>= 3900` rule. The summary renders shipping at `:229-232`.
- `app/api/checkout/route.ts:40-42` -- `subtotal >= 5000 ? 0 : 500`. `:57-70` pushes a `Shipping` line item when the cost is above 0. `total` is stored on the Order at `:90`. Replace the inline rule with `getShippingCost`, and keep the line-item shape unchanged.
- `components/CartProvider.tsx:85` -- `totalPrice` is the live subtotal in cents. This file is read-only.
- `components/CartItem.tsx` -- unused by `/cart` (the cart renders its own rows) and uses undefined `brand-*` classes. Do not touch it.
- `prisma/seed.ts:11,22` -- prices are 3900 (shampoo) and 2500 (conditioner), so 2 × conditioner = 5000 is a real at-threshold cart. Read-only.
- `package.json` -- scripts has no `test` entry. `tsx` ^4.19 is already a devDependency, and Node v25 runs locally.

## Tasks & Acceptance

**Execution:**
- `lib/shipping.ts` -- create the constants and the four pure functions from the Code Map, following the matrix -- one policy for cart, checkout, and Stripe.
- `lib/shipping.test.ts` -- write `node:test` tests asserting shipping, remaining, progress, and the exact message for each matrix row, and grouping them as below, exactly at, and above the threshold -- the story requires threshold coverage.
- `package.json` -- add `"test": "tsx --test lib/shipping.test.ts"` -- gives the tests a repeatable command with no new dependency.
- `app/api/checkout/route.ts` -- replace the inline rule with `getShippingCost(subtotal)` imported from `@/lib/shipping` -- the Stripe session and the stored Order total follow the shared policy.
- `app/checkout/page.tsx` -- replace the inline rule with `getShippingCost(totalPrice)` -- the checkout summary agrees with Stripe.
- `app/cart/page.tsx` -- use `getShippingCost` for the summary. Replace the "Free shipping on orders over $39" paragraph with an always-visible progress block: the message from `getFreeShippingMessage(totalPrice)` and a track/fill bar sized by `getFreeShippingProgress(totalPrice)` -- the shopper-facing feature.

**Acceptance Criteria:**
- Given one $39 shampoo in the cart, when `/cart` loads, then it shows `Add $11 more for free shipping.`, a bar about 78% full, shipping `$5.00`, and total `$44.00`.
- Given that cart, when the shopper clicks `+` on the shampoo, then without a reload the message becomes `You’ve unlocked free shipping!`, the bar is full, shipping shows `Free`, and total is `$78.00`.
- Given that two-bottle cart, when the shopper clicks `-`, then the message returns to `Add $11 more for free shipping.` and shipping returns to `$5.00`.
- Given two $25 conditioners ($50.00 exactly), when the shopper views `/cart` and then `/checkout`, then both show shipping `Free`, and submitting checkout creates a Stripe session with no `Shipping` line item and a PENDING Order with `total` 5000.
- Given one $39 shampoo, when the shopper submits `/checkout`, then the checkout summary, the Stripe session (a `Shipping` line item for 500), and the Order `total` (4400) all show the same $5.00 shipping and $44.00 total.
- Given the repository, when you search `app/` and `components/` for `3900 ? 0` and `5000 ? 0`, then nothing matches.

## Spec Change Log

## Review Triage Log

## Design Notes

The story only says "approved shipping policy," and no PRD or other doc defines it. Its own example pins the $50 threshold, and `POST /api/checkout` already charges by that rule. So the server is treated as correct, and the client's `3900` is the bug. The $5 flat rate is unchanged, because every surface already uses it. Pure functions keep the threshold tests independent of React and Stripe. The cart ACs are checked in the browser against the real page.

Suggested shape for the cart progress block (inside the summary card, above the Subtotal row):

```tsx
<p className="text-sm text-navy-700">{getFreeShippingMessage(totalPrice)}</p>
<div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}
     className="h-2 bg-navy-100 rounded-full overflow-hidden">
  <div className="h-full bg-coral-500 transition-all" style={{ width: `${pct}%` }} />
</div>
```

## Verification

**Commands:**
- `npm test` -- expected: every below, at, and above threshold case passes.
- `npm run lint` -- expected: no errors.
- `npm run build` -- expected: succeeds with no env vars.
- `grep -rnE "(3900|5000) \? 0" app components` -- expected: no matches.

**Manual checks (if no CLI):**
- Run `npm run dev` against a seeded DB and walk through the cart ACs (1 shampoo → `+` → `-`, and 2 conditioners) on `/cart` and `/checkout`. With Stripe test keys, check the session's line items in the Stripe dashboard.

## Auto Run Result

Status: ready-for-dev
Blocking condition: none. Halted after planning as the invocation directed; implementation and review were not run.
