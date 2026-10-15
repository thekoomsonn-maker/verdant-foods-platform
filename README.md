# Verdant Foods Platform

The Verdant Foods website: a fresh-produce marketplace, farm-to-table traceability, a business (B2B) buying portal and an operations console, in one Next.js app. Live at **https://verdant-foods.vercel.app**.

The farmer and savings-group mobile app (Flutter) is a separate product and is not in this repository.

## Repository layout

```
.
├── docs/                    Product and design documentation
│   ├── product/             Brief, architecture, decisions
│   ├── design/              Design system, motion and interaction spec, visual references
│   └── pdf/                 Signed-off planning documents
└── web/                     The Next.js application (deployed to Vercel)
    ├── public/              Images, illustrations, videos, brand files
    └── src/
        ├── app/             Routes (App Router). One folder per page; `*-client.tsx` holds interactive parts
        ├── components/      UI, grouped by area (site, market, trace, account, b2b, admin, portal, map, motion, i18n, drone)
        ├── lib/             Routes, data modules, languages, session helpers
        └── middleware.ts    Protects /admin and /b2b
```

## Products and URLs

| Product | URL | Access |
|---|---|---|
| Website | `/`, `/about`, `/farmers`, `/business`, `/impact`, `/stories`, `/careers`, `/help`, `/contact` | Public |
| Shop | `/shop`, `/packs`, `/weekly-box`, `/bag`, `/checkout`, `/account/*` | Public |
| Trace your food | `/t`, `/t/[code]`, `/trace-your-food` | Public |
| Fly over our farm | `/fly` (also embedded on the home page) | Public |
| Business portal | `/b2b/*` | Business and staff sign-in at `/b2b/sign-in` |
| Operations console | `/admin/*` | Staff sign-in at `/team` |

Access, sign-in and environment variables: [`web/ACCESS.md`](web/ACCESS.md).

## Getting started

Requirements: Node.js 20+ and npm.

```bash
cd web
npm install
npm run dev          # http://localhost:3000
```

Local sign-in uses the development values in `web/.env.development` (password `verdant-dev`). Production values live in Vercel; see `web/.env.example`.

Other commands (run inside `web/`):

| Command | What it does |
|---|---|
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type check |

## Deployment

Vercel project `verdant-foods` (root directory `web`). Every push to `main` deploys to production; pull requests get preview URLs.

## Connecting the backend

The frontend currently runs on typed mock data so every screen works end to end. Each area reads from one module in `web/src/lib/`, and the exported TypeScript types describe the shape each screen expects:

| Module | Used by |
|---|---|
| `data.ts` | Shared catalogue: categories, farms (all 16 regions), products, trace journey, places |
| `data-market.ts` | Shop, product pages, packs, bag, checkout, weekly box, delivery zones, reviews |
| `data-trace.ts` | Public trace pages `/t/[code]` (farm, spray record, handovers, freshness) |
| `data-account.ts` | Shopper account: orders, addresses, payments, saved items, weekly box |
| `data-b2b.ts` | Business portal: sourcing, bids, agreements, orders, invoices, team, claims, reports |
| `data-admin.ts` | Console: dashboard, orders, products and harvests, buyers, farmers, savings groups, farm checks, trace codes, payments |
| `data-admin-ops.ts` | Console: live map, batches, weight checks, recalls, deliveries, pricing, content, users and roles, reports, settings, problems |
| `data-corporate.ts` | Stories, careers, help FAQs, legal text |

Suggested approach: keep the types, replace each exported constant with a fetch from the API (server components can `await` directly; client components can use a small hook), one module at a time. Sign-in is in `web/src/app/api/auth/` and `web/src/lib/session.ts`; swap the shared-password check for the real account service when it is ready.

## Languages

English is the source. French, Twi (Asante), Akuapem Twi, Fante, Ga and Ewe are available from the language menu; Dagbani and Gonja are in progress. How translations work and how to edit them: [`web/I18N.md`](web/I18N.md).

## Conventions

Code style, components and page patterns: [`web/CONVENTIONS.md`](web/CONVENTIONS.md). Design rules: [`docs/design/DESIGN-SYSTEM.md`](docs/design/DESIGN-SYSTEM.md) and [`docs/design/MOTION-AND-INTERACTION.md`](docs/design/MOTION-AND-INTERACTION.md).
