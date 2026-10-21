---
title: "shamp"
status: draft
created: 2026-10-19
updated: 2026-10-20
---

# PRD: shamp
*Working title — confirm. [ASSUMPTION: "shamp" is the working brand name.]*

## 0. Document Purpose

This PRD defines the first public version of shamp, a men's hair and skin care store built around a 1% ketoconazole anti-dandruff shampoo. It is written for the owner (aaron-s) and for the downstream UX, architecture, and epic/story workflows. Domain terms are defined once in §3 and used exactly as defined. Features in §4 hold globally numbered FRs. Inferred items carry `[ASSUMPTION]` tags and are indexed in §12. Technical approach notes live in `addendum.md`, not here. The existing codebase (single-product Next.js store with Stripe Checkout) is the starting point; this PRD describes what it must become, not how to build it.

## 1. Vision

Most men treat dandruff and skin care the same way: ignore it, then grab whatever is on the drugstore shelf. shamp gives them one product that actually works, a 1% ketoconazole shampoo, sold under a brand that talks to them like a friend rather than a pharmacy aisle.

Around the product, shamp offers a **Skin Coach**: an AI chat that answers the basic questions guys are too embarrassed or too busy to ask. What is a simple routine? Which sunscreen won't feel greasy? When is it time to see a dermatologist? The Skin Coach teaches; it does not diagnose. Its product recommendations come from a list the owner curates, not from the model's imagination.

A blog and an Instagram feed give the brand a voice and bring people in from search and social. The questions guys ask the Skin Coach show which blog posts are worth writing, so the chat, the blog, and the store reinforce each other. Phase one is a side project that proves the loop works. The goal is a real launch afterward.

## 2. Target User

### 2.1 Jobs To Be Done

- **Functional:** Get rid of visible flakes and itchy scalp with something that works, without a doctor's visit.
- **Functional:** Learn a skin care routine simple enough to actually follow (cleanse, moisturize, sunscreen).
- **Emotional:** Ask "dumb" questions about skin without embarrassment or judgment.
- **Social:** Stop worrying about flakes on a dark shirt in a meeting or on a date.
- **Contextual:** Get an answer at 11pm on a phone, without creating an account.

### 2.2 Non-Users (v1)

- People seeking a diagnosis or treatment plan for a medical skin condition. The Skin Coach redirects them to a dermatologist.
- Buyers outside the US. Shipping and regulatory scope is US only.
- Minors. [ASSUMPTION: the store and Skin Coach target adults 18+; no age verification beyond a terms-of-use statement.]
- Women aren't excluded from buying, but the brand, copy, and Skin Coach are written for men.

### 2.3 Key User Journeys

- **UJ-1. Marcus finds flakes on his black shirt at 11pm.**
  Marcus, 29, notices white flakes on his shoulders before a date tomorrow. He lands on shamp from a search, sees the Skin Coach, and types "why is my scalp flaking." Without signing up, he gets a plain answer: common dandruff causes, what ketoconazole does, and signs that mean he should see a dermatologist instead. The Skin Coach suggests the shamp shampoo. He adds it to the cart and checks out with Stripe. **Edge case:** Marcus describes bleeding, spreading patches. The Skin Coach does not suggest a product. It tells him to see a dermatologist and explains why.

- **UJ-2. Dev wants a sunscreen that doesn't look greasy.**
  Dev, 34, searches "best sunscreen for men oily skin" and lands on a shamp blog post. The post gives three picks from the Recommendation List with a visible affiliate disclosure. He clicks one to buy it elsewhere, then notices the shampoo in the post's sidebar. He signs up for the email list for a launch discount. [ASSUMPTION: email signup offers an incentive; incentive type TBD.]

- **UJ-3. Jordan comes over from Instagram.**
  Jordan follows shamp on Instagram after seeing a funny post. He taps the bio link and lands on the site, where the Instagram Feed shows the same posts he recognizes. He reads one blog post and buys the shampoo.

## 3. Glossary

