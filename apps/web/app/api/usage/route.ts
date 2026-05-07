import { NextRequest, NextResponse } from "next/server";
import { checkUsage } from "@/lib/usage/track";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const feature = req.nextUrl.searchParams.get("feature");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const usage = await checkUsage(user.id, feature!);
  return NextResponse.json(usage);
}
