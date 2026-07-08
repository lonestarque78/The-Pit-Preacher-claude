# Pit Preacher vs. Bless Your Loaf — Structural Comparison

Bless Your Loaf (BYL) read directly from `C:\Users\Brian\blessyourloaf` (read-only, not modified). It is offered here as a reference pattern for "simple," not something to copy verbatim — different brand, different persona, but same owner and same underlying stack (Next.js + Supabase + Stripe).

---

## 1. Page / Dashboard Structure

| | Pit Preacher | Bless Your Loaf |
|---|---|---|
| Total top-level route groups | ~14 (`/`, `/dashboard`, `/account`, `/cook`, `/setup`, `/logs`, `/lab`, `/fix`, `/playbook`, `/pitmaster`, `/premium`, `/preacher`, `/auth`, marketing pages) | ~9 (`(marketing)`, `(auth)`, `/dashboard`, `/pricing`, `/recipes`, `/discard`, `/flour-guide`, `/starter-guide`, legal pages) |
| Deepest nesting | 4 levels (`/cook/[id]/plan` → insights overlay → overlay sections) | 3 levels (`/dashboard/starters/[id]/edit`, `/dashboard/my-recipes/[id]`) |
| Dashboard sub-sections | Cook list + tier-conditional upsell blocks, all in one 340-line `page.tsx` mixing marketing hero (logged-out) and app UI (logged-in) in a single file | `dashboard/layout.tsx` is a thin shell (nav + signout + footer); each feature (`starters`, `my-recipes`, `scheduler`, `troubleshooter`, `history`, `account`) is its **own route with its own page**, not conditionally rendered inside one file |
| Component organization | `components/{account,gospel,insights,plan,playbook,strategy,ui}` — 7 folders, several single-purpose one-off components (`PitmasterInsightsOverlay.tsx` is 511 lines including inline pit/meat reasoning data that arguably belongs in `lib/`) | `components/{account,dashboard,layout,pricing,sections,starters}` — 6 folders, page-specific logic mostly lives in the route's own folder (e.g. `ForgotPasswordForm.tsx` sits next to its `page.tsx`) |

**Takeaway**: BYL separates "one route = one concern" much more strictly. Pit Preacher's `dashboard/page.tsx` doing double duty as both the logged-out marketing landing page and the logged-in app home is the single biggest structural complexity smell — it's also why tier-upsell logic, hero copy, and cook-list rendering are all tangled in one 340-line file.

---

## 2. Auth Flow

| | Pit Preacher | Bless Your Loaf |
|---|---|---|
| Routes | Single `/auth/login` page handling **both** login and a 3-step signup wizard via local component state (`mode`, `step`) | Separate routes: `(auth)/login`, `(auth)/signup`, `(auth)/forgot-password`, each with its own dedicated form component (`LoginForm.tsx`, `SignupForm.tsx`, `ForgotPasswordForm.tsx`) |
| Signup steps | 3 steps embedded in one component: account info → add smoker(s) → cooking style. Directly performs 4 separate Supabase table inserts client-side (`profiles`, `subscriptions`, `pits`, `user_preferences`) with no transaction | Single-step signup form (name/email/password); no equivalent "add your equipment" step is forced during signup — that happens later, in-app, when the user actually creates a starter |
| OAuth | Google + Apple, redirect to `/auth/callback` | Not found in the files reviewed (email/password only) |
| Post-auth routing | Hard `window.location.href = "/dashboard"` reload after both login and signup | `redirect()` (Next.js server-side redirect) used in `dashboard/layout.tsx` |

**Takeaway**: Pit Preacher's signup asks for more upfront (equipment + cooking style) before the user has done anything in the app — BYL defers all of that to first real use. Pit Preacher's single-file, step-state wizard is also harder to reason about and test than BYL's route-per-step-per-concern split, though this is a smaller structural issue than the dashboard file.

---

## 3. Pricing / Upgrade Page Structure

| | Pit Preacher | Bless Your Loaf |
|---|---|---|
| Tiers shown | 3 paid tiers + free (Basic $3.99, Backyard $7.99, Pitmaster $11.99), monthly/annual toggle, 3×2 = 6 price points to reason about, plus a "Pitmaster 7-day trial" badge shown conditionally | **1 paid tier + free.** Free / Monthly $5.99 / Annual $55.99 — annual is presented as a third *card* next to Free and Monthly, not a toggle, but it is still fundamentally one product with two billing intervals |
| Where pricing logic lives | Two independent implementations: `app/premium/page.tsx` and `app/account/billing/page.tsx`, each with their own price-ID maps (see `AUDIT.md` §2) | One: `app/pricing/page.tsx` fetches `isSubscriber` server-side and passes props into a single `PricingCards.tsx` client component. No duplicate price map anywhere else found. |
| Trial mechanics | Trial only for Pitmaster tier, gated behind a "has this user ever had a Pitmaster sub before" check, applied conditionally in `subscription_data.trial_period_days` | Trial period (`trial_period_days: 7`) applied unconditionally to every checkout in `api/stripe/checkout/route.ts` — no prior-subscriber check (simpler, though technically more exposed to trial-abuse; worth noting either way) |
| Gating pattern in the rest of the app | Numeric tier-rank system (`TIER_RANK`, `tierMeetsRequirement`) checked in ~14 different files/routes | Single boolean computed inline per page: `isSubscriber = status === 'active' \|\| status === 'trialing'` (e.g. `app/discard/page.tsx:22`, `app/recipes/page.tsx:30`, `app/recipes/[slug]/page.tsx:30`) — no shared helper function, but also no tier-rank machinery to maintain |

**Takeaway**: BYL's actual production pricing model is *already* the "Free + one paid tier, annual as a price option" shape the owner wants for Pit Preacher. It validates the plan is realistic and low-risk — a sibling app on the same stack runs it today. BYL's boolean-per-page pattern is arguably *too* repetitive (worth centralizing into one `isSubscriber()` helper) but it's still far simpler than a 4-way tier rank.

---

## 4. Styling Tokens (Fonts, Colors, Spacing)

| | Pit Preacher | Bless Your Loaf |
|---|---|---|
| Font tokens | CSS custom properties in `apps/web/app/globals.css`: `--font-heading: "Playfair Display"`, `--font-body: "Libre Baskerville"`, `--font-ui: "Oswald"` | Tailwind v4 `@theme` block in `src/app/globals.css`: `--font-playfair`, `--font-lora`, exposed as utility classes `.font-playfair` / `.font-lora` |
| Color tokens | CSS custom properties: `--color-bg: #0e0c0a`, `--color-bg-alt`, `--color-accent: #C9973A` (the signature amber/ember tone), `--color-text`, semantic success/warning/danger | No CSS custom properties for color — colors are hard-coded hex values inline and in Tailwind class names throughout components (`#3d2b1f`, `#c9956c`, `#fdf6f0`, etc.) |
| Spacing tokens | Explicit scale: `--space-1` (4px) through `--space-7` (64px), used consistently via `var(--space-N)` | No spacing scale — Tailwind's default spacing utilities used directly (`p-9`, `gap-6`, etc.) |
| Framework | Tailwind v4 imported but a large fraction of components use **inline `style={{}}` objects** referencing the CSS variables rather than Tailwind classes (visible throughout `premium/page.tsx`, `dashboard/page.tsx`, `Paywall.tsx`) | Tailwind v4 used more idiomatically — utility classes are the primary styling mechanism; almost no inline `style` props in the files reviewed |
| Shared design-system package between the two repos | **None.** `packages/ui` in the Pit Preacher monorepo is still the unmodified `create-turbo` starter stub (`button.tsx`, `card.tsx`, `code.tsx` — generic, unbranded, not imported by anything Pit-Preacher-specific found in this audit beyond its own scaffold). Bless Your Loaf is a separate, non-monorepo repo with no package reference to Pit Preacher at all. | Confirmed independently — no cross-repo design tokens exist today. Any "shared design system" would have to be built from scratch (e.g., extracting Pit Preacher's actual tokens into a real package), not just wired up. |

**Takeaway**: Pit Preacher's design tokens (fonts, colors, spacing) are genuinely more mature than BYL's (BYL doesn't even use CSS variables for color) — this is the one area where Pit Preacher is *already* doing the right thing structurally, it's just applied inconsistently (mixed inline-style vs. Tailwind usage). Per the constraints of this engagement, these tokens should be **preserved as-is**; the simplification work belongs in tier logic and page structure, not the design system.

---

## 5. Concrete, Portable Simplifications from Bless Your Loaf

1. **One route = one file = one concern.** BYL never conditionally renders two entirely different experiences (marketing hero vs. logged-in dashboard) from the same `page.tsx`. Split Pit Preacher's `apps/web/app/dashboard/page.tsx` into a real marketing landing page (or keep it at `/`) and a separate, logged-in-only dashboard page. Directly portable, no design risk.

2. **One boolean, not a tier-rank system.** BYL's `isSubscriber = status === 'active' || status === 'trialing'`, computed the same simple way everywhere, replaces Pit Preacher's `TIER_RANK` + `tierMeetsRequirement()` machinery spread across ~14 files. Once Pit Preacher collapses to Free + Pitmaster, the numeric rank system becomes unnecessary — a single `isPitmaster()` boolean (mirroring `lib/premium.ts`'s existing `isPremium()`, just renamed/simplified) is all that's needed. Directly portable.

3. **One pricing-data source, one pricing component.** BYL's `pricing/page.tsx` fetches subscriber state server-side and passes it as props into a single `PricingCards.tsx`. Pit Preacher should collapse its two independent price maps (`premium/page.tsx` and `account/billing/page.tsx`) into one shared `lib/pricing.ts` (or similar) consumed by both pages. Directly portable, no design risk — this is pure de-duplication, doesn't touch visual design.

4. **Signup asks for the minimum, defers equipment setup to first real use.** BYL's signup form only collects name/email/password; starter/equipment details are entered later, in-app, when the user actually needs them. Pit Preacher's 3-step signup (account → add smoker → cooking style) adds friction before the user has seen any value. Consider moving pit/smoker entry to first-cook-creation instead of signup, matching BYL's lower-friction pattern. This does touch onboarding UX, but not brand/visual identity — flagged as a recommendation, not a requirement.

5. **Unconditional trial, no prior-subscriber lookup.** BYL applies `trial_period_days: 7` to every checkout without checking subscription history first. Pit Preacher's Pitmaster-only, prior-subscriber-gated trial logic (`create-checkout-session/route.ts:98-117`) is more defensive against abuse but adds real code complexity for a single-tier product. Once Pit Preacher is down to one paid tier, evaluate whether the extra trial-eligibility check is worth keeping vs. simplifying to BYL's unconditional model — this is a business trade-off (abuse risk vs. code simplicity), not a design one, and should be the owner's call.
