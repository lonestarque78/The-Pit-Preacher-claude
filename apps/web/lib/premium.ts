// apps/web/lib/premium.ts

export async function getTier(userId: string | undefined, supabase: any) {
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

export async function isPremium(userId: string | undefined, supabase: any) {
  const tier = await getTier(userId, supabase);
  return tier === "premium" || tier === "pro" || tier === "pitmaster";
}
