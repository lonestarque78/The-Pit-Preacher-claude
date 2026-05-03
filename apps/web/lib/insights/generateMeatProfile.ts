// lib/insights/generateMeatProfile.ts

import { createServerClient } from "@/lib/supabase-server";

export interface MeatProfile {
  meatType: string;
  strengths: string[];
  weaknesses: string[];
  tendencies: string[];
  timingProfile: {
    averageCookTime: number;
    averageStallTime: number;
    averageWrapTime: string | null;
    averageRestTime: number;
  };
  pitBehavior: string[];
  outcomeAverages: {
    tenderness: number;
    bark: number;
    moisture: number;
    smoke: number;
    flavor: number;
    overall: number;
  };
  recommendedStrategy: string[];
  cookCount: number;
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

function diffMinutes(a: string, b: string): number {
  return Math.abs(new Date(b).getTime() - new Date(a).getTime()) / 60000;
}

import { normalizeMeatType, MEAT_KEYWORDS } from "@/lib/insights/normalizers";
export { normalizeMeatType };

export async function generateMeatProfile(
  userId: string,
  meatType: string
): Promise<MeatProfile | null> {
  const supabase = await createServerClient();

  const { data: allCooks } = await supabase
    .from("cooks")
    .select("id, label, smoker_type, created_at, completed_at, eat_time")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(30);

  if (!allCooks || allCooks.length === 0) return null;

  const keywords = MEAT_KEYWORDS[meatType] ?? [meatType];
  const matchingCooks = allCooks.filter((c: any) =>
    keywords.some(k => (c.label ?? "").toLowerCase().includes(k))
  ).slice(0, 10);

  if (matchingCooks.length === 0) return null;

  const cookIds = matchingCooks.map((c: any) => c.id);

  const [
    { data: outcomes },
    { data: events },
    { data: trackerNotes },
  ] = await Promise.all([
    supabase.from("cook_outcomes").select("*").in("cook_id", cookIds),
    supabase.from("cook_events").select("*").in("cook_id", cookIds),
    supabase.from("cook_tracker_notes").select("*").in("cook_id", cookIds),
  ]);

  const outcomeMap: Record<string, any> = {};
  for (const o of outcomes ?? []) outcomeMap[o.cook_id] = o;

  const trackedCooks = matchingCooks.filter((c: any) => outcomeMap[c.id]);
  const allEvents = events ?? [];
  const allNotes = trackerNotes ?? [];

  // ── OUTCOME AVERAGES ────────────────────────────────────────────────────
  const tValues = trackedCooks.map((c: any) => outcomeMap[c.id]?.tenderness).filter(Boolean);
  const bValues = trackedCooks.map((c: any) => outcomeMap[c.id]?.bark_quality).filter(Boolean);
  const mValues = trackedCooks.map((c: any) => outcomeMap[c.id]?.moisture_level).filter(Boolean);
  const sValues = trackedCooks.map((c: any) => outcomeMap[c.id]?.smoke_profile).filter(Boolean);
  const fValues = trackedCooks.map((c: any) => outcomeMap[c.id]?.flavor_balance).filter(Boolean);
  const oValues = trackedCooks.map((c: any) => outcomeMap[c.id]?.overall_success).filter(Boolean);

  const outcomeAverages = {
    tenderness: avg(tValues),
    bark: avg(bValues),
    moisture: avg(mValues),
    smoke: avg(sValues),
    flavor: avg(fValues),
    overall: avg(oValues),
  };

  // ── TIMING PROFILE ──────────────────────────────────────────────────────
  const cookTimes: number[] = [];
  for (const c of trackedCooks) {
    const o = outcomeMap[c.id];
    if (o?.start_time_actual && o?.finish_time_actual) {
      cookTimes.push(diffMinutes(o.start_time_actual, o.finish_time_actual));
    } else if (c.created_at && c.completed_at) {
      cookTimes.push(diffMinutes(c.created_at, c.completed_at));
    }
  }

  const stallTimes = trackedCooks
    .map((c: any) => outcomeMap[c.id]?.stall_time_minutes)
    .filter(Boolean);

  const restTimes = trackedCooks
    .map((c: any) => outcomeMap[c.id]?.rest_time_minutes)
    .filter(Boolean);

  const wrapTimes = trackedCooks
    .map((c: any) => outcomeMap[c.id]?.wrap_time)
    .filter(Boolean)
    .map((t: string) => new Date(t).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }));

  const timingProfile = {
    averageCookTime: Math.round(avg(cookTimes)),
    averageStallTime: Math.round(avg(stallTimes)),
    averageWrapTime: wrapTimes.length > 0 ? wrapTimes[0] ?? null : null,
    averageRestTime: Math.round(avg(restTimes)),
  };

  // ── STRENGTHS ───────────────────────────────────────────────────────────
  const strengths: string[] = [];

  if (outcomeAverages.tenderness >= 4) {
    strengths.push(`Your ${meatType} tenderness averages ${outcomeAverages.tenderness}/5 — consistently strong probe results.`);
  }
  if (outcomeAverages.bark >= 4) {
    strengths.push(`Bark development on your ${meatType} is a strength — averaging ${outcomeAverages.bark}/5.`);
  }
  if (outcomeAverages.moisture >= 4) {
    strengths.push(`Moisture retention is solid — your ${meatType} is finishing juicy across multiple cooks.`);
  }
  if (outcomeAverages.smoke >= 4) {
    strengths.push(`Strong smoke profile on your ${meatType} — your wood choice and timing are dialed in.`);
  }
  if (outcomeAverages.overall >= 4) {
    strengths.push(`Overall ${meatType} execution is strong — ${outcomeAverages.overall}/5 average across tracked cooks.`);
  }
  if (timingProfile.averageCookTime > 0 && cookTimes.length >= 3) {
    const variance = cookTimes.reduce((sum, t) => sum + Math.pow(t - avg(cookTimes), 2), 0) / cookTimes.length;
    if (Math.sqrt(variance) < 45) {
      strengths.push(`Your ${meatType} cook times are predictable — low variance across ${cookTimes.length} cooks.`);
    }
  }
  if (strengths.length === 0) {
    strengths.push(`Not enough data yet to identify strengths. Track more ${meatType} cooks.`);
  }

  // ── WEAKNESSES ──────────────────────────────────────────────────────────
  const weaknesses: string[] = [];

  if (outcomeAverages.tenderness > 0 && outcomeAverages.tenderness < 3) {
    weaknesses.push(`Tenderness is your weakest category at ${outcomeAverages.tenderness}/5. Go longer, not hotter — probe feel beats temperature.`);
  }
  if (outcomeAverages.bark > 0 && outcomeAverages.bark < 3) {
    weaknesses.push(`Bark averages ${outcomeAverages.bark}/5. Wrap timing is likely the issue — let the crust set before sealing.`);
  }
  if (outcomeAverages.moisture > 0 && outcomeAverages.moisture < 3) {
    weaknesses.push(`Moisture retention is a recurring problem at ${outcomeAverages.moisture}/5. Drop your pit temp 10–15°F and extend rest time.`);
  }
  if (outcomeAverages.flavor > 0 && outcomeAverages.flavor < 3) {
    weaknesses.push(`Flavor balance is averaging ${outcomeAverages.flavor}/5. Audit your rub ratio and salt timing.`);
  }

  const fireIssueCooks = trackedCooks.filter((c: any) =>
    outcomeMap[c.id]?.fire_issues && outcomeMap[c.id].fire_issues.trim().length > 5
  );
  if (fireIssueCooks.length >= 2) {
    weaknesses.push(`Fire management issues logged in ${fireIssueCooks.length} ${meatType} cooks. Stabilize your fire before the meat goes on.`);
  }

  if (weaknesses.length === 0 && trackedCooks.length >= 2) {
    weaknesses.push(`No persistent weaknesses detected across your ${meatType} cooks. Keep tracking to surface patterns.`);
  }

  // ── TENDENCIES ──────────────────────────────────────────────────────────
  const tendencies: string[] = [];

  const tempRanges = trackedCooks
    .map((c: any) => {
      const o = outcomeMap[c.id];
      return o?.pit_temp_low && o?.pit_temp_high ? o.pit_temp_high - o.pit_temp_low : null;
    })
    .filter((v): v is number => v !== null);

  if (tempRanges.length >= 2 && avg(tempRanges) > 60) {
    tendencies.push(`Your pit tends to swing wide on ${meatType} cooks — average ${Math.round(avg(tempRanges))}°F variance. Tighter vent management will tighten this.`);
  }

  const longStalls = trackedCooks.filter((c: any) =>
    outcomeMap[c.id]?.stall_time_minutes && outcomeMap[c.id].stall_time_minutes > 150
  );
  if (longStalls.length >= 2) {
    tendencies.push(`Your ${meatType} stalls tend to run long — over 2.5 hours in ${longStalls.length} cooks. Plan for it and wrap at the 2-hour mark when time is tight.`);
  }

  const shortRests = trackedCooks.filter((c: any) =>
    outcomeMap[c.id]?.rest_time_minutes && outcomeMap[c.id].rest_time_minutes < 45
  );
  if (shortRests.length >= 2) {
    tendencies.push(`You tend to rest your ${meatType} less than 45 minutes. Extend to at least 60 minutes — it directly improves tenderness and moisture.`);
  }

  const lidEventCounts = trackedCooks.map((c: any) =>
    allEvents.filter((e: any) =>
      e.cook_id === c.id &&
      (e.note?.toLowerCase().includes("opened lid") || e.note?.toLowerCase().includes("checked temp"))
    ).length
  );
  if (avg(lidEventCounts) >= 3) {
    tendencies.push(`You average ${Math.round(avg(lidEventCounts))} lid openings per ${meatType} cook. Each one costs you temp and extends the stall.`);
  }

  if (tendencies.length === 0) {
    tendencies.push(`No strong tendencies detected yet. Track more ${meatType} cooks to surface your patterns.`);
  }

  // ── PIT BEHAVIOR ────────────────────────────────────────────────────────
  const pitBehavior: string[] = [];

  const pitTypes = [...new Set(matchingCooks.map((c: any) => (c.smoker_type ?? "").toLowerCase()).filter(Boolean))];

  for (const pit of pitTypes) {
    const pitCooks = trackedCooks.filter((c: any) => (c.smoker_type ?? "").toLowerCase() === pit);
    if (pitCooks.length === 0) continue;

    const pitStalls = pitCooks.map((c: any) => outcomeMap[c.id]?.stall_time_minutes).filter(Boolean);
    if (pitStalls.length >= 2) {
      pitBehavior.push(`Your ${pit} produces ${Math.round(avg(pitStalls))}-minute stalls on ${meatType} on average.`);
    }

    const pitRanges = pitCooks
      .map((c: any) => {
        const o = outcomeMap[c.id];
        return o?.pit_temp_low && o?.pit_temp_high ? o.pit_temp_high - o.pit_temp_low : null;
      })
      .filter((v): v is number => v !== null);

    if (pitRanges.length >= 2 && avg(pitRanges) > 50) {
      pitBehavior.push(`Your ${pit} swings ${Math.round(avg(pitRanges))}°F on ${meatType} cooks — tighten your vent management for this cut.`);
    } else if (pitRanges.length >= 2 && avg(pitRanges) <= 30) {
      pitBehavior.push(`Your ${pit} holds tight on ${meatType} — ${Math.round(avg(pitRanges))}°F average variance. Consistent pit management.`);
    }
  }

  if (pitBehavior.length === 0) {
    pitBehavior.push(`More tracked cooks needed to profile your pit behavior on ${meatType}.`);
  }

  // ── RECOMMENDED STRATEGY ────────────────────────────────────────────────
  const recommendedStrategy: string[] = [];

  // From tracker notes across all cooks
  const allNoteTexts = allNotes.flatMap((n: any) =>
    [n.note_1, n.note_2, n.note_3, n.note_4, n.note_5].filter(Boolean) as string[]
  );
  allNoteTexts.slice(0, 2).forEach(note => recommendedStrategy.push(note));

  if (outcomeAverages.bark > 0 && outcomeAverages.bark < 3.5) {
    recommendedStrategy.push(`Delay your wrap until the bark resists a finger press — your ${meatType} bark average is ${outcomeAverages.bark}/5.`);
  }
  if (outcomeAverages.moisture > 0 && outcomeAverages.moisture < 3.5) {
    recommendedStrategy.push(`Drop pit temp 10°F and add 30 minutes to rest time — your moisture average is ${outcomeAverages.moisture}/5.`);
  }
  if (timingProfile.averageRestTime > 0 && timingProfile.averageRestTime < 50) {
    recommendedStrategy.push(`Your average rest is ${timingProfile.averageRestTime} minutes. Push it to at least 60 — longer rests improve both tenderness and moisture.`);
  }
  if (timingProfile.averageCookTime > 0) {
    const hours = Math.floor(timingProfile.averageCookTime / 60);
    const mins = timingProfile.averageCookTime % 60;
    const display = mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    recommendedStrategy.push(`Your ${meatType} averages ${display} of cook time. Build in a 90-minute buffer and plan your start time accordingly.`);
  }

  if (recommendedStrategy.length === 0) {
    recommendedStrategy.push(`Track more ${meatType} cooks to generate a personalized strategy.`);
  }

  return {
    meatType,
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 4),
    tendencies: tendencies.slice(0, 4),
    timingProfile,
    pitBehavior: pitBehavior.slice(0, 4),
    outcomeAverages,
    recommendedStrategy: recommendedStrategy.slice(0, 5),
    cookCount: matchingCooks.length,
  };
}