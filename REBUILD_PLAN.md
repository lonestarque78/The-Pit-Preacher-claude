# Rebuild Plan — Consolidate to Free + Pitmaster

Proposal only. No code, schema, or Stripe changes were made as part of producing this document. Every item below needs owner sign-off before execution.

---

## Flagged Assumption — Confirm Before Proceeding

**Assumption made for this plan**: annual billing, if kept, is a *price option* under the single Pitmaster tier (e.g. "Pitmaster — Monthly $7.99 / Annual $XX, save ~20%"), not a separate tier or separate product. This mirrors exactly what Bless Your Loaf already does in production (see `COMPARISON.md` §3) and what Pit Preacher's own webhook already half-supports (it already maps annual price IDs to the same tier as monthly). **Please confirm this is the intended shape** — the alternative (no annual option at all, monthly-only) is also a one-line change to this plan if that's preferred.

---

## 1. Free vs. Pitmaster Feature Split

### Recommendation

| Free | Pitmaster ($7.99/mo, annual optional) |
|---|---|
| Full cook planning & tracking tools (item catalog, timeline, live cook mode, fire/tracker/events pages) | Everything in Free, plus: |
| Ask the Preacher — capped (keep the existing 5-messages-per-cook limit as the free ceiling, or tune it) | Ask the Preacher — unlimited |
| 2 cooks/month limit (existing, already enforced server-side — keep as-is) | Unlimited cooks/month |
| Full Playbook — **all modules unlocked** | (No playbook gating at all — see justification) |
| Cook Log & history (currently Backyard-gated) | — |
| Basic dashboard | Deep Insights Overlay (Confidence Score, Fire Control Score, Trend Analysis, Meat/Pit Profiles, Next Cook Strategy) — the 7 API routes already gated at `pitmaster` today stay exactly as gated |
| Pit Rescue / "Fix My Cook" (currently Backyard-gated) | — |

### Justification

The audit (`AUDIT.md` §3) found that **every one of the seven AI-insight API routes** (`fire-control`, `confidence`, `trends`, `strategy`, `pit-profile`, `meat-profile`, `variability`) is *already* gated at `pitmaster`, not at the now-defunct `basic`/`backyard` middle tiers. Those middle tiers currently gate only: (a) which Playbook articles you can read, and (b) cosmetic dashboard badge copy. Neither of those is a strong enough value prop to justify its own paid tier — reading material and cook-logging are exactly the kind of "let them see what they're missing" free-tier features that drive upgrades, not things to paywall on their own.

