// app/api/strategy/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { generateNextCookStrategy } from "@/lib/insights/generateNextCookStrategy";
import { getTier, tierMeetsRequirement } from "@/lib/premium";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const meatType = searchParams.get("meatType") ?? "";
  const pitType = searchParams.get("pitType") ?? "";
  const cookId = searchParams.get("cookId") ?? undefined;

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tier = await getTier(user.id, supabase);
  if (!tierMeetsRequirement(tier, "pitmaster")) {
    return NextResponse.json({ error: "Pitmaster tier required" }, { status: 403 });
  }

  const strategy = await generateNextCookStrategy(user.id, meatType, pitType, cookId);
  return NextResponse.json(strategy);
}