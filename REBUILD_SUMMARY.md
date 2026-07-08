# Rebuild Summary — Free + Pitmaster Consolidation

Branch: `rebuild/two-tier`. This document covers everything implemented, tested, and still outstanding before this ships to production.

---

## 1. Decisions — what was done

**1. Annual pricing kept.** Single Pitmaster product, monthly $7.99 + annual $74.99 (~22% off — matches the "Save 20%" messaging already in the UI). No separate tier.

**2. `STRIPE_BACKYARD_PRICE_ID` gap.** Investigated per instruction. The real picture was bigger than the audit assumed — see §3 below ("What contradicted the audit").

**3. App Store IAP.** Not touched. Checkout-gating-by-platform logic is untouched. One thing worth flagging for the App Store review: the pricing copy visible in the Capacitor WebView (`/premium`) changed from a 3-tier grid to 1 tier, and the price dropped from $11.99 → $7.99/mo. If this app has already been through App Store review with the old pricing, the new pricing should be reflected before resubmission.

**4. Free vs. Pitmaster split** — implemented exactly per REBUILD_PLAN.md §1: Free gets full cook planning/tracking, capped Preacher chat (5 msgs/cook, unchanged), 2 cooks/month (unchanged), full Playbook (no gating at all), Cook Log, Fix My Cook. Pitmaster gets unlimited chat/cooks + the 7 AI-insight routes, gated exactly where they already were (`isPitmaster()` check unchanged in each of the 7 API routes).

**5. `/setup`, `/setup/pits` deleted.** Confirmed orphaned (zero inbound links) before deleting.

**6. Navigation/IA simplification — the real scope of this rebuild.** See §2 below for full before/after.

**7. Old prices archived.** Nothing to archive — see §3, the old prices don't exist in the Stripe account this repo's `.env.local` points at. New prices created fresh (see §4).

**8. Dead code deleted** per AUDIT.md §5: stray `apps/web/apps/web/ios/...` empty tree, `premium/cancel.tsx` / `premium/success.tsx` (invalid Next.js filenames, unreachable), `cook/[id]/404.tsx` (invalid filename), `lib/billing/isPremium.ts` (deprecated, no callers), empty `api/checkout/` dir, root `type` file (zero-byte, no extension).

---

## 2. Navigation/IA — before and after

| | Before | After |
|---|---|---|
| Top-level sections | 8 (dashboard, playbook, pitmaster, cook, account, logs, lab, fix) | 4 (dashboard, playbook, cook, account) + marketing pages |
| Cook flow | 10 routes (`page, events, fire, guide, live, plan, rubs, share, summary, timeline, tracker`) | 1 route (`/cook/[id]`) with 7 in-page tabs (Overview, Plan, Tracker, Live Mode, Timeline, Journal, Summary) + a Guide reference overlay + a Share modal |
| Playbook | 7 routes (index + 6 modules) | 1 route with in-page module switching (`?tab=` deep-linkable) |
| Pitmaster insights | 3 standalone routes (`/pitmaster/trends`, `/pitmaster/meat/[type]`, `/pitmaster/pit/[type]`) | Folded into `PitmasterInsightsOverlay` as "Full Trend Analysis / Meat Profile / Pit Profile" deep-dive views — real data-driven content preserved (not just summarized), reachable only from within a cook's Summary tab, matching the "not standalone destinations" instruction |
| Logs / Lab / Fix | 3 standalone routes | Folded into Dashboard as modals (`Cook Log & History`, `Wood Flavor Lab`, `Fix My Cook` buttons), deep-linkable via `/dashboard?logs=1` / `?lab=1` / `?fix=1` |
| Signup | 3-step wizard (account → smoker → cooking style) | 1 step (name/email/password). Smoker entry deferred to first cook creation — the existing `/` prep flow already handles zero-pit users, so no new code was needed there |
| Total routes (build output) | ~55 | 42 |

