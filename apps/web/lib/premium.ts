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

export async function isPremium(userId: string | undefined, supabase: SupabaseClient): Promise<boolean> {
  const tier = await getTier(userId, supabase);
  return (TIER_RANK[tier] ?? 0) >= (TIER_RANK["basic"] ?? 1);
}

export function tierMeetsRequirement(userTier: string, requiredTier: string): boolean {
  return (TIER_RANK[userTier] ?? 0) >= (TIER_RANK[requiredTier] ?? 0);
}