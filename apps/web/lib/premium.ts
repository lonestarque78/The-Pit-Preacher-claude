// apps/web/lib/premium.ts

export async function isPremium(userId: string | undefined, supabase: any) {
  if (!userId) return false;

  const { data, error } = await supabase
    .from("subscriptions")
    .select("tier")
    .eq("user_id", userId)
    .eq("status", "active")
    .in("tier", ["premium", "pro"])
    .maybeSingle();

  if (error) return false;

  return data?.tier === "premium" || data?.tier === "pro";
}
