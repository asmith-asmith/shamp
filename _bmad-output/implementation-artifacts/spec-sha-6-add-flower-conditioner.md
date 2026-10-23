---
title: 'SHA-6: Add Flower conditioner'
type: 'feature'
created: '2026-10-22'
status: 'done'
baseline_revision: '0ff8da78cf97ccc90034472e53e76efe7ae6c69a'
review_loop_iteration: 0
followup_review_recommended: false
context: []
warnings: []
deferred:
  - summary: >-
      "Subscribe" is not real recurring billing; the conditioner's "$20/month" (like the shampoo's "Ships every 60 days") is a one-time discounted Stripe payment.
    evidence: |-
      app/api/checkout/route.ts creates every session with mode 'payment'. The story's "$20/month, if applicable" answers the earlier question about a shampoo-style price split, and PRD 9.2 defers real subscriptions. Buyers who choose subscribe pay once and are never billed again.
    location: >-
      app/page.tsx (conditioner Subscribe option); app/api/checkout/route.ts
    severity: medium
  - summary: >-
      /api/checkout trusts the client-sent item price and records no purchase type, so subscribe vs. one-time vs. tampered prices cannot be told apart server-side.
    evidence: |-
      route.ts uses item.price directly for unit_amount and OrderItem.price and never reads Product.price. This existed before this story; the home-page-only subscribe price relies on it.
    location: >-
      app/api/checkout/route.ts
    severity: high
  - summary: >-
      Cart merges lines by id only, so adding the same product at two prices (subscribe and one-time, or home page and /products) keeps the first price.
    evidence: |-
      components/CartProvider.tsx addItem only increments quantity when it finds an existing id. The shampoo already behaves this way; the conditioner inherits it.
    location: >-
      components/CartProvider.tsx addItem
    severity: medium
  - summary: >-
      Home-page product data duplicates prisma/seed.ts (now for two products); parity of id/slug/price is checked only by hand.
    evidence: |-
      This duplication is documented in CLAUDE.md. A one-sided id edit would make home-page checkout fail on the OrderItem FK. PRD FR-1 (catalog-driven home page) or a shared module would remove it.
    location: >-
      app/page.tsx conditioner const; prisma/seed.ts
    severity: medium
  - summary: >-
      No automated tests cover price selection or catalog/checkout paths; the repo has no test framework.
    evidence: |-
      package.json has no test script or dependency. Verification is lint, build, and a manual review of the acceptance criteria.
    location: >-
      repository
    severity: medium
  - summary: >-
      AGENTS.md and CLAUDE.md still describe a single hardcoded product; the seed/home-page sync rule should name the conditioner too.
    evidence: |-
      AGENTS.md says "Single-product e-commerce site" and "The product in app/page.tsx duplicates the seeded row". The fix edits agent-context files, so it is deferred.
    location: >-
      AGENTS.md; CLAUDE.md
    severity: low
  - summary: >-
      The conditioner only appears on /products after the DB is re-seeded; checking it out before that fails on the OrderItem FK.
    evidence: |-
      This is the existing two-source architecture: the shampoo has the same requirement. Run `npx dotenv -e .env.local -- npm run db:seed` on each environment.
    location: >-
      prisma/seed.ts; deployment
    severity: medium
---

<intent-contract>

## Intent

**Problem:** The store sells only the shampoo. Linear story SHA-6 asks for a new conditioner called "Flower" that is for sale and appears on the home page: $25 one-time, $20/month subscription, 12 oz, made-up description, filler image, and agent-chosen category, id, and slug.

**Approach:** Add a Flower conditioner row to the seed. Add a matching hardcoded conditioner section to `app/page.tsx` that has the same subscribe / one-time choice the shampoo has. `/products`, `/products/flower-conditioner`, and checkout get it through the existing `Product` table with no code change.

## Boundaries & Constraints

