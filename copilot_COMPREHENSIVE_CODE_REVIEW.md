# Comprehensive Expert Code Review: The Pit Preacher

Based on systematic analysis of the production codebase, this document identifies critical issues, architectural opportunities, and specific improvements organized by impact.

---

## 🔴 CRITICAL ISSUES (Fix Immediately)

### 1. SECURITY: Secrets Management and Environment Variables

**Issue**: Service role keys (`SUPABASE_SERVICE_ROLE_KEY`) are being instantiated in multiple client-accessible code locations, violating the fundamental principle of key segregation.

**Files**:
- lib/usage/track.ts — Creates Supabase client with service role key in non-API code
- lib/billing/isPremium.ts — Service role key exposed in library function
- app/api/billing/create-checkout-session/route.ts — Using service role in API route is correct, but pattern is inconsistent elsewhere

**Problem**: If lib/usage/track.ts is called from the browser (via Server Components or direct imports), the service role key could leak. This bypasses Supabase's row-level security and grants full database access.

**Recommendation**:
1. Create a single server-side utility: `/lib/supabase-admin.ts` for all service-role operations
2. Move `isPremium()` to API route or make it accept a user-authenticated client
3. Move `incrementUsage()` and `checkUsage()` to `/app/api/usage/` endpoints
4. Never import service-role clients in component code or shared utilities

**Impact**: 🔴 **CRITICAL** — Potential full database access compromise

---

### 2. SECURITY: Cleartext Protocol in Capacitor Config

**File**: capacitor.config.ts

```typescript
server: {
  url: 'https://thepitpreacher.com',
  cleartext: true  // ❌ CRITICAL SECURITY ISSUE
}
```

**Problem**: `cleartext: true` allows HTTP traffic to mixed HTTP/HTTPS URLs on iOS. On production, this should **never** be enabled.

**Recommendation**:
```typescript
// Production
server: {
  url: 'https://thepitpreacher.com',
  cleartext: false  // or omit (defaults to false)
}
```

Use environment-based config:
```typescript
const isProduction = process.env.NODE_ENV === 'production';
const config: CapacitorConfig = {
  // ...
  server: {
    url: process.env.NEXT_PUBLIC_APP_URL,
    cleartext: !isProduction,  // Allow only in dev
  },
};
```

**Impact**: 🔴 **CRITICAL** — Man-in-the-middle vulnerabilities on iOS app

---

### 3. SECURITY: Stripe Webhook Signature Validation Gap

**File**: app/api/stripe/webhook/route.ts

```typescript
try {
  event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
} catch (err: any) {
  console.error("Webhook signature error:", err.message);
  return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
}
```

**Problem**: The `sig` parameter is accessed with non-null assertion (`sig!`) but could be undefined. If someone calls the webhook without the header, it passes an undefined signature, potentially accepting invalid events.

**Recommendation**:
```typescript
const sig = req.headers.get("stripe-signature");

if (!sig) {
  console.error("Missing stripe-signature header");
  return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
}

try {
  event = stripe.webhooks.constructEvent(
    body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
}
```

**Impact**: 🔴 **CRITICAL** — Could accept forged Stripe events

---

## 🟠 HIGH PRIORITY ISSUES

### 4. Error Handling: Inconsistent and Incomplete Across All APIs

**Pattern Found**: Generic catch blocks with minimal logging.

**Examples**:
- app/api/billing/create-checkout-session/route.ts:
  ```typescript
  } catch (err) {
    console.error("Checkout session error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
  ```

- app/api/stripe/webhook/route.ts:
  ```typescript
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }
  ```

**Problems**:
1. No error categorization (client error vs. server error vs. external service error)
2. User-facing errors expose internal details (bad UX + security risk)
3. No structured logging for debugging
4. Missing Stripe-specific error handling (e.g., authentication failures, rate limits)
5. No retry logic for transient failures

**Recommendation**: Create a unified error handling library:

