# Verdant Foods — Product Architecture

One ecosystem, eight experiences. Shared design system, shared entities, separate navigation per role.

## 1. Experiences and routes

| # | Experience | Primary user | Platform (PRS §3) | Phase |
|---|---|---|---|---|
| 01 | Public brand site | Everyone | Web (Next.js) | 1 |
| 02 | Marketplace | Consumers, buyers | Web (Next.js) + mobile client | 1 |
| 03 | Customer account | Consumers | Web + mobile client | 1 |
| 04 | B2B procurement portal | Restaurants, hotels, supermarkets | Web (Next.js) | 1 core / 2 contracts |
| 05 | Farmer / Producer portal | Farmers, co-ops | **Mobile client (React Native/Flutter), offline-first**; responsive web used for design prototyping | 1 |
| 06 | Digital VSLA | VSLA members & officers | **Mobile client, offline-first** | 1 (ledger) / 3 (insurance, credit) |
| 07 | Admin / Operations | Verdant staff | Web (Next.js) | 1 |
| 08 | Public traceability page | Anyone scanning a QR | Web, lightweight | 2 |

> **Decided:** the Client Application (Farmers & VSLAs) is a separate Flutter Android app. This repo is the website only (INV-NKL-00704). Consumers shop on the website in Phase 1.

### Routes (web)
```
/                         Home
/shop  /shop/[category]   Marketplace
/product/[slug]           Product detail
/farm/[slug]              Farm profile
/packages                 Stock-up packages        (proposed — not in PRS)
/cart  /checkout
/business                 For Business (marketing)
/farmers                  For Farmers (marketing)
/trace  /trace/[orderCode] Verdant Trace (order-level, lists batches — FR-1.4) · Phase 2
/about
/account/*                Customer: orders, saved, addresses, payment methods, profile (consumer subscriptions = future, not PRS)
/b2b/*                    overview, source, bids, orders (+deliveries), agreements, invoices, suppliers
/admin/*                  dashboard, marketplace, products, farmers, farms, harvests, buyers, orders, procurement, deliveries, payments, traceability, vslas, reports, users, settings
/design-system            Internal style lab
```

## 2. Requirement traceability (PRS → screens)

| PRS | Requirement | Where it lives |
|---|---|---|
| FR-1.1 | Vendor onboarding: location, arable area, regenerative methods | App: farm onboarding; website: Admin verification queue |
| FR-1.2 | Mobile batch logging, auto-assigned permanent Traceability ID | App: Log harvest → trace number shown |
| FR-1.3 | Ecological indicators per batch: soil organic matter, tCO₂ sequestered, GPS | Batch detail, trace page (verified only) |
| FR-1.4 | Dynamic QR, print-ready + digital, chronological journey page | Admin/farmer traceability, `/trace/[batchId]` |
| FR-1.5 | B2B: browse live inventory, filter by soil-health/carbon, wholesale bids, recurring agreements | `/b2b/marketplace`, `/b2b/rfqs`, `/b2b/contracts` |
| FR-2.1 | VSLA: member registration, bylaws (share price, lending rate), weekly contributions ledger, cash position | `| FR-2.2 | Alternative credit score (VSLA + sales history) | Phase 3 — farmer finance card, admin |
| FR-2.3 | Weather-indexed micro-insurance | Phase 3 |
| FR-2.4 | Payments: B2B wires/cards/invoice financing; B2C cards/wallets; MoMo payouts | Website: checkout, `/b2b/invoices`; App: Money tab |
| NFR-1.1 | Offline-first farmer/VSLA, background sync | SyncStatus component, optimistic saves |

**Proposed (in master brief, not in PRS) — confirm with client:** consumer subscriptions, stock-up packages / farm boxes, saved items.

## 3. Core entities (frontend types, backend-agnostic)
`Farmer` · `Farm` (location, GPS, arableHectares, practices[], verification) · `Crop` · `HarvestBatch` (traceabilityId `VF-{CROP}-{00000}`, harvestDate, quantity, unit, plot, practices, photos, price, availability, eco: {somDelta, tCO2e, gps}) · `Product` (listing derived from batch) · `Buyer` (consumer | business) · `Order` · `Rfq/Bid` · `SupplyAgreement` · `Delivery` · `JourneyEvent` (planted, verified, harvested, qc, collected, dispatched, delivered) · `Payment/Payout` · `Vsla` (bylaws) · `Member` · `Contribution` · `Loan` · `LedgerEntry`.

Types live in `/types`; realistic Ghana mock data in `/data`; a thin `/lib/api` service layer returns mocks until the existing backend is integrated by Verdant's backend developer. No API contracts are invented.

## 4. Navigation

**Public:** Shop · For Business · For Farmers · Trace Your Food · About Verdant | Sign in | **Shop fresh**
**Customer:** Overview · Orders · Saved · Addresses · Profile (· Subscriptions — proposed)
**B2B:** Overview · Source · Bids · Orders & deliveries · Supply agreements · Invoices · Suppliers
**Farmer:** Overview · My Farm · Harvests · Inventory · Orders · Deliveries · Payments · Traceability · VSLA
  Mobile bottom bar: Home · Harvests · **+ Log harvest** · Orders · Money
**VSLA:** Overview · Meeting · Members · Loans · Ledger · Group rules
**Admin (grouped):** Overview: Dashboard · Marketplace: Products, Harvests, Orders, Deliveries · Network: Farmers & farms, Buyers, VSLAs · Trust: Verification, Traceability · Money: Payments & payouts · System: Reports, Users, Settings

## 5. Key flows
1. **Log harvest (farmer, mobile, offline):** product → variety → date → quantity+unit → plot → practices → photos → price → availability → *Save* → instant Traceability ID (generated locally, reconciled on sync).
2. **Buy (consumer):** browse/search → product (trace preview) → cart → checkout (MoMo / card) → order tracking → QR trace on delivery.
3. **Procure (B2B):** filter live inventory (soil/carbon) → bid or buy → recurring agreement → scheduled deliveries → invoices.
4. **Trace (public):** scan QR → product + batch → grown by → journey timeline → practices → verified environmental data → map.
5. **VSLA meeting (mobile, offline):** open meeting → record contributions per member → loans/repayments → close meeting → ledger + cash position.

## 6. Roles
Guest · Consumer · B2B Buyer · Farmer/Producer · VSLA Member · VSLA Admin · Verdant Admin · Extension Officer (to confirm). Full access matrix: PDF §04.

## 7. Checkpoint 1 scope
Website: Design Lab · Homepage · Marketplace · Admin dashboard (desktop 1440 + mobile 390). App: Farm space and Savings space screens. Stop for review.
