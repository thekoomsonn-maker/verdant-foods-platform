# Code conventions

Next.js 15 (App Router), Tailwind v4, Motion (`motion/react`), Lenis, MapLibre GL. Data comes from the modules in `src/lib/` (see the root README, "Connecting the backend").

Read with: `../docs/design/MOTION-AND-INTERACTION.md` (how things move) and `../docs/design/DESIGN-SYSTEM.md` (colours, type, page inventory). Layouts follow the Figma file "Verdant Foods — Website" (page "Website — All pages"); frame ids are listed at the end of this file.

## Rules
- **Server vs client:** `src/components/tokens.ts` (`cx`, `T` type scale) is safe in server components. `ui.tsx`, `motion`, `sections`, `charts`, `map` and `portal/shell` are client modules: render them from server pages, but do not call their functions in server files. Interactive parts of a page go in a `*-client.tsx` file next to the page.
- **Brand:** greens lead on white. Accents (tomato, sun, orange, plum, lime) appear mainly in the marketplace. No emoji, no outlined decorative boxes, few labels, plain language. Use the Plus Jakarta Sans scale in `T`.
- **Images:** scenes in `/img`, illustrations in `/illustrations`, product cut-outs in `/products` (on a tinted well, `TINT[img]`, with `mix-blend-multiply`).
- **Links:** every button, card, menu item and chip that goes somewhere uses `R` from `src/lib/routes.ts`. Actions without a page (Save, Send) give visible feedback: `useToast()` from `@/components/toast`, a state change or a check mark.
- **Motion:** use the primitives in `src/components/motion`: `Reveal`, `Stagger`, `SplitWords`, `CountUp`, `ParallaxImage`, `ClipReveal`, `Tilt`, `Marquee`, `StackCards`, plus `Pills`/`Tabs` and Motion `layoutId` for active states. Animate transform and opacity only; the primitives already respect reduced motion.
- **Video:** use `AutoVideo` (`src/components/media/auto-video.tsx`) with an HD/SD pair and a poster.
- **Maps:** `LiveMap` from `@/components/map` (lazy-loaded) with real coordinates from `src/lib/data.ts` (`FARMS`, `PLACES`, `JOURNEY`) and `plotAround()` for plot shapes. Pin kinds: farm, handover, van, problem, buyer, home.
- **Portals:** wrap console and business pages in `<PortalShell cfg={ADM|B2B} active="Menu label" title sub actions>` with `Panel`, `Kpi`, `KpiRow`, `DataTable` and `Feed`.
- **Accounts:** wrap shopper account pages in `<AccountShell active title sub>` and use `Card`.
- **Public pages:** wrap in `<PublicPage nav="overlay|light">` — `overlay` when the page starts with a full-bleed `PageHero`, `light` with a `TopBand`.
- **Text and languages:** write UI text in plain English in the component; the translation layer picks it up (see `I18N.md`). Text split into words for animation must go through `useT()` first.
- **Responsive:** check 390, 834 and 1440 px. Nothing scrolls sideways except deliberate scroll rows (`no-scrollbar`).
- **Checks before a push:** `npx tsc --noEmit`, `npm run lint`, `npm run build`.

## Routes (Figma page number → route, see `R`)
01 `/`, 02 `/about`, 03 `/farmers`, 04 `/business`, 05 `/trace-your-food`, 06 `/contact`, 35 `/impact`, 36 `/stories`, 37 `/stories/[slug]`, 38 `/careers`, 39 `/help`, 40 `/legal`, 41 `not-found.tsx`
07 `/shop`, 08 `/shop/p/[slug]`, 09 `/farms/[slug]`, 10 `/packs`, 11 `/bag`, 12 `/checkout`, 13 `/checkout/confirmed`, 42 `/shop/[cat]`, 43 `/search`, 44 `/weekly-box`, 45 `/delivery`, 46 `/shop/p/[slug]/reviews`
14 `/account/sign-in`, 15 `/account`, 16 `/account/orders`, 17 `/account/orders/[id]`, 18 `/account/addresses`, 47 `/account/sign-up`, 48 `/account/code`, 49 `/account/saved`, 50 `/account/weekly-box`, 51 `/account/report`, 52 `/account/settings`
19 `/b2b`, 20 `/b2b/source`, 21 `/b2b/bids`, 22 `/b2b/agreements`, 23 `/b2b/orders`, 24 `/b2b/invoices`, 53 `/business/join`, 54 `/b2b/quote`, 55 `/b2b/team`, 56 `/b2b/claims`, 57 `/b2b/calendar`, 58 `/b2b/reports`
25 `/admin`, 26 `/admin/orders`, 27 `/admin/products`, 28 `/admin/buyers`, 29 `/admin/farmers`, 30 `/admin/groups`, 31 `/admin/checks`, 32 `/admin/codes`, 33 `/admin/payments`, 59 `/admin/map`, 60 `/admin/batches`, 61 `/admin/weights`, 62 `/admin/recalls`, 63 `/admin/deliveries`, 64 `/admin/pricing`, 65 `/admin/content`, 66 `/admin/users`, 67 `/admin/reports`, 68 `/admin/settings`, 69 `/admin/problems`
73 `/t`, 34 `/t/[code]`, 70 `/t/[code]/farm`, 71 `/t/[code]/spray`, 72 (an unknown code on `/t/[code]` shows the "code not found" state)

