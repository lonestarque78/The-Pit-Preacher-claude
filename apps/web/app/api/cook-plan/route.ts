// app/api/cook-plan/route.ts
// Backs the Plan tab in the unified cook view. Moved out of a Server Component
// so the (expensive) AI plan generation only runs when the user opens this tab,
// not on every load of /cook/[id].

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { autoAdjustPlan } from "@/lib/plan/autoAdjustPlan";
import { isPitmaster as checkIsPitmaster } from "@/lib/premium";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cookId = searchParams.get("cookId");
  if (!cookId) return NextResponse.json({ error: "cookId required" }, { status: 400 });

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isPitmaster = await checkIsPitmaster(user.id, supabase);

  const { data: cook } = await supabase
    .from("cooks")
    .select("*")
    .eq("id", cookId)
    .single();

  if (!cook) {
    return NextResponse.json({ error: "Cook not found" }, { status: 404 });
  }

  const { data: cookItems } = await supabase
    .from("cook_items")
    .select("*")
    .eq("cook_id", cookId);

  let session: any = null;
  if (cook.prep_session_id) {
    const { data } = await supabase
      .from("meal_prep_sessions")
      .select("*")
      .eq("id", cook.prep_session_id)
      .single();
    session = data;
  }

  const plan = cook.plan as { tools?: any[]; items?: any[] } | null;
  const planTools = plan?.tools ?? [];
  const planItems = plan?.items ?? [];

  const pitType = cook.smoker_type ?? "";
  const meatType = cook.label ?? "";

  const { adjustments, hasAdjustments } = await autoAdjustPlan(
    cookId,
    user.id,
    pitType,
    meatType
  );

  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");

  let adjustmentContext = "";
  if (hasAdjustments) {
    const parts: string[] = [];
    if (adjustments.startTimeAdjustment !== null) {
      parts.push(`Start ${Math.abs(adjustments.startTimeAdjustment)} minutes ${adjustments.startTimeAdjustment < 0 ? "earlier" : "later"} than normal`);
    }
    if (adjustments.pitTempAdjustment !== null) {
      parts.push(`Run pit ${Math.abs(adjustments.pitTempAdjustment)}°F ${adjustments.pitTempAdjustment < 0 ? "cooler" : "hotter"} than target`);
    }
    if (adjustments.wrapAdjustment !== null) {
      parts.push(`Wrap ${Math.abs(adjustments.wrapAdjustment)} minutes ${adjustments.wrapAdjustment > 0 ? "later" : "earlier"} than normal`);
    }
    if (adjustments.restTimeAdjustment !== null) {
      parts.push(`Rest ${Math.abs(adjustments.restTimeAdjustment)} minutes ${adjustments.restTimeAdjustment > 0 ? "longer" : "shorter"} than normal`);
    }
    adjustmentContext = `\n\nBased on past cook data, apply these adjustments to the plan: ${parts.join(". ")}.`;
  }

  let aiReply = "";
  try {
    const siteUrl = req.nextUrl.origin;
    const res = await fetch(`${siteUrl}/api/preacher`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        cookId: cook.id,
        message:
          "Generate a full cook plan for this cook. Include: when to trim and season each meat, when to light each smoker, key milestones (wrap windows, spritz windows, probe tender check), rest time, and slice/serve time. Be specific with clock times working backward from the eating time. Write in your voice — direct, confident, no fluff. End with a one paragraph overall read on this cook." + adjustmentContext,
        cookContext: {
          label: cook.label,
          eat_time: cook.eat_time,
          cooking_style: cook.cooking_style,
          tools: planTools,
          planItems,
          flavor_smoke: session?.flavor_smoke ?? null,
          flavor_bark: session?.flavor_bark ?? null,
          flavor_tenderness: session?.flavor_tenderness ?? null,
          recentEvents: [],
        },
      }),
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      aiReply = json.reply || "";
    }
  } catch (err) {
    console.error("Preacher fetch failed:", err);
  }

  return NextResponse.json({
    cook,
    cookItems: cookItems ?? [],
    session,
    isPitmaster,
    adjustments,
    hasAdjustments,
    aiReply,
  });
}