```typescript
// lib/api-errors.ts
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public userMessage: string,
    public details?: unknown
  ) {
    super(userMessage);
  }
}

export function handleError(err: unknown) {
  if (err instanceof APIError) {
    return NextResponse.json(
      { error: err.userMessage },
      { status: err.statusCode }
    );
  }
  
  if (err instanceof Stripe.errors.StripeError) {
    // Handle Stripe-specific errors
    const status = err.statusCode || 500;
    return NextResponse.json(
      { error: "Payment processing failed" },
      { status }
    );
  }
  
  // Unknown error
  console.error("Unhandled error:", err);
  return NextResponse.json(
    { error: "An unexpected error occurred" },
    { status: 500 }
  );
}
```

Apply to all API routes:
```typescript
export async function POST(req: NextRequest) {
  try {
    // ... logic
  } catch (err) {
    return handleError(err);
  }
}
```

**Impact**: 🟠 **HIGH** — Data leakage, poor debugging, worse user experience

---

### 5. Environment Variables: Scattered Throughout Codebase Without Central Validation

**Pattern Found**: 50+ references to `process.env` with no validation.

**Example locations with direct access**:
- app/account/billing/page.tsx — Client component accessing Stripe price IDs
- app/premium/page.tsx — Same pattern
- lib/plan/autoAdjustPlan.ts — Direct `process.env.NEXT_PUBLIC_SITE_URL`

**Problems**:
1. **No type safety** — Typos in env var names aren't caught at compile time
2. **No validation** — Missing required vars only fail at runtime
3. **No documentation** — Hard to know all required variables
4. **Scattered usage** — Makes refactoring painful
5. **Build-time exposure** — Unset vars in Turbo config silently fail

**Recommendation**: Create centralized configuration:

```typescript
// lib/config.ts
import { z } from "zod";

const envSchema = z.object({
  // Public variables (safe for browser)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID: z.string(),
  NEXT_PUBLIC_STRIPE_BACKYARD_PRICE_ID: z.string(),
  NEXT_PUBLIC_STRIPE_PITMASTER_PRICE_ID: z.string(),
  NEXT_PUBLIC_STRIPE_BASIC_ANNUAL_PRICE_ID: z.string(),
  NEXT_PUBLIC_STRIPE_BACKYARD_ANNUAL_PRICE_ID: z.string(),
  NEXT_PUBLIC_STRIPE_PITMASTER_ANNUAL_PRICE_ID: z.string(),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  
  // Server-only variables
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  ANTHROPIC_API_KEY: z.string().optional(),
});

type Config = z.infer<typeof envSchema>;

let config: Config | null = null;

export function getConfig(): Config {
  if (!config) {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      console.error("Invalid environment variables:", parsed.error.flatten());
      throw new Error("Invalid environment configuration");
    }
    config = parsed.data;
  }
  return config;
}

// Prevent server-only access
export function getPublicConfig() {
  const cfg = getConfig();
  return {
    supabaseUrl: cfg.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: cfg.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    siteUrl: cfg.NEXT_PUBLIC_SITE_URL,
    appUrl: cfg.NEXT_PUBLIC_APP_URL,
    // Stripe prices
    stripePrices: {
      basicMonthly: cfg.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID,
      basicAnnual: cfg.NEXT_PUBLIC_STRIPE_BASIC_ANNUAL_PRICE_ID,
      backyardMonthly: cfg.NEXT_PUBLIC_STRIPE_BACKYARD_PRICE_ID,
      backyardAnnual: cfg.NEXT_PUBLIC_STRIPE_BACKYARD_ANNUAL_PRICE_ID,
      pitmasterMonthly: cfg.NEXT_PUBLIC_STRIPE_PITMASTER_PRICE_ID,
      pitmasterAnnual: cfg.NEXT_PUBLIC_STRIPE_PITMASTER_ANNUAL_PRICE_ID,
    }
  };
}

export function getServerConfig() {
  const cfg = getConfig();
  return {
    ...getPublicConfig(),
    supabaseServiceRoleKey: cfg.SUPABASE_SERVICE_ROLE_KEY,
    stripeSecretKey: cfg.STRIPE_SECRET_KEY,
    stripeWebhookSecret: cfg.STRIPE_WEBHOOK_SECRET,
    anthropicApiKey: cfg.ANTHROPIC_API_KEY,
  };
}
```

