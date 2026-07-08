# The Pit Preacher — Complexity Audit

Generated 2026-07-06. Read-only analysis of `apps/web` in the Turborepo monorepo (`C:\Users\Brian\thepitpreacher\The-Pit-Preacher-claude`). No code, schema, or Stripe changes were made.

---

## 1. Route / Page Inventory

All routes live under `apps/web/app/`. Next.js 16 App Router.

### Public / marketing (no auth required)
| Route | File |
|---|---|
| `/` | `apps/web/app/page.tsx` — **not a marketing page**: this is a large client-side cook-builder/prep tool (item catalogs, smoker selection, prep session creation). Marketing hero content actually lives in `apps/web/app/dashboard/page.tsx`'s logged-out branch. |
| `/about` | `app/about/page.tsx` |
| `/features` | `app/features/page.tsx` |
| `/how-it-works` | `app/how-it-works/page.tsx` |
| `/meet-the-preacher` | `app/meet-the-preacher/page.tsx` |
| `/preacher` | `app/preacher/page.tsx` |
| `/premium` | `app/premium/page.tsx` — pricing page |
| `/privacy` | `app/privacy/page.tsx` |
| `/prep` | `app/prep/page.tsx` |
| `/playbook` + 6 sub-pages | `app/playbook/{page,finishing-moves,fire-behavior,holy-trinity,meat-science,pit-types,timeline-philosophy,troubleshooting}/page.tsx` |
| `/pitmaster` + dynamic children | `app/pitmaster/meat/[meatType]/page.tsx`, `app/pitmaster/pit/[pitType]/page.tsx`, `app/pitmaster/trends/page.tsx` |
| `/auth/login`, `/auth/reset` | `app/auth/{login,reset}/page.tsx` |
| `/auth/callback` | `app/auth/callback/route.ts` |

### Protected (behind `middleware.ts`, requires session)
| Route | File |
|---|---|
| `/dashboard` | `app/dashboard/page.tsx` |
| `/setup`, `/setup/pits` | `app/setup/page.tsx`, `app/setup/pits/page.tsx` — **appears orphaned**, see §5 |
| `/account` + 5 sub-pages | `app/account/{page,billing/page,cooks/page,danger/page,pits/page,profile/page,settings/page}.tsx`, layout at `app/account/layout.tsx`, server actions in `app/account/actions.ts` |
| `/cook` | `app/cook/page.tsx` |
| `/cook/create` | `app/cook/create/page.tsx` |
| `/cook/preacher` | `app/cook/preacher/page.tsx` (+ `action.ts`, `behavior.ts`, `fire.ts`, `voice.ts`) |
| `/cook/[id]` + 10 sub-routes | `app/cook/[id]/{page,events/page,fire/page,guide/page,live/page,plan/page,rubs/page,share/page,summary/page,timeline/page,tracker/page}.tsx` |
| `/logs` | `app/logs/page.tsx` |
| `/lab` | `app/lab/page.tsx` |
| `/fix` | `app/fix/page.tsx` ("Fix My Cook" panic button) |
| `/preacher` | also matched by middleware matcher |

### API routes (18)
`account/delete`, `billing/create-checkout-session`, `billing/portal`, `checkout` (empty, see §5), `confidence`, `cooks/create`, `fire-control`, `insights`, `meat-profile`, `pit-profile`, `preacher`, `strategy`, `trends`, `usage`, `variability`, `webhook`.

### Navigation depth
Up to **4 levels deep**: `/cook/[id]/plan` → nested tier-gated overlay (`PitmasterInsightsOverlay`) → nested "Deep Insights" panel sections. `/pitmaster/meat/[meatType]` and `/pitmaster/pit/[pitType]` are also 3 levels deep with their own layouts. For a BBQ logging app this is a lot of surface area — **8 top-level content sections** (dashboard, playbook, pitmaster, cook, account, logs, lab, fix) each with their own sub-navigation.

---

## 2. Where Subscription/Tier Logic Lives

### Tier model in code (4 tiers)
`free` → `basic` ($3.99) → `backyard` ($7.99) → `pitmaster` ($11.99), ranked in:
- **`apps/web/lib/premium.ts`** — `TIER_RANK`, `getTier()`, `isPremium()`, `tierMeetsRequirement()`. This is the canonical, consolidated implementation.
- **`apps/web/lib/billing/isPremium.ts`** — marked `@deprecated`, thin wrapper delegating to `lib/premium.ts`. No remaining callers found (verified `app/api/usage/route.ts` already imports from `lib/premium` directly). Safe to delete.

> Note: an earlier review (`Claude_Code_Review.txt`) flagged "two isPremium implementations that diverge" — **this has already been fixed**; they're now consolidated, one is just a deprecated pass-through.