**Always:**
- Chosen values, identical in seed and home page: `id: 'shamp-flower-conditioner'`, `name: 'Shamp Flower Conditioner'`, `slug: 'flower-conditioner'`, `price: 2500`, `image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800'`, `category: 'Conditioner'`, `size: '12 oz'`, `featured: true`. The home page also has `subscriptionPrice: 2000`.
- Money stays in integer cents. Divide by 100 only when rendering.
- Description and copy treat Flower as a Cosmetic Product (PRD §3, §7.1). No claims that it treats, prevents, or cures dandruff, hair loss, or any condition.
- Use the existing Tailwind tokens: `navy-*`, `coral-*` for the CTA, `cream`.

**Never:**
- Do not touch the shampoo's data, copy, or price.
- Do not make the home page catalog-driven (PRD FR-1). Do not add real Stripe recurring subscriptions (PRD §9.2 defers them). Do not change the schema, checkout, webhook, or cart.
- Do not add new image hosts. The image must stay on `images.unsplash.com`, the only host allowed in `next.config.js`.

</intent-contract>

## Code Map

- `prisma/seed.ts` -- `products` array (one shampoo entry). The upsert loop already copies every field, so a second entry is enough.
- `app/page.tsx` -- client home page. `product` const (lines 13-21) plus `purchaseType`/`added` state drive the shampoo's subscribe/one-time radios and `addItem` call (lines 32-43, 129-204). Copy that pattern for the conditioner with its own const and its own state. The Benefits section starts at around line 280. Add the conditioner section before it.
- `components/CartProvider.tsx` -- `addItem(Omit<CartItem,'quantity'>)` needs `id, name, slug, price, image`. Read-only.
- `app/api/checkout/route.ts` -- uses the cart's `price` and `id` as given. `OrderItem.productId` needs the id to exist in `Product`. Read-only.
- `app/products/page.tsx`, `app/products/[slug]/page.tsx` -- read Prisma and render `price`, `size`, `description`, `image`. Read-only; the new row shows up automatically.
- `next.config.js` -- only `images.unsplash.com` is allowed. Read-only.

## Tasks & Acceptance

**Execution:**
- `prisma/seed.ts` -- append the Flower conditioner entry with the values in Always and a cosmetic-only description of about 1-2 sentences -- makes it sellable through the catalog and checkout FK.
- `app/page.tsx` -- add a `conditioner` const that mirrors the seed (id, name, slug, description, price 2500, image) plus `subscriptionPrice: 2000`. Add a "Flower Conditioner" section between the shampoo hero and Benefits. It holds the image (next/image), name, "12 oz", the description, a subscribe radio ("Subscribe" $20/month, default) and a one-time radio ($25), and a coral Add to Cart button that calls `addItem` with the selected price and shows "Added to Cart!" feedback. Keep its state separate from the shampoo state -- makes it appear on the home page and buyable there.

**Acceptance Criteria:**
- Given the home page, when it loads, then a Flower Conditioner section shows the filler image, "12 oz", the description, $20/month subscribe and $25 one-time options, and an Add to Cart button. The shampoo section is unchanged.
- Given the conditioner subscribe option (the default), when the user clicks Add to Cart, then the cart gets `{ id: 'shamp-flower-conditioner', slug: 'flower-conditioner', price: 2000 }` and shows "Shamp Flower Conditioner" at $20.00. Given one-time, the cart line price is 2500 ($25.00).
- Given a seeded DB, when visiting `/products`, then the Flower conditioner card shows $25.00 under the "Conditioner" category filter. When visiting `/products/flower-conditioner`, then the page shows the name, $25.00, 12 oz, the description, and an Add to Cart button that adds price 2500.
- Given a cart that holds the conditioner, when checking out, then `OrderItem.productId = 'shamp-flower-conditioner'` satisfies the `Product` foreign key.
- Given `app/page.tsx` and `prisma/seed.ts`, when compared, then `id`, `name`, `slug`, `price`, `image`, and `description` of the conditioner are identical.
- Given the conditioner copy, when read, then it makes no drug or treatment claims.

## Spec Change Log