**Cook flow implementation note:** all 10 old page components were moved into `cook/[id]/_sections/` with their internal logic untouched — only cross-navigation (`<Link href="/cook/.../tracker">` etc.) was rewired to an `onNavigate(tab)` callback from the new tab-shell, and duplicate per-page nav bars (each old page rendered its own copy of the same 5-link bottom bar) were removed since the shell now owns navigation once. One real architectural change: `Plan.tsx` was a Server Component that ran an AI plan-generation call unconditionally; it's now a client component fetching from a new `/api/cook-plan` route on-demand, so that expensive call only fires when the user actually opens the Plan tab (previously it would have re-run on every visit to the unified cook page — a real behavior change I made deliberately to avoid a regression).

**Playbook implementation note:** same approach — module content moved into `playbook/_sections/`, `PlaybookShell.tsx` (client) manages which module is showing via `?tab=`, `PitTypes.tsx` (the one module with live Supabase data — user's own pit type) stays a cheap Server Component.

---

## 3. What contradicted the audit

- **The `STRIPE_BACKYARD_PRICE_ID` gap was bigger than described.** The env var wasn't just missing — `.env.local` had a fully duplicated, conflicting price-ID block (an old `1TAB...`-prefixed set and a newer `1TMb...`-prefixed set both defining `STRIPE_BASIC_PRICE_ID`), and **every price ID referenced anywhere in the app — old or "new" — returned 404 when queried against the Stripe test account this repo is configured against.** The synced `stripe_subscriptions` table (2 rows, both `status: canceled`) references a price ID that also doesn't exist in this account. Conclusion: the price IDs in `.env.local` were created in a different Stripe account or mode than the one currently configured. This didn't block the rebuild (new prices were created fresh in the account this repo actually uses), but it means **the live/production Stripe account — wherever that actually is — needs its own price setup repeated manually** (see §6).
- **Supabase CLI was linked to the wrong project.** `supabase link` pointed at a project called "BlessYourLoaf" — a different app entirely — not the "PitPreacher" project this app's `.env.local` actually targets. Caught before any schema command ran; relinked to the correct project (`mgqubopwzyddvjeptnxd`) before doing anything else.
- **"No active subscribers" — confirmed true, but the DB has a wrinkle worth knowing about.** 3 `subscriptions` rows show `tier=pitmaster, status=active` with **no Stripe customer/subscription ID attached** — these are comp/manually-granted accounts, not real billing relationships, so they were unaffected by any of this work. Real Stripe-linked subscriptions (the 2 rows in `stripe_subscriptions`) are both canceled. So "no active subscribers" is accurate for anything Stripe-billed.
- **`subscription_tier` Postgres enum is unenforced.** It exists (`free|backyard|pitmaster`) but isn't bound to any column — `subscriptions.tier` is plain `text`. Left the enum alone (didn't alter it, per the instruction to only touch it if confirmed enforced) — it's now doubly stale (still has `backyard`, still not `basic`) and is a good candidate for a future cleanup migration alongside the other dead `stripe_*` tables the audit flagged.

---

## 4. Stripe changes

New product **"Pitmaster"** created in **test mode** on the Stripe account this repo's `.env.local` points at (account `acct_1TAB7YCVbcpKBwQc`):

| Price | ID |
|---|---|
| Monthly $7.99 | `price_1TqQQbCVbcpKBwQcE5QlP2Mn` |
| Annual $74.99 | `price_1TqQQbCVbcpKBwQciugCzyAR` |

Nothing was archived — as described in §3, the old Basic/Backyard/Pitmaster($11.99) prices don't exist in this account, so there was nothing to archive. `.env.local` was updated to the new IDs, and the duplicate/conflicting old block was removed entirely.

