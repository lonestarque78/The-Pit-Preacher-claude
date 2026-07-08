// app/api/variability/route.ts

import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { generateCookVariabilityIndex } from "@/lib/insights/generateCookVariabilityIndex";
import { isPitmaster } from "@/lib/premium";

export async function GET(): Promise<NextResponse> {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!(await isPitmaster(user.id, supabase))) {
    return NextResponse.json({ error: "Pitmaster tier required" }, { status: 403 });
  }

  const result = await generateCookVariabilityIndex(user.id);
  return NextResponse.json(result);
}