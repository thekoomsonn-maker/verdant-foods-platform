# Verdant Foods — Design System (v2, 13 Oct 2026)

Source of truth: Figma file `gVlIXT1BH4YD5NR5wC97An`, page **00 · Design System** (variables `Verdant / Color`, text styles, components, Foundations sheet). This document mirrors it for the Next.js and Flutter builds.

## 1. Direction
- **Corporate and calm.** Verdant greens lead on white. Accent colours are rare, and used mostly inside the marketplace (category and product grounds, small highlights).
- **Cream is no longer a canvas.** Use white, `paper` and `mist` for backgrounds.
- **Layout references:** the professional agri sites in the reference board: full-bleed media, calm white sections, a stats row, restrained cards, and a Kresho-style dashboard density.
- **No decoration labels:** no "image slot" or "photo" labels, no emoji, no outlined cards, and no mono chips. Keep each page to a few labels at most.

## 2. Colour tokens (CSS: `var(--group-name)`)
| Token | Hex | Use |
|---|---|---|
| brand/night | #01261F | Admin sidebar, deepest text on light |
| brand/deep | #024639 | Primary buttons, headings, footer, dark bands (logo green) |
| brand/forest | #0B5B49 | Inputs and secondary surfaces on dark |
| brand/leaf | #5F9F0D | Icons, small highlights, links (not body text) |
| brand/leaf-light | #8CC63F | Illustration only |
| brand/mint | #E4EFE8 | Subtle fills |
| brand/mist | #F2F7F4 | Section bands, product image wells, secondary buttons |
| neutral/white · paper · line · line-strong · muted · ink | #FFFFFF · #F7F8F7 · #E2E8E4 · #C9D3CE · #5A6A63 · #0F1F1A | Canvas, dividers, text |
| neutral/cream | #F7F2E8 | Reserved (packaging and print only) |
| accent/lime | #BBEA70 | One emphasis per view (active nav on dark, "Trace", progress) |
| accent/orange · tomato · sun · plum · blush | #FF7006 · #E5412B · #F7C33C · #6C1144 · #F4C4CF | Marketplace accents, alerts, rare highlight cards |
| status/* | success #1E7B4F, warning #8A5300, danger #B42318, info #1D5FA8 (each with a -bg) | Status chips only |

## 3. Type: Plus Jakarta Sans (one family)
- **Desktop:** Display XL 88/92 Medium −3%, Display L 64, H1 48, H2 36, H3 28 SemiBold, H4 22, H5 18; Body XL 20, L 18, M 16, S 14; Caption 13; Overline 13 caps; Button L 16, M 14; Number XL 56, L 36, M 24.
- **Tablet:** Display XL 64, Display L 52, H1 40, H2 32.
- **Mobile:** Display XL 42, Display L 36, H1 32, H2 26, H3 22, H4 19.
- **App (Android):** Title 26, Heading 20, Amount 40, Body 16, Label 14, Small 13, Button 17. Minimum text size is 13; touch targets are at least 44 px.

## 4. Components (Figma)
- **Button:** Style Primary, Secondary, Light or Lime × Size L or M; properties Label and Show icon. Fully rounded.
- **Nav:** Desktop, Tablet or Mobile × Light or Overlay (the Overlay version sits over hero media).
- **Footer:** Desktop, Tablet or Mobile.
- **Product card:** L or S; properties Name, Farm, Price and Unit. The product photo sits on a `mist` well.
- **Icons:** Lucide, stroke 1.75, about 89 components (`Icon/*`).

## 5. Boards
- **Website — All pages** (file `gVlIXT1BH4YD5NR5wC97An`): every UI on one page. Each part (W1–W6) is a labelled section holding its *Desktop 1440*, *Tablet 834* and *Mobile 390* boards, stacked top to bottom. Pages are numbered and sorted left to right.
  - **W1 Corporate website (13):** 01 Home, 02 About, 03 For farmers, 04 For business, 05 Trace your food, 06 Contact, 35 Impact, 36 Stories, 37 Story article, 38 Careers, 39 Help centre, 40 Privacy and terms, 41 Page not found.
  - **W2 AgTech marketplace (12):** 07 Shop, 08 Product, 09 Farm, 10 Stock-up packs, 11 Bag, 12 Checkout, 13 Order confirmed, 42 Category, 43 Search results, 44 Weekly box, 45 Delivery areas, 46 Reviews.
  - **W3 Consumer accounts (11):** 14 Sign in, 15 Overview, 16 Orders, 17 Order tracking, 18 Addresses and payment, 47 Sign up, 48 Enter code (sign-in and account recovery; there are no passwords), 49 Saved items, 50 Weekly box, 51 Report a problem, 52 Settings.
  - **W4 B2B procurement engine (12):** 19 Overview, 20 Source produce, 21 Bids, 22 Supply agreements, 23 Orders and deliveries, 24 Invoices, 53 Company sign-up, 54 Request a quote, 55 Team and roles, 56 Quality claims, 57 Supply calendar, 58 Trace reports.
  - **W5 Admin interface (20):** 25 Dashboard, 26 Orders, 27 Products and harvests, 28 Buyers, 29 Farmers and farms, 30 Savings groups, 31 Farm checks, 32 Trace codes, 33 Payments and payouts, 59 Live supply map, 60 Batches and handovers, 61 Weight checks, 62 Recalls, 63 Deliveries, 64 Pricing, 65 Website content, 66 Users and roles, 67 Reports, 68 Settings, 69 Problems.
  - **W6 Traceability matrix (5):** 34 QR journey page, 70 Farm story, 71 Spray record, 72 Code not found, 73 Trace search.
- **Client Application — All screens** (file `mJEq4xwX3X2lhYSTiG2vUU`): the same layout, one labelled section for each of A1–A4, all *Android 360* (Flutter).
  - A1 · Getting started, offline and languages: 01–08
  - A2 · Farm space: 09–20, plus 37 Log a spray and 38 Not safe to pick yet
  - A3 · Savings group space (VSLA): 21–29
  - A4 · Field officer: 30–36, plus 39 Map a plot, 40 Scan handover, 41 Merge batches, 42 Weight does not match and 43 Check spray records
- The old combined app board is on the website file's Archive page.

## 5a. v2 visual rules (marketplace and traceability)
- **Full-bleed media:** heroes are edge-to-edge photographs with a dark-green gradient. The navigation sits over them in its Overlay version.
- **Glass:** white or night fill at 14–45% opacity, background blur 32, and a 1 px white edge at 14–30%. Use dark glass on light photographs so text stays readable.
- **Marketplace colour:** each category has its own soft ground and accent (tomato, sun, orange, plum, lime). Use them on category tiles, promotions and photo tints only. Brand green still leads.
- **Charts:** smooth area lines with a soft gradient, a dashed comparison line, an end dot with a tooltip, donuts for shares, and bars with one highlighted bar. No gridline clutter.
- **Live maps:** aerial photograph, lime plot outlines, a dashed route, white handover pins, orange vans, tomato problem pins, glass controls, a legend and a "live" chip.
- **Proof levels:** Weighed and photographed (success), Checked by officer (info), Logged by farmer (neutral). These are used the same way on every page that shows a batch.

## 6. Imagery
- **Marketing scenes:** art-directed photographs of Ghanaian farms, people, the packhouse and deliveries.
- **Product photos:** shot on a `mist` (#F2F7F4) ground.
- **Records:** farm and harvest records use real farmer photos once supplied.
- **Hero video:** the homepage hero is a full-bleed video. It plays `/video/home-hd.mp4` (35 s loop; `home-sd.mp4` on phones) over the poster `/video/home-poster.jpg`.