### Supabase schema
- Table `subscriptions` (`apps/web/types/database.ts:1784`): `user_id, tier (text), status (text), stripe_customer_id, stripe_subscription_id, current_period_end`.
- **Mismatch**: the Postgres enum `subscription_tier` (`types/database.ts:2120,2263`) only defines `'free' | 'backyard' | 'pitmaster'` — **"basic" is not a valid enum member**, yet all application code (pricing page, dashboard badges, Paywall component, playbook gating, billing page) treats `basic` as a real, purchasable tier with its own Stripe price. The `subscriptions.tier` column itself is typed as plain `string` in the generated types (not bound to the enum), so inserts of `"basic"` won't necessarily fail — but this needs verification directly against the live Supabase schema before any tier consolidation work, since it suggests the enum may already be out of sync with reality (or "basic" was retired mid-flight and code wasn't cleaned up).
- Legacy/parallel billing tables not touched by the live webhook: `stripe_subscriptions`, `stripe_products`, `stripe_prices`, `stripe_events`, view `billing_overview`. The current webhook (`apps/web/app/api/webhook/route.ts`) only writes `subscriptions` and reads `stripe_customers`. These other four tables/view are remnants of an earlier billing architecture — dead schema.
- `feature_flags` / `user_feature_flags` tables exist in the schema but a repo-wide search found **zero application-code references** — fully unused.
- Three overlapping usage-tracking constructs: `usage` (stage/count/month), `usage_events` + `daily_usage` view, and `api_rate_limits` (the only one confirmed live — backs `check_rate_limit()` used by `app/api/preacher/route.ts:199`).
- Only **two tracked migrations** exist: `supabase/migrations/20260524000000_add_rate_limit_rpc.sql` and `20260525000000_create_cook_if_under_limit.sql`. The rest of the ~25-table schema visible in `types/database.ts` has no corresponding migration file in this repo — it was evidently built directly in the Supabase dashboard/Studio. **There is no single source of truth for schema changes**; any tier/schema work should start by pulling a fresh schema dump from the live project, not by trusting `supabase/migrations/`.

### Stripe checkout / webhook / portal
- `apps/web/app/api/billing/create-checkout-session/route.ts` — validates `priceId` against a whitelist built from 7 env vars (lines 16-24), creates/reuses a Stripe customer, applies a 7-day trial only for Pitmaster tier and only if the user never had a prior Pitmaster subscription (lines 98-117).
- `apps/web/app/api/billing/portal/route.ts` — Stripe billing portal session.
- `apps/web/app/api/webhook/route.ts` — handles `checkout.session.completed`, `customer.subscription.{created,updated,deleted}`, `invoice.payment_failed`. `getTierFromPriceId()` (line 222) maps 6 price-ID env vars to tier names.
  - **Bug candidate**: line 226 references `process.env.STRIPE_BACKYARD_PRICE_ID`, but `.env.example` never declares this variable (only `STRIPE_BASIC_PRICE_ID` and `STRIPE_PITMASTER_PRICE_ID` are listed as "legacy/server-side aliases", line 36-37 of `.env.example`). If this var is genuinely unset in production, a monthly Backyard subscription would resolve to tier `"free"` in the webhook. **Needs verification against real Vercel env vars before touching pricing.**
  - `app/api/checkout` directory exists but is **empty** (no `route.ts`) — the old duplicate billing route flagged in `codex_code_review.txt` has already been removed; only the stale empty directory remains.
- `apps/web/app/api/cooks/create/route.ts` calls Postgres RPC `create_cook_if_under_limit` (`supabase/migrations/20260525000000_create_cook_if_under_limit.sql`), which atomically enforces the **free-tier 2-cooks/month limit** using `pg_advisory_xact_lock`. This is a proper server-side, race-free implementation — the "client-side only, bypassable" issue from `Claude_Code_Review.txt` item 3 has already been fixed.
- Free-tier **5-message limit** on Preacher chat: `apps/web/app/api/preacher/route.ts:307-316` (`MESSAGE_LIMIT_REACHED` when `userTier === "free"`).

### Duplicate pricing UI
Two independent, hand-maintained implementations of the same tier/price data:
1. `apps/web/app/premium/page.tsx` — 3-tier grid, monthly/annual toggle, per-month-equivalent annual pricing ($3.19/$6.39/$9.59).
2. `apps/web/app/account/billing/page.tsx` — separate `priceMap`/`priceToTier`/`TIERS` objects, annual prices shown as flat yearly totals ($29.99/$79.99/$119.99/yr). Both must be hand-updated in sync today; they are not.

