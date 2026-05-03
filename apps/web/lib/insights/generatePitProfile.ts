// lib/insights/generatePitProfile.ts

import { createServerClient } from "@/lib/supabase-server";

export interface PitProfile {
  pitType: string;
  stability: string[];
  quirks: string[];
  heatProfile: {
    averageLow: number;
    averageHigh: number;
    spikeFrequency: number;
    dipFrequency: number;
    stabilizationTime: number;
  };
  behaviorByMeat: Record<string, string[]>;
  weatherSensitivity: string[];
  adjustmentPatterns: string[];
  strengths: string[];
  weaknesses: string[];
  recommendedFireStrategy: string[];
  cookCount: number;
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

import { normalizeMeatType as detectMeat, MEAT_KEYWORDS } from "@/lib/insights/normalizers";

const PIT_STABILIZATION: Record<string, number> = {
  offset: 30,
  pellet: 15,
  kamado: 25,
  kettle: 20,
  drum: 15,
  cabinet: 20,
  vertical: 20,
  electric: 10,
};

function getStabilizationTime(pitType: string): number {
  const key = Object.keys(PIT_STABILIZATION).find(k => pitType.toLowerCase().includes(k));
  return key ? (PIT_STABILIZATION[key] ?? 20) : 20;
}

import { normalizePitType } from "@/lib/insights/normalizers";
export { normalizePitType };

export async function generatePitProfile(
  userId: string,
  pitType: string
): Promise<PitProfile | null> {
  const supabase = await createServerClient();

  const { data: allCooks } = await supabase
    .from("cooks")
    .select("id, label, smoker_type, created_at, completed_at")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(30);

  if (!allCooks || allCooks.length === 0) return null;

  const normalizedTarget = normalizePitType(pitType);
  const matchingCooks = allCooks.filter((c: any) =>
    normalizePitType(c.smoker_type ?? "") === normalizedTarget
  ).slice(0, 15);

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

  // ── HEAT PROFILE ────────────────────────────────────────────────────────
  const lowTemps = trackedCooks.map((c: any) => outcomeMap[c.id]?.pit_temp_low).filter(Boolean);
  const highTemps = trackedCooks.map((c: any) => outcomeMap[c.id]?.pit_temp_high).filter(Boolean);

  const spikeEvents = allEvents.filter((e: any) =>
    e.note?.toLowerCase().includes("spike") || e.note?.toLowerCase().includes("too hot")
  );
  const dipEvents = allEvents.filter((e: any) =>
    e.note?.toLowerCase().includes("dip") || e.note?.toLowerCase().includes("dropped") || e.note?.toLowerCase().includes("too cold")
  );

  const spikeFrequency = trackedCooks.length > 0 ? Math.round((spikeEvents.length / trackedCooks.length) * 10) / 10 : 0;
  const dipFrequency = trackedCooks.length > 0 ? Math.round((dipEvents.length / trackedCooks.length) * 10) / 10 : 0;

  const heatProfile = {
    averageLow: Math.round(avg(lowTemps)),
    averageHigh: Math.round(avg(highTemps)),
    spikeFrequency,
    dipFrequency,
    stabilizationTime: getStabilizationTime(pitType),
  };

  // ── STABILITY ───────────────────────────────────────────────────────────
  const stability: string[] = [];

  const avgRange = avg(
    trackedCooks
      .map((c: any) => {
        const o = outcomeMap[c.id];
        return o?.pit_temp_low && o?.pit_temp_high ? o.pit_temp_high - o.pit_temp_low : null;
      })
      .filter((v): v is number => v !== null)
  );

  if (avgRange > 0 && avgRange <= 25) {
    stability.push(`Your ${pitType} holds temperature tightly — average swing of ${avgRange}°F across tracked cooks.`);
  } else if (avgRange > 25 && avgRange <= 60) {
    stability.push(`Your ${pitType} shows moderate variance — ${avgRange}°F average swing. Tighter vent management will close this gap.`);
  } else if (avgRange > 60) {
    stability.push(`Wide temp variance on your ${pitType} — ${avgRange}°F average swing. This is a fire management issue, not a pit issue.`);
  }

  if (spikeFrequency >= 2) {
    stability.push(`Spikes average ${spikeFrequency} per cook. Your fire is reactive — make smaller vent adjustments and wait longer between changes.`);
  } else if (spikeFrequency < 0.5 && trackedCooks.length >= 3) {
    stability.push(`Low spike frequency — your fire management has improved or your pit type handles airflow well.`);
  }

  if (dipFrequency >= 2) {
    stability.push(`Dips average ${dipFrequency} per cook. Your fire is starving mid-cook — add fuel earlier and keep a coal bed going.`);
  }

  if (heatProfile.averageLow > 0 && heatProfile.averageHigh > 0) {
    stability.push(`Your ${pitType} operates between ${heatProfile.averageLow}°F and ${heatProfile.averageHigh}°F across tracked cooks.`);
  }

  if (stability.length === 0) {
    stability.push(`Not enough tracked data to profile stability. Complete more cooks with the tracker to build this section.`);
  }

  // ── QUIRKS ──────────────────────────────────────────────────────────────
  const quirks: string[] = [];

  const lidEvents = allEvents.filter((e: any) =>
    e.note?.toLowerCase().includes("opened lid") || e.note?.toLowerCase().includes("checked temp")
  );
  const avgLidOpenings = trackedCooks.length > 0 ? Math.round(lidEvents.length / trackedCooks.length) : 0;

  if (avgLidOpenings >= 4) {
    quirks.push(`Your ${pitType} sees ${avgLidOpenings} lid openings per cook on average. Each opening affects temp stability — set a check schedule.`);
  }

  if (normalizedTarget === "offset") {
    quirks.push("Offsets spike early when fresh splits are added. Add splits before the fire needs them, not after.");
    quirks.push("Hot spots near the firebox will cook meat faster on that side. Rotate or use a baffle.");
  }
  if (normalizedTarget === "kamado") {
    quirks.push("Kamados are slow to cool once overshot. Small vent adjustments only — wait 5 minutes before touching anything again.");
    quirks.push("Cold meat straight from the fridge can cause a temp dip on a kamado. Let it temper slightly first.");
  }
  if (normalizedTarget === "drum") {
    quirks.push("Drums respond fast to vent changes — faster than most pitmasters expect. Move slowly.");
    quirks.push("High humidity inside the drum amplifies smoke flavor. Use less wood than you think you need.");
  }
  if (normalizedTarget === "pellet") {
    quirks.push("Pellet grills lose temp when the hopper runs low. Check fuel levels every 3 hours on long cooks.");
    quirks.push("Fan cycling creates minor temp fluctuations every few minutes — normal behavior, not a problem.");
  }
  if (normalizedTarget === "kettle") {
    quirks.push("The coal bed shrinks faster than expected on a kettle. Add small amounts of fuel every 90 minutes on long cooks.");
    quirks.push("Bottom vent is your primary temp control on a kettle. Keep the top vent fully open.");
  }
  if (normalizedTarget === "electric") {
    quirks.push("Electric smokers cycle the heating element on and off — temp fluctuations of 10–15°F are normal.");
    quirks.push("Bark development suffers in the humid electric environment. Finish unwrapped at max temp for the last hour.");
  }

  // ── BEHAVIOR BY MEAT ────────────────────────────────────────────────────
  const behaviorByMeat: Record<string, string[]> = {};

  const meatGroups: Record<string, any[]> = {};
  for (const c of trackedCooks) {
    const meat = detectMeat(c.label ?? "");
    if (!meat) continue;
    if (!meatGroups[meat]) meatGroups[meat] = [];
    meatGroups[meat].push(outcomeMap[c.id]);
  }

  for (const [meat, meatOutcomes] of Object.entries(meatGroups)) {
    if (meatOutcomes.length === 0) continue;
    const insights: string[] = [];

    const stallTimes = meatOutcomes.filter((o: any) => o.stall_time_minutes).map((o: any) => o.stall_time_minutes);
    if (stallTimes.length >= 2) {
      insights.push(`Stalls on ${meat} average ${Math.round(avg(stallTimes))} minutes on this pit.`);
    }

    const barkScores = meatOutcomes.filter((o: any) => o.bark_quality).map((o: any) => o.bark_quality);
    if (barkScores.length >= 2 && avg(barkScores) >= 4) {
      insights.push(`Bark development on ${meat} is strong — ${avg(barkScores)}/5 average.`);
    } else if (barkScores.length >= 2 && avg(barkScores) < 3) {
      insights.push(`Bark on ${meat} struggles on this pit — ${avg(barkScores)}/5 average. Check wrap timing and finishing temp.`);
    }

    const tempRanges = meatOutcomes
      .filter((o: any) => o.pit_temp_low && o.pit_temp_high)
      .map((o: any) => o.pit_temp_high - o.pit_temp_low);
    if (tempRanges.length >= 2 && avg(tempRanges) > 50) {
      insights.push(`Pit variance is higher on ${meat} cooks — ${Math.round(avg(tempRanges))}°F average swing.`);
    }

    if (insights.length > 0) behaviorByMeat[meat] = insights;
  }

  // ── WEATHER SENSITIVITY ─────────────────────────────────────────────────
  const weatherSensitivity: string[] = [];

  const weatherCooks = trackedCooks.filter((c: any) =>
    outcomeMap[c.id]?.weather_impact && outcomeMap[c.id].weather_impact.trim().length > 3
  );

  if (weatherCooks.length >= 2) {
    weatherSensitivity.push(`Weather was noted as a factor in ${weatherCooks.length} of ${trackedCooks.length} tracked cooks on this pit.`);
    const notes = weatherCooks.map((c: any) => outcomeMap[c.id].weather_impact.toLowerCase());
    if (notes.some((n: string) => n.includes("wind"))) {
      weatherSensitivity.push("Wind is a recurring factor. Shield your firebox or reposition the pit on windy days.");
    }
    if (notes.some((n: string) => n.includes("cold"))) {
      weatherSensitivity.push("Cold weather extends your cook time. Add 20–30% to your time estimate when temps drop below 45°F.");
    }
    if (notes.some((n: string) => n.includes("rain") || n.includes("humid"))) {
      weatherSensitivity.push("Humidity affects your smoke behavior and stall duration. Plan for a longer stall in wet conditions.");
    }
  } else if (normalizedTarget === "offset") {
    weatherSensitivity.push("Offsets are the most weather-sensitive pit. Wind directly affects airflow and can cause massive temp swings.");
    weatherSensitivity.push("Cold weather adds 30–45 minutes to your fire stabilization time on an offset.");
  } else if (normalizedTarget === "kamado") {
    weatherSensitivity.push("Kamados are highly weather-resistant. Ceramic walls insulate against cold and wind effectively.");
  } else if (normalizedTarget === "pellet") {
    weatherSensitivity.push("Pellet grills handle weather reasonably well but cold temperatures increase pellet consumption significantly.");
  } else {
    weatherSensitivity.push("Track weather conditions in your Cook Tracker to build a weather sensitivity profile for this pit.");
  }

  // ── ADJUSTMENT PATTERNS ─────────────────────────────────────────────────
  const adjustmentPatterns: string[] = [];

  const adjustmentCooks = trackedCooks.filter((c: any) =>
    outcomeMap[c.id]?.adjustments_made && outcomeMap[c.id].adjustments_made.trim().length > 5
  );

  if (adjustmentCooks.length >= 2) {
    adjustmentPatterns.push(`Mid-cook adjustments were needed in ${adjustmentCooks.length} of ${trackedCooks.length} tracked cooks.`);
  }

  const avgAdjEvents = trackedCooks.length > 0
    ? Math.round(allEvents.filter((e: any) =>
        e.note?.toLowerCase().includes("adjusted") || e.note?.toLowerCase().includes("changed")
      ).length / trackedCooks.length)
    : 0;

  if (avgAdjEvents >= 3) {
    adjustmentPatterns.push(`You average ${avgAdjEvents} adjustments per cook on this pit. A more stable pre-cook setup will reduce this.`);
  } else if (avgAdjEvents <= 1 && trackedCooks.length >= 3) {
    adjustmentPatterns.push("Low adjustment frequency — your pre-cook setup is working and your pit is running predictably.");
  }

  if (adjustmentPatterns.length === 0) {
    adjustmentPatterns.push("Track more cooks to profile your adjustment patterns on this pit.");
  }

  // ── STRENGTHS ───────────────────────────────────────────────────────────
  const strengths: string[] = [];

  const avgOverall = avg(trackedCooks.map((c: any) => outcomeMap[c.id]?.overall_success).filter(Boolean));
  if (avgOverall >= 4) {
    strengths.push(`Strong overall results on this pit — ${avgOverall}/5 average across tracked cooks.`);
  }

  const avgBark = avg(trackedCooks.map((c: any) => outcomeMap[c.id]?.bark_quality).filter(Boolean));
  if (avgBark >= 4) {
    strengths.push(`Excellent bark development — ${avgBark}/5 average. This pit's heat profile suits bark formation.`);
  }

  const avgMoisture = avg(trackedCooks.map((c: any) => outcomeMap[c.id]?.moisture_level).filter(Boolean));
  if (avgMoisture >= 4) {
    strengths.push(`Strong moisture retention — ${avgMoisture}/5 average. The cook environment is working in your favor.`);
  }

  if (avgRange > 0 && avgRange <= 25) {
    strengths.push("Tight temperature control — this pit holds temp well when managed correctly.");
  }

  if (normalizedTarget === "pellet") {
    strengths.push("Consistency is the pellet grill's core strength. Set-and-nearly-forget reliability produces repeatable results.");
  }
  if (normalizedTarget === "kamado") {
    strengths.push("Exceptional fuel efficiency. A kamado uses a fraction of the charcoal that a kettle or drum requires for the same cook.");
  }
  if (normalizedTarget === "offset") {
    strengths.push("Unmatched smoke flavor potential. An offset running clean fire produces depth that no other pit type can match.");
  }

  if (strengths.length === 0) {
    strengths.push("Track more cooks to identify this pit's strengths.");
  }

  // ── WEAKNESSES ──────────────────────────────────────────────────────────
  const weaknesses: string[] = [];

  if (avgOverall > 0 && avgOverall < 3) {
    weaknesses.push(`Overall results on this pit average ${avgOverall}/5. The pit isn't the problem — work through the fundamentals.`);
  }

  if (avgBark > 0 && avgBark < 3) {
    weaknesses.push(`Bark is underperforming at ${avgBark}/5. This pit's environment may be too humid — try finishing unwrapped at higher temp.`);
  }

  if (spikeFrequency >= 2) {
    weaknesses.push(`High spike frequency (${spikeFrequency} per cook) suggests fire management needs attention on this pit.`);
  }

  if (normalizedTarget === "pellet") {
    weaknesses.push("Smoke flavor is the pellet grill's primary weakness. A smoke tube adds depth in the first two hours.");
  }
  if (normalizedTarget === "electric") {
    weaknesses.push("Bark development and smoke depth are both limited on electric. Compensate with finishing heat and early chip loading.");
  }
  if (normalizedTarget === "kettle") {
    weaknesses.push("Limited cook capacity and active coal management make the kettle demanding on long cooks.");
  }

  if (weaknesses.length === 0) {
    weaknesses.push("No persistent weaknesses detected on this pit. Keep tracking to surface patterns.");
  }

  // ── RECOMMENDED FIRE STRATEGY ───────────────────────────────────────────
  const recommendedFireStrategy: string[] = [];

  recommendedFireStrategy.push(`Stabilize your ${pitType} for ${heatProfile.stabilizationTime} minutes before adding meat.`);

  if (normalizedTarget === "offset") {
    recommendedFireStrategy.push("Keep a consistent coal bed going. Add splits on top of coals, not beside them.");
    recommendedFireStrategy.push("Run your exhaust fully open at all times. Control temperature with the intake only.");
    recommendedFireStrategy.push("Chase clean blue-gray smoke. If it's thick and white, let the fire burn hotter before the meat goes on.");
  } else if (normalizedTarget === "pellet") {
    recommendedFireStrategy.push("Keep the hopper at least half full. Pellet grills lose temp fast when fuel runs low.");
    recommendedFireStrategy.push("Clean the firepot before every cook. Ash buildup causes temperature instability.");
    recommendedFireStrategy.push("Use a smoke tube in the first two hours for deeper smoke penetration.");
  } else if (normalizedTarget === "kamado") {
    recommendedFireStrategy.push("Make one vent adjustment at a time. Wait five minutes before assessing the result.");
    recommendedFireStrategy.push("Burp the lid before fully opening — especially at high temps. This prevents flashback.");
    recommendedFireStrategy.push("Add wood chunks directly into the lump for smoke. Chips burn too fast.");
  } else if (normalizedTarget === "kettle") {
    recommendedFireStrategy.push("Use the snake method or charcoal baskets for long cooks. Direct pile burns too fast.");
    recommendedFireStrategy.push("Keep the top vent fully open. Control temp with the bottom vent only.");
    recommendedFireStrategy.push("Check fuel levels every 90 minutes. Add small amounts before you need to, not after.");
  } else if (normalizedTarget === "drum") {
    recommendedFireStrategy.push("Start with vents barely cracked. Drums run hotter than expected and are slow to cool.");
    recommendedFireStrategy.push("Use less wood than you think. The enclosed environment amplifies smoke flavor.");
  } else if (normalizedTarget === "electric") {
    recommendedFireStrategy.push("Add chips in the first two hours only. Late additions produce bitter flavor.");
    recommendedFireStrategy.push("Crack the vent slightly to let moisture escape and help bark development.");
    recommendedFireStrategy.push("Finish the last hour unwrapped at max temp to develop crust.");
  }

  // Add notes from tracker
  const allNoteTexts = allNotes.flatMap((n: any) =>
    [n.note_1, n.note_2, n.note_3].filter(Boolean) as string[]
  );
  if (allNoteTexts.length > 0) {
    recommendedFireStrategy.push(allNoteTexts[0] ?? "");
  }

  return {
    pitType,
    stability: stability.slice(0, 4),
    quirks: quirks.slice(0, 4),
    heatProfile,
    behaviorByMeat,
    weatherSensitivity: weatherSensitivity.slice(0, 4),
    adjustmentPatterns: adjustmentPatterns.slice(0, 4),
    strengths: strengths.slice(0, 4),
    weaknesses: weaknesses.slice(0, 4),
    recommendedFireStrategy: recommendedFireStrategy.slice(0, 5),
    cookCount: matchingCooks.length,
  };
}