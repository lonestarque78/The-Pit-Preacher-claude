// app/api/meat-profile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { generateMeatProfile } from "@/lib/insights/generateMeatProfile";
import { getTier, tierMeetsRequirement } from "@/lib/premium";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const meatType = searchParams.get("meatType");

  if (!meatType) {
    return NextResponse.json({ error: "meatType required" }, { status: 400 });
  }

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tier = await getTier(user.id, supabase);
  if (!tierMeetsRequirement(tier, "pitmaster")) {
    return NextResponse.json({ error: "Pitmaster tier required" }, { status: 403 });
  }

  const profile = await generateMeatProfile(user.id, meatType);
  if (!profile) {
    return NextResponse.json({ error: "No data found for this meat type" }, { status: 404 });
  }

  return NextResponse.json(profile);
}