---
title: 'SHA-8: Free-shipping progress bar and consistent shipping policy'
type: 'feature'
created: '2026-10-24'
status: 'done'
baseline_revision: 'd20d1d7499beffad94446da97a2c362ce45b9936'
review_loop_iteration: 0
followup_review_recommended: false
context: []
warnings: [oversized]
deferred:
  - summary: >-
      POST /api/checkout prices the Stripe line items, the shipping decision, and the Order total from client-posted item prices.
    evidence: |-
      route.ts computes subtotal and unit_amount from item.price in the request body. A tampered cart can lower prices or inflate them to unlock free shipping. This predates SHA-8, and the intent forbids changing how the route trusts or re-prices items.
    location: >-
      app/api/checkout/route.ts:41
    severity: high
  - summary: >-
      The home page ("Free shipping on every order") and the header promo ("FREE SHIPPING") contradict the $50 free-shipping policy.
    evidence: |-
      app/page.tsx and components/Header.tsx still promise unconditional free shipping. Stripe already charged $5 under $50 before this change. The intent puts the home page and the header promo out of scope.
    location: >-
      app/page.tsx, components/Header.tsx
    severity: medium
  - summary: >-
      AGENTS.md still says there are no tests and does not list npm test as a verification step.
    evidence: |-
      AGENTS.md "Running and verifying" lists only lint and build, so agents following it never run the new threshold tests. Fixes to agent-context files are deferred by policy.
    location: >-
      AGENTS.md:17
    severity: medium
  - summary: >-
      No automated check confirms that cart, checkout, and the Stripe route all use getShippingCost.
    evidence: |-
      Only lib/shipping.ts is unit-tested. Agreement across the three surfaces holds by construction, because each calls getShippingCost. If any caller reintroduced an inline rule, every test would still pass. Closing this needs the route's line-item logic extracted into a pure lib function, or a route/component test harness, which the spec does not allow adding.
    location: >-
      app/cart/page.tsx, app/checkout/page.tsx, app/api/checkout/route.ts
    severity: medium
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

### 2026-10-24 — Review pass
- verdicts: 20 findings — high 2, medium 5, low 7, false 5, maybe-false 1
- findings:
  - `[low]` `[patch]` (blind) Cart progress used `Math.round`, so subtotals 4975–4999 showed a full bar and aria-valuenow 100 while the message still said "Add $X more". — Switched `progressPct` to `Math.floor`. The bar now reaches 100 only at the threshold. Current prices are multiples of 100, so this could not happen yet.
  - `[low]` `[patch]` (blind) Screen readers did not hear the message change on +/-/Remove. — Added `aria-live="polite"` to the message and `aria-valuetext` to the progressbar.
  - `[false]` `[reject]` (blind) Unlocking looks the same as partial progress. — The message text changes to "You’ve unlocked free shipping!", the bar fills, and the Shipping row shows "Free". The unlock is visibly confirmed.
  - `[medium]` `[defer]` (blind) The home page and header copy promise free shipping on every order, which contradicts the $50 policy. — Real and pre-existing. The intent's Never list excludes the home page and header promo.
  - `[high]` `[defer]` (blind) Free shipping and Order totals come from client-sent prices. — Real and pre-existing. Stripe unit_amount also uses item.price. The intent forbids changing how the route trusts or re-prices items.
  - `[false]` `[reject]` (blind) Negative or non-integer subtotals are handled inconsistently. — Not reachable: `updateQuantity` removes items below 1, and prices are integer cents, so `totalPrice` is always a non-negative integer.
  - `[false]` `[reject]` (blind) `qualifiesForFreeShipping` has no direct test, and $11.50 is untested. — The predicate is exercised at 4950/5000/7800 through `getShippingCost`. The two-decimal path is covered by the 4950 → `$0.50` row.
  - `[false]` `[reject]` (blind) The unlocked message is duplicated in the test. — Pinning the exact copy, including U+2019, independently is the point of the test. Importing it would make the assertion tautological.
  - `[low]` `[defer]` (blind) The test script runs one file, and AGENTS.md does not mention `npm test`. — No other test file exists today, so the glob part has no current defect. The AGENTS.md part is an agent-context edit and is deferred, grouped with the verification-gap AGENTS.md finding.
  - `[low]` `[patch]` (blind) The fill transition ignores reduced motion. — Added `motion-reduce:transition-none` to the fill.
  - `[low]` `[patch]` (edge) progressPct rounds to 100 for 4975–4999. — Same root cause as the first row. Fixed with `Math.floor`.
  - `[maybe-false]` `[reject]` (edge) Corrupt localStorage could make totalPrice NaN. — Only reachable by hand-editing localStorage, and it would already break the existing Subtotal display. Settling it would need a test that injects malformed cart JSON. Even if true it is only low, so rejected.
  - `[high]` `[defer]` (edge) Tampered or non-numeric client prices drive shipping and the Order total. — Same root cause as the client-price row. Pre-existing, and excluded by the intent.
  - `[medium]` `[defer]` (verification-gap) AGENTS.md verify step omits `npm test`, so the threshold tests never run in the documented path. — Agent-context file edits are deferred by policy.
  - `[medium]` `[defer]` (verification-gap) No check proves cart, checkout, and Stripe share the rule. — Pre-verified by that layer. Closing it needs extracting the route logic or adding a harness, which the spec forbids. Deferred.
  - `[low]` `[patch]` (verification-gap, other) The progress bar can look full before unlock. — Same root cause as the first row. Fixed with `Math.floor`.
  - `[medium]` `[defer]` (intent-alignment) Cross-surface agreement holds by construction, not by test. — Same root cause as the verification-gap regression gap. Deferred.
  - `[low]` `[patch]` (intent-alignment) Rounding can show 100% before unlock (the "full iff unlocked" reading). — Same root cause as the first row. Fixed with `Math.floor`.
  - `[false]` `[reject]` (intent-alignment) The test file contains 3900/5000/500 literals. — The test asserts the policy values and fixtures. None is a shipping rule in another file. The grep of app/ and components/ finds no shipping literal or comparison.
  - `[medium]` `[defer]` (intent-alignment) Header and home copy still disagree with the $50 rule. — Same root cause as the home page and header row. Excluded by the intent's Never list.

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

Status: done
Blocking condition: none.

**Summary:** The shipping policy now lives in one place, `lib/shipping.ts`: free at a subtotal of 5000 cents or more, otherwise 500 cents. `/cart`, `/checkout`, and `POST /api/checkout` all use it. This fixes the old split where the client gave free shipping at $39 but the server only at $50. The cart summary now shows a live free-shipping message and a progress bar.

**Files changed:**
- `lib/shipping.ts` — new. Holds the constants, `qualifiesForFreeShipping`, `getShippingCost`, `getFreeShippingRemaining`, `getFreeShippingProgress`, and `getFreeShippingMessage`. It has no imports.
- `lib/shipping.test.ts` — new. `node:test` cases for every matrix row, grouped as below, exactly at, and above the threshold.
- `package.json` — adds the `"test": "tsx --test lib/shipping.test.ts"` script.
- `app/api/checkout/route.ts` — the inline rule is replaced by `getShippingCost(subtotal)`. The line-item shape is unchanged.
- `app/checkout/page.tsx` — the wrong `>= 3900` rule is replaced by `getShippingCost(totalPrice)`.
- `app/cart/page.tsx` — uses `getShippingCost`. The static "$39" note is replaced by the progress block, with an aria-live message and a progressbar using floor percentage, aria-valuetext, and reduced-motion support.

**Review findings:** 20 findings: high 2, medium 5, low 7, false 5, maybe-false 1.
- Patched: 3 entries, all low.
  - Progress rounding: switched to `Math.floor`.
  - Screen-reader announcement: added `aria-live` and `aria-valuetext`.
  - Reduced motion: added `motion-reduce:transition-none`.
- Deferred: 4 items. See the `deferred` frontmatter.
  - Client-price trust in the route (high, pre-existing).
  - Home page and header free-shipping copy (medium, out of scope per intent).
  - AGENTS.md verify step omits `npm test` (medium, agent-context file).
  - No cross-surface automated test (medium).
- Rejected:
  - Unlock styling: false, because the message, the full bar, and "Free" confirm it.
  - Negative or non-integer subtotals: false, not reachable.
  - Missing direct predicate test or $11.50 case: false, already covered.
  - Duplicated unlocked copy in the test: false, intentional pinning.
  - Test literals: false, they are not shipping rules.
  - Corrupt localStorage NaN: maybe-false, and low even if true.

**Follow-up review recommended:** false. Patched entries were 0 high, 0 medium, and 3 low.

**Verification:**
- `npm test` passes 7 of 7, covering all six matrix rows plus the constants.
- `npm run lint` reports no warnings or errors.
- `npm run build` compiles successfully with no env vars.
- `grep -rnE "(3900|5000) \? 0" app components` finds no matches.
- The matrix test audit passed.

**Residual risks:**
- Manual browser checks were not run: the cart +/-/Remove walkthrough, the two-conditioner checkout, and the Stripe line items. There was no seeded DB or Stripe test keys.
- `Math.floor` on float progress can read 1% low for some subtotals (for example 2900 → 57%). This is cosmetic, and the bar never fills early.
- Carts from $39.00 to $49.99 now show $5.00 shipping on cart and checkout. This matches what Stripe already charged.
