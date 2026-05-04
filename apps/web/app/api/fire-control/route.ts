// app/api/fire-control/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { generateFireControlScore } from "@/lib/insights/generateFireControlScore";
import { getTier, tierMeetsRequirement } from "@/lib/premium";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const cookId = searchParams.get("cookId");
  if (!cookId) return NextResponse.json({ error: "cookId required" }, { status: 400 });

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tier = await getTier(user.id, supabase);
  if (!tierMeetsRequirement(tier, "pitmaster")) {
    return NextResponse.json({ error: "Pitmaster tier required" }, { status: 403 });
  }

  const result = await generateFireControlScore(cookId, user.id);
  return NextResponse.json(result);
}