Collapsing everything that isn't a Pitmaster-gated AI insight into Free, and keeping the Pitmaster gate exactly where it already is, means: **zero new gating logic to write.** The `tierMeetsRequirement(tier, "pitmaster")` calls in the seven API routes and `cook/[id]/plan/page.tsx` don't need to change at all — only the `basic`/`backyard` checks (Playbook modules, `Paywall.tsx`'s `requiredTier` type, dashboard upsell copy) need to be either deleted or repointed at `pitmaster`. This is the lowest-risk path to two tiers because it reuses the one gating pattern that already works correctly in production.

Keep the existing free-tier limits (2 cooks/month, 5 Preacher messages/cook) — they're already implemented as atomic, race-free server-side checks (`create_cook_if_under_limit` RPC, `preacher/route.ts:307-316`) and don't need touching.

---

## 2. Stripe Changes Needed (Proposal Only — Do Not Execute Without Owner Approval)

1. **New Pitmaster price(s) to create**: a single product "Pitmaster" with two prices — monthly $7.99 and (if the annual assumption above is confirmed) annual at a discount matching the app's existing "Save 20%" messaging already present in `apps/web/app/premium/page.tsx`'s billing toggle. Do **not** reuse the existing `pitmaster` price IDs at $11.99 — that price point is being lowered, and Stripe prices are immutable once created, so this requires genuinely new Price objects on the same or a new Product.
2. **Prices to deprecate** (not delete — Stripe prices can't be deleted, only archived once no active subscriptions reference them): all `basic` and `backyard` monthly/annual prices, and the old `pitmaster` $11.99 monthly/annual prices once every existing Pitmaster subscriber has been migrated (see grandfathering below). Archive them in Stripe (`active: false`) so they can no longer be selected for new checkouts, but leave them intact for historical/reporting purposes.
3. **Grandfathering existing subscribers — must not break anyone currently paying**:
   - **Existing Basic and Backyard subscribers**: since the new model has no equivalent paid tier below Pitmaster, these subscribers need an explicit decision from the owner: (a) grandfather them at their current price on a "legacy" plan indefinitely, (b) offer them a one-time in-app prompt to move to the new $7.99 Pitmaster price (likely a *price increase* for Basic subscribers, a slight *decrease* for Backyard subscribers — frame accordingly), or (c) migrate them to Pitmaster at their **current price** as a grandfathered rate using Stripe's "Update subscription with a different price, prorate: none" flow. Do not auto-migrate anyone without opt-in communication — this is a billing change affecting real charges.
   - **Existing Pitmaster subscribers at $11.99**: recommend grandfathering them at $11.99 indefinitely (i.e., leave their subscription's Stripe price untouched) rather than force-migrating them to the new $7.99 price. Forcing a price *decrease* on existing subscribers is low-risk but still a support/comms question the owner should decide (some businesses proactively lower existing subscribers' price too, as a goodwill gesture — worth asking).
   - Practically: because the `subscriptions` table stores `tier` (not `price_id`) as the source of truth for feature gating, and gating only ever checks `tier >= pitmaster`, grandfathered subscribers can keep paying their old Stripe price indefinitely with zero code changes — the app only needs to know they're `tier = "pitmaster"`, which they already are. **This means grandfathering is a Stripe-dashboard-only decision, not a code change**, which significantly de-risks this migration.
4. **Webhook update needed**: `apps/web/app/api/webhook/route.ts`'s `getTierFromPriceId()` (line 222) needs its price-map rewritten to only recognize the new Pitmaster price ID(s) plus every legacy price ID that grandfathered subscribers still hold (so their renewals keep resolving to `tier: "pitmaster"` instead of silently falling through to `"free"`). **This is the one piece of code that must be updated carefully and tested against a Stripe test-mode webhook replay before going live** — get this wrong and grandfathered subscribers silently lose access on their next renewal.
5. **Fix the `STRIPE_BACKYARD_PRICE_ID` gap noted in `AUDIT.md` §2** before any of the above — confirm whether it's actually set in production; if it's genuinely missing, current Backyard subscribers may already be mis-mapped to `free` on renewal, which would need investigating independently of this rebuild.

---

## 3. Components / Pages — Keep vs. Gut vs. Rebuild

### Keep as-is (design tokens, persona, brand)
- `apps/web/app/globals.css` — all CSS custom properties (`--font-heading`, `--font-body`, `--font-ui`, `--color-*`, `--space-*`, `--radius-*`). **Do not touch.**
- Preacher persona/voice: `apps/web/lib/preacher/voice.ts`, `apps/web/app/cook/preacher/voice.ts`, `apps/web/lib/verses.ts`, `apps/web/components/gospel/DailyVerse.tsx`, all "commandment"/sermon-style copy in `premium/page.tsx`.
- All cook-logic/BBQ-domain code: `lib/insights/*`, `lib/plan/*`, timeline engine (`app/cook/[id]/timeline/engine.ts`), wood pairings, fire/behavior logic. None of this is tier-related and none of it needs to change.
- Visual layout of the Playbook, Pitmaster reference pages, cook flow screens — keep the look, just remove the lock icons on modules that move to Free.

### Gut and rebuild (tier/billing logic only — not visual design)
- `apps/web/lib/premium.ts` — replace `TIER_RANK`/`tierMeetsRequirement()` with a single `isPitmaster(userId, supabase): Promise<boolean>` (rename/repurpose the existing `isPremium()`, which already implements almost exactly this — the function body barely changes, just the tier list it checks against shrinks to one).
- `apps/web/components/Paywall.tsx` — `requiredTier` prop becomes unnecessary (or collapses to a no-op boolean prop); simplify to a plain "Pitmaster feature" lock component, keeping its existing visual style (lock icon, card, "Upgrade to Unlock" button) untouched.
- `apps/web/app/premium/page.tsx` — reduce the `TIERS` array from 3 entries to 1 (Pitmaster), keep the "commandment" copy style and visual card design, keep the monthly/annual toggle if the annual assumption is confirmed.
- `apps/web/app/account/billing/page.tsx` — delete its independent price map entirely; either delete the page and redirect to `/premium`, or have it import the same shared pricing config `/premium` uses (see COMPARISON.md #3 recommendation) so there's only one source of truth.
- `apps/web/app/playbook/page.tsx` — change every module's `requiredTier` to either `"free"` or `"pitmaster"` (drop `"basic"`/`"backyard"` entirely); `PlaybookCard.tsx`'s visual lock treatment stays.
- `apps/web/app/dashboard/page.tsx` — split per COMPARISON.md #1 (separate marketing/logged-in concerns) *and* simplify the tier-upsell block from 3 branches (`free`/`basic`/`backyard`) to 1 (`free` → "Upgrade to Pitmaster").
- `apps/web/components/insights/PitmasterInsightsOverlay.tsx` — no change needed to its gating (`isPitmaster` prop stays the same shape), just verify the caller passes the new simplified boolean.

### Delete outright (see AUDIT.md §5 for full list)
`apps/web/lib/billing/isPremium.ts`, `apps/web/app/premium/cancel.tsx`, `apps/web/app/premium/success.tsx`, `apps/web/app/cook/[id]/404.tsx`, `apps/web/app/api/checkout/` (empty dir), `apps/web/apps/web/ios/...` (stray empty tree), root-level `type` file, and — pending owner confirmation they're truly unreferenced — `apps/web/app/setup/` and `apps/web/app/setup/pits/`.

---

## 4. Supabase Schema Changes (Proposal Only)

1. **`subscriptions.tier`**: no column-type change needed if it's already plain `text` (confirm against live schema first, per AUDIT.md §2's enum-mismatch flag). Application code simply stops writing/expecting `"basic"` and `"backyard"` values going forward. Existing rows with `tier = 'basic'` or `tier = 'backyard'` need a data migration (see below) — do not silently leave them, since `tierMeetsRequirement`-style checks will disappear and any check that isn't updated to the new binary model could either wrongly grant or wrongly deny Pitmaster access to these users.
2. **Data migration for existing subscription records** (write as a new tracked migration file, do not run manually against prod):
   - Rows with `tier = 'pitmaster'` and `status IN ('active','trialing')` → no change, they're already correct under the new model.
   - Rows with `tier IN ('basic','backyard')` and `status IN ('active','trialing')` → per the grandfathering decision in §2, these become `tier = 'pitmaster'` (since Pitmaster is now the only paid tier) while their Stripe subscription keeps its original (grandfathered) price. This is a data-only update, no schema change.
   - Rows with `tier IN ('basic','backyard')` and `status NOT IN ('active','trialing')` (cancelled/past_due free-riders) → set `tier = 'free'`, no billing impact since they're not currently paying.
3. **Enum cleanup**: if `subscription_tier` enum is confirmed to be live and enforced somewhere, add a migration to alter it to `('free', 'pitmaster')` — but only after the data migration above has run, and only after confirming nothing else in the DB (views, RPCs, check constraints) depends on the `basic`/`backyard` values. `create_cook_if_under_limit()` (the one RPC found that reads `tier`) only compares `v_tier = 'free'`, so it's unaffected either way.
4. **Feature flags**: `feature_flags`/`user_feature_flags` tables are unused today (AUDIT.md §2) — no changes needed for this rebuild, but they're sitting there if a future need for per-user flags (e.g. beta access, grandfather cohort marking) arises; consider using `user_feature_flags` to explicitly tag grandfathered legacy-price subscribers (e.g. `feature_key: 'legacy_pricing'`) so support/reporting can identify them later without cross-referencing Stripe.
5. **Legacy table cleanup**: `stripe_subscriptions`, `stripe_products`, `stripe_prices`, `stripe_events`, `billing_overview` view are dead (AUDIT.md §2) — safe to drop in a later, separate cleanup migration once confirmed truly unreferenced (do not bundle with the tier migration; keep unrelated cleanup separate for easy rollback).
6. **Migration hygiene**: whatever migration(s) come out of this work should be added to `supabase/migrations/` and should include an explicit `SELECT` verification query (row counts before/after) in a comment, since this repo currently has no CI check that migrations match the live schema.

---

## 5. Suggested Phased Implementation Order

| Phase | Scope | Effort |
|---|---|---|
| **0. Verify** | Confirm live Stripe price/product IDs, confirm `STRIPE_BACKYARD_PRICE_ID` env var status, confirm whether `subscription_tier` enum is actually enforced anywhere, pull a fresh schema dump from Supabase (don't trust the 2 tracked migrations alone), get owner sign-off on the annual-as-price-option assumption and the grandfathering approach. | **Small** — no code, mostly checking dashboards/env and one conversation with the owner. Blocking for everything else. |
| **1. Stripe setup** | Create new Pitmaster monthly/annual prices at $7.99, archive old Basic/Backyard prices (leave old Pitmaster $11.99 active for grandfathered subscribers), decide + document grandfathering policy. | **Small** — dashboard work, no deploy. |
| **2. Data migration** | Write and run the `subscriptions.tier` data migration (basic/backyard → pitmaster or free per status), tag grandfathered accounts if using `user_feature_flags`. | **Medium** — needs careful testing against a staging/duplicate of the real data before running on prod; irreversible without a backup. |
| **3. Webhook update** | Rewrite `getTierFromPriceId()` to map new Pitmaster price IDs + all legacy price IDs (old Pitmaster, and any grandfathered Basic/Backyard price IDs) → `"pitmaster"`. Test against Stripe CLI webhook replay in test mode. | **Medium** — small diff, but this is the highest-consequence file in the whole plan; a mistake silently downgrades paying users. |
| **4. App code simplification** | `lib/premium.ts` → single boolean; `Paywall.tsx`, `playbook/page.tsx`, `dashboard/page.tsx`, `premium/page.tsx`, `account/billing/page.tsx` updated per §3 above. | **Medium** — mechanical but touches ~8 files; no visual redesign required, just removing branches. |
| **5. Dead code cleanup** | Delete everything in AUDIT.md §5's dead-code list (stray directories, invalid route files, deprecated wrapper, empty dirs, root `type` file). | **Small** — pure deletion, low risk, do it in its own PR for easy review/rollback. |
| **6. Dashboard/onboarding split** | Split `dashboard/page.tsx`'s marketing/logged-in concerns per COMPARISON.md #1; optionally simplify signup wizard per COMPARISON.md #4 (defer equipment entry). | **Medium-Large** — this is UX/IA work, not just tier consolidation; can be scheduled independently of phases 0-5 since it's not required to ship the 2-tier pricing model. |
| **7. Verify & monitor** | Manually test: new signup → free experience, existing free user, existing grandfathered legacy subscriber (all price points), new Pitmaster checkout, cancel/downgrade flow, Stripe portal. Watch webhook logs for the first billing cycle after launch. | **Small-Medium** — mostly QA time, budget at least one full billing-cycle (~1 month) of monitoring before considering old price IDs fully retired. |

Phases 0-3 are the load-bearing, must-get-right work (billing correctness for existing payers). Phases 4-6 are the actual "simplification" the owner asked for and carry much lower risk since they're additive/subtractive UI changes, not billing-state changes.

---

## 6. App Store / IAP Considerations

**Key finding**: `apps/web/capacitor.config.ts` configures the iOS app to load the **live website remotely** (`server.url: 'https://thepitpreacher.com'`) inside a Capacitor WebView — this is not a bundled native build with local assets. No StoreKit configuration file, no in-app-purchase plugin (e.g. `cordova-plugin-purchase`, RevenueCat, `react-native-iap`), and no `.storekit` file were found anywhere in the iOS project or `package.json` dependencies. The app's own pricing copy (`apps/web/app/premium/page.tsx:511-518`) explicitly tells users "Apple charges a fee on in-app purchases, so we pass the savings to you here" — implying the team is already aware of, and pricing around, Apple's IAP economics.

**This is a compliance question the owner should resolve, not something this audit can answer definitively**: if the iOS app currently lets a logged-in user reach `/premium` or `/account/billing` *inside the app's WebView* and complete a Stripe Checkout there, that is the kind of in-app digital-subscription purchase flow Apple's App Store Review Guideline 3.1.1 generally requires to go through StoreKit/IAP instead (with narrow exceptions — "reader" apps, or using Apple's External Purchase Link Entitlement, which is region-limited and has its own approval process). If instead the app deliberately blocks/hides the purchase flow when running inside Capacitor and only allows purchase via the mobile browser or desktop web, that would be compliant — **but no code enforcing that distinction was found in this audit** (no Capacitor-platform check gating the checkout buttons). This needs a direct answer before the app is resubmitted to the App Store with any pricing change, tier count change, or if it hasn't already been through an App Store review with the current setup.

**Mismatch to flag regardless of the above**: with 3 paid web tiers today, there is no evidence of *any* matching Apple IAP product configuration (no `.storekit` file, no product identifiers found). If Apple IAP is required, it needs entirely new product setup (matching whatever the new $7.99 Pitmaster monthly/annual prices become) — there's nothing existing to migrate on the Apple side, this would be greenfield IAP work, not a consolidation of existing Apple products. Recommend resolving the compliance question in Phase 0 (§5) before spending engineering time on Phases 1-4, since the answer could change how checkout is gated across platforms.
