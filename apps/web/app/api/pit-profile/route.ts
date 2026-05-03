// app/api/pit-profile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { generatePitProfile } from "@/lib/insights/generatePitProfile";
import { getTier, tierMeetsRequirement } from "@/lib/premium";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const pitType = searchParams.get("pitType");

  if (!pitType) {
    return NextResponse.json({ error: "pitType required" }, { status: 400 });
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

  const profile = await generatePitProfile(user.id, pitType);
  if (!profile) {
    return NextResponse.json({ error: "No data found for this pit type" }, { status: 404 });
  }

  return NextResponse.json(profile);
}