- **Product** — A sellable item in the Catalog with a price in integer cents, a slug, and a stock status. Each Product is either a Drug Product or a Cosmetic Product.
- **Drug Product** — An over-the-counter drug Product (the 1% ketoconazole shampoo). Its claims and labeling are limited by FDA rules (see §7.1).
- **Cosmetic Product** — A Product with no drug claims (the conditioner).
- **Catalog** — The set of all Products shown in the store.
- **Order** — A purchase created at checkout; status changes only through payment events.
- **Skin Coach** — The AI chat assistant that gives general men's skin and hair care education.
- **Coach Session** — One anonymous conversation with the Skin Coach. Not linked to any account; not remembered across visits.
- **Recommendation List** — The owner-curated list of third-party and shamp Products that the Skin Coach and Posts may recommend. Each entry has a name, category, short reason, and optional Affiliate Link.
- **Affiliate Link** — An outbound link to a third-party retailer that pays shamp a commission.
- **Post** — A blog article written by the owner.
- **Instagram Feed** — The section of the site showing recent posts from the shamp Instagram account.
- **Subscriber** — A visitor who has given an email address through Email Capture.
- **Red Flag** — A symptom description that calls for a dermatologist rather than self-care (for example bleeding, spreading rash, sudden hair loss in patches, signs of infection).

## 4. Features

### 4.1 Multi-Product Storefront

**Description:** The store moves from one hardcoded Product to a Catalog. The shampoo launches first; the conditioner follows shortly after. The home page presents the brand and the featured Product(s); each Product has its own page. The existing cart and Stripe Checkout keep working across multiple Products. Realizes UJ-1, UJ-3. [ASSUMPTION: shampoo ships first; conditioner added later without code changes.]

#### FR-1: Catalog-driven pages
Visitors can browse every in-stock Product in the Catalog, and the home page shows featured Products from the same source as the Product pages.
**Consequences (testable):**
- Adding a Product to the Catalog makes it appear on the Catalog listing and its own page with no code change.
- The home page and a Product's own page never show different names, prices, or images for the same Product.

#### FR-2: Mixed cart and checkout
Visitors can add any combination of Products to one cart and pay in a single Stripe Checkout. Realizes UJ-1.
**Consequences (testable):**
- An Order with one shampoo and one conditioner records both items with the price paid for each.
- An Order is marked paid only after the payment provider confirms payment.

#### FR-3: Drug Facts on Drug Products
Visitors can see the full Drug Facts panel (active ingredient, uses, warnings, directions) on every Drug Product page.
**Consequences (testable):**
- The shampoo page shows Drug Facts text that matches the approved label.
- Cosmetic Product pages show an ingredient list and no drug claims.

### 4.2 Skin Coach

**Description:** An anonymous AI chat available site-wide. It answers general men's skin and hair care questions: routines, ingredients, sun protection, shaving irritation, dandruff basics. It recommends products only from the Recommendation List. It does not diagnose or suggest prescription treatment. When a visitor describes a Red Flag, it recommends a dermatologist and does not push a product. There is no login and no memory between visits. Realizes UJ-1.

#### FR-4: Anonymous chat
Visitors can open the Skin Coach from any page and start a Coach Session without an account. Realizes UJ-1.
**Consequences (testable):**
- A first-time visitor can send a message within one tap/click of opening the Skin Coach.
- Closing the browser and returning starts a new Coach Session with no previous messages.

#### FR-5: Education-only scope
The Skin Coach answers general skin and hair care questions and declines to diagnose conditions or recommend prescription drugs or dosages.
**Consequences (testable):**
- Asked "do I have psoriasis?", the Skin Coach explains it cannot diagnose and suggests a dermatologist.
- Asked about prescription treatments, the Skin Coach does not name doses or tell the visitor to start or stop a medication.
- Every Coach Session shows a visible "not medical advice" notice.

#### FR-6: Red Flag escalation
When a visitor describes a Red Flag, the Skin Coach recommends seeing a dermatologist (or urgent care, if severe) and does not recommend a Product in that reply.
**Consequences (testable):**
- A test set of Red Flag prompts (owned by the owner, see §9) always produces a dermatologist recommendation and no product link.

#### FR-7: Curated recommendations only
The Skin Coach recommends products only from the Recommendation List, and every recommended third-party product with an Affiliate Link carries an affiliate disclosure. Realizes UJ-1, UJ-2.
**Consequences (testable):**
- No product name outside the Recommendation List appears as a recommendation.
- Recommendations of shamp Products link to the Product page; third-party recommendations link through the Affiliate Link.
- The owner can add, edit, or remove a Recommendation List entry and the Skin Coach uses the change on the next Coach Session.

#### FR-8: Drug claim limits in chat
When the Skin Coach talks about the shamp shampoo, it stays within the claims on the approved label.
**Consequences (testable):**
- The Skin Coach never says the shampoo treats hair loss or any condition beyond dandruff.

#### FR-9: Abuse and cost limits
The Skin Coach limits messages per visitor and per day so one visitor or bot cannot run up costs.
**Consequences (testable):**
- Past the per-visitor limit, the Skin Coach shows a friendly limit message instead of calling the model.
- Past the site-wide daily spend cap, the Skin Coach is shown as unavailable until the next day. [ASSUMPTION: monthly AI budget is small (≤ $50) during the side-project phase.]

