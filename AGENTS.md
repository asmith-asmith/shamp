<!-- bmad:context -->
<!-- Verified 2026-10-19 against fda71a3. Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## shamp

Single-product e-commerce site for a ketoconazole anti-dandruff shampoo. Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma on PostgreSQL, Stripe Checkout. No planning docs yet; `_bmad-output/` is the BMAD output folder.

## Where things are

- Product page: `app/page.tsx` (client component, hardcoded product data).
- Checkout: `app/api/checkout/route.ts`; payment status: `app/api/webhook/route.ts`.
- Schema and seed: `prisma/schema.prisma`, `prisma/seed.ts`.

## Running and verifying

- Prisma CLI and the seed script do not read `.env.local`. Wrap them: `npx dotenv -e .env.local -- npx prisma db push`, `npx dotenv -e .env.local -- npm run db:seed`. Alternatively, put `DATABASE_URL` in `.env`.
- There are no tests and no CI. Verify changes with `npm run lint` and `npm run build`.
- `.env.local` needs `DATABASE_URL`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_BASE_URL`.
- `package.json` pins `next` to 14.2.18. Write against Next 14 APIs, not Next 15.

## Conventions that differ from defaults

- Money is integer cents everywhere (`3900` = $39.00). Divide by 100 only when rendering.
- Call `getStripe()` from `lib/stripe.ts` inside request handlers, never at module scope. Builds run without env vars, so it throws only at runtime.
- Use the Tailwind tokens from `tailwind.config.js`: `navy-*` for the primary palette, `coral-*` for CTA buttons, `cream` for backgrounds.
- The product in `app/page.tsx` duplicates the seeded row in `prisma/seed.ts`. Keep them identical. A mismatched `id` (`shamp-ketoconazole`) breaks checkout on the `OrderItem` foreign key. A mismatched slug or price makes the home page disagree with `/products`.
- `/api/checkout` creates the Order as `PENDING`. Only `/api/webhook` changes its status (`PAID` / `CANCELLED`). Never mark orders paid from `/checkout/success`.

<!-- /bmad:context -->
