// lib/insights/generateNextCookStrategy.ts

import { createServerClient } from "@/lib/supabase-server";
import { generateMeatProfile } from "@/lib/insights/generateMeatProfile";
import { generatePitProfile } from "@/lib/insights/generatePitProfile";
import { generateTrends } from "@/lib/insights/generateTrends";

export interface NextCookStrategy {
  headline: string;
  keyFocus: string[];
  timingAdjustments: string[];
  pitManagement: string[];
  meatSpecificTips: string[];
  riskFactors: string[];
  confidenceContext: string[];
  finalStrategy: string[];
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export async function generateNextCookStrategy(
  userId: string,
  meatType: string,
  pitType: string,
  cookId?: string
): Promise<NextCookStrategy> {
  const supabase = await createServerClient();

  // Load all intelligence layers in parallel
  const [meatProfile, pitProfile, trends] = await Promise.all([
    meatType ? generateMeatProfile(userId, meatType).catch(() => null) : Promise.resolve(null),
    pitType ? generatePitProfile(userId, pitType).catch(() => null) : Promise.resolve(null),
    generateTrends(userId).catch(() => null),
  ]);

  // Load last 5 confidence scores via cook_outcomes
  const { data: recentCooks } = await supabase
    .from("cooks")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(5);

  const recentCookIds = (recentCooks ?? []).map((c: any) => c.id);
  let avgConfidence = 0;
  let confidenceTrend: "up" | "down" | "stable" = "stable";

  if (recentCookIds.length > 0) {
    const { data: recentOutcomes } = await supabase
      .from("cook_outcomes")
      .select("overall_success, tenderness, bark_quality, moisture_level")
      .in("cook_id", recentCookIds);

    if (recentOutcomes && recentOutcomes.length >= 2) {
      const scores = recentOutcomes.map((o: any) => {
        const vals = [o.overall_success, o.tenderness, o.bark_quality, o.moisture_level].filter(Boolean);
        return vals.length > 0 ? avg(vals) : 0;
      }).filter(s => s > 0);

      avgConfidence = avg(scores);

      if (scores.length >= 3) {
        const first = avg(scores.slice(Math.floor(scores.length / 2)));
        const last = avg(scores.slice(0, Math.floor(scores.length / 2)));
        if (last - first > 0.3) confidenceTrend = "up";
        else if (first - last > 0.3) confidenceTrend = "down";
      }
    }
  }

  // Load insights for this cook if cookId provided
  let insightsData: any = null;
  if (cookId) {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const res = await fetch(`${siteUrl}/api/insights?cookId=${cookId}`, { cache: "no-store" });
      if (res.ok) insightsData = await res.json();
    } catch { /* insights optional */ }
  }

  // ── BUILD STRATEGY ──────────────────────────────────────────────────────

  const meatLabel = meatType || "this cook";
  const pitLabel = pitType || "your pit";

  // HEADLINE
  const headlineParts: string[] = [];
  if (meatProfile?.weaknesses[0]) {
    headlineParts.push(meatProfile.weaknesses[0].split(".")[0] ?? "");
  }
  if (pitProfile?.quirks[0]) {
    headlineParts.push(pitProfile.quirks[0].split(".")[0] ?? "");
  }

  let headline = `Today's ${meatLabel} cook — stay patient, work your process.`;
  if (meatProfile?.outcomeAverages.bark && meatProfile.outcomeAverages.bark < 3) {
    headline = `Today's ${meatLabel} is all about bark — wrap later and let the crust develop.`;
  } else if (meatProfile?.outcomeAverages.moisture && meatProfile.outcomeAverages.moisture < 3) {
    headline = `Today's ${meatLabel} needs moisture discipline — run cooler and rest longer.`;
  } else if (meatProfile?.outcomeAverages.tenderness && meatProfile.outcomeAverages.tenderness < 3) {
    headline = `Today's ${meatLabel} needs time — probe feel beats temperature every time.`;
  } else if (pitProfile?.heatProfile.spikeFrequency && pitProfile.heatProfile.spikeFrequency >= 2) {
    headline = `Your ${pitLabel} runs reactive — stabilize early and keep your hands off the vents.`;
  } else if (confidenceTrend === "up") {
    headline = `Your last few cooks have been trending up — build on that momentum today.`;
  }

  // KEY FOCUS
  const keyFocus: string[] = [];

