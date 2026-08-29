# Bonny & Bright — AI Personal Skincare Platform

A prototype of a skin-aware, shelf-aware, budget-aware and trust-aware skincare platform built with React, TypeScript, Tailwind CSS and React Router.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL, usually `http://localhost:5173`.

## Local run options

### Option 1 — standard Vite app

```bash
npm install
npm run dev
```

### Option 2 — GitHub Pages style static preview

```bash
git clone https://github.com/BALUQUUUU/BONNY-BRIGHT.git
cd BONNY-BRIGHT
python3 -m http.server 8000
```

Open `http://localhost:8000/` in a browser.

### Option 3 — serve under a prefix

```bash
ln -s . bonny-and-bright
python3 -m http.server 8000
```

Then open `http://localhost:8000/bonny-and-bright/`.

## What’s inside

- Landing → Sign up → Onboarding → Skin profile → Home dashboard
- AI Skin Advisor / Routine Builder (`/routine-builder`)
- My Shelf (`/shelf`)
- Shop (`/shop`) with personalised sections and filtering
- Trust Centre (`/trust`) and product detail pages
- Skin Journey, Discovery, Subscription, Checkout, Store Locator, and Profile screens

## Data & persistence

This is a front-end prototype. User, shelf, routine, journey and subscription data are stored in `localStorage` via `src/context/AppContext.tsx` unless connected to Supabase and Stripe.

## Production commerce setup

The app is wired for Supabase + Stripe. Until those values are configured, the prototype continues to work locally without real customer data or payments.

1. Create a Supabase project and run `supabase/migrations/20260829000100_commerce_foundation.sql`.
2. Copy `.env.example` to `.env.local` and fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
3. Set Stripe webhook and deployment secrets in Supabase.
4. Add the GitHub Pages environment secrets for the app build.

## Structure

```text
src/
  components/   shared UI
  context/      global app state
  data/         demo product catalog
  lib/          recommendation engine
  pages/        screen-by-screen app flow
  types/        shared TypeScript data model
```

## Notes

- The repo includes GitHub Pages compatibility and route fallback handling in the root `index.html`.
- The app is intentionally a prototype, not a production commerce deployment.
