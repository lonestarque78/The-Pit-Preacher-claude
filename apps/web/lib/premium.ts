// apps/web/lib/premium.ts

export async function isPremium(userId: string | undefined, supabase: any) {
  if (!userId) return false;

  const { data, error } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", userId)
    .single();

  if (error) return false;

  return data?.is_premium === true;
}
