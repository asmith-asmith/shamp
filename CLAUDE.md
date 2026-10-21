# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Architecture

- **Two sources of product data.** The home page (`app/page.tsx`) renders a hardcoded product. `/products`, `/products/[slug]`, `/api/products`, and `/api/checkout` read the `Product` table through Prisma (`lib/db.ts`). This split is why the seed and home page must stay identical.
- **Cart is client-only.** `components/CartProvider.tsx` holds cart state in React Context and persists it to `localStorage`. The server never sees the cart until `/checkout` posts it to `/api/checkout`.
- **Checkout flow.** `/checkout` collects shipping details. `POST /api/checkout` creates a Stripe Checkout session, then a `PENDING` Order with `OrderItem`s keyed by `stripeSessionId`, and returns `{ url }` for the client to redirect to. Stripe sends the buyer back to `/checkout/success`. `/api/webhook` verifies the signature with `STRIPE_WEBHOOK_SECRET` and sets the Order to `PAID` on `checkout.session.completed` or `CANCELLED` on `checkout.session.expired`, matching on `stripeSessionId`.
- **Order statuses** `SHIPPED` and `DELIVERED` exist in the schema, but no code sets them yet.
