// lib/insights/generateConfidenceScore.ts

import { createServerClient } from "@/lib/supabase-server";

export interface ConfidenceScoreResult {
  score: number;
  breakdown: {
    pitStability: number;
    planAdherence: number;
    outcomeConsistency: number;
    cookEfficiency: number;
  };
  notes: string[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function diffMinutes(a: string, b: string): number {
  return Math.abs(new Date(b).getTime() - new Date(a).getTime()) / 60000;
}

export async function generateConfidenceScore(
  cookId: string,
  userId: string
): Promise<ConfidenceScoreResult> {
  const supabase = await createServerClient();

  const [
    { data: cook },
    { data: outcome },
    { data: events },
    { data: trackerNotes },
  ] = await Promise.all([
    supabase.from("cooks").select("*").eq("id", cookId).eq("user_id", userId).single(),
    supabase.from("cook_outcomes").select("*").eq("cook_id", cookId).maybeSingle(),
    supabase.from("cook_events").select("*").eq("cook_id", cookId),
    supabase.from("cook_tracker_notes").select("*").eq("cook_id", cookId).maybeSingle(),
  ]);

  if (!cook || !outcome) {
    return {
      score: 0,
      breakdown: { pitStability: 0, planAdherence: 0, outcomeConsistency: 0, cookEfficiency: 0 },
      notes: ["No cook tracker data found. Complete the Cook Tracker to generate a confidence score."],
    };
  }

  const allEvents = events ?? [];
  const notes: string[] = [];

  // ── A. PIT STABILITY (0–25) ─────────────────────────────────────────────
  let pitStability = 25;

  const tempRange = (outcome.pit_temp_high ?? 0) - (outcome.pit_temp_low ?? 0);
  if (tempRange > 100) { pitStability -= 12; }
  else if (tempRange > 75) { pitStability -= 8; }
  else if (tempRange > 50) { pitStability -= 4; }
  else if (tempRange <= 25 && tempRange > 0) { pitStability += 0; } // full marks

  const spikeEvents = allEvents.filter((e: any) =>
    e.note?.toLowerCase().includes("spike") || e.note?.toLowerCase().includes("too hot")
  );
  pitStability -= Math.min(spikeEvents.length * 3, 9);

  const dipEvents = allEvents.filter((e: any) =>
    e.note?.toLowerCase().includes("dip") || e.note?.toLowerCase().includes("too cold") || e.note?.toLowerCase().includes("dropped")
  );
  pitStability -= Math.min(dipEvents.length * 2, 6);

  if (outcome.fire_issues && outcome.fire_issues.trim().length > 5) {
    pitStability -= 4;
    notes.push("Fire issues were logged — stabilize your fire before adding meat next time.");
  }

  if (pitStability >= 22) {
    notes.push("Your pit was extremely stable — great fire control throughout the cook.");
  } else if (pitStability >= 15) {
    notes.push("Moderate pit variance. Tighter vent management will reduce those swings.");
  } else {
    notes.push("Chaotic pit temp — focus on stabilization before the meat goes on.");
  }

  pitStability = clamp(pitStability, 0, 25);

  // ── B. PLAN ADHERENCE (0–25) ────────────────────────────────────────────
  let planAdherence = 25;
  let adherenceDeductions = 0;

  if (outcome.start_time_actual && cook.created_at) {
    const startDiff = diffMinutes(cook.created_at, outcome.start_time_actual);
    if (startDiff > 60) adherenceDeductions += 5;
    else if (startDiff > 30) adherenceDeductions += 3;
    else if (startDiff > 15) adherenceDeductions += 1;
  }

  if (outcome.finish_time_actual && cook.eat_time) {
    const finishDiff = diffMinutes(cook.eat_time, outcome.finish_time_actual);
    if (finishDiff > 90) {
      adherenceDeductions += 8;
      notes.push("Cook finished well off your planned eat time — build a larger buffer into your next timeline.");
    } else if (finishDiff > 45) {
      adherenceDeductions += 5;
    } else if (finishDiff > 20) {
      adherenceDeductions += 2;
    }
  }

  if (outcome.rest_time_minutes) {
    if (outcome.rest_time_minutes < 30) adherenceDeductions += 5;
    else if (outcome.rest_time_minutes < 45) adherenceDeductions += 2;
  }

  planAdherence = clamp(planAdherence - adherenceDeductions, 0, 25);

  if (planAdherence >= 22) {
    notes.push("Your cook closely followed the plan — great timeline discipline.");
  } else if (planAdherence < 15) {
    notes.push("Large deviations from the plan. Use the timeline as a hard anchor, not a suggestion.");
  }

  // ── C. OUTCOME CONSISTENCY (0–25) ──────────────────────────────────────
  let outcomeConsistency = 0;
  const ratingFields = [
    outcome.tenderness,
    outcome.bark_quality,
    outcome.moisture_level,
    outcome.smoke_profile,
    outcome.flavor_balance,
    outcome.overall_success,
  ].filter((v): v is number => v != null);

  if (ratingFields.length > 0) {
    const avgRating = ratingFields.reduce((a, b) => a + b, 0) / ratingFields.length;
    const variance = ratingFields.reduce((sum, v) => sum + Math.pow(v - avgRating, 2), 0) / ratingFields.length;

    if (avgRating >= 4.5) outcomeConsistency = 25;
    else if (avgRating >= 4.0) outcomeConsistency = 22;
    else if (avgRating >= 3.5) outcomeConsistency = 18;
    else if (avgRating >= 3.0) outcomeConsistency = 14;
    else if (avgRating >= 2.5) outcomeConsistency = 10;
    else outcomeConsistency = 5;

    // Penalize high variance even at decent averages
    if (variance > 2) outcomeConsistency = Math.max(outcomeConsistency - 5, 0);

    const lowRatings = ratingFields.filter(v => v <= 2).length;
    if (lowRatings >= 2) {
      notes.push("Multiple outcome ratings were low — focus on the weakest category first.");
    }

    const highRatings = ratingFields.filter(v => v >= 4).length;
    if (highRatings >= 4) {
      notes.push(`Strong outcomes across ${highRatings} of ${ratingFields.length} categories — this was a quality cook.`);
    }
  }

  outcomeConsistency = clamp(outcomeConsistency, 0, 25);

  // ── D. COOK EFFICIENCY (0–25) ───────────────────────────────────────────
  let cookEfficiency = 25;

  const lidEvents = allEvents.filter((e: any) =>
    e.note?.toLowerCase().includes("opened lid") || e.note?.toLowerCase().includes("checked temp")
  );
  cookEfficiency -= Math.min(lidEvents.length * 2, 8);

  const adjustmentEvents = allEvents.filter((e: any) =>
    e.event_type?.toLowerCase().includes("adjustment") ||
    e.note?.toLowerCase().includes("adjusted") ||
    e.note?.toLowerCase().includes("changed")
  );
  cookEfficiency -= Math.min(adjustmentEvents.length * 2, 8);

  if (outcome.adjustments_made && outcome.adjustments_made.trim().length > 10) {
    cookEfficiency -= 4;
    notes.push(`Mid-cook adjustments were needed: "${outcome.adjustments_made.slice(0, 60)}${outcome.adjustments_made.length > 60 ? "..." : ""}"`);
  }

  if (cookEfficiency >= 22) {
    notes.push("Smooth cook execution — minimal interventions needed.");
  } else if (cookEfficiency < 12) {
    notes.push("Frequent corrections throughout the cook. A stable pre-cook setup reduces mid-cook chaos.");
  }

  cookEfficiency = clamp(cookEfficiency, 0, 25);

  // ── FINAL SCORE ─────────────────────────────────────────────────────────
  const score = clamp(pitStability + planAdherence + outcomeConsistency + cookEfficiency, 0, 100);

  return {
    score,
    breakdown: {
      pitStability,
      planAdherence,
      outcomeConsistency,
      cookEfficiency,
    },
    notes: notes.slice(0, 5),
  };
}