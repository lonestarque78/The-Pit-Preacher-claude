// lib/plan/autoAdjustPlan.ts

import { createServerClient } from "@/lib/supabase-server";

export interface PlanAdjustments {
  startTimeAdjustment: number | null;
  wrapAdjustment: number | null;
  pitTempAdjustment: number | null;
  restTimeAdjustment: number | null;
  notes: string[];
}

export interface AdjustedPlan {
  adjustments: PlanAdjustments;
  hasAdjustments: boolean;
}

function containsAny(texts: string[], keywords: string[]): boolean {
  const combined = texts.join(" ").toLowerCase();
  return keywords.some(k => combined.includes(k.toLowerCase()));
}

export async function autoAdjustPlan(
  cookId: string,
  userId: string,
  pitType: string,
  meatType: string
): Promise<AdjustedPlan> {
  const supabase = await createServerClient();

  // Load past cooks
  const { data: pastCooks } = await supabase
    .from("cooks")
    .select("id, smoker_type, label, completed_at, eat_time")
    .eq("user_id", userId)
    .eq("status", "completed")
    .neq("id", cookId)
    .order("created_at", { ascending: false })
    .limit(5);

  const pastCookIds = (pastCooks ?? []).map((c: any) => c.id);

  let pastOutcomes: any[] = [];
  let pastNotes: any[] = [];

  if (pastCookIds.length > 0) {
    const [{ data: outcomes }, { data: notes }] = await Promise.all([
      supabase.from("cook_outcomes").select("*").in("cook_id", pastCookIds),
      supabase.from("cook_tracker_notes").select("*").in("cook_id", pastCookIds),
    ]);
    pastOutcomes = outcomes ?? [];
    pastNotes = notes ?? [];
  }

  // Fetch insights from the API
  let patternInsights: string[] = [];
  let pitInsights: string[] = [];
  let nextTimeRecommendations: string[] = [];

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const res = await fetch(`${siteUrl}/api/insights?cookId=${cookId}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      patternInsights = data.patternInsights ?? [];
      pitInsights = data.pitInsights ?? [];
      nextTimeRecommendations = data.nextTimeRecommendations ?? [];
    }
  } catch {
    // No insights available — proceed with past outcome analysis only
  }

  const allInsights = [...patternInsights, ...pitInsights, ...nextTimeRecommendations];
  const allNoteTexts = pastNotes.flatMap((n: any) =>
    [n.note_1, n.note_2, n.note_3, n.note_4, n.note_5].filter(Boolean)
  );
  const allText = [...allInsights, ...allNoteTexts];

  const adjustments: PlanAdjustments = {
    startTimeAdjustment: null,
    wrapAdjustment: null,
    pitTempAdjustment: null,
    restTimeAdjustment: null,
    notes: [],
  };

  // ── START TIME ADJUSTMENTS ──────────────────────────────────────────────

  // Check if cooks consistently finish late
  const lateFinishes = (pastCooks ?? []).filter((c: any) => {
    if (!c.completed_at || !c.eat_time) return false;
    const diff = new Date(c.completed_at).getTime() - new Date(c.eat_time).getTime();
    return diff > 30 * 60 * 1000; // finished more than 30 min after eat time
  });

  if (lateFinishes.length >= 2) {
    adjustments.startTimeAdjustment = -45;
    adjustments.notes.push("Starting 45 minutes earlier — your last two cooks finished late.");
  } else if (containsAny(allText, ["finish late", "start earlier", "long stall", "slow pit", "ran long"])) {
    adjustments.startTimeAdjustment = -30;
    adjustments.notes.push("Starting 30 minutes earlier based on past cook behavior.");
  }

  // Check if cooks consistently finish early
  const earlyFinishes = (pastCooks ?? []).filter((c: any) => {
    if (!c.completed_at || !c.eat_time) return false;
    const diff = new Date(c.eat_time).getTime() - new Date(c.completed_at).getTime();
    return diff > 90 * 60 * 1000; // finished more than 90 min before eat time
  });

  if (earlyFinishes.length >= 2 && !adjustments.startTimeAdjustment) {
    adjustments.startTimeAdjustment = 20;
    adjustments.notes.push("Starting 20 minutes later — your cooks have been finishing well ahead of schedule.");
  } else if (containsAny(allText, ["finish early", "pit runs hot early", "runs hot"]) && !adjustments.startTimeAdjustment) {
    adjustments.startTimeAdjustment = 15;
    adjustments.notes.push("Starting 15 minutes later — pit has been running hot early in recent cooks.");
  }

  // ── PIT TEMP ADJUSTMENTS ────────────────────────────────────────────────

  // Low moisture or tenderness issues → run cooler
  const dryOutcomes = pastOutcomes.filter((o: any) => o.moisture_level && o.moisture_level <= 2);
  const toughOutcomes = pastOutcomes.filter((o: any) => o.tenderness && o.tenderness <= 2);

  if (dryOutcomes.length >= 2 || toughOutcomes.length >= 2) {
    adjustments.pitTempAdjustment = -15;
    adjustments.notes.push("Running 15°F cooler — recent cooks have been drying out or coming off tough.");
  } else if (containsAny(allText, ["dry out", "bark too hard", "pit runs hot", "runs hot early", "ribs dry"])) {
    adjustments.pitTempAdjustment = -10;
    adjustments.notes.push("Dropping pit temp 10°F — past notes flag heat as a factor in dry results.");
  }

  // Long stalls or cool pit → run hotter
  const longStalls = pastOutcomes.filter((o: any) => o.stall_time_minutes && o.stall_time_minutes > 180);

  if (longStalls.length >= 2 && !adjustments.pitTempAdjustment) {
    adjustments.pitTempAdjustment = 10;
    adjustments.notes.push("Adding 10°F to pit temp — stalls have been running long across recent cooks.");
  } else if (containsAny(allText, ["pit dips", "pit runs cool", "stall lasts long", "slow stall"]) && !adjustments.pitTempAdjustment) {
    adjustments.pitTempAdjustment = 15;
    adjustments.notes.push("Running 15°F hotter — pit has been losing temp during the stall.");
  }

  // ── WRAP TIMING ADJUSTMENTS ─────────────────────────────────────────────

  const softBarkOutcomes = pastOutcomes.filter((o: any) => o.bark_quality && o.bark_quality <= 2);

  if (softBarkOutcomes.length >= 2) {
    adjustments.wrapAdjustment = 30;
    adjustments.notes.push("Wrapping 30 minutes later — bark has been underdeveloped across recent cooks.");
  } else if (containsAny(allText, ["wrap later", "bark was soft", "wrap too early", "bark underdeveloped", "soft bark"])) {
    adjustments.wrapAdjustment = 20;
    adjustments.notes.push("Delaying wrap by 20 minutes — past notes flag early wrapping as a bark issue.");
  }

  const hardBarkOutcomes = pastOutcomes.filter((o: any) => o.bark_quality && o.bark_quality >= 5 && o.moisture_level && o.moisture_level <= 2);

  if (hardBarkOutcomes.length >= 2 && !adjustments.wrapAdjustment) {
    adjustments.wrapAdjustment = -25;
    adjustments.notes.push("Wrapping 25 minutes earlier — bark has been overdeveloping and drying out the meat.");
  } else if (containsAny(allText, ["bark too hard", "cook dried out", "pit ran hot", "wrap earlier"]) && !adjustments.wrapAdjustment) {
    adjustments.wrapAdjustment = -20;
    adjustments.notes.push("Wrapping 20 minutes earlier — past notes flag hard bark and moisture loss.");
  }

  // ── REST TIME ADJUSTMENTS ───────────────────────────────────────────────

  const shortRestOutcomes = pastOutcomes.filter((o: any) => o.rest_time_minutes && o.rest_time_minutes < 45);
  const tenderIssues = pastOutcomes.filter((o: any) => o.tenderness && o.tenderness <= 2);

  if (shortRestOutcomes.length >= 2 || tenderIssues.length >= 2) {
    adjustments.restTimeAdjustment = 45;
    adjustments.notes.push("Adding 45 minutes to rest time — short rests have been affecting tenderness.");
  } else if (containsAny(allText, ["rest longer", "meat tightened", "juices pushed out", "need more rest"])) {
    adjustments.restTimeAdjustment = 30;
    adjustments.notes.push("Extending rest by 30 minutes — past notes flag insufficient rest time.");
  }

  if (containsAny(allText, ["rest too long", "meat cooled too much", "got cold"]) && !adjustments.restTimeAdjustment) {
    adjustments.restTimeAdjustment = -20;
    adjustments.notes.push("Trimming rest by 20 minutes — meat has been cooling too much before service.");
  }

  const hasAdjustments =
    adjustments.startTimeAdjustment !== null ||
    adjustments.wrapAdjustment !== null ||
    adjustments.pitTempAdjustment !== null ||
    adjustments.restTimeAdjustment !== null;

  return { adjustments, hasAdjustments };
}