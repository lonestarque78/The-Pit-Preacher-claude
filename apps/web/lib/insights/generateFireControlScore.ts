// lib/insights/generateFireControlScore.ts

import { createServerClient } from "@/lib/supabase-server";

export interface FireControlScore {
  score: number;
  breakdown: {
    stability: number;
    responsiveness: number;
    efficiency: number;
  };
  notes: string[];
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export async function generateFireControlScore(
  cookId: string,
  userId: string
): Promise<FireControlScore> {
  const supabase = await createServerClient();

  const [{ data: cook }, { data: outcome }, { data: events }] = await Promise.all([
    supabase.from("cooks").select("*").eq("id", cookId).eq("user_id", userId).single(),
    supabase.from("cook_outcomes").select("*").eq("cook_id", cookId).maybeSingle(),
    supabase.from("cook_events").select("*").eq("cook_id", cookId).order("created_at", { ascending: true }),
  ]);

  if (!cook || !outcome) {
    return {
      score: 0,
      breakdown: { stability: 0, responsiveness: 0, efficiency: 0 },
      notes: ["No cook tracker data found. Complete the Cook Tracker to generate a Fire Control Score."],
    };
  }

  const allEvents = events ?? [];
  const notes: string[] = [];

  // ── STABILITY (0–100) ────────────────────────────────────────────────────
  let stability = 100;

  const tempRange = (outcome.pit_temp_high ?? 0) - (outcome.pit_temp_low ?? 0);
  if (tempRange > 100) stability -= 35;
  else if (tempRange > 75) stability -= 25;
  else if (tempRange > 50) stability -= 15;
  else if (tempRange > 30) stability -= 7;

  const spikeEvents = allEvents.filter((e: any) =>
    e.note?.toLowerCase().includes("spike") || e.note?.toLowerCase().includes("too hot")
  );
  stability -= Math.min(spikeEvents.length * 8, 32);

  const dipEvents = allEvents.filter((e: any) =>
    e.note?.toLowerCase().includes("dip") || e.note?.toLowerCase().includes("dropped") || e.note?.toLowerCase().includes("too cold")
  );
  stability -= Math.min(dipEvents.length * 6, 24);

  if (outcome.fire_issues && outcome.fire_issues.trim().length > 5) {
    stability -= 10;
  }

  stability = clamp(stability, 0, 100);

  if (stability >= 80) {
    notes.push("You maintained a tight temp window — excellent pit stability throughout the cook.");
  } else if (stability >= 55) {
    notes.push("Moderate pit stability. Some swings but nothing catastrophic.");
  } else {
    notes.push("Chaotic pit behavior — temp swings affected the cook. Focus on fire stabilization before adding meat.");
  }

  // ── RESPONSIVENESS (0–100) ──────────────────────────────────────────────
  // Measure: how fast does the pit recover after spikes/dips
  // We infer this from spike/dip count vs cook duration
  let responsiveness = 100;

  const cookDurationMins = outcome.start_time_actual && outcome.finish_time_actual
    ? (new Date(outcome.finish_time_actual).getTime() - new Date(outcome.start_time_actual).getTime()) / 60000
    : 0;

  const totalDeviations = spikeEvents.length + dipEvents.length;

  if (totalDeviations === 0) {
    responsiveness = 95; // clean cook
  } else if (cookDurationMins > 0) {
    // If deviations resolve quickly relative to cook time, responsiveness is high
    const deviationDensity = totalDeviations / (cookDurationMins / 60);
    if (deviationDensity > 4) responsiveness -= 40;
    else if (deviationDensity > 2) responsiveness -= 25;
    else if (deviationDensity > 1) responsiveness -= 12;
  } else {
    responsiveness -= Math.min(totalDeviations * 10, 40);
  }

  // Fire issues flag slow recovery
  if (outcome.fire_issues && outcome.fire_issues.trim().length > 5) {
    responsiveness -= 15;
  }

  responsiveness = clamp(responsiveness, 0, 100);

  if (responsiveness >= 80) {
    notes.push("Recovery after deviations was fast — your adjustments were timely and measured.");
  } else if (responsiveness < 55) {
    notes.push("Recovery after spikes or dips was slow. Consider smaller fuel additions to avoid over-correction.");
  }

  // ── EFFICIENCY (0–100) ──────────────────────────────────────────────────
  let efficiency = 100;

  const lidEvents = allEvents.filter((e: any) =>
    e.note?.toLowerCase().includes("opened lid") || e.note?.toLowerCase().includes("checked temp")
  );
  efficiency -= Math.min(lidEvents.length * 5, 30);

  const adjustmentEvents = allEvents.filter((e: any) =>
    e.note?.toLowerCase().includes("adjusted") || e.note?.toLowerCase().includes("changed vent")
  );
  efficiency -= Math.min(adjustmentEvents.length * 4, 24);

  if (outcome.adjustments_made && outcome.adjustments_made.trim().length > 10) {
    efficiency -= 10;
  }

  efficiency = clamp(efficiency, 0, 100);

  if (efficiency >= 80) {
    notes.push("Smooth fire management — minimal interventions needed throughout the cook.");
  } else if (efficiency < 55) {
    notes.push(`Frequent lid openings (${lidEvents.length}) and adjustments contributed to temp swings. Set a check schedule.`);
  }

  // ── FINAL SCORE ─────────────────────────────────────────────────────────
  const score = clamp(Math.round((stability + responsiveness + efficiency) / 3), 0, 100);

  if (score >= 80) {
    notes.push("Excellent fire control this cook. Replicate this setup.");
  } else if (score >= 60) {
    notes.push("Solid fire control with room to tighten up. Focus on your weakest component next time.");
  } else {
    notes.push("Fire management was the main challenge this cook. A stable pre-cook setup will solve most of this.");
  }

  return {
    score,
    breakdown: { stability, responsiveness, efficiency },
    notes: notes.slice(0, 5),
  };
}