**This is test mode only.** You'll need to create the equivalent monthly/annual Pitmaster prices in whichever Stripe account/mode actually serves production, and set those price IDs in production's environment config (Vercel or wherever it's deployed) — the code reads `STRIPE_PITMASTER_PRICE_ID` / `STRIPE_PITMASTER_ANNUAL_PRICE_ID` (server) and their `NEXT_PUBLIC_` twins (client).

---

## 5. Bugs found and fixed during end-to-end testing

Verification wasn't just re-reading the diff — I ran the dev server, drove real HTTP requests against it, and replayed real Stripe test-mode webhook events end-to-end (subscription created → tier updated → canceled → reverted to free) using the Stripe CLI. That surfaced two real, pre-existing bugs unrelated to the price-map rewrite itself, both fixed:

1. **`subscriptions.user_id` had no unique constraint**, but the webhook's new-customer path does `.upsert(..., { onConflict: "user_id" })`. Without a matching unique constraint, Postgres can't honor `ON CONFLICT`, the upsert fails silently (Supabase-js returns an error object the webhook code never checked), and **a brand-new customer's first Pitmaster subscription would never actually get written to the database** — confirmed live via a real test-mode subscription that returned webhook 200 but left the row at `tier=free`. Fixed with a new migration (`20260707010000_add_subscriptions_user_id_unique.sql`) adding the missing constraint (verified no existing duplicate `user_id` rows first). Re-tested after the fix — works correctly now.
2. **`current_period_end` moved in a Stripe API version bump** — the webhook read it from the top level of the Subscription object, but this Stripe account is on API version `2026-02-25.clover`, where that field lives on each subscription item instead. Fixed in both webhook handlers; confirmed the "renews on" date now populates correctly.

Also found and fixed several leftover references to the old pricing/tier model that a plain code-reading pass didn't catch but driving the app did:
- `app/page.tsx` (root prep tool) still showed **"Upgrade — $3.99/mo"** on the free-tier cook-limit paywall.
- 5 of 7 Playbook modules still displayed **"Basic+" / "Backyard+"** tier badges even though every module is now free.
- `FixPanel.tsx` (the relocated Fix My Cook flow) still had a **hard lock screen gating the entire feature behind "Backyard and Pitmaster plans"** — meaning Free users, who are supposed to have full access to Fix My Cook per decision #4, would have been completely blocked. Removed the gate and the now-dead `tier` fetch.
- `Live.tsx` (cook live mode) gated **suggested-prompt pills and photo upload** behind `backyard`/non-free tiers — neither is a named Pitmaster-exclusive feature in the decided split, so both are now universally available, consistent with "collapse Basic+Backyard into Free."

I verified `Summary.tsx`'s two `userTier === "pitmaster"` checks (Cook Confidence Score, Fire Control Score) are correct as-is — those are 2 of the 7 explicitly pitmaster-gated insights.

---

## 6. Manual verification steps still needed before production

- [ ] **Replicate the Stripe setup in the actual production Stripe account/mode.** This build only touched the test-mode account linked to this repo's `.env.local` — confirm which account/mode actually serves `thepitpreacher.com` in production, create the same monthly/annual Pitmaster prices there, and set the resulting price IDs in production's env config.
- [ ] **Full click-through of the new nav** — I verified this via HTTP status codes, server logs, and a live Stripe webhook replay (no console/runtime errors surfaced), but I did not have a browser automation tool available in this environment, so no one has visually clicked the tab bar, opened the Guide overlay, or opened the Dashboard modals in a real browser yet. Please do a full pass: sign up as a new user, create a cook, click through all 7 cook tabs + Guide overlay + Share modal, click through all 7 Playbook modules, open all 3 Dashboard tool modals (Cook Log, Wood Lab, Fix My Cook).
- [ ] **Live payment test**: run one real (or Stripe-test-mode-via-real-checkout-UI) purchase through `/premium`, both monthly and annual, and confirm the Stripe Checkout redirect, success/cancel URLs (`/account/billing?status=success|cancelled`), and post-purchase tier all work from the actual browser checkout flow (I tested the webhook side directly via the Stripe API/CLI, not by clicking through Stripe Checkout's hosted page).
- [ ] **Stripe customer portal** cancel/downgrade flow, clicked through for real (I verified the webhook correctly processes a `customer.subscription.deleted` event, but not the portal UI itself).
- [ ] **App Store**: if this app has already been submitted/approved with the old 3-tier, $11.99 pricing visible in the WebView, the pricing change needs to be reflected before resubmission (see decision #3).
- [ ] Confirm production environment has a real `ANTHROPIC_API_KEY` and `NEXT_PUBLIC_APP_URL` set — this repo's local `.env.local` was missing both (needed a placeholder value added locally just to get `next build` to run for verification; not a production concern but flagging in case production's env is similarly incomplete).