### Photo pack add-on (unbuilt/unused)
`.env.example` declares `NEXT_PUBLIC_STRIPE_PHOTO_1_PRICE_ID` through `_PHOTO_4_PRICE_ID` (4 SKUs), but `apps/web/app/api/billing/create-checkout-session/route.ts:23` whitelists a differently-named `NEXT_PUBLIC_STRIPE_PHOTO_PACK_PRICE_ID` (singular). Neither is referenced by any UI component found in this audit — this looks like a planned-but-never-shipped feature with inconsistent naming already baked in.

---

## 3. Paywall / Upsell Touchpoints

| Touchpoint | File : line | Gate |
|---|---|---|
| Generic paywall wrapper | `apps/web/components/Paywall.tsx:14` | `requiredTier: "basic" \| "backyard" \| "pitmaster"` |
| Playbook module locks | `apps/web/app/playbook/page.tsx:20-58` (module list), rendered via `apps/web/components/playbook/PlaybookCard.tsx` | 1 free, 3 `basic`, 3 `backyard` modules |
| "Deep Insights" slide-over | `apps/web/components/insights/PitmasterInsightsOverlay.tsx:202,354-392` | `pitmaster` only — full blur/lock screen with upgrade CTA |
| Cook plan Pitmaster branch | `apps/web/app/cook/[id]/plan/page.tsx:178-179` | `pitmaster` |
| Dashboard tier-aware upsell blocks | `apps/web/app/dashboard/page.tsx:274-334` | Different copy per tier: free → "Upgrade to Basic $3.99/mo", basic → "Upgrade to Backyard $7.99/mo", backyard → "Learn more" (Pitmaster) |
| Pricing page itself | `apps/web/app/premium/page.tsx` | Full 3-tier comparison grid |
| API: Fire Control Score | `apps/web/app/api/fire-control/route.ts:17-18` | `pitmaster` |
| API: Confidence Score | `apps/web/app/api/confidence/route.ts:23-24` | `pitmaster` |
| API: Trend Analysis | `apps/web/app/api/trends/route.ts:16,18` | `pitmaster` |
| API: Next Cook Strategy | `apps/web/app/api/strategy/route.ts:21-22` | `pitmaster` |
| API: Pit Profile | `apps/web/app/api/pit-profile/route.ts:23-24` | `pitmaster` |
| API: Meat Profile | `apps/web/app/api/meat-profile/route.ts:23-24` | `pitmaster` |
| API: Cook Variability Index | `apps/web/app/api/variability/route.ts:13-14` | `pitmaster` |
| Free cook creation limit (2/mo) | `apps/web/app/api/cooks/create/route.ts:69-90` → RPC `create_cook_if_under_limit` | `free` |
| Free Preacher chat message cap (5/cook) | `apps/web/app/api/preacher/route.ts:307-316` | `free` |

**Observation**: every one of the seven AI-insight API routes is already gated at `pitmaster` — none are gated at `basic` or `backyard`. Those two middle tiers currently only gate Playbook *reading material* and cosmetic dashboard badges. This strongly supports collapsing Basic + Backyard into Free (see `REBUILD_PLAN.md`).

---

## 4. Onboarding Flow — Traced Step by Step

1. Logged-out visitor sees the marketing hero rendered by `apps/web/app/dashboard/page.tsx` (lines 183-206) with primary CTA **"Start a Cook"** → `/auth/login?tab=signup`.
2. `apps/web/app/auth/login/page.tsx` reads the `tab=signup` query param (line ~75) and opens signup mode.
3. Signup is a **3-step client-side wizard inside the same page component** (no separate route per step):
   - Step 1 (`handleStep1Next`): display name, email, password, confirm password.
   - Step 2 (`handleStep2Next`): add one or more smokers (name + wood) — this *is* pit setup, done inline.
   - Step 3: pick a cooking style from `COOKING_STYLES` (6 options: Texas, Kansas City, Memphis, Carolina, Backyard Classic, Competition).
4. `handleSignupSubmit` calls `supabase.auth.signUp()`, then makes **four separate client-side inserts** (no transaction, no server endpoint): `profiles`, `subscriptions` (`tier: "free", status: "inactive"`), `pits` (one row per smoker entered), `user_preferences`.
5. Immediately re-authenticates via `signInWithPassword` and hard-redirects to `/dashboard`.
6. OAuth (Google/Apple) sign-in bypasses all of the above — it redirects straight to `apps/web/app/auth/callback/route.ts`, which exchanges the code and redirects to `/dashboard`. **No profile/subscription/pit rows are created for OAuth users anywhere I could find** (no DB trigger visible in the two tracked migrations). `getTier()` degrades gracefully to `"free"` on a missing row, but there's no `pits` row either — first-cook UX for OAuth signups is unverified and likely broken or degraded.
7. `apps/web/app/setup/page.tsx` and `apps/web/app/setup/pits/page.tsx` implement a **second, apparently orphaned onboarding path** — check for existing pits, redirect to an add-a-pit form if none exist. Nothing in the current signup flow links here; it looks like a leftover from an earlier design where pit setup happened after signup instead of inline. Still reachable by direct URL (protected by middleware) but dead-end in the current UX graph.

