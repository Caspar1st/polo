# Frankfurter Polo Club — Web App

Members & guests web app for **Frankfurter Polo Club e.V.** (Oeserstr. 80,
65934 Frankfurt am Main · est. 1902, revived 1992): facility bookings, polo
lessons, live tournament streaming, club shop, and news — with a
"quiet luxury" equestrian design language.

Reference site: <https://frankfurterpoloclub.de/>

## Stack

- **Next.js 15** (App Router, React Server Components) · **TypeScript**
- **Tailwind CSS v4** (design tokens in `app/globals.css` via `@theme`) · **Framer Motion**
- **Supabase** — Postgres, Auth (Sign in with Apple + email), Storage *(Milestone 2+)*
- **Stripe** — Payment Element with Apple/Google Pay + SEPA, webhooks *(Milestone 4)*
- **Google Maps Platform Photorealistic 3D Tiles** — landing hero, feature-flagged *(later milestone)*
- **Resend/Postmark** — newsletter delivery *(Milestone 5)*
- **Vercel** hosting · **GitHub Actions** CI (lint + typecheck + build)

## Getting started

```bash
# Node 20+ (repo is developed on Node 24 via nvm)
npm install
cp .env.example .env.local   # fill in as milestones land; empty is fine for M1
npm run dev                  # http://localhost:3000
```

Other scripts: `npm run lint` · `npm run typecheck` · `npm run build`.

## Design system

- **Typography:** Times New Roman first, with Georgia/Liberation Serif
  fallbacks (system fonts — no webfont embedding/licensing needed).
- **Palette:** deep racing green (`primary`), cream/ivory (`surface`),
  brass/gold (`accent`). Tokens live in `app/globals.css`.
  ⚠️ Exact hex values are placeholders until sampled from the official FPC
  crest artwork.
- **Signature motif:** `components/shared/PoloPonyLoader.tsx` — an animated
  galloping pony used for *every* loading state, empty state, and as a hero
  watermark. Never add an ad-hoc spinner; use the pony
  (`variant="loader" | "inline" | "empty" | "watermark"`, parametrized
  `size` / `speed` / `color`).

## Structure

```
app/                  routes: / /book /live /shop /news /account
components/shared/    PoloPonyLoader, SiteNav, SiteFooter
lib/                  (M2+) supabase.ts, stripe.ts, streamProvider.ts
supabase/migrations/  (M2+) SQL migrations
.github/workflows/    CI
```

## Roadmap (build milestones)

1. ✅ Repo scaffold, design tokens, `PoloPonyLoader`, app shell/nav
2. Supabase project + Auth (Apple + email) + account model
3. Shared calendar/booking engine across hall, 3 fields, lessons, events
4. Stripe checkout + webhook
5. News/events feed + newsletter delivery
6. Live streaming (`StreamProvider` interface)
7. Merchandise shop
8. Polish: animations, a11y, DSGVO pages, SEO/OG

## Deployment

Prepared for Vercel (`vercel.json`, region `fra1`): import the GitHub repo in
Vercel or run `vercel deploy`. Set the variables from `.env.example` in the
Vercel project settings.

### 3D hero note (§3a of the brief)

The live Photorealistic 3D Tiles stream renders real-world imagery as-is —
electricity poles/lines **cannot** be reliably masked at runtime and no
CSS/shader hack should be attempted. Ship either (1) a baked, retouched
flythrough/still, or (2) a custom Blender model of the grounds. Until then
the hero uses a static placeholder behind `NEXT_PUBLIC_FEATURE_3D_HERO`.
