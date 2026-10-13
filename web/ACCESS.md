# Verdant: products, URLs and who can get in

The site is one Next.js app that holds several Verdant products. Every public page links to all of them from the **Products** button in the top bar (the grid icon), the mobile menu, and the **Verdant products** strip in the footer.

| Product | URL | Who can see it | How to get in |
|---|---|---|---|
| Website | `/`, `/about`, `/impact`, `/stories`, `/careers`, `/help`, `/contact` | Everyone | Open |
| Shop | `/shop`, `/packs`, `/weekly-box`, `/bag`, `/checkout`, `/account/*` | Everyone (shoppers sign in with a phone code) | `/account/sign-in` |
| Trace your food | `/t`, `/t/[code]`, `/trace-your-food` | Everyone | Open. Scan the QR code on a bag or type the code at `/t` |
| Farmers | `/farmers` | Everyone | Open (the farmer app is separate) |
| Business portal | `/b2b/*` | Business customers and Verdant staff | `/b2b/sign-in` (footer: "Business sign in") |
| Operations console (Admin) | `/admin/*` | Verdant staff only | `/team` (footer and Products menu: "Team sign in") |

## How the protection works
- `src/middleware.ts` runs before every `/admin`, `/b2b` and `/team` request.
  - `/admin/...` without a staff session goes to `/team?next=/admin/...`.
  - `/b2b/...` without a staff or business session goes to `/b2b/sign-in?next=/b2b/...`.
  - Already signed in? `/team` and `/b2b/sign-in` skip straight to the console or portal.
- Signing in posts to `POST /api/auth/sign-in`. On success it sets an httpOnly cookie `vf_session` (`role.expiry.signature`, HMAC-SHA256 with `AUTH_SECRET`). It lasts 12 hours, or 30 days with "Keep me signed in".
- "Sign out" (avatar menu or the foot of the portal sidebar) posts to `POST /api/auth/sign-out` and returns to the website.
- `/admin`, `/b2b`, `/team` and `/api` are kept out of search engines (`robots.txt`, `noindex` metadata and an `X-Robots-Tag` header).
- Changing `AUTH_SECRET` signs everyone out at once.

## Environment variables (Vercel → Project → Settings → Environment Variables)
| Name | Required | What it is |
|---|---|---|
| `AUTH_SECRET` | Yes | A long random string (32+ characters) used to sign sessions. Generate one with `openssl rand -base64 32`. |
| `TEAM_PASSWORD` | Yes, for `/team` | The shared password for Verdant staff. |
| `TEAM_EMAILS` | Optional | Comma-separated staff emails allowed in, e.g. `akosua@verdantfoods.com,kwame@verdantfoods.com`. Empty means any email with the right password. |
| `BUSINESS_PASSWORD` | Yes, for `/b2b/sign-in` | The shared password for demo business accounts. |

If `AUTH_SECRET` or an area's password is missing, that sign-in says it "is not set up yet" and nobody can get in. After adding or changing these, redeploy.

## Local development
`web/.env.development` holds dev-only values that Next.js loads for `next dev` only: password `verdant-dev` for both the team and business sign-in. It is never used in production; do not put real secrets in it.

This is a stop-gap: one shared password per area. When Verdant's backend team ships real accounts, replace the check in `src/app/api/auth/sign-in/route.ts` and keep the cookie and middleware as they are.