---

## 5. Dead Code, Duplicates, and Legacy Remnants

| Finding | Location |
|---|---|
| Stray empty duplicate directory tree | `apps/web/apps/web/ios/App/App/public` — nested `apps/web/apps/web/...` with **zero files**, clearly a copy/build mistake. Safe to delete. |
| Invalid Next.js route files (dead/unreachable) | `apps/web/app/premium/cancel.tsx`, `apps/web/app/premium/success.tsx` — not valid App Router filenames (need `cancel/page.tsx`, `success/page.tsx` to ever render) |
| Invalid Next.js special file (dead/unreachable) | `apps/web/app/cook/[id]/404.tsx` — should be `not-found.tsx` |
| Empty legacy directory | `apps/web/app/api/checkout/` — no `route.ts` inside; the old duplicate billing route already removed, only the empty folder remains |
| Deprecated wrapper with no callers | `apps/web/lib/billing/isPremium.ts` |
| Orphaned onboarding routes | `apps/web/app/setup/page.tsx`, `apps/web/app/setup/pits/page.tsx` (see §4) |
| Duplicate pricing/plan UIs | `apps/web/app/premium/page.tsx` vs `apps/web/app/account/billing/page.tsx` — independent price maps, inconsistent annual price presentation |
| Legacy Stripe tables unused by live code | `stripe_subscriptions`, `stripe_products`, `stripe_prices`, `stripe_events`, view `billing_overview` |
| Fully unused schema tables | `feature_flags`, `user_feature_flags` — zero code references found |
| Overlapping usage-tracking schema | `usage`, `usage_events` + `daily_usage` view (only `api_rate_limits` confirmed in active use) |
| Tier enum / app code mismatch | Postgres enum `subscription_tier` = `free/backyard/pitmaster`; app code implements a 4th tier `basic` not present in the enum |
| Env var naming inconsistency | Checkout whitelist expects `NEXT_PUBLIC_STRIPE_PHOTO_PACK_PRICE_ID`; `.env.example` declares `NEXT_PUBLIC_STRIPE_PHOTO_1..4_PRICE_ID` instead — feature was never finished |
| Possibly-missing production env var | `STRIPE_BACKYARD_PRICE_ID` used in webhook's `getTierFromPriceId` but never declared in `.env.example` |
| Stray root file | `type` — zero-context, extension-less file at repo root next to `package.json`; likely a shell redirect accident |
| Turborepo stub package, not a real design system | `packages/ui` — still the `create-turbo` starter (`button.tsx`, `card.tsx`, `code.tsx`), not used for Pit Preacher's actual visual design (see `COMPARISON.md`) |

---

## 6. Stripe Price IDs / Env Vars Found in Code (values are placeholders — no live IDs are checked into the repo)

| Env var | Declared in `.env.example`? | Used where |
|---|---|---|
| `NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID` | Yes | premium page, billing page, checkout whitelist |
| `NEXT_PUBLIC_STRIPE_BACKYARD_PRICE_ID` | Yes | premium page, billing page, checkout whitelist |
| `NEXT_PUBLIC_STRIPE_PITMASTER_PRICE_ID` | Yes | premium page, billing page, checkout whitelist, trial-eligibility check |
| `NEXT_PUBLIC_STRIPE_BASIC_ANNUAL_PRICE_ID` | Yes | same set, annual toggle |
| `NEXT_PUBLIC_STRIPE_BACKYARD_ANNUAL_PRICE_ID` | Yes | same set |
| `NEXT_PUBLIC_STRIPE_PITMASTER_ANNUAL_PRICE_ID` | Yes | same set, trial-eligibility check |
| `STRIPE_BASIC_PRICE_ID` | Yes (labeled "legacy alias") | webhook `getTierFromPriceId` |
| `STRIPE_PITMASTER_PRICE_ID` | Yes (labeled "legacy alias") | webhook `getTierFromPriceId` |
| `STRIPE_BACKYARD_PRICE_ID` | **No** | webhook `getTierFromPriceId` — likely gap, see §2 |
| `NEXT_PUBLIC_STRIPE_PHOTO_1..4_PRICE_ID` | Yes | not referenced in any code found |
| `NEXT_PUBLIC_STRIPE_PHOTO_PACK_PRICE_ID` | **No** | checkout whitelist — mismatched name, see §5 |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | standard Stripe SDK config |

No Stripe product IDs (`prod_...`) appear anywhere in code — only price IDs. This audit did **not** call the Stripe API or check live dashboard config, per instructions; all of the above is inferred purely from source and `.env.example`.
