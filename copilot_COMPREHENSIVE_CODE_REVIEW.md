# Code Review & Feature Enhancement Assessment
## The Pit Preacher — May 25, 2026

---

## REMAINING CODE QUALITY ISSUES

### 1. 🟠 ERROR HANDLING: Still Inconsistent in API Routes

**Status**: Not fully resolved. Generic catch blocks remain.

**Files with issues**:
- app/api/billing/create-checkout-session/route.ts
- app/api/stripe/webhook/route.ts
- app/api/insights/route.ts

**Example**:
```typescript
} catch (err) {
  console.error("Webhook handler error:", err);
  return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
}
```

**Problem**: No error categorization or user-friendly messages. Stripe errors are indistinguishable from database errors from client perspective.

**Quick Fix** (Medium effort):
```typescript
// lib/api-errors.ts
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public userMessage: string,
    public code: string,
    public details?: unknown
  ) {
    super(userMessage);
  }
}

export function handleError(err: unknown) {
  if (err instanceof APIError) {
    console.error(`[${err.code}]`, err.details);
    return NextResponse.json(
      { error: err.userMessage, code: err.code },
      { status: err.statusCode }
    );
  }
  
  console.error("Unhandled error:", err);
  return NextResponse.json(
    { error: "An unexpected error occurred" },
    { status: 500 }
  );
}
```

**Impact**: Better user experience, easier debugging, improved monitoring.

---

### 2. 🟡 ENVIRONMENT VARIABLES: Still Scattered Without Validation

**Status**: Not fully centralized.

**Issues**:
- 50+ direct `process.env` references throughout codebase
- No build-time validation
- Missing variables only caught at runtime
- Inconsistent naming (e.g., `STRIPE_BASIC_PRICE_ID` vs `NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID`)

**Example problem in** app/premium/page.tsx:
```typescript
const PRICE_IDS: Record<string, string> = {
  basic: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID!,
  backyard: process.env.NEXT_PUBLIC_STRIPE_BACKYARD_PRICE_ID!,
  pitmaster: process.env.NEXT_PUBLIC_STRIPE_PITMASTER_PRICE_ID!,
};
```

**Quick Fix**: Create lib/config.ts (see previous review) and update Turbo to validate env vars at build time.

**Impact**: Prevents deployment failures, improves type safety.

---

### 3. 🟡 TYPE SAFETY: `as any` in Webhook Handler

**Status**: Still present.

**File**: app/api/stripe/webhook/route.ts, line 31
```typescript
const subscription = event.data.object as any; // relax typings
```

**Fix**: 
```typescript
type SubscriptionEvent = Stripe.Events.Data<Stripe.Subscription>;
const subscription = event.data.object as SubscriptionEvent;
```

**Impact**: Prevents runtime bugs, improves maintainability.

---

### 4. 🟡 STRIPE WEBHOOK IDEMPOTENCY: No Duplicate Prevention

**Status**: Not addressed.

**Problem**: If Stripe retries a webhook, duplicates could be created in database.

**Quick Fix**: Add event deduplication:
```typescript
// In webhook handler
const eventId = event.id;
const { data: existingEvent } = await supabase
  .from("webhook_events")
  .select("id")
  .eq("stripe_event_id", eventId)
  .single();

if (existingEvent) {
  return NextResponse.json({ received: true }); // Already processed
}
```

**Impact**: Prevents subscription duplication, improves data integrity.

---

### 5. 🟡 DATABASE SCHEMA TYPES: No Supabase Type Generation