Then use consistently:
```typescript
// In client components
import { getPublicConfig } from "@/lib/config";
const config = getPublicConfig();

// In server code
import { getServerConfig } from "@/lib/config";
const config = getServerConfig();
```

**Update Turbo config to validate**:
```json
{
  "tasks": {
    "build": {
      "env": [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        // ... all required vars
      ]
    }
  }
}
```

**Impact**: 🟠 **HIGH** — Runtime crashes, deployment failures, security risks

---

## 🟡 MEDIUM PRIORITY ISSUES

### 6. Architecture: No Separation Between Usage Tracking and API Boundaries

**Current Pattern**: lib/usage/track.ts contains business logic that should be in API routes.

**Issues**:
- Mixing service-layer with API authentication
- Usage tracking called directly from components with service role credentials
- Difficult to audit/monitor API calls

**Recommendation**: Move usage tracking to middleware/API:

```typescript
// app/api/usage/track/route.ts
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { feature } = await req.json();
  await incrementUsage(user.id, feature);
  
  return NextResponse.json({ success: true });
}
```

Then call from client:
```typescript
// Before
import { incrementUsage } from "@/lib/usage/track";
await incrementUsage(userId, "insights");

// After
const response = await fetch("/api/usage/track", {
  method: "POST",
  body: JSON.stringify({ feature: "insights" })
});
```

**Impact**: 🟡 **MEDIUM** — Better security posture, easier auditing

---

### 7. Type Safety: Relax Typings in Critical Code

**File**: app/api/stripe/webhook/route.ts

```typescript
const subscription = event.data.object as any; // relax typings
```

**Problem**: Using `as any` defeats TypeScript's type system. The webhook handler processes subscription data without type checking.

**Recommendation**: Use proper Stripe types:

```typescript
import Stripe from "stripe";

type SubscriptionEvent = Stripe.Events.Data<Stripe.Subscription>;

case "customer.subscription.created":
case "customer.subscription.updated":
case "customer.subscription.deleted": {
  const subscription = event.data.object as SubscriptionEvent;
  // Now TypeScript knows the shape
  const currentPeriodStart = subscription.current_period_start;
  // ...
}
```

**Impact**: 🟡 **MEDIUM** — Prevents runtime bugs, improves maintainability

---

### 8. API Design: Inconsistent Authentication Patterns

**Current Pattern**: Mix of header-based and cookie-based auth.

**Examples**:
- app/api/billing/create-checkout-session/route.ts — Uses Bearer token from header
- app/api/stripe/webhook/route.ts — Uses Supabase session from cookies
- app/api/account/delete/route.ts — Uses session from cookies

**Recommendation**: Standardize on Supabase session (cookie-based via middleware):

```typescript
// All API routes should follow this pattern
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // user is authenticated, proceed
}
```

**Impact**: 🟡 **MEDIUM** — Simpler, more consistent, better security

---

### 9. Performance: Missing Code Splitting and Dynamic Imports

**Current State**: No visible usage of Next.js dynamic imports or code splitting for large components.

**Issue**: Page components like app/page.tsx import everything statically, bloating the initial bundle.

**Recommendation**: Add dynamic imports for heavy components:

```typescript
// app/page.tsx
import dynamic from "next/dynamic";

const CookingStyleSection = dynamic(
  () => import("@/components/CookingStyleSection"),
  { loading: () => <div>Loading...</div> }
);

const MeatSelectionSection = dynamic(
  () => import("@/components/MeatSelectionSection"),
  { loading: () => <div>Loading...</div> }
);
```

Also use Suspense for async components (Next.js 13+):
```typescript
import { Suspense } from "react";

export default function Page() {
  return (
    <>
      <Suspense fallback={<LoadingSkeleton />}>
        <AsyncInsightsSection />
      </Suspense>
    </>
  );
}
```

