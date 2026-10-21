# shamp PRD — Addendum

Notes from the discovery conversation that belong in architecture or solution design, not in the PRD.

## Regulatory route (for sourcing)

- 1% ketoconazole OTC in the US is sold under the Nizoral A-D approval and under generic approvals that reference it, not under the OTC dandruff monograph (which lists zinc pyrithione, selenium sulfide, salicylic acid, coal tar, sulfur). The practical route for a small brand is private label from a contract manufacturer that holds an approved generic. Verify with the manufacturer or a regulatory consultant.
- The conditioner as a cosmetic avoids this entirely, provided it makes no drug claims.

## Technical notes for architecture

- **Catalog:** `app/page.tsx` currently hardcodes the product (`shamp-ketoconazole`) and duplicates `prisma/seed.ts`. FR-1 removes that duplication; the home page should read from the same `Product` source as `/products`.
- **Instagram Feed:** Meta's Instagram Basic Display API was shut down in December 2024. Options: Instagram Graph API with a Business/Creator account (requires a Meta app and long-lived token refresh), or a third-party embed widget. Cache results so a Meta outage doesn't break the page (FR-14).
- **Blog:** Markdown or MDX files in the repo, rendered statically by Next.js 14. Frontmatter carries title, date, summary, cover, draft flag.
- **Skin Coach:** Server-side route calls the LLM with a system prompt that holds the scope rules, Red Flag handling, label-claim limits, and the Recommendation List (small enough to include in the prompt). Stream replies. Rate limit per IP/session and enforce a daily spend cap. Consider a current Claude model for the safety behavior.
- **Recommendation List:** Owner-editable data (database table or a data file in the repo). Each entry: name, category, reason, optional affiliate URL, active flag.
- **Coach Session storage:** Default to not storing transcripts; if stored for the blog-topic flywheel, strip identifiers and expire after 90 days.
- **Evaluation:** Keep Red Flag and scope test prompts in the repo and run them before changes to the Skin Coach prompt or Recommendation List.

## Discussion highlights

- The chat-to-blog flywheel (Skin Coach questions suggest Post topics) was the reason the chat earned a place over a pure FAQ.
- Scope moved from "help men with skin conditions" to "men's skin care education, no diagnosis" to avoid medical advice with a conflict of interest.
- Product recommendations come from a curated list because language models invent products and specs.
