import { createServerClient } from "../supabase-server";
import { isPremium as checkIsPremium } from "../premium";

/**
 * Server-side helper to check if user is premium
 * @deprecated Use isPremium from @/lib/premium with explicit supabase client instead
 */
export async function isPremium(userId: string): Promise<boolean> {
  const supabase = await createServerClient();
  return checkIsPremium(userId, supabase);
}
