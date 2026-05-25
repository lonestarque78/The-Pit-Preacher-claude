// apps/web/lib/premium.ts

import type { SupabaseClient } from "@supabase/supabase-js";

const TIER_RANK: Record<string, number> = {
  free: 0,
  basic: 1,
  backyard: 2,
  pitmaster: 3,
};

export async function getTier(userId: string | undefined, supabase: SupabaseClient): Promise<string> {
  if (!userId) return "free";

  const { data, error } = await supabase
    .from("subscriptions")
    .select("tier")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error || !data) return "free";

  return data.tier || "free";
}

/**
 * Check if user is premium (active/trialing subscription with tier >= basic)
 * Unified implementation that checks BOTH subscription status AND tier
 */
export async function isPremium(userId: string | undefined, supabase: SupabaseClient): Promise<boolean> {
  if (!userId) return false;

  const { data, error } = await supabase
    .from("subscriptions")
    .select("status, tier")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return false;

  // Must be active or trialing AND tier must be basic or higher
  const isActiveSubscription = data.status === "active" || data.status === "trialing";
  const isPaidTier = (TIER_RANK[data.tier] ?? 0) >= (TIER_RANK["basic"] ?? 1);

  return isActiveSubscription && isPaidTier;
}

export function tierMeetsRequirement(userTier: string, requiredTier: string): boolean {
  return (TIER_RANK[userTier] ?? 0) >= (TIER_RANK[requiredTier] ?? 0);
}