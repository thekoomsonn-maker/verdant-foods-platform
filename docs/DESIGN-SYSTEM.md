# Verdant Foods — Design System

Version 0.1 · October 2026 · Status: **Checkpoint 1 — for review**
Source of truth for tokens. Figma variables (collection `Verdant / Tokens`) and `app/globals.css` + `tailwind.config.ts` mirror this file exactly. If they disagree, this file wins and the others are fixed.

---

## 0. Three rules that override everything

1. **Verdant owns green. The produce brings the colour.** Deep Verdant and Leaf (from the logo) are the identity; the fresh accents below bring food-merchandising vibrancy.
2. **Accents by context.** Marketing/shop use the full accent range. B2B/Admin are neutral-led (lime as highlight only; accents only in charts/status). Farmer is deep + lime; **Plum identifies the VSLA (money) space**.
3. **The Trace Frame is the signature.** A hairline frame around produce with a mono label tab carrying the batch ID.

> Palette revised 13 Oct 2026 per Nex's approved reference selection (Gromuse palette, Wise numerals, Kresho dashboard, festival patterns). The earlier "no lime" rule is withdrawn: Fresh Lime is now an official accent.

---

## 1. Colour

### 1.1 Core — from the logo
| Token | Hex | Use |
|---|---|---|
| `deep` | `#024639` | **Brand.** Primary buttons, nav, headings, dark sections |
| `night` | `#012B23` | Deepest surfaces, cover, footer |
| `deep-2` | `#0E5A4A` | Hover / pressed on deep |
| `leaf` | `#5F9F0D` | Logo leaf, marks, success dot. Not body text on cream (2.9:1) |

### 1.2 Fresh accents — from the approved reference selection
| Token | Hex | Soft | Text on it |
|---|---|---|---|
| `lime` | `#BBEA70` | `#E4F5C8` | deep (7.8:1) |
| `orange` | `#FF7006` | `#FFE1CC` | ink (6.1:1) — never white |
| `tomato` | `#E5412B` | `#FADAD4` | cream ≥24px bold only, else ink |
| `sun` | `#F7C33C` | `#FDEFC8` | ink / deep |
| `blush` | `#F4C4CF` | — | ink / plum |
| `plum` | `#6C1144` | `#F1DCE6` | cream (10.4:1) |

### 1.3 Warm neutrals — no pure-white pages
| Token | Hex | Use |
|---|---|---|
| `cream` | `#F7F1E3` | Default canvas |
| `paper` | `#FFFCF6` | Cards, panels, alt pages |
| `stone` | `#ECE5D6` | Bands, table header, image wells |
| `line` | `#DDD4C2` | Hairlines, borders |
| `muted` | `#6E675A` | Secondary text (5.0:1 on cream) |
| `ink` | `#13201B` | Primary text |

### 1.4 Status
| Token | Dot | Text | Bg |
|---|---|---|---|
| success | `#4E870A` | `#3F6E08` | `#E2F2CF` |
| warning | `#D99A12` | `#8A5A05` | `#FDEFC8` |
| danger | `#C8401F` | `#9A3118` | `#FADAD4` |
| info | `#3D7DB3` | `#245A84` | `#DDEBF6` |
| neutral | `#6E675A` | `#6E675A` | `#ECE5D6` |

### 1.5 Ratios per experience
- Marketing & shop ≈ cream 35 · deep 25 · lime 12 · orange 8 · sun 7 · plum 7 · blush 6
- B2B & admin ≈ cream 60 · paper 20 · deep 14 · lime 4 · orange 2
- Farmer & VSLA ≈ cream 50 · deep 25 · lime 15 · plum 10

---

## 2. Typography

| Role | Family | Why |
|---|---|---|
| Display / marketing | **Bricolage Grotesque** (ExtraBold, Bold; "96pt" optical cut ≥ 64px) | Chunky, slightly irregular grotesk — the warmth of Granja Urbana and the punch of the Target headlines, without copying either. Contrasts the round monoline wordmark instead of imitating it. |
| UI / body | **Inter** (Regular, Medium, Semi Bold, Bold) — `font-feature-settings: "tnum","cv11"` in data | Neutral, dense, excellent tabular figures. |
| Data / IDs | **IBM Plex Mono** (Medium) | Batch IDs, Traceability IDs, invoice numbers — reads as "record". |

### 2.1 Marketing scale (Bricolage)
| Token | Size / line | Tracking | Weight |
|---|---|---|---|
| `display-xl` | 128 / 0.9 | -4% | 96pt ExtraBold |
| `display-l`  | 96 / 0.92 | -3.5% | 96pt ExtraBold |
| `display-m`  | 64 / 0.95 | -3% | ExtraBold |
| `display-s`  | 44 / 1.0 | -2% | Bold |
| `headline`   | 32 / 1.05 | -1.5% | Bold |
| `title`      | 24 / 1.15 | -1% | Bold |

Mobile: display-xl → 64, display-l → 52, display-m → 40, display-s → 32.
Headlines are short, stacked, sentence-case with a full stop. All-caps only for eyebrow labels.

### 2.2 Product scale (Inter)
| Token | Size / line | Weight |
|---|---|---|
| `page-title` | 24 / 32 | Semi Bold |
| `section` | 16 / 24 | Semi Bold |
| `body-l` | 18 / 28 | Regular |
| `body` | 15 / 22 | Regular |
| `body-s` | 13 / 18 | Regular |
| `label` | 13 / 16 | Medium |
| `eyebrow` | 11 / 14, +8% tracking, UPPER | Semi Bold |
| `metric` | 32 / 36, -2% | Semi Bold, tnum |
| `metric-l` | 48 / 48, -3% | Bold, tnum |
| `mono` | 12 / 16 (Plex Mono) | Medium |

