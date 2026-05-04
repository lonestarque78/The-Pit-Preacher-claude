// lib/insights/generateCookVariabilityIndex.ts

import { createServerClient } from "@/lib/supabase-server";

export interface CookVariabilityIndex {
  index: number;
  components: {
    timingVariability: number;
    pitVariability: number;
    outcomeVariability: number;
  };
  notes: string[];
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return Math.sqrt(variance);
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

// Convert a std dev to a 0–100 consistency score
// Lower std dev = higher score
function consistencyScore(sd: number, maxSd: number): number {
  if (maxSd === 0) return 100;
  return clamp(Math.round(100 - (sd / maxSd) * 100), 0, 100);
}

export async function generateCookVariabilityIndex(userId: string): Promise<CookVariabilityIndex> {
  const supabase = await createServerClient();

  const { data: cooks } = await supabase
    .from("cooks")
    .select("id, created_at, completed_at, eat_time")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(20);

  if (!cooks || cooks.length < 3) {
    return {
      index: 0,
      components: { timingVariability: 0, pitVariability: 0, outcomeVariability: 0 },
      notes: ["Track at least 3 completed cooks to compute your Cook Variability Index."],
    };
  }

  const cookIds = cooks.map((c: any) => c.id);

  const [{ data: outcomes }, { data: events }] = await Promise.all([
    supabase.from("cook_outcomes").select("*").in("cook_id", cookIds),
    supabase.from("cook_events").select("*").in("cook_id", cookIds),
  ]);

  const outcomeMap: Record<string, any> = {};
  for (const o of outcomes ?? []) outcomeMap[o.cook_id] = o;

  const trackedCooks = cooks.filter((c: any) => outcomeMap[c.id]);
  const allEvents = events ?? [];

  if (trackedCooks.length < 2) {
    return {
      index: 0,
      components: { timingVariability: 0, pitVariability: 0, outcomeVariability: 0 },
      notes: ["Complete the Cook Tracker on more cooks to generate your variability index."],
    };
  }

  const notes: string[] = [];

  // ── TIMING VARIABILITY ──────────────────────────────────────────────────
  const cookDurations: number[] = [];
  for (const c of trackedCooks) {
    const o = outcomeMap[c.id];
    if (o?.start_time_actual && o?.finish_time_actual) {
      const mins = (new Date(o.finish_time_actual).getTime() - new Date(o.start_time_actual).getTime()) / 60000;
      if (mins > 0) cookDurations.push(mins);
    } else if (c.created_at && c.completed_at) {
      const mins = (new Date(c.completed_at).getTime() - new Date(c.created_at).getTime()) / 60000;
      if (mins > 0) cookDurations.push(mins);
    }
  }

  const stallDurations = trackedCooks.map((c: any) => outcomeMap[c.id]?.stall_time_minutes).filter(Boolean);
  const restDurations = trackedCooks.map((c: any) => outcomeMap[c.id]?.rest_time_minutes).filter(Boolean);

  const durationSd = stdDev(cookDurations);
  const stallSd = stdDev(stallDurations);
  const restSd = stdDev(restDurations);

  // Max expected std devs for normalization
  const durationScore = consistencyScore(durationSd, 120); // 120 min sd = chaotic
  const stallScore = stallDurations.length >= 2 ? consistencyScore(stallSd, 90) : 75;
  const restScore = restDurations.length >= 2 ? consistencyScore(restSd, 45) : 75;

  const timingVariability = Math.round((durationScore + stallScore + restScore) / 3);

  if (timingVariability >= 80) {
    notes.push(`Your cook times are highly consistent — ${trackedCooks.length} cooks with low timing variance.`);
  } else if (timingVariability >= 55) {
    notes.push("Moderate timing variance. Your cook durations are predictable but not locked in yet.");
  } else {
    notes.push("High timing variance. Your cook durations swing significantly — build tighter timelines and buffer time.");
  }

  // ── PIT VARIABILITY ─────────────────────────────────────────────────────
  const tempRanges = trackedCooks
    .map((c: any) => {
      const o = outcomeMap[c.id];
      return o?.pit_temp_low && o?.pit_temp_high ? o.pit_temp_high - o.pit_temp_low : null;
    })
    .filter((v): v is number => v !== null);

  const spikeEvents = allEvents.filter((e: any) =>
    e.note?.toLowerCase().includes("spike") || e.note?.toLowerCase().includes("too hot")
  );
  const dipEvents = allEvents.filter((e: any) =>
    e.note?.toLowerCase().includes("dip") || e.note?.toLowerCase().includes("dropped")
  );

  const avgTempRange = avg(tempRanges);
  const tempRangeSd = stdDev(tempRanges);
  const spikesPerCook = trackedCooks.length > 0 ? spikeEvents.length / trackedCooks.length : 0;
  const dipsPerCook = trackedCooks.length > 0 ? dipEvents.length / trackedCooks.length : 0;

  let pitVariability = 100;
  if (avgTempRange > 75) pitVariability -= 30;
  else if (avgTempRange > 50) pitVariability -= 20;
  else if (avgTempRange > 25) pitVariability -= 10;

  pitVariability -= Math.min(spikesPerCook * 10, 30);
  pitVariability -= Math.min(dipsPerCook * 8, 24);
  pitVariability -= Math.min(consistencyScore(tempRangeSd, 40) < 60 ? 15 : 0, 15);

  pitVariability = clamp(Math.round(pitVariability), 0, 100);

  if (pitVariability >= 80) {
    notes.push("Pit behavior is stable across cooks — consistent temp management is showing in your results.");
  } else if (pitVariability >= 55) {
    notes.push("Pit behavior is moderately consistent. Spikes and dips are present but not chronic.");
  } else {
    notes.push("Pit behavior is still volatile — spikes and dips are frequent. Focus on pre-cook stabilization.");
  }

  // ── OUTCOME VARIABILITY ─────────────────────────────────────────────────
  const ratingFields = ["tenderness", "bark_quality", "moisture_level", "smoke_profile", "flavor_balance", "overall_success"];
  const fieldSds: number[] = [];

  for (const field of ratingFields) {
    const vals = trackedCooks.map((c: any) => outcomeMap[c.id]?.[field]).filter((v): v is number => v != null);
    if (vals.length >= 2) fieldSds.push(stdDev(vals));
  }

  const avgOutcomeSd = avg(fieldSds);
  const outcomeVariability = consistencyScore(avgOutcomeSd, 2); // 2 point sd = very inconsistent for 1-5 scale

  if (outcomeVariability >= 80) {
    notes.push("Outcome quality is stabilizing — ratings are clustering tightly across recent cooks.");
  } else if (outcomeVariability >= 55) {
    notes.push("Moderate outcome variance. Some categories are consistent, others still swinging.");
  } else {
    notes.push("High outcome variance. Results are unpredictable cook to cook — narrow your variables.");
  }

  // ── FINAL INDEX ─────────────────────────────────────────────────────────
  const index = clamp(Math.round((timingVariability + pitVariability + outcomeVariability) / 3), 0, 100);

  if (index >= 75) {
    notes.push(`Cook Variability Index of ${index} — your process is repeatable and improving.`);
  } else if (index >= 50) {
    notes.push(`Cook Variability Index of ${index} — solid foundation, room to tighten consistency.`);
  } else {
    notes.push(`Cook Variability Index of ${index} — focus on one variable at a time to reduce variance.`);
  }

  return {
    index,
    components: { timingVariability, pitVariability, outcomeVariability },
    notes: notes.slice(0, 5),
  };
}