## Figma frame ids (D = desktop 1440, M = mobile 390)
```
01 Home D 69:8760 M 69:9916 | 02 About D 78:9868 M 78:10397 | 03 For Farmers D 78:10655 M 78:11278 | 04 For Business D 78:11581 M 78:12174
05 Trace your food D 78:12456 M 78:12980 | 06 Contact D 78:13236 M 78:13621 | 07 Shop D 71:8995 M 71:10006 | 08 Product D 72:9110 M 72:10092
09 Farm profile D 75:9271 M 75:9963 | 10 Stock-up packs D 76:9306 M 76:9912 | 11 Bag D 77:9395 M 77:10151 | 12 Checkout D 77:10452 M 77:10730
13 Order confirmed D 77:10867 M 77:11442 | 14 Sign in D 80:10093 M 80:10173 | 15 Overview D 80:10210 M 80:10762 | 16 Orders D 80:11016 M 80:11578
17 Order tracking D 80:11837 M 80:12545 | 18 Addresses and payment D 80:12877 M 80:13288 | 19 B2B Overview D 81:10252 M 81:10796
20 Source produce D 81:11025 M 81:11525 | 21 Bids D 81:11733 M 81:12177 | 22 Supply agreements D 81:12360 M 81:12820 | 23 Orders and deliveries D 81:13012 M 81:13464
24 Invoices D 81:13628 M 81:14074 | 25 Admin Dashboard D 82:13537 M 82:10794 | 26 Orders D 82:14061 M 82:11450 | 27 Products and harvests D 82:14452 M 82:11992
28 Buyers D 82:14859 M 82:12482 | 29 Farmers and farms D 82:15193 M 82:12998 | 30 Savings groups D 83:10855 M 83:11516 | 31 Farm checks D 83:11761 M 83:12294
32 Trace codes D 83:12492 M 83:13131 | 33 Payments and payouts D 83:13372 M 83:13979 | 34 QR journey page D 85:13039 M 85:14002 | 35 Impact D 87:14254 M 87:14710
36 Stories D 87:12143 M 87:12477 | 37 Story article D 87:12639 M 87:12972 | 38 Careers D 87:13131 M 87:13712 | 39 Help centre D 88:12887 M 88:13373
40 Privacy and terms D 88:13612 M 88:13927 | 41 Page not found D 88:14061 M 88:14360 | 42 Category D 89:13868 M 89:14650 | 43 Search results D 89:15014 M 89:15653
44 Weekly box D 89:16396 M 89:17027 | 45 Delivery areas D 90:15662 M 90:16346 | 46 Reviews D 90:17466 M 90:18021 | 47 Sign up D 91:16469 M 91:16593
48 Enter code D 91:16652 M 91:16742 | 49 Saved items D 91:16784 M 91:17420 | 50 Weekly box (account) D 91:17670 M 91:18313 | 51 Report a problem D 91:18594 M 91:19076
52 Settings D 91:19296 M 91:19736 | 53 Company sign-up D 92:18238 M 92:18597 | 54 Request a quote D 92:18775 M 92:19227 | 55 Team and roles D 92:19416 M 92:19911
56 Quality claims D 92:20107 M 92:20611 | 57 Supply calendar D 92:20818 M 92:21450 | 58 Trace reports D 92:22664 M 92:23324 | 59 Live supply map D 93:19341 M 93:20214
60 Batches and handovers D 93:20562 M 93:21141 | 61 Weight checks D 93:21345 M 93:22015 | 62 Recalls D 93:22262 M 93:23005 | 63 Deliveries D 93:23287 M 93:23974
64 Pricing D 94:25405 M 94:26018 | 65 Website content D 94:21828 M 94:22359 | 66 Users and roles D 94:22553 M 94:23328 | 67 Reports D 94:23593 M 94:24187
68 Settings D 94:24415 M 94:24934 | 69 Problems D 93:24245 M 93:24884 | 70 Farm story D 95:24033 M 95:24903 | 71 Spray record D 95:22006 M 95:22439
72 Code not found D 95:22627 M 95:22938 | 73 Trace search D 95:23085 M 95:23531
```