**Feature-specific NFRs:**
- First token of a reply appears within 3 seconds for 95% of messages.
- Coach Session transcripts are stored only in aggregate or de-identified form, for no more than 90 days (see §7.3). [ASSUMPTION: 90-day retention.]

**Notes:** `[NOTE FOR PM]` The flywheel from Skin Coach questions to blog topics depends on reviewing de-identified question themes. Keep that review within the privacy limits in §7.3.

### 4.3 Blog

**Description:** The owner writes Posts as files in the code repository; no admin editor or CMS. Posts are public, readable on phones, and built to rank in search. Posts may recommend Products from the Recommendation List and link to shamp Products. Realizes UJ-2. [ASSUMPTION: owner writes Posts; files in repo.]

#### FR-10: Publish Posts
The owner can publish a Post by adding a file to the repository, with title, date, summary, cover image, and body.
**Consequences (testable):**
- A new Post appears on the blog index and at its own URL after the next deploy.
- Posts can be marked draft and are not shown publicly.

#### FR-11: Search-ready Posts
Each Post has a unique title, meta description, social sharing image, and canonical URL, and Posts are included in the sitemap.

#### FR-12: Disclosed recommendations in Posts
Any Post with an Affiliate Link shows a clear affiliate disclosure before the first Affiliate Link. Realizes UJ-2.

#### FR-13: Product placement in Posts
Each Post can show a call-to-action to a shamp Product. Realizes UJ-2.

### 4.4 Instagram Feed

**Description:** A section of the site (on the home page and its own page) showing recent posts from the shamp Instagram account, each linking to the post on Instagram. Realizes UJ-3. [ASSUMPTION: owner has or will create an Instagram Business or Creator account.]

#### FR-14: Show recent Instagram posts
Visitors can see the most recent Instagram posts (image or video thumbnail, caption excerpt) and open each on Instagram.
**Consequences (testable):**
- A new Instagram post appears on the site within 24 hours without a deploy.
- If Instagram is unavailable, the section hides or shows a "follow us" link and the page still loads.

### 4.5 Email Capture

**Description:** Visitors can join an email list for launch news and a discount. [ASSUMPTION: email capture is the only marketing extra at launch; no subscriptions, bundles, or discount codes in checkout.]

#### FR-15: Join the email list
Visitors can submit an email address from the home page, Post pages, and the footer, and become a Subscriber after confirming consent.
**Consequences (testable):**
- Submitting an already-subscribed email does not create a duplicate.
- Every marketing email has a working unsubscribe link.

## 5. Aesthetic and Tone

Dry, no-nonsense, a little funny. Talks like a friend who knows skin care, not a pharmacist or a wellness influencer. No fear-mongering about appearance. The Skin Coach uses the same voice, but drops the jokes when a visitor describes a Red Flag. The existing visual palette (navy, coral calls-to-action, cream backgrounds) carries forward. [ASSUMPTION: voice and palette.]

## 6. Non-Goals (Explicit)

- shamp is not a telehealth service and will not diagnose, prescribe, or connect visitors to clinicians.
- No customer accounts, order history, or saved Coach Sessions in v1.
- No prescription-strength (2%) ketoconazole products.
- No hair-loss claims for any Product, even though ketoconazole is discussed in hair-loss communities.
- No marketplace or third-party sellers; third-party products are only recommended through Affiliate Links.
- No sales outside the US.

## 7. Constraints and Guardrails

### 7.1 Regulatory (FDA)
- Ketoconazole is not on the FDA's list of approved over-the-counter dandruff ingredients. A 1% ketoconazole shampoo can only be sold under an FDA-approved application, so shamp must source it from a manufacturer holding one (private label). [ASSUMPTION: no supplier chosen yet; this is the top launch risk, see §11.]
- The shampoo's claims anywhere on the site (Product pages, Posts, Skin Coach, Instagram captions shown on site) are limited to its approved label uses. [ASSUMPTION: label uses are controlling flaking, scaling, and itching from dandruff, as on comparable 1% products; confirm against the supplier's label.]
- The conditioner stays a Cosmetic Product: no claims that it treats or prevents any condition.

### 7.2 Advertising (FTC)
- Affiliate relationships are disclosed clearly and close to the recommendation, in both Posts and the Skin Coach.

### 7.3 Privacy
- Coach Session text can contain health information. Washington's My Health My Data Act and similar state laws apply to non-medical sites. Collect the minimum needed, publish a consumer health data privacy policy, do not sell or share chat content, and keep it no longer than §4.2 allows.
- Subscriber emails are used only for shamp marketing, with consent and unsubscribe.

