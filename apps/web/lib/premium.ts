// apps/web/lib/premium.ts

import type { SupabaseClient } from "@supabase/supabase-js";

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
 * Check if user has an active/trialing Pitmaster subscription.
 */
export async function isPitmaster(userId: string | undefined, supabase: SupabaseClient): Promise<boolean> {
  if (!userId) return false;

  const { data, error } = await supabase
    .from("subscriptions")
    .select("status, tier")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return false;

  const isActiveSubscription = data.status === "active" || data.status === "trialing";
  return isActiveSubscription && data.tier === "pitmaster";
}