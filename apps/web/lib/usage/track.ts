import { createClient } from "@supabase/supabase-js";
import { FREE_LIMITS, PREMIUM_LIMITS } from "./limits";
import { isPremium } from "../billing/isPremium";

export async function incrementUsage(userId: string, feature: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabase.from("usage_events").insert({
    user_id: userId,
    feature,
  });
}

export async function checkUsage(userId: string, feature: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const premium = await isPremium(userId);
  const limits = premium ? PREMIUM_LIMITS : FREE_LIMITS;

  const { data } = await supabase
    .from("daily_usage")
    .select("count")
    .eq("user_id", userId)
    .eq("feature", feature)
    .maybeSingle();

  const used = data?.count ?? 0;
  const limit = (limits as Record<string, number>)[feature] ?? Infinity;

  return {
    used,
    limit,
    remaining: limit === Infinity ? Infinity : limit - used,
    isLimited: limit !== Infinity,
    isOverLimit: used >= limit,
  };
}