### 7.4 AI Safety
- The Skin Coach must not give dangerous advice (for example mixing actives at harmful strengths, or delaying care for Red Flags).
- Changes to the Skin Coach's instructions or the Recommendation List are checked against the Red Flag and scope test sets before going live (§9).

### 7.5 Cost
- AI usage has a hard daily cap (FR-9). Hosting stays on low-cost or free tiers during the side-project phase.

## 8. Cross-Cutting NFRs

- **Accessibility:** WCAG 2.1 AA for storefront, checkout, blog, and the Skin Coach (keyboard use, screen reader labels, contrast).
- **Performance:** Product pages and Posts load in under 2.5s Largest Contentful Paint on a mid-range phone on 4G.
- **Mobile first:** All features work on phones; most traffic is expected from search and Instagram on mobile.
- **Reliability:** If the Skin Coach or Instagram Feed fails, shopping and checkout still work.

## 9. MVP Scope

### 9.1 In Scope
- Catalog-driven storefront with the shampoo; conditioner added when its supplier is ready (FR-1 to FR-3).
- Skin Coach with education scope, Red Flag escalation, curated recommendations, disclosure, and cost limits (FR-4 to FR-9).
- Red Flag and scope test prompts the owner maintains, run before each Skin Coach change.
- Blog with files in the repo, search-ready Posts, disclosures, product calls-to-action (FR-10 to FR-13).
- Instagram Feed (FR-14).
- Email capture (FR-15).
- Privacy policy, terms of use, and affiliate disclosure page.

### 9.2 Out of Scope for MVP
- Customer accounts and Coach Session memory (deferred to v2; decided for MVP).
- Subscriptions, bundles, discount codes at checkout (v2).
- Blog editor or CMS (only if the owner stops wanting to write in the repo).
- Photo upload to the Skin Coach (too close to diagnosis).
- Product reviews and ratings (v2; needs moderation and FTC review-rule care).

## 10. Success Metrics

**Primary**
- **SM-1: Orders** — 50 paid Orders by the end of the side-project phase. Validates FR-1, FR-2. [ASSUMPTION: target.]

**Secondary**
- **SM-2: Coach Sessions** — 1,000 Coach Sessions with at least two visitor messages. Validates FR-4, FR-5. [ASSUMPTION: target.]
- **SM-3: Coach-to-cart** — share of Coach Sessions that end with a shamp Product added to the cart. Validates FR-7. Target set after the first 200 sessions.
- **SM-4: Subscribers** — Subscriber count as a launch audience. Validates FR-15. Target TBD.

**Counter-metrics (do not optimize)**
- **SM-C1: Product mentions per Coach Session** — must not be pushed up. A Skin Coach that pushes the shampoo in every reply loses trust and drifts toward claims trouble. Counterbalances SM-3.
- **SM-C2: Red Flag replies with a product link** — must stay at zero. Counterbalances SM-3.
- **SM-C3: Affiliate revenue vs. shamp Orders** — affiliate clicks rising while Orders stay flat means the site is becoming a review blog, not a brand. Counterbalances SM-1.

## 11. Open Questions

1. Which private-label manufacturer supplies the 1% ketoconazole shampoo, and what exact label claims does its approval allow? (Blocks launch; owner.)
2. Which affiliate programs (Amazon Associates or others) will the Recommendation List use?
3. What incentive does email capture offer, if any?
4. When does the side-project phase end: a date, an order count, or a spending decision?
5. Which state privacy laws beyond Washington require specific consent screens for Coach Sessions? (Quick legal check before launch.)
6. Is a price of $39.00 for the shampoo still right? (Current code value.)

## 12. Assumptions Index

- Header — "shamp" is the working brand name.
- §2.2 — Audience is adults 18+, with no age verification beyond terms of use.
- §2.3 UJ-2 — Email signup offers an incentive; incentive type TBD.
- §4.1 — Shampoo ships first; conditioner added later without code changes.
- §4.2 FR-9 — Monthly AI budget ≤ $50 during the side-project phase.
- §4.2 NFRs — Coach Session data kept de-identified, ≤ 90 days.
- §4.3 — Owner writes Posts as files in the repo.
- §4.4 — Owner has or will create an Instagram Business or Creator account.
- §4.5 — Email capture is the only marketing extra at launch.
- §5 — Voice (dry, no-nonsense, a bit funny) and existing palette.
- §7.1 — No supplier chosen yet; label uses match comparable 1% products.
- §10 — Targets of 50 Orders and 1,000 Coach Sessions.