  if (meatProfile?.weaknesses && meatProfile.weaknesses.length > 0) {
    keyFocus.push(...meatProfile.weaknesses.slice(0, 2));
  }
  if (pitProfile?.quirks && pitProfile.quirks.length > 0) {
    keyFocus.push(pitProfile.quirks[0] ?? "");
  }
  if (insightsData?.patternInsights && insightsData.patternInsights.length > 0) {
    keyFocus.push(insightsData.patternInsights[0] ?? "");
  }
  if (trends?.weaknesses && trends.weaknesses.length > 0) {
    keyFocus.push(trends.weaknesses[0] ?? "");
  }

  // TIMING ADJUSTMENTS
  const timingAdjustments: string[] = [];

  if (meatProfile?.timingProfile.averageCookTime && meatProfile.timingProfile.averageCookTime > 0) {
    const h = Math.floor(meatProfile.timingProfile.averageCookTime / 60);
    const m = meatProfile.timingProfile.averageCookTime % 60;
    const display = m > 0 ? `${h}h ${m}m` : `${h}h`;
    timingAdjustments.push(`Your ${meatLabel} averages ${display} of cook time. Start your fire accordingly and plan a 90-minute buffer.`);
  }

  if (meatProfile?.timingProfile.averageStallTime && meatProfile.timingProfile.averageStallTime > 120) {
    timingAdjustments.push(`Expect a ${Math.round(meatProfile.timingProfile.averageStallTime)}-minute stall based on your history. Don't panic — wrap at the 2-hour mark if time is tight.`);
  }

  if (meatProfile?.timingProfile.averageRestTime && meatProfile.timingProfile.averageRestTime < 50) {
    timingAdjustments.push(`Your average rest is ${meatProfile.timingProfile.averageRestTime} minutes. Push it to at least 60 — the gelatin needs time to resettle.`);
  }

  if (trends?.consistency && trends.consistency.some((c: string) => c.toLowerCase().includes("late"))) {
    timingAdjustments.push("Your cooks have been finishing late. Start 30–45 minutes earlier than planned.");
  }

  if (insightsData?.nextTimeRecommendations) {
    const timingRecs = (insightsData.nextTimeRecommendations as string[]).filter((r: string) =>
      r.toLowerCase().includes("start") || r.toLowerCase().includes("time") || r.toLowerCase().includes("earlier")
    );
    timingAdjustments.push(...timingRecs.slice(0, 2));
  }

  if (timingAdjustments.length === 0) {
    timingAdjustments.push("Build a 90-minute buffer into your timeline. The cooler hold is always available.");
  }

  // PIT MANAGEMENT
  const pitManagement: string[] = [];

  if (pitProfile?.recommendedFireStrategy) {
    pitManagement.push(...pitProfile.recommendedFireStrategy.slice(0, 3));
  }

  if (pitProfile?.heatProfile.spikeFrequency && pitProfile.heatProfile.spikeFrequency >= 1.5) {
    pitManagement.push(`Watch for spikes in the first hour — your ${pitLabel} averages ${pitProfile.heatProfile.spikeFrequency} spikes per cook.`);
  }

  if (pitProfile?.weatherSensitivity && pitProfile.weatherSensitivity.length > 0) {
    pitManagement.push(pitProfile.weatherSensitivity[0] ?? "");
  }

  if (pitManagement.length === 0) {
    pitManagement.push(`Stabilize your ${pitLabel} before the meat goes on. Don't rush the fire.`);
    pitManagement.push("Run the exhaust fully open. Control temperature with the intake only.");
  }

  // MEAT-SPECIFIC TIPS
  const meatSpecificTips: string[] = [];

  if (meatProfile?.tendencies) {
    meatSpecificTips.push(...meatProfile.tendencies.slice(0, 2));
  }

  if (meatProfile?.outcomeAverages.bark && meatProfile.outcomeAverages.bark < 3.5) {
    meatSpecificTips.push(`Bark has been your weak point at ${meatProfile.outcomeAverages.bark}/5. Don't wrap until the crust resists a finger press.`);
  }

  if (meatProfile?.outcomeAverages.moisture && meatProfile.outcomeAverages.moisture < 3.5) {
    meatSpecificTips.push(`Moisture has been trending low at ${meatProfile.outcomeAverages.moisture}/5. Drop pit temp 10°F and extend rest time.`);
  }

