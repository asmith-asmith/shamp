# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Shamp is a single-product e-commerce site for a ketoconazole anti-dandruff shampoo. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma (PostgreSQL), and Stripe for payments.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint
npm run db:push      # Push Prisma schema to database
npm run db:seed      # Seed database with product

# Prisma commands need env vars - use dotenv-cli:
npx dotenv -e .env.local -- npx prisma db push
npx dotenv -e .env.local -- npm run db:seed
```

## Architecture

**Single-Product Landing Page**: The home page (`app/page.tsx`) is a client component containing the full product display with hardcoded product data (id: `shamp-ketoconazole`). This ID must match the seeded product in the database for checkout to work.

**Cart State**: `components/CartProvider.tsx` uses React Context with localStorage persistence. Cart items include product ID, name, price, image, and quantity.

**Checkout Flow**:
1. User fills shipping form at `/checkout`
2. `POST /api/checkout` creates Stripe Checkout session and pending Order in database
3. Stripe redirects to `/checkout/success` on payment
4. Stripe webhook (`/api/webhook`) updates Order status to PAID

**Database Models** (Prisma):
- `Product`: id, name, slug, price (cents), image, category, size, inStock, featured
- `Order`: status (PENDING/PAID/SHIPPED/DELIVERED/CANCELLED), customer info, stripeSessionId
- `OrderItem`: links Order to Product with quantity and price

**Stripe Integration**: `lib/stripe.ts` exports `getStripe()` which throws if `STRIPE_SECRET_KEY` is missing (deferred to runtime to allow builds without env vars).

## Environment Variables

Required in `.env.local`:
- `DATABASE_URL` - PostgreSQL connection string
- `STRIPE_SECRET_KEY` - Stripe secret key (sk_...)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (pk_...)
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret (whsec_...)
- `NEXT_PUBLIC_BASE_URL` - Site URL for Stripe redirects

Note: Prisma CLI reads from `.env`, not `.env.local`. Either create a `.env` file with `DATABASE_URL` or use `dotenv-cli`.

## Design System

Colors defined in `tailwind.config.js`:
- `navy-*` (50-950): Primary dark blue palette
- `coral-*` (400-600): CTA button color
- `cream`: Background color (#faf9f7)

Prices are stored and displayed in cents (e.g., 3900 = $39.00).