**Impact**: 🟡 **MEDIUM** — Faster initial page loads, better Core Web Vitals

---

### 10. Billing Logic: No Reconciliation or Retry Mechanism for Failed Webhooks

**File**: app/api/stripe/webhook/route.ts

**Issues**:
1. No dead-letter queue for failed webhook processing
2. No idempotency keys — if webhook retried, duplicates created
3. No retry logic if database insert fails after signature validation

**Recommendation**: Add webhook idempotency:

```typescript
// Add idempotency key tracking
export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  // ...
  
  const eventId = event.id; // Stripe provides unique event ID
  
  // Check if we've already processed this event
  const supabase = createClient(...);
  const { data: existingEvent } = await supabase
    .from("webhook_events")
    .select("id")
    .eq("stripe_event_id", eventId)
    .single();
  
  if (existingEvent) {
    // Already processed, return success to prevent retry
    return NextResponse.json({ received: true });
  }
  
  try {
    // ... process webhook
    
    // Record successful processing
    await supabase.from("webhook_events").insert({
      stripe_event_id: eventId,
      event_type: event.type,
      processed_at: new Date().toISOString(),
    });
    
    return NextResponse.json({ received: true });
  } catch (err) {
    // Let Stripe retry
    console.error("Webhook processing failed:", err);
    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }
}
```

**Impact**: 🟡 **MEDIUM** — Prevents subscription duplication, improves reliability

---

### 11. Component Organization: Components Folder Lacks Clear Hierarchy

**Current Structure**:
```
components/
  account/        # ✓ Good
  Button.tsx
  Footer.tsx
  gospel/         # ❌ Unclear naming
  Input.tsx
  Nav.tsx
  Paywall.tsx
  Sidebar.tsx
```

**Recommendation**: Reorganize for clarity:

```
components/
  ui/              # Base components (Button, Input, Card)
    Button.tsx
    Input.tsx
    Card.tsx
  account/         # Account-related features
    SettingsForm.tsx
    BillingCard.tsx
  insights/        # Insights visualization
    InsightCard.tsx
    TrendChart.tsx
  common/          # Page-level components
    Nav.tsx
    Footer.tsx
    Sidebar.tsx
  features/        # Feature-specific components
    CookPlanner.tsx
    FireControl.tsx
```

Also: Break down large page components into smaller pieces.

**Impact**: 🟡 **MEDIUM** — Better maintainability, easier to find code

---

### 12. TypeScript: Missing Type Definitions for Database Responses

**Current Pattern**: lib/supabase/account.ts uses proper types, but most other data fetches use implicit `any`.

**Issue**: No consistent database schema types.

**Recommendation**: Generate types from Supabase schema:

```bash
npm install --save-dev @supabase/cli
supabase gen types typescript --schema public > types/database.ts
```

Then use throughout:

```typescript
// types/database.ts (auto-generated)
export type Database = {
  public: {
    Tables: {
      cooks: {
        Row: { id: string; user_id: string; ... }
        Insert: { ... }
        Update: { ... }
      }
    }
  }
}

// Usage
import type { Database } from "@/types/database";

const supabase = createClient<Database>();
const { data } = await supabase.from("cooks").select();
// data is now properly typed!
```

**Impact**: 🟡 **MEDIUM** — Prevents runtime errors, better IDE support

---

## 🔵 LOWER PRIORITY BUT IMPORTANT

### 13. SEO: Well Implemented, But Missing Structured Data

**Current State**: Good metadata in app/layout.tsx.

**Recommendation**: Add JSON-LD structured data for rich search results:

```typescript
// app/layout.tsx
import { type Metadata } from "next";

export const metadata: Metadata = {
  // ... existing metadata
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "The Pit Preacher",
    "description": "BBQ cook planner for pitmasters",
    "url": "https://thepitpreacher.com",
    "applicationCategory": "Productivity",
    "offers": {
      "@type": "Offer",
      "price": "3.99",
      "priceCurrency": "USD"
    }
  };

  return (
    <html>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      {/* ... */}
    </html>
  );
}
```

