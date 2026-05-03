// app/api/trends/route.ts

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { generateTrends } from "@/lib/insights/generateTrends";
import { getTier, tierMeetsRequirement } from "@/lib/premium";

export async function GET(): Promise<NextResponse> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tier = await getTier(user.id, supabase);

  if (!tierMeetsRequirement(tier, "pitmaster")) {
    return NextResponse.json({ error: "Pitmaster tier required" }, { status: 403 });
  }

  const trends = await generateTrends(user.id);
  return NextResponse.json(trends);
}