  if (insightsData?.pitInsights) {
    meatSpecificTips.push(...(insightsData.pitInsights as string[]).slice(0, 1));
  }

  if (meatSpecificTips.length === 0) {
    meatSpecificTips.push("Use probe tenderness — not temperature — as your doneness signal.");
    meatSpecificTips.push("Let the bark tell you when to wrap. Temperature is a guideline, not the answer.");
  }

  // RISK FACTORS
  const riskFactors: string[] = [];

  if (pitProfile?.weaknesses) {
    riskFactors.push(...pitProfile.weaknesses.slice(0, 2));
  }

  if (meatProfile?.weaknesses && meatProfile.weaknesses.length > 0) {
    riskFactors.push(meatProfile.weaknesses[0] ?? "");
  }

  if (pitProfile?.heatProfile.dipFrequency && pitProfile.heatProfile.dipFrequency >= 1.5) {
    riskFactors.push(`Your ${pitLabel} dips ${pitProfile.heatProfile.dipFrequency} times per cook on average. Monitor at the stall — this is when dips usually happen.`);
  }

  if (trends?.weaknesses && trends.weaknesses.length > 1) {
    riskFactors.push(trends.weaknesses[1] ?? "");
  }

  if (riskFactors.length === 0) {
    riskFactors.push("No major risk factors detected. Stay consistent with what's been working.");
  }

  // CONFIDENCE CONTEXT
  const confidenceContext: string[] = [];

  if (avgConfidence > 0) {
    const label = avgConfidence >= 4 ? "strong" : avgConfidence >= 3 ? "solid" : "developing";
    confidenceContext.push(`Your recent cook average is ${avgConfidence.toFixed(1)}/5 — ${label} execution.`);
  }

  if (confidenceTrend === "up") {
    confidenceContext.push("Your last few cooks show improving consistency. Build on that momentum.");
  } else if (confidenceTrend === "down") {
    confidenceContext.push("Recent cooks have dipped slightly. Slow down and focus on one thing at a time.");
  } else if (avgConfidence > 0) {
    confidenceContext.push("Your results are consistent. Stability is a strength — keep the process tight.");
  }

  if (trends?.improvements && trends.improvements.length > 0) {
    confidenceContext.push(trends.improvements[0] ?? "");
  }

  if (confidenceContext.length === 0) {
    confidenceContext.push("Track more cooks to build your confidence score history.");
  }

  // FINAL STRATEGY
  const finalStrategy: string[] = [];

  if (pitProfile?.heatProfile.stabilizationTime) {
    finalStrategy.push(`Stabilize your ${pitLabel} for ${pitProfile.heatProfile.stabilizationTime} minutes before adding meat.`);
  } else {
    finalStrategy.push("Stabilize your pit and get clean smoke before adding meat.");
  }

  if (meatProfile?.outcomeAverages.bark && meatProfile.outcomeAverages.bark < 3.5) {
    finalStrategy.push("Delay wrap until bark is firm, dark, and resists a finger press.");
  } else {
    finalStrategy.push("Watch the bark — wrap when the color and texture tell you, not the clock.");
  }

  const targetRest = meatProfile?.timingProfile.averageRestTime && meatProfile.timingProfile.averageRestTime >= 60
    ? meatProfile.timingProfile.averageRestTime
    : 90;
  finalStrategy.push(`Rest for at least ${targetRest} minutes wrapped in paper or foil, then toweled in a cooler.`);

  finalStrategy.push("Use probe tenderness as your doneness signal. The number on the thermometer is a guide.");

  if (insightsData?.nextTimeRecommendations && insightsData.nextTimeRecommendations.length > 0) {
    finalStrategy.push(insightsData.nextTimeRecommendations[0] ?? "");
  }

  return {
    headline,
    keyFocus: keyFocus.filter(Boolean).slice(0, 5),
    timingAdjustments: timingAdjustments.filter(Boolean).slice(0, 4),
    pitManagement: pitManagement.filter(Boolean).slice(0, 4),
    meatSpecificTips: meatSpecificTips.filter(Boolean).slice(0, 4),
    riskFactors: riskFactors.filter(Boolean).slice(0, 4),
    confidenceContext: confidenceContext.filter(Boolean).slice(0, 3),
    finalStrategy: finalStrategy.filter(Boolean).slice(0, 6),
  };
}