## Review Triage Log

### 2026-10-22 — Review pass
- verdicts: 27 findings — high 1, medium 10, low 8, false 8, maybe-false 0
- findings:
  - `[medium]` `[defer]` (blind) "$20/month" label promises billing that checkout does not do — real (mode 'payment'), but the lack of recurring billing predates this story (shampoo's "Ships every 60 days"). The story answers the earlier question about a shampoo-style price split, and PRD 9.2 defers subscriptions. Deferred.
  - `[high]` `[defer]` (blind) Subscribe price is client-only and checkout records whatever price is sent — real. Pre-existing: route.ts never reads Product.price. Deferred.
  - `[medium]` `[defer]` (blind) Subscribe and one-time collide in the cart — real. Pre-existing CartProvider merge-by-id. Deferred.
  - `[low]` `[defer]` (blind) AGENTS.md/CLAUDE.md still describe one product — real. The fix edits agent-context files. Deferred.
  - `[medium]` `[defer]` (blind) Conditioner data duplicated instead of shared — real drift risk (FK break), but it follows the documented pre-existing two-source design; FR-1 resolves it. Deferred.
  - `[low]` `[patch]` (blind) Subscribe option shows no saving against $25 — patched: added a struck-through $25 span, mirroring the shampoo.
  - `[false]` `[reject]` (blind) `toFixed(0)` misrenders cent prices — the conditioner prices are constants 2000/2500, so no rounding occurs.
  - `[low]` `[patch]` (blind) New `<Image fill>` lacks `sizes` — patched: added `sizes="(min-width: 1024px) 50vw, 100vw"`.
  - `[medium]` `[defer]` (edge) Subscribe then one-time add keeps the first price — same root cause as the cart-merge row. Deferred.
  - `[medium]` `[defer]` (edge) Home-page 2000 and product-page 2500 adds merge into one line — same cart-merge root cause. Deferred.
  - `[medium]` `[defer]` (edge) Subscribe label vs. checkout mode 'payment' — same root cause as the "$20/month" row. Deferred.
  - `[medium]` `[defer]` (edge) Code deployed before the seed runs makes checkout fail on the FK — real, but it is the existing seed/home-page architecture; the shampoo needs the same step. Deferred.
  - `[false]` `[reject]` (edge) Slug conflict on upsert — no row with slug 'flower-conditioner' exists anywhere; the seed is the only writer of Product rows.
  - `[false]` `[reject]` (edge) `toFixed(0)` misrenders prices — same refutation as the blind row: whole-dollar constants.
  - `[medium]` `[defer]` (edge, claim) One-time chosen but charged $20 after an earlier subscribe add — same cart-merge root cause. Deferred.
  - `[medium]` `[defer]` (edge, claim) No recurring billing behind "$20/month" — same root cause as the "$20/month" row. Deferred.
  - `[medium]` `[defer]` (verification-gap) No automated check of subscribe/one-time price selection — pre-verified gap. The repo has no test framework. Manual review confirms subscribe sends 2000 and one-time sends 2500. Deferred.
  - `[low]` `[defer]` (verification-gap) Home-page/seed parity checked only by hand — pre-verified gap; grouped with the duplication row. Values match today. Deferred.
  - `[low]` `[defer]` (verification-gap other) "/month" copy vs. one-time payment — same root cause as the "$20/month" row. Deferred.
  - `[low]` `[defer]` (verification-gap other) Checkout trusts client price — same root cause as the client-price row. Deferred.
  - `[false]` `[reject]` (intent) Subscription reading B1 (real recurring) vs. B2 — the intent selects B2: "subscription pricing, if applicable" answers the prior blocker's question about "a one-time vs. subscribe price split like the shampoo's". The remaining harm is tracked in the "$20/month" row.
  - `[low]` `[reject]` (intent) Conditioner's Product.price is its one-time price, while the shampoo's is its subscribe price — the story states "Price $25" explicitly, so /products must show $25. Changing it would contradict the intent.
  - `[low]` `[reject]` (intent) /products/flower-conditioner offers only $25, not the subscribe price — the shampoo's product page also offers a single price. Adding purchase options there means new UI beyond a direct correction, and buyers rarely meet this.
  - `[false]` `[reject]` (intent) Client-side price enforcement — duplicate observation of the client-price row, which is already deferred. This intent row adds no separate defect.
  - `[false]` `[reject]` (intent) Verification is only lint/build — duplicate of the verification-gap rows, already deferred.
  - `[false]` `[reject]` (intent) Catalog surfaces depend on re-seeding — duplicate of the deploy-before-seed row, already deferred.
  - `[false]` `[reject]` (intent) Cart merge breaks "both prices available" — duplicate of the cart-merge rows, already deferred.

## Design Notes

- The seed `price` is the $25 one-time price, so `/products` and the product page show the story's "Price $25". The $20/month subscribe price lives only on the home page, the same way the shampoo's alternate price (`originalPrice`) lives only there. "Subscription" here uses the existing home-page pattern: a discounted price on a one-time Stripe payment. Real recurring billing is deferred (PRD §9.2).
- Known pre-existing limitation, not in scope: `CartProvider.addItem` merges by `id`, so adding subscribe and then one-time keeps the first price. The shampoo has the same behavior.

- No I/O matrix or unit tests. The repo has no test framework, and AGENTS.md says to verify with `npm run lint` and `npm run build`. Adding a test stack is out of scope for this story, so the behaviors are written as acceptance criteria and checked at review.

## Verification

**Commands:**
- `npm run lint` -- expected: no errors
- `npm run build` -- expected: success

**Manual checks (if no CLI):**
- Diff `app/page.tsx` `conditioner` against the `prisma/seed.ts` entry: the shared fields match exactly.

## Auto Run Result

Status: done

**Summary:** Added "Shamp Flower Conditioner" (`shamp-flower-conditioner`, slug `flower-conditioner`, category `Conditioner`, 12 oz, $25, filler Unsplash image, cosmetic-only description) to the seed and to the home page. The home-page section has Subscribe at $20/month (default, shows $25 struck through) and One-time at $25, plus a coral Add to Cart button. `/products`, the product page, and checkout pick it up through the `Product` table once the DB is re-seeded.

**Files changed:**
- `prisma/seed.ts` -- new conditioner product row (`featured: true`, in stock by default).
- `app/page.tsx` -- `conditioner` const that mirrors the seed, plus a home-page section with its own purchase-type and added state.

**Review findings:** 27 findings in total. Patches applied: 2 (both low): a `sizes` prop on the conditioner image, and the struck-through $25 on the Subscribe option. Deferred: 7 entries in frontmatter `deferred`. They cover: subscriptions are not recurring; checkout trusts the price the client sends; the cart merges lines by id; home-page and seed data are duplicated; there are no automated tests; agent docs still say single product; the DB must be re-seeded. Rejected: 8 `false` (the `toFixed(0)` rounding, ×2, cannot happen with whole-dollar constants; there is no slug conflict; the intent selects the shampoo-style subscribe reading; 4 intent-audit rows duplicate deferred items) and 2 `low` (the story fixes Product.price at $25; the product page has one price, as the shampoo's does).

**Follow-up review recommended:** false. Only 2 low entries were patched (high 0, medium 0, low 2).

**Verification:** `npm run lint`: no ESLint warnings or errors. `npm run build`: compiled successfully, 13/13 static pages. Manual check: the conditioner's `id`, `name`, `slug`, `price`, `image`, and `description` in `app/page.tsx` match `prisma/seed.ts` exactly. The copy makes no drug or treatment claims.

**Residual risks:** Nothing was checked against a live seeded DB, cart, or Stripe. Run `npx dotenv -e .env.local -- npm run db:seed` before checking out the conditioner, or the `OrderItem` FK will fail. "$20/month" is a one-time discounted payment, the same as the shampoo's subscribe option.
