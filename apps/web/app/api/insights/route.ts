// app/api/insights/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

interface InsightsResult {
  patternInsights: string[];
  pitInsights: string[];
  nextTimeRecommendations: string[];
}

const RATING_LABELS: Record<number, string> = {
  1: "poor", 2: "below average", 3: "solid", 4: "great", 5: "perfect",
};

function minutesToHours(min: number): string {
  if (min < 60) return `${min} minutes`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h} hours`;
}

function diffMinutes(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000);
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const cookId = searchParams.get("cookId");

  if (!cookId) {
    return NextResponse.json({ error: "cookId required" }, { status: 400 });
  }

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = user.id;

  const [
    { data: cook },
    { data: outcome },
    { data: trackerNotes },
    { data: events },
  ] = await Promise.all([
    supabase.from("cooks").select("*").eq("id", cookId).eq("user_id", userId).single(),
    supabase.from("cook_outcomes").select("*").eq("cook_id", cookId).maybeSingle(),
    supabase.from("cook_tracker_notes").select("*").eq("cook_id", cookId).maybeSingle(),
    supabase.from("cook_events").select("*").eq("cook_id", cookId).order("created_at", { ascending: true }),
  ]);

  if (!cook || !outcome) {
    return NextResponse.json({ patternInsights: [], pitInsights: [], nextTimeRecommendations: [] });
  }

  const pitType: string = cook.smoker_type?.toLowerCase() ?? "unknown";

  const { data: pastCooks } = await supabase
    .from("cooks")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "completed")
    .neq("id", cookId)
    .order("created_at", { ascending: false })
    .limit(5);

  const pastCookIds = (pastCooks ?? []).map((c: any) => c.id);
  let pastOutcomes: any[] = [];
  if (pastCookIds.length > 0) {
    const { data } = await supabase
      .from("cook_outcomes")
      .select("*")
      .in("cook_id", pastCookIds);
    pastOutcomes = data ?? [];
  }

  // ── PATTERN INSIGHTS ────────────────────────────────────────────────────
  const patternInsights: string[] = [];

  if (outcome.finish_time_actual && cook.eat_time) {
    const diff = diffMinutes(cook.eat_time, outcome.finish_time_actual);
    if (diff > 30) {
      patternInsights.push(`This cook finished ${minutesToHours(diff)} after your planned eat time. Build a longer buffer into your next timeline.`);
    } else if (diff < -60) {
      patternInsights.push(`This cook finished ${minutesToHours(Math.abs(diff))} early. Your buffer worked — the cooler rest improved the final product.`);
    }
  }

  if (outcome.stall_time_minutes) {
    if (outcome.stall_time_minutes > 180) {
      patternInsights.push(`Your stall ran ${minutesToHours(outcome.stall_time_minutes)}. That's a long one — next time consider wrapping at the two-hour mark to reclaim time.`);
    } else if (outcome.stall_time_minutes < 45) {
      patternInsights.push(`Short stall of ${minutesToHours(outcome.stall_time_minutes)}. Your pit humidity is working — keep the environment consistent.`);
    }
  }

  if (outcome.bark_quality && outcome.moisture_level) {
    if (outcome.bark_quality <= 2 && outcome.moisture_level >= 4) {
      patternInsights.push("High moisture but weak bark — you likely wrapped too early or too tight. Let the bark set before sealing it in.");
    }
    if (outcome.bark_quality >= 4 && outcome.moisture_level <= 2) {
      patternInsights.push("Strong bark but dry finish — great crust development, but the meat needs more rest time or an earlier wrap to hold moisture.");
    }
  }

  const lowBarkCooks = pastOutcomes.filter((o: any) => o.bark_quality && o.bark_quality <= 2);
  if (lowBarkCooks.length >= 2) {
    patternInsights.push(`Bark has been weak across ${lowBarkCooks.length} recent cooks. Check your wrap timing and make sure you're running dry heat in the final hour.`);
  }

  const dryFinishes = pastOutcomes.filter((o: any) => o.moisture_level && o.moisture_level <= 2);
  if (dryFinishes.length >= 2) {
    patternInsights.push("Dry finishes are showing up across multiple cooks. Wrap earlier, rest longer, or reduce your cook temp by 15–20°F.");
  }

  if (outcome.smoke_profile && outcome.smoke_profile <= 2) {
    patternInsights.push("Light smoke profile this cook. Add a smoke tube in the first two hours or switch to a stronger wood like hickory or oak.");
  }

  if (outcome.smoke_profile >= 5 && outcome.flavor_balance && outcome.flavor_balance <= 3) {
    patternInsights.push("Heavy smoke overpowered the flavor balance. Pull back to fruit wood or reduce your smoke exposure window.");
  }

  const spikeEvents = (events ?? []).filter((e: any) =>
    e.event_type?.toLowerCase().includes("spike") ||
    e.note?.toLowerCase().includes("spike") ||
    e.note?.toLowerCase().includes("too hot")
  );
  if (spikeEvents.length >= 2) {
    patternInsights.push(`${spikeEvents.length} temp spikes logged. Make smaller vent adjustments and give the pit five minutes before touching anything again.`);
  }

  const lidEvents = (events ?? []).filter((e: any) =>
    e.event_type?.toLowerCase().includes("lid") ||
    e.note?.toLowerCase().includes("opened lid") ||
    e.note?.toLowerCase().includes("checked temp")
  );
  if (lidEvents.length >= 4) {
    patternInsights.push(`You opened the lid ${lidEvents.length} times. Every opening drops pit temp and slows the stall. Trust the process — check less.`);
  }

  // ── PIT-SPECIFIC INSIGHTS ───────────────────────────────────────────────
  const pitInsights: string[] = [];

  if (pitType.includes("offset")) {
    pitInsights.push("Offsets spike early — let your fire run for 30 minutes and stabilize before the meat goes on.");
    pitInsights.push("Hot spots near the firebox will cook your meat faster on that side. Rotate every hour if you don't have a baffle.");
    if (outcome.smoke_profile && outcome.smoke_profile <= 3) {
      pitInsights.push("Your offset should be producing strong smoke flavor. Check that you're running splits, not chunks, and that your exhaust is fully open.");
    }
  }

  if (pitType.includes("pellet")) {
    pitInsights.push("Pellet grills produce clean but mild smoke. A smoke tube in the first two hours adds the depth that the auger system can't.");
    pitInsights.push("Bark development is your pellet grill's weakness. Avoid wrapping before the bark is fully set — usually 165°F internal or later.");
    if (outcome.bark_quality && outcome.bark_quality <= 3) {
      pitInsights.push("Soft bark is common on pellets. Try finishing at 300°F unwrapped for the last 45 minutes to firm up the crust.");
    }
    if (outcome.overall_success && outcome.overall_success >= 4) {
      pitInsights.push("Pellet consistency is your strength — you're getting repeatable results. Document your settings and replicate them.");
    }
  }

  if (pitType.includes("kamado")) {
    pitInsights.push("Kamados hold moisture exceptionally well — that's why your stalls are softer and shorter than offset cooks.");
    pitInsights.push("Small vent moves have big effects on a kamado. Make one adjustment, wait five minutes, then reassess.");
  }

  if (pitType.includes("kettle")) {
    pitInsights.push("Two-zone setup is everything on a kettle. Coals on one side, meat on the other — never cook directly over the coals on a long cook.");
    pitInsights.push("Your coal bed shrinks faster than you think. Check fuel levels every 90 minutes on cooks longer than two hours.");
    if (outcome.pit_temp_high && outcome.pit_temp_low && (outcome.pit_temp_high - outcome.pit_temp_low) > 50) {
      pitInsights.push(`Wide temp range of ${outcome.pit_temp_low}–${outcome.pit_temp_high}°F. Add smaller amounts of fuel more frequently.`);
    }
  }

  if (pitType.includes("drum") || pitType.includes("uds")) {
    pitInsights.push("Drums run hotter than expected. Start with vents barely cracked and work up from there.");
    pitInsights.push("High humidity inside a drum keeps meat moist but can slow bark development. Crack the lid for the last hour if bark is a priority.");
  }

  if (pitType.includes("cabinet") || pitType.includes("vertical")) {
    pitInsights.push("Bottom rack runs hottest on a cabinet smoker. Use it intentionally for cuts that need more heat or rotate every two hours.");
    pitInsights.push("Even heat distribution means your cook should be predictable. If results are inconsistent, check your water pan and wood placement.");
  }

  if (pitType.includes("electric")) {
    pitInsights.push("Add wood chips in the first two hours only — late additions turn bitter fast in an electric environment.");
    pitInsights.push("Bark is your biggest challenge on electric. Finish at max temp unwrapped for the last 45–60 minutes to develop crust.");
  }

  if (outcome.pit_temp_low && outcome.pit_temp_high) {
    const range = outcome.pit_temp_high - outcome.pit_temp_low;
    if (range > 75) {
      pitInsights.push(`Your pit swung ${range}°F during this cook. That variance stresses the meat — focus on vent consistency.`);
    } else if (range <= 25) {
      pitInsights.push(`Tight temp range of ${range}°F — excellent pit management. That consistency shows in the final product.`);
    }
  }

  // ── NEXT-TIME RECOMMENDATIONS ───────────────────────────────────────────
  const nextTimeRecommendations: string[] = [];

  const notes = [
    trackerNotes?.note_1,
    trackerNotes?.note_2,
    trackerNotes?.note_3,
    trackerNotes?.note_4,
    trackerNotes?.note_5,
  ].filter(Boolean) as string[];

  notes.slice(0, 3).forEach(note => nextTimeRecommendations.push(note));

  if (outcome.tenderness && outcome.tenderness <= 2) {
    nextTimeRecommendations.push("Probe tenderness was off — go longer, not hotter. Add 90 minutes to your cook window and check feel, not temp.");
  }

  if (outcome.flavor_balance && outcome.flavor_balance <= 2) {
    nextTimeRecommendations.push("Flavor was out of balance. Revisit your rub ratio — too much sugar burns, too much salt dominates. Salt the night before and keep the rub light.");
  }

  if (outcome.bark_quality && outcome.bark_quality <= 2 && !(outcome.moisture_level && outcome.moisture_level <= 2)) {
    nextTimeRecommendations.push("Wrap later next time — your bark wasn't set when you sealed it. Wait until the crust resists a finger press before wrapping.");
  }

  if (outcome.overall_success && outcome.overall_success >= 4) {
    nextTimeRecommendations.push("Strong cook overall. Document your exact start time, vent settings, and wrap timing — repeat what worked.");
  }

  if (outcome.start_time_actual && outcome.finish_time_actual && cook.eat_time) {
    const actualDuration = diffMinutes(outcome.start_time_actual, outcome.finish_time_actual);
    const plannedDuration = diffMinutes(outcome.start_time_actual, cook.eat_time);
    const variance = actualDuration - plannedDuration;
    if (variance > 60) {
      nextTimeRecommendations.push(`This cook ran ${minutesToHours(variance)} longer than planned. Start your fire earlier and build in a two-hour cooler hold.`);
    }
  }

  if (outcome.fire_issues?.trim()) {
    nextTimeRecommendations.push(`Fire issue noted: "${outcome.fire_issues.slice(0, 80)}${outcome.fire_issues.length > 80 ? "..." : ""}". Address this before the next cook.`);
  }

  if (outcome.weather_impact?.trim()) {
    nextTimeRecommendations.push(`Weather was a factor: "${outcome.weather_impact.slice(0, 60)}${outcome.weather_impact.length > 60 ? "..." : ""}". Add extra time when conditions are similar.`);
  }

  const result: InsightsResult = {
    patternInsights: patternInsights.slice(0, 5),
    pitInsights: pitInsights.slice(0, 5),
    nextTimeRecommendations: nextTimeRecommendations.slice(0, 5),
  };

  return NextResponse.json(result);
}