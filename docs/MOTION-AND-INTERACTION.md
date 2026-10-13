# Verdant Foods — Motion and Interaction (v1, 13 Oct 2026)

This is the contract the Next.js build follows. The Figma prototype shows **where** everything goes. This file says **how it moves**. Where the two differ, the code follows this file.

## 1. Principles
- **Motion explains, it does not decorate.** Every movement shows where something came from, what changed, or what to do next.
- **Calm and quick.** Most UI motion is 150–350 ms. Big scenes (hero, maps) can take up to 900 ms. Nothing loops except "live" signals (pulsing pins, the live dot, moving vans).
- **One easing family.** Use `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)` for things arriving and `--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)` for things moving between places. Springs (stiffness 260, damping 30) are for drag and hover only.
- **Respect "reduce motion".** With `prefers-reduced-motion: reduce`, turn off parallax, smooth scroll, scroll scrubbing, count-ups and map fly-throughs. Fades of 150 ms or less stay. Content is never hidden behind an animation that might not run.
- **Performance first.** Animate only `transform`, `opacity` and `filter` (and `clip-path` for reveals). Hold 60 fps on a mid-range Android phone (Tecno or Infinix class). Load maps and video only when they are near the viewport.

## 2. Tokens
| Token | Value | Use |
|---|---|---|
| `--dur-1` | 150 ms | Hover, press, toggles |
| `--dur-2` | 250 ms | Menus, chips, tabs, tooltips |
| `--dur-3` | 400 ms | Cards, drawers, page transitions |
| `--dur-4` | 700 ms | Hero text, section reveals |
| `--dur-5` | 900 ms | Map fly-to, hero video fade-in |
| `--stagger` | 60 ms | Between siblings in a reveal |
| `--lift` | translateY(-4px) + shadow-2 | Card hover |

## 3. Page level
- **Smooth scroll** (Lenis, lerp 0.1) on public pages only. Off in the portals (admin, business) and when reduced motion is on.
- **Page transitions:** the outgoing page fades out over 150 ms. The incoming page fades in and rises 12 px over 400 ms. The navigation never animates between pages.
- **Scroll progress:** a 2 px lime bar at the top of long pages (stories, trace journey).
- **Navigation bar:** transparent over heroes. After 80 px of scroll it turns into white glass (blur 20, 85% white) and shrinks from 84 px to 68 px over 250 ms. It hides when scrolling down quickly and comes back on any scroll up.

## 4. Text
- **Hero headlines:** words rise 24 px and fade in, staggered 40 ms, inside a mask (no spill). Run once on load.
- **Section titles:** fade and rise 16 px when 20% is in view. Once only.
- **Numbers** (stats, KPIs, prices): count up from 0 over 1.2 s with ease-out, starting when they come into view. Counted numbers use tabular figures so the width doesn't jump.
- **Body text:** never animates letter by letter.

## 5. Images and parallax
- **Hero media:** the video or image scales from 1.08 to 1.0 over 1.2 s on load. On scroll it moves at 0.85× speed and darkens slightly as the hero leaves.
- **Full-bleed bands** (stats, call to action): the background image moves at 0.8× speed. The glass panels on top stay fixed to the content.
- **Image cards:** on hover the photo zooms to 1.05 over 600 ms and the glass caption rises 4 px.
- **Reveal:** images enter with a clip-path wipe from the bottom (`inset(100% 0 0 0)` to `inset(0)`) over 700 ms.
- **Product photos:** they never parallax. On hover the photo lifts with a 2° tilt that follows the pointer (desktop only).

## 6. Cards, buttons and chips
- **Buttons:** on hover the fill shifts one step deeper and a soft shadow appears, 150 ms. On press, scale 0.97. An arrow icon slides 3 px to the right on hover.
- **Product card:** lifts 4 px with shadow-2, the photo zooms to 1.04, the + button turns lime and rotates 90°. "Add to bag" sends a small product thumbnail along an arc to the bag icon, and the bag count bumps (scale 1.25, then back).
- **Chips and tabs:** the active indicator slides between items (a shared layout animation), never jumps.
- **Glass panels:** the blur and edge brighten slightly on hover (stroke opacity 0.3 to 0.45).
- **Lists:** rows stagger in at 40 ms each, at most 8 rows. After that everything appears at once.

## 7. Menus and overlays
- **Mobile and tablet menu:** a full-screen night-green sheet slides in from the right (400 ms). Links stagger in at 50 ms. The language chips and buttons come last. Close with ✕, Escape or a swipe right.
- **Desktop "Shop" mega menu:** opens on hover after 120 ms, or on click. Category tiles fade and rise. It closes 200 ms after the pointer leaves.
- **Bag drawer:** slides in from the right with the page dimmed to 40%. Items stagger in.
- **Portal sidebar** (admin, business): the active item has a lime or mist pill that slides between items. On tablet and mobile, the section tabs scroll so the active tab is visible.
- **Modals:** scale from 0.96 and fade, 250 ms. The background blurs.
- **Toasts:** slide up from the bottom (mobile) or the top right (desktop). They dismiss after 4 s and pause while hovered.

## 8. Maps (MapLibre GL)
Maps show the real geography of Northern Ghana and Upper West, using satellite imagery for farm views and a light map style for delivery views.
- **On load:** start zoomed out over Ghana, then fly to the area that matters (900 ms, ease-in-out). Plots draw their outline (stroke dash animation, 600 ms) and then fill in at 22% lime.
- **Live signals:** vans move smoothly between GPS updates (interpolated every second). Problem pins pulse with a tomato ring every 2 s. The "Live" chip's dot breathes.
- **Routes:** a dashed line flows along the route (the dash offset animates) in the direction of travel.
- **Interaction:** hover on a plot or pin raises it and shows a glass tooltip. Click flies to it and opens a side card (desktop) or a bottom sheet (mobile). Layer chips (Farms, Collection points, Vans, Problems, Plots) fade layers in and out over 250 ms.
- **Clusters:** at low zoom, pins group into counted circles that split apart as you zoom in.
- **Trace journey:** as the visitor scrolls the timeline, the map follows each step (farm, collection point, packhouse, road, door). The active step highlights on both the map and the timeline.
- **Recall view:** tracing forward draws lines from the source farm out to every buyer, one after another (80 ms stagger), so the spread is visible.

## 9. Charts
- Area charts draw from left to right over 900 ms, then the end dot pops and its tooltip fades in.
- Donuts sweep clockwise over 800 ms. Bars grow from the baseline, staggered 50 ms.
- Hovering shows a crosshair and a glass tooltip. Values update with a 250 ms tween, never a jump.

## 10. Forms and feedback
- Inputs: the focus ring fades in (lime at 40% plus deep green 1 px). The label stays on top.
- Code entry boxes: each digit pops in (scale 0.8 to 1). A wrong code shakes the row (3 × 4 px).
- Success: the check draws itself, then the confetti-free "done" state appears. No confetti.
- Loading: skeletons shimmer over `mist` (1.2 s). Spinners are not used except inside buttons.

## 11. Freshness and trust details
- The freshness bar fills segment by segment in journey order.
- Proof chips (Weighed and photographed, Checked by officer, Logged by farmer) fade in after the data they describe, never before.
- The QR viewfinder on trace search runs a lime scan line top to bottom, every 1.8 s.

## 12. Accessibility
- Every animated control works with the keyboard. Focus rings are always visible.
- Hover-only information is also available on focus and tap.
- Nothing flashes more than 3 times a second.
