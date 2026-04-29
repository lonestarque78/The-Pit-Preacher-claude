import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  return NextResponse.redirect(`${siteUrl}/dashboard`);
}
