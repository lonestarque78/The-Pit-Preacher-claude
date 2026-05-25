import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SelectedItemSchema = z.object({
  name: z.string().min(1),
  category: z.string(),
  quantity: z.number().int().min(1),
  weight: z.string(),
  notes: z.string(),
  smokerId: z.string().nullable(),
});

const SmokerSchema = z.object({
  id: z.string(),
  name: z.string(),
  wood: z.string(),
});

const CreateCookSchema = z.object({
  selectedItems: z.array(SelectedItemSchema).min(1, "at least one item required"),
  cookingStyle: z.string().min(1, "cookingStyle is required"),
  eatingTime: z.string().min(1, "eatingTime is required"),
  flavorSmoke: z.number().int().min(1).max(10),
  flavorBark: z.number().int().min(1).max(10),
  flavorTenderness: z.number().int().min(1).max(10),
  smokers: z.array(SmokerSchema).min(1, "at least one smoker required"),
});

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bodyParseResult = CreateCookSchema.safeParse(await req.json());
  if (!bodyParseResult.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: bodyParseResult.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const {
    selectedItems,
    cookingStyle,
    eatingTime,
    flavorSmoke,
    flavorBark,
    flavorTenderness,
    smokers,
  } = bodyParseResult.data;

  const label = selectedItems.map(i => i.name).join(" + ") || "Cook";
  const smokerType = smokers.map(s => s.name).filter(Boolean).join(", ");
  const woodType = smokers.map(s => s.wood).filter(Boolean).join(", ");

  const serviceSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await serviceSupabase.rpc("create_cook_if_under_limit", {
    p_user_id:           user.id,
    p_selected_items:    selectedItems,
    p_cooking_style:     cookingStyle,
    p_eating_time:       eatingTime,
    p_flavor_smoke:      flavorSmoke,
    p_flavor_bark:       flavorBark,
    p_flavor_tenderness: flavorTenderness,
    p_smokers:           smokers,
    p_label:             label,
    p_smoker_type:       smokerType,
    p_wood_type:         woodType,
  });

  if (error) {
    console.error("[cooks/create] RPC error:", error);
    return NextResponse.json({ error: "Failed to create cook" }, { status: 500 });
  }

  if (data?.error === "COOK_LIMIT_REACHED") {
    return NextResponse.json({ error: "COOK_LIMIT_REACHED" }, { status: 403 });
  }

  if (!data?.cook_id) {
    console.error("[cooks/create] RPC returned no cook_id:", data);
    return NextResponse.json({ error: "Failed to create cook" }, { status: 500 });
  }

  return NextResponse.json({ cookId: data.cook_id });
}
