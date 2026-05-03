// app/api/trends/route.ts

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { generateTrends } from "@/lib/insights/generateTrends";

export async function GET(): Promise<NextResponse> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check pitmaster tier
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("tier")
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  const tier = sub?.tier ?? "free";
  const TIER_RANK: Record<string, number> = { free: 0, basic: 1, backyard: 2, pitmaster: 3 };
  if ((TIER_RANK[tier] ?? 0) < TIER_RANK["pitmaster"]) {
    return NextResponse.json({ error: "Pitmaster tier required" }, { status: 403 });
  }

  const trends = await generateTrends(user.id);
  return NextResponse.json(trends);
}