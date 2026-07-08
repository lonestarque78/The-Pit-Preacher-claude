import { NextRequest, NextResponse } from "next/server";
import { isPitmaster } from "@/lib/premium";
import { createServerClient } from "@/lib/supabase-server";

export async function GET(_req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pitmaster = await isPitmaster(user.id, supabase);
  return NextResponse.json({ isPitmaster: pitmaster });
}
