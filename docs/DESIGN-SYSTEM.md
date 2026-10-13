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
- **Website — All pages:** three sections, *Desktop 1440*, *Tablet 834* and *Mobile 390*, with rows named after the Verdant document:
  - Corporate Website (6)
  - AgTech Marketplace (7)
  - Consumer Accounts (5)
  - B2B Procurement Engine (6)
  - Admin Interface (9)
  - Traceability Matrix: QR Journey Page (1)
- **Client Application — All screens:** one section, *Android 360* (Flutter), with three rows:
  - Getting started, offline and languages (5)
  - Farm space (10)
  - Savings group space (8)

## 6. Imagery
- **Marketing scenes:** art-directed photographs of Ghanaian farms, people, the packhouse and deliveries.
- **Product photos:** shot on a `mist` (#F2F7F4) ground.
- **Records:** farm and harvest records use real farmer photos once supplied.
- **Hero video:** the homepage hero is a full-bleed video. The poster frame in Figma is `hero-aerial`. The video file is still to be produced.