**Money:** `GH₵` prefix, decimals set at 55% size and raised (superscript cents) on marketing cards and balances: GH₵18<sup>.50</sup>. Tables use plain tabular `GH₵ 18.50`.
Dashboards never use Bricolage above `title` (24). No gigantic dashboard headings.

---

## 3. Space, radius, borders, elevation

**Spacing (4-base):** 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128.
Marketing section padding: 128 desktop / 64 mobile. Dashboard gutter: 24 desktop / 16 mobile. Card padding: 20 (product), 24 (panels).

**Grid:** marketing 12 col, 1312 content width (64 margins on 1440), 24 gutter. App: 248 sidebar + fluid content, max 1440. Mobile 4 col, 16 margin.

**Radius:** `r-xs 4` (chips, tags, table badges) · `r-sm 8` (inputs, buttons, small cards) · `r-md 12` (product cards, panels) · `r-lg 20` (marketing media blocks, category tiles) · `r-full` (avatars, quantity stepper ends only).
Not everything is rounded: full-bleed images and section bands are square.

**Borders:** 1px `stone-200` is the default separator. Panels are defined by border, not shadow.

**Elevation:** only two shadows exist.
- `shadow-pop` `0 12 32 -8 rgba(1,36,29,0.18)` — menus, popovers, toasts, cart drawer.
- `shadow-lift` `0 8 20 -10 rgba(1,36,29,0.22)` — product card hover only.
No glassmorphism. No gradients except a photo scrim (`verdant-950` 0→70%).

---

## 4. Signature devices

### 4.1 Trace Frame
A 1.5px `paper` (on photo) or `verdant-800` (on cream) rectangular stroke, inset around the hero subject, with 10px corner ticks and a label tab attached to the top-left edge.
- Tab: `verdant-800` fill, `paper` text, IBM Plex Mono Medium 11, padding 4/8, r-xs on outer corners only.
- Content: `VF-TOM-00042 · Agyeman Farms` or a short field label (`Soil`, `Harvest`).
- Used on: hero photography, product detail image, trace page, batch cards, campaign imagery.
- Never on: icons, buttons, avatars, more than one subject per image.

### 4.2 Verdant Crate
The recurring campaign object (like Target's basket): a slatted wooden crate stamped with the Verdant leaf, produce rising out of it. Used in campaign modules and stock-up packages. Photographed or illustrated — never 3D-rendered cartoon.

### 4.3 Produce silhouettes (illustration)
Flat, single-colour produce shapes with slightly irregular edges (Granja Urbana principle). Palette: produce colours + verdant-800 + leaf-500 on cream. No faces, no outlines, no gradients, no 3D. Used for: category tiles, empty states, onboarding, campaign patterns, section punctuation.

### 4.4 Headline formula
"Grown by ___. ___ by you." — a repeatable, ownable line that carries traceability.
e.g. *Grown by Agyeman Farms. Cooked by you.* · *Grown by Akua. Served by your kitchen.*

---

## 5. Components (checkpoint 1 set)

Foundation: Button (primary / secondary / ghost / on-dark; sm 36, md 44, lg 52), IconButton, Input, Select, Search, Checkbox, Radio, Switch, Tabs, Badge, StatusChip, Avatar, Toast, QuantityStepper.
Commerce: ProductCard, PackageCard, CategoryTile, FarmCard, PriceDisplay, TraceabilityBadge, InventoryBadge.
Dashboard: MetricCard, DataTable, FilterBar, ChartCard, ActivityItem, Timeline, EmptyState.
Agriculture: HarvestCard, BatchCard, TraceTimeline, ImpactMetric, SyncStatus.

### 5.1 Buttons
- Primary: verdant-800 fill, paper text, Inter Semi Bold 15, r-sm. Hover verdant-900.
- Secondary: transparent, 1px verdant-800 stroke, verdant-800 text.
- Ghost: text + icon, verdant-800.
- On-dark primary: paper fill, verdant-900 text.
- Lime: `lime` fill + `deep` text — the farmer "Log harvest" action and highlight CTAs on dark.
- Leaf is not a button fill (fails contrast with cream text).

### 5.2 ProductCard
Image well (stone-100 or produce-100 tint, r-md top) with cut-out produce → name (Inter Semi Bold 16) → farm (body-s, stone-700, leaf dot if regenerative-verified) → unit (body-s) → price (Bricolage Bold 24 with superscript pesewas) → freshness line (`Harvested yesterday`, leaf-700) → add button (40×40 verdant-800, r-sm) which becomes a QuantityStepper.
Optional TraceabilityBadge top-left (mono, verdant-800 tab — a mini Trace Frame tab).

### 5.3 StatusChip
r-xs, 22 high, label 12 Medium, status bg + status text, 6px dot. Not pill-shaped.

### 5.4 SyncStatus (farmer/VSLA, NFR-1.1)
Always visible in farmer & VSLA headers: `● Synced 2 min ago` / `● 3 entries saved offline — will sync` (warning). Saving never blocks on connectivity.

---

## 6. Motion
Durations 120 / 200 / 320ms; easing `cubic-bezier(0.2, 0.7, 0.2, 1)`.
Card lift 200ms (translateY -4 + shadow-lift). Image mask reveal 320ms. Count-up for impact metrics only. Trace timeline steps reveal on scroll, 80ms stagger. Respect `prefers-reduced-motion`.

---

## 7. Do not
Generic SaaS · stacks of floating rounded cards · gradients · glassmorphism · heavy shadows · pills everywhere · giant dashboard headings · every feature in a card · cute faced vegetables · 3D agri renders · stock smiling-farmer-with-basket · drone + hard-hat stock · redesigning the logo · inventing features not in the spec.