**Status**: Only partial typing (account.ts has types, others don't).

**Recommendation**: Generate types from Supabase schema:
```bash
npm install --save-dev @supabase/cli
supabase gen types typescript --schema public > apps/web/types/database.ts
```

Use consistently:
```typescript
import type { Database } from "@/types/database";
const supabase = createClient<Database>();
// Now data is properly typed
```

**Impact**: Prevents runtime errors, better IDE autocomplete.

---

### 6. 🟡 MISSING CODE SPLITTING & LAZY LOADING

**Status**: Not implemented.

**Issue**: Page.tsx loads all components statically, bloating initial bundle.

**Fix**: Use dynamic imports for heavy sections:
```typescript
import dynamic from "next/dynamic";

const CookingStylesSection = dynamic(
  () => import("@/components/CookingStylesSection"),
  { loading: () => <div>Loading styles...</div> }
);
```

**Impact**: Faster page loads, better Core Web Vitals, improved UX.

---

### 7. 🔵 TESTING: No Visible Test Coverage

**Status**: Jest configured but no test files visible.

**What to add**:
1. Unit tests for critical functions (isPremium, canUseFeature)
2. Integration tests for API routes
3. E2E tests for billing flow

**Impact**: Prevents regressions, increases deployment confidence.

---

### 8. 🔵 LOGGING & MONITORING: Basic Console.error() Only

**Status**: Not improved.

**Recommendation**: Add structured logging:
```bash
npm install pino
```

```typescript
// lib/logger.ts
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
});

// Usage
logger.error({ err, userId, cookId }, "Insights generation failed");
logger.info({ eventId }, "Webhook processed successfully");
```

**Impact**: Better debugging, easier monitoring in production.

---

---

## FEATURE ENHANCEMENT OPPORTUNITIES

### HIGH IMPACT: These Features Will Drive Signups & Retention

---

## 1. 🚀 **LIVE COOKING MODE** (Backyard/Pitmaster Tiers) — HIGH PRIORITY

### Problem
Users plan a cook, then need to manually track time/temperature manually throughout. The app becomes unused *during the actual cook* — the highest-engagement moment.

### Solution
Build a **Live Cook Tracker** that runs on the cook detail page:

**Core Features** (Backyard tier):
- **Real-time timeline overlay**: Show planned timeline vs. actual elapsed time
- **Temperature tracking**: Simple input for pit temp every 15-30 min (optional QR code or voice input for iOS app)
- **Event markers**: User can tap to log "wrapped", "stall started", "off the pit", etc.
- **Voice notes**: Quick voice memo capability for observations
- **Alerts**: Notify if cook is falling behind timeline by >30 min
- **Photo capture**: Take photos of the cook (for later review)

**Enhanced** (Pitmaster tier):
- **Predictive alerts**: "Based on current pace, you'll finish 45 minutes early—consider lowering temp"
- **Auto-generated events**: Parse voice notes for events ("wrapped in foil" → auto-log WRAP event)
- **Fire control score in real-time**: See how your pit management is tracking
- **Sidebar next cook tips**: Show relevant Playbook articles based on what's happening now

### Why This Works
- Solves the actual use case (tracking live cooks)
- Creates habit loop (users return app constantly during cook)
- Natural upsell: "Get alerts if behind timeline" = Backyard tier paywall
- Pittmaster tier shows predictive insights that free users can't see

### Implementation
- New page: `/cook/[id]/live` 
- Real-time updates via Supabase subscriptions
- Mobile-first design (smaller inputs for iOS app)
- Estimated effort: **2-3 weeks**

---

## 2. 🎯 **COOK COMPETITIONS/LEADERBOARDS** (Backyard Tier) — MODERATE PRIORITY

### Problem
Currently no social engagement. Users cook alone. There's no achievement system or community aspect.

### Solution
Create optional **Cook Competitions** within the app:

**Features**:
- **Weekly/Monthly challenges**: "Best brisket bark", "Fastest cook", "Most consistent temperature control"
- **Scoring system**: Based on actual cook data (bark quality ratings, time variance, temperature stability)
- **Leaderboards**: Leaderboard per meat type, per region, per pit type
- **Private group competitions**: Invite friends to compete (features up to 10 people)
- **Achievement badges**: Unlockable badges for milestones

### Why This Works
- Creates social motivation (compete with friends)
- Increases app engagement (users come back to check scores)
- Free tier: Can see leaderboards but can't submit cooks
- Backyard/Pitmaster: Can compete and view detailed competition analytics
- Natural virality: Invite friends → they need account

### Implementation
- New DB tables: `competitions`, `competition_entries`, `achievement_badges`
- New pages: `/leaderboards`, `/competitions/[id]`, `/account/achievements`
- Estimated effort: **2-3 weeks**

---

## 3. 📱 **OFFLINE MODE / MOBILE APP FIRST** (All Tiers) — HIGH PRIORITY

### Problem
Users are cooking outdoors without reliable WiFi. Current web app requires connection.

### Solution
Add **Offline-first cook tracking** using Service Workers:

**Features**:
- Pre-load cook plan, timeline, playbook articles
- Log temperature, events, photos locally
- Sync to server when connection restored
- Native iOS/Android app (build from current Capacitor setup)

### Why This Works
- Solves critical use case (cooking outdoors)
- Creates app-like behavior (no refresh needed)
- Makes iOS/Android app feel essential, not optional
- Free tier users can't use offline features (premium only)

### Implementation
- Add Workbox/Service Worker for caching
- Implement queue system for offline uploads
- Complete iOS app build (currently just configured)
- Estimated effort: **3-4 weeks**

---

## 4. 🧠 **AI-POWERED "ASK THE PREACHER" IMPROVEMENTS** (Basic Tier, Enhanced Premium) — MEDIUM PRIORITY

### Current State
"Ask the Preacher" exists but is gated behind Basic tier with unlimited questions.

### Enhancement Ideas
**For Basic tier** (limited):
- 20 questions/day (already limited)
- Generic questions: "What's the best wood for brisket?"
- No context about user's specific cook

**For Backyard tier** (context-aware):
- Unlimited questions
- Questions can reference user's active cook: "Is my bark developing fast enough based on my timeline?"
- Can ask about past cooks: "Why did my last brisket come out dry?"
- Historical analysis: "I always have temp spikes. What am I doing wrong?"

**For Pitmaster tier** (advanced):
- Custom recipe generation based on user's pit profile
- "Create a cook plan for competition brisket on my offset smoker"
- Predictive cooking: "Based on your skill level (Pitmaster), optimize your timeline for this 16 lb brisket"
- Competitive analysis: "How does your last cook compare to competition standards?"

### Why This Works
- Free users: "I can ask 1 question for free" → gets addicted → pays for Basic
- Basic users: Want context-aware answers → upgrade to Backyard
- Backyard users: Want AI-generated recipes and optimization → upgrade to Pitmaster

### Implementation
- Update Preacher system prompt to include cook context
- Add cook context to API requests
- Store conversation history (linked to cook)
- Estimated effort: **1-2 weeks**

---

## 5. 📊 **COOK ANALYTICS & PERFORMANCE DASHBOARD** (Pitmaster Tier) — MEDIUM PRIORITY

### Problem
Pitmaster users can see individual cook insights, but no aggregate dashboard showing patterns over 10+ cooks.

### Solution
Add **Advanced Cook Analytics** page for Pitmaster tier:

**Sections**:
- **Performance vs. Time**: Scatter plot of cook duration vs. final quality rating
- **Temperature stability**: Average temp variance across all cooks (trend over time)
- **Meat type mastery**: Compare bark/moisture quality across beef/pork/chicken
- **Pit type performance**: Which of your pits produces best results?
- **Wood pairing analysis**: Which wood-meat combos work best for you?
- **Seasonal trends**: Do cooks differ in summer vs. winter?
- **Personal records**: Best bark, best moisture, fastest cook, etc.

### Why This Works
- Pitmaster-only feature creates tier differentiation
- Shows data-driven insights they can't get elsewhere
- Encourages continued use (track improvement over months)
- Potential future monetization: "Export cook data for competition submission"

### Implementation
- New page: `/dashboard/analytics`
- Use Chart.js (already in dependencies) for visualizations
- Aggregate queries on cook_outcomes table
- Estimated effort: **2 weeks**

---

## 6. 🎓 **PERSONALIZED LEARNING PATH** (Backyard/Pitmaster) — MEDIUM PRIORITY

### Current State
Playbook has 7 modules, all equally presented. Users don't know what to learn based on their goals.

### Solution
Create **Skill Trees** based on user's cooking profile:

**Types**:
- **Beginner path**: "Master the basics" (Temperature control → Time management → Wrapping strategy)
- **Competition path**: "Prepare for competition" (Bark science → Color control → Presentation → Judging criteria)
- **Specialty master**: "Become a brisket expert" (Meat science → Fire behavior → Troubleshooting → Timeline philosophy)
- **Pit-specific**: "Master your offset" (Fire behavior → Pit types → Finishing moves → Troubleshooting)

**Features**:
- Recommended articles based on cooking history
- Progress tracking (% of path completed)
- Unlock badges for completing paths
- Quiz/test before unlocking advanced modules

### Why This Works
- Backyard tier: Can see recommended path (drives engagement)
- Pitmaster tier: Can unlock "advanced" paths and quizzes
- Creates learning motivation (users want to complete paths)
- Natural progression: Free users see paths → want Backyard to unlock recommendations

### Implementation
- New DB table: `learning_paths`, `path_progress`
- New pages: `/playbook/paths`, `/playbook/paths/[pathId]`
- Update Playbook to show learning progress
- Estimated effort: **1.5 weeks**

---

## 7. 🏆 **RECIPE/TEMPLATE LIBRARY** (Backyard/Pitmaster) — MEDIUM PRIORITY

### Problem
Free users see "Ask the Preacher" but can't see example cook plans. Beginner friction point.

### Solution
Create **Public Recipe Library** with user-generated + official content:

**Features**:
- Official recipes: "Classic Texas Brisket (13-16 hrs)", "Competition Chicken", etc.
- User templates: Top-rated user plans marked as public (with author credit)
- Filtering: By meat type, pit type, cook duration, difficulty level
- One-click import: Use a template to create a new cook, customize it
- Fork & remix: Base cook on someone else's but modify temps/times

**Monetization**:
- Free users: View 3 recipes/month (paywall)
- Backyard: Unlimited recipes + can publish own
- Pitmaster: All of above + see detailed analytics on their published recipes

### Why This Works
- Solves new user problem: "What's a good cook plan?"
- Creates community (users see other cooks' plans)
- Viral: "I found an amazing recipe on Pit Preacher"
- Natural upsell: "Create unlimited recipes" → Backyard tier

### Implementation
- New DB table: `recipe_templates`, `recipe_ratings`
- New pages: `/recipes`, `/recipes/[id]`, `/recipes/create`
- Import flow in cook creation
- Estimated effort: **2 weeks**

---

## 8. 🔔 **SMART NOTIFICATIONS** (All Tiers) — QUICK WIN

### Problem
Users get no reminders or notifications. App is passive.

### Solution
Add **Contextual notifications** (use Supabase real-time + browser notifications):

**Examples**:
- "Your cook timeline suggests wrapping in 30 minutes"
- "Your pit is 15°F hotter than your plan — adjust vents"
- "Unusual stall detected (>3 hours) — check your wrap"
- "Great bark development detected based on your notes"
- "Cook finished! Time to review and log outcome"
- Daily: "You have a cook planned for tomorrow at 6 AM — prep checklist ready?"

**Monetization**:
- Free: Generic notifications only
- Backyard+: Pit-specific, predictive alerts
- Pitmaster: All of above + custom notification rules

### Implementation
- Use Supabase real-time for cook event subscriptions
- Browser notifications API (easy to implement)
- Optional push notifications for iOS app
- Estimated effort: **5-7 days**

---

## 9. 📸 **COOK PHOTO JOURNAL** (Backyard Tier) — QUICK WIN

### Problem
Users want to document cooks visually (bark color, meat appearance, final sliced product) but have no system for it.

### Solution
Add **Photo timeline** to cook details:

**Features**:
- Upload photos at any point (before, during, after)
- Auto-tag photos by time (e.g., "6:00 AM - Pre-cook", "12:30 PM - Wrapped")
- Timeline view: Photos + events + notes in chronological order
- Export as PDF cook report: Photos + timeline + ratings + notes
- Gallery: All cook photos in user dashboard for browsing

**Monetization**:
- Free: No photos
- Backyard: 10 photos/cook
- Pitmaster: Unlimited photos + PDF export

### Implementation
- Use Supabase storage for images
- New component: PhotoUploadWidget, PhotoTimeline
- New page: `/cook/[id]/photos`
- Estimated effort: **1 week**

---

## 10. 🌐 **COMMUNITY FEATURES** (Pitmaster Tier) — LONGER TERM

### Ideas (in priority order):

1. **Cook feed**: Follow other Pitmaster users, see their recent cooks, comment/react
2. **Private teams**: Create teams for cook clubs, family competitions
3. **Live cook watching**: Spectate someone's live cook in real-time
4. **Expert directory**: Verified competition cooks available for consulting/mentorship
5. **Forum/Q&A**: Community-driven questions (moderated by admins)

### Why This Works
- Pitmaster-exclusive creates subscription stickiness
- Reduces churn (friends are using it too)
- Potential future monetization: "Expert consultation" marketplace

### Implementation: Future (3+ months out)

---

---

## PRICING TIER SUMMARY: How Enhancements Drive Monetization

```
FREE TIER
├─ 3 cooks/month
├─ Basic Playbook (meat science only)
├─ Ask Preacher: 3 questions/month
├─ View leaderboards (not eligible to join)
├─ View public recipes (3/month)
└─ Static cook planning

BASIC TIER ($3.99/mo)
├─ Unlimited cooks
├─ Full Playbook (all modules)
├─ Ask Preacher: Unlimited questions
├─ Leaderboard participation
├─ Can publish recipes
├─ Smart notifications (basic)
└─ Live cook mode (basic tracking)

BACKYARD TIER ($7.99/mo)
├─ Everything in Basic
├─ Live cook mode + alerts
├─ Pit Rescue (emergency troubleshooting)
├─ Context-aware Ask Preacher (references your cooks)
├─ Photo timeline (10 photos/cook)
├─ Private team competitions
├─ Smart notifications (pit-specific)
├─ Learn Path recommendations
└─ Offline mode (cook tracking)

PITMASTER TIER ($11.99/mo)
├─ Everything in Backyard
├─ Advanced Cook Analytics Dashboard
├─ Predictive insights (real-time during cook)
├─ Unlimited photo storage + PDF export
├─ AI-generated recipe optimization
├─ Competition analysis tools
├─ Community features (follow cooks, feed)
├─ Ask Preacher (with recipe generation)
└─ Full offline + sync
```

---

## QUICK WINS (Can ship this week)

1. **Improve error handling** in API routes (1-2 days)
2. **Add smart notifications** (3-4 days)
3. **Simple photo upload to cooks** (3-4 days)
4. **Fix Stripe webhook idempotency** (1 day)
5. **Centralize env config** (2-3 days)

**Expected impact**: Reduces friction, improves user experience, prevents bugs.

---

## MEDIUM-TERM ROADMAP (Next 4-6 weeks)

1. **Live Cooking Mode** (highest impact for engagement)
2. **Offline mode** (critical for outdoor use)
3. **Cook Analytics Dashboard** (Pitmaster tier differentiation)
4. **Leaderboards/Competitions** (social engagement)
5. **Recipe Library** (solves beginner problem)

**Expected impact**: Higher retention, higher ARPU (average revenue per user), word-of-mouth growth.

---

## ARCHITECTURE IMPROVEMENTS STILL NEEDED

These don't add user value but reduce technical debt:

1. ✅ Centralize environment variables (started)
2. ⚠️ Improve error handling across all APIs (in progress)
3. ⚠️ Add Supabase type generation (not done)
4. ⚠️ Implement webhook idempotency (not done)
5. ⚠️ Add code splitting for bundle optimization (not done)
6. ⚠️ Set up structured logging (not done)
7. ⚠️ Add test coverage (not done)

**Recommendation**: Pick #2, #4, #6 this sprint (3-5 days total effort).

---

## SUMMARY

**Current State**: App has solid foundation with good feature set. Missing engagement loops and offline capability.

**Biggest Gaps**:
- Users can't track cooks in real-time (app is only useful for planning)
- No social/community elements
- No offline capability (critical for outdoor cooking)
- Limited analytics for advanced users

**Highest ROI Improvements**:
1. **Live Cook Mode** — Gets users to use app during actual cook
2. **Offline Capability** — Removes WiFi friction point
3. **Better Analytics** — Makes Pitmaster tier sticky
4. **Community Features** — Reduces churn, enables growth

**Recommendation**: Build live cook mode first (2-3 weeks), then offline mode (2 weeks), then leaderboards (1 week). These three features alone would likely 2-3x engagement and conversion rates.
