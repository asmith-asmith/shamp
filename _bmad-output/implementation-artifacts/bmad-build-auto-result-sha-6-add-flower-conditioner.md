---
status: blocked
---

# BMad Build Auto Result

Story: SHA-6 "Add conditioner": "Add new conditioner called Flower as an item"

Status: blocked
Blocking condition: unclear intent. The story names the product ("Flower", a conditioner) but gives none of the data that `Product` requires, and neither the PRD nor the code supplies it. Unresolved questions:

1. Price in integer cents (required `Product.price`; also the amount Stripe charges). Is there also a one-time vs. subscribe price split like the shampoo's `price` / `originalPrice`?
2. Size (required `Product.size`, e.g. "8 oz").
3. Description copy (required `Product.description`). It must make no drug claims, because the PRD (§ constraints, addendum) treats the conditioner as a Cosmetic Product.
4. Image URL(s) (required `Product.image`).
5. Category (required `Product.category`), stable `id`, and `slug`.
6. Should it be `featured`, and should it appear on the home page? `app/page.tsx` currently hardcodes the shampoo alone; PRD FR-1, which would make the home page catalog-driven, is not implemented yet.
7. Is the supplier ready? The PRD's release scope says the conditioner ships "when its supplier is ready".

Recovery: update the Linear story (or give the runner a spec) with answers to 1–6, then re-run bmad-build-auto for SHA-6.