**Impact**: 🔵 **LOW** — Improves search visibility

---

### 14. Mobile: Capacitor iOS Build Needs Proper Config per Environment

**Current Issue**: Single config file doesn't support dev/prod differentiation.

**Recommendation**: Use environment-based build:

```typescript
// capacitor.config.ts
import { CapacitorConfig } from "@capacitor/cli";

const isProduction = process.env.ENVIRONMENT === "production";

const config: CapacitorConfig = {
  appId: "com.thepitpreacher.app",
  appName: "The Pit Preacher",
  server: {
    url: isProduction
      ? "https://thepitpreacher.com"
      : "http://localhost:3000",
    cleartext: !isProduction,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
    },
  },
};

export default config;
```

Then build with: `ENVIRONMENT=production npx cap sync`

**Impact**: 🔵 **LOW** — Better dev/prod parity

---

### 15. Logging & Monitoring: Missing Structured Logging

**Current Pattern**: Basic `console.error()` calls.

**Recommendation**: Add structured logging library:

```bash
npm install pino
```

```typescript
// lib/logger.ts
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino/file",
    options: { destination: 1 }, // stdout
  },
});

// Usage
logger.error({ err, userId }, "Webhook processing failed");
logger.info({ eventId, type: event.type }, "Webhook received");
```

**Impact**: 🔵 **LOW** — Better debugging and monitoring

---

### 16. Testing: No Visible Test Coverage

**Current State**: Jest configured but no test files visible.

**Recommendation**:
1. Add unit tests for critical functions:
   - lib/billing/isPremium.ts
   - lib/gating/canUseFeature.ts
   - Error handling utilities

2. Add integration tests for API routes:
   ```typescript
   // __tests__/api/billing/create-checkout.test.ts
   describe("POST /api/billing/create-checkout-session", () => {
     it("should create checkout session for authenticated user", async () => {
       // Test logic
     });
   });
   ```

3. Add E2E tests with Playwright:
   ```typescript
   // e2e/checkout.spec.ts
   test("should complete billing flow", async ({ page }) => {
     // Test Stripe checkout flow
   });
   ```

**Impact**: 🔵 **LOW** — Prevents regressions, improves confidence in deployments

---

## 📊 Priority Summary

| Issue | Severity | Effort | Impact |
|-------|----------|--------|--------|
| Service role key exposure | 🔴 Critical | Low | Full DB access breach |
| Capacitor cleartext config | 🔴 Critical | Low | MITM vulnerabilities |
| Stripe webhook validation | 🔴 Critical | Low | Forged events |
| Error handling | 🟠 High | Medium | Data leaks, poor UX |
| Environment variables | 🟠 High | Medium | Runtime failures |
| Usage tracking architecture | 🟡 Medium | Medium | Security + auditing |
| Type safety (Stripe) | 🟡 Medium | Low | Runtime bugs |
| Auth patterns | 🟡 Medium | Medium | Inconsistency |
| Code splitting | 🟡 Medium | Low | Performance |
| Webhook idempotency | 🟡 Medium | Medium | Data integrity |
| Component organization | 🟡 Medium | Medium | Maintainability |
| Database types | 🟡 Medium | High | Type safety |
| SEO structured data | 🔵 Low | Low | Search visibility |
| Mobile config | 🔵 Low | Low | Dev/prod parity |
| Logging | 🔵 Low | Low | Debugging |
| Testing | 🔵 Low | High | Reliability |

---

## Immediate Action Items (This Week)

1. **Move service role keys** out of shared libraries
2. **Disable cleartext in Capacitor** production config
3. **Fix Stripe webhook** sig validation
4. **Create config.ts** for environment variables
5. **Add error handling library** to API routes

The codebase is well-structured overall (Turbo monorepo, good component patterns, Supabase auth setup), but these security and architectural issues need addressing before scaling further.
