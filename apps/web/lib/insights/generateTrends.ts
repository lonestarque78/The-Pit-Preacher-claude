// lib/insights/generateTrends.ts

import { createServerClient } from "@/lib/supabase-server";

export interface TrendsResult {
  consistency: string[];
  pitBehavior: string[];
  meatSpecific: string[];
  improvements: string[];
  weaknesses: string[];
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function trend(values: number[]): "up" | "down" | "stable" {
  if (values.length < 3) return "stable";
  const first = avg(values.slice(0, Math.floor(values.length / 2)));
  const last = avg(values.slice(Math.floor(values.length / 2)));
  if (last - first > 0.4) return "up";
  if (first - last > 0.4) return "down";
  return "stable";
}

function variance(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = avg(values);
  return avg(values.map(v => Math.pow(v - mean, 2)));
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function generateTrends(userId: string): Promise<TrendsResult> {
  const supabase = await createServerClient();

  // Load last 20 completed cooks with outcomes
  const { data: cooks } = await supabase
    .from("cooks")
    .select("id, label, smoker_type, created_at, completed_at, eat_time, plan")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(20);

  if (!cooks || cooks.length === 0) {
    return { consistency: [], pitBehavior: [], meatSpecific: [], improvements: [], weaknesses: [] };
  }

  const cookIds = cooks.map((c: any) => c.id);

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

  const trackedCooks = cooks.filter((c: any) => outcomeMap[c.id]);

  if (trackedCooks.length === 0) {
    return { consistency: [], pitBehavior: [], meatSpecific: [], improvements: [], weaknesses: [] };
  }

  // ── CONSISTENCY TRENDS ─────────────────────────────────────────────────
  const consistency: string[] = [];

  const tendernessScores = trackedCooks.map((c: any) => outcomeMap[c.id]?.tenderness).filter(Boolean);
  const barkScores = trackedCooks.map((c: any) => outcomeMap[c.id]?.bark_quality).filter(Boolean);
  const moistureScores = trackedCooks.map((c: any) => outcomeMap[c.id]?.moisture_level).filter(Boolean);
  const overallScores = trackedCooks.map((c: any) => outcomeMap[c.id]?.overall_success).filter(Boolean);

  const tendernessTrend = trend(tendernessScores.reverse());
  if (tendernessTrend === "up") {
    consistency.push(`Your tenderness scores have improved across your last ${tendernessScores.length} tracked cooks. Whatever you changed — keep doing it.`);
  } else if (tendernessTrend === "down") {
    consistency.push(`Tenderness is trending downward across recent cooks. Check your probe technique and rest time — the meat needs more time, not more heat.`);
  }

  const barkTrend = trend(barkScores.reverse());
  if (barkTrend === "up") {
    consistency.push(`Bark quality is improving. Your wrap timing and pit management are getting more consistent.`);
  } else if (barkTrend === "down") {
    consistency.push(`Bark quality has been slipping. Review your wrap timing — wrapping too early is the most common cause.`);
  }

  const moistureTrend = trend(moistureScores.reverse());
  if (moistureTrend === "down") {
    consistency.push(`Moisture levels are trending downward across recent cooks. Consider running 10–15°F cooler or extending rest time.`);
  } else if (moistureTrend === "up") {
    consistency.push(`Moisture retention is improving — your rest time and wrap technique are working.`);
  }

  const overallVariance = variance(overallScores);
  if (overallVariance < 0.5 && overallScores.length >= 4) {
    consistency.push(`Your overall scores are highly consistent — variance of less than half a point across ${overallScores.length} cooks. You've found a repeatable process.`);
  } else if (overallVariance > 1.5 && overallScores.length >= 4) {
    consistency.push(`High variance in your overall scores — your cooks are inconsistent. Focus on one variable at a time: start time, pit temp, or wrap timing.`);
  }

  // Late finish pattern
  const lateFinishes = trackedCooks.filter((c: any) => {
    const o = outcomeMap[c.id];
    if (!o?.finish_time_actual || !c.eat_time) return false;
    return new Date(o.finish_time_actual).getTime() - new Date(c.eat_time).getTime() > 30 * 60 * 1000;
  });
  if (lateFinishes.length >= 3) {
    const pct = Math.round((lateFinishes.length / trackedCooks.length) * 100);
    consistency.push(`${pct}% of your tracked cooks finish late. Build a 90-minute buffer into every timeline — the cooler hold won't hurt anything.`);
  }

  // ── PIT BEHAVIOR TRENDS ────────────────────────────────────────────────
  const pitBehavior: string[] = [];

  // Group by pit type
  const pitGroups: Record<string, any[]> = {};
  for (const c of trackedCooks) {
    const pit = (c.smoker_type ?? "unknown").toLowerCase();
    if (!pitGroups[pit]) pitGroups[pit] = [];
    pitGroups[pit].push(outcomeMap[c.id]);
  }

  for (const [pit, pitOutcomes] of Object.entries(pitGroups)) {
    if (pitOutcomes.length < 2) continue;

    const tempRanges = pitOutcomes
      .filter((o: any) => o.pit_temp_low && o.pit_temp_high)
      .map((o: any) => o.pit_temp_high - o.pit_temp_low);
    if (tempRanges.length >= 2) {
      const avgRange = avg(tempRanges);
      if (avgRange > 60) {
        pitBehavior.push(`Your ${pit} consistently swings ${Math.round(avgRange)}°F during cooks. That's too much variance — tighten your vent management.`);
      } else if (avgRange < 25) {
        pitBehavior.push(`Your ${pit} holds temperature tightly — average swing of ${Math.round(avgRange)}°F. That consistency is showing in your results.`);
      }
    }

    const stallTimes = pitOutcomes.filter((o: any) => o.stall_time_minutes).map((o: any) => o.stall_time_minutes);
    if (stallTimes.length >= 2) {
      const avgStall = avg(stallTimes);
      if (avgStall > 150) {
        pitBehavior.push(`Stalls on your ${pit} average ${Math.round(avgStall)} minutes. Plan for a long stall on every cook — it's your pit's pattern, not a problem.`);
      }
    }

    const restTimes = pitOutcomes.filter((o: any) => o.rest_time_minutes).map((o: any) => o.rest_time_minutes);
    if (restTimes.length >= 3) {
      const restVariance = variance(restTimes);
      if (restVariance < 100) {
        pitBehavior.push(`Your rest times on the ${pit} are consistent — within ${Math.round(Math.sqrt(restVariance))} minutes across ${restTimes.length} cooks. That discipline is helping tenderness.`);
      }
    }
  }

  // Event-based pit behavior
  const allEvents = events ?? [];
  const spikeEvents = allEvents.filter((e: any) =>
    e.note?.toLowerCase().includes("spike") || e.note?.toLowerCase().includes("too hot")
  );
  if (spikeEvents.length >= 3) {
    pitBehavior.push(`Temp spikes appear across ${spikeEvents.length} cook events. Your fire is reactive — focus on smaller vent adjustments and longer stabilization time before adding meat.`);
  }

  const lidEvents = allEvents.filter((e: any) =>
    e.note?.toLowerCase().includes("opened lid") || e.note?.toLowerCase().includes("checked temp")
  );
  if (lidEvents.length >= 6) {
    pitBehavior.push(`You've opened the lid ${lidEvents.length} times across tracked cooks. Each opening costs you temp and stall time. Set a check schedule and stick to it.`);
  }

  // ── MEAT-SPECIFIC TRENDS ───────────────────────────────────────────────
  const meatSpecific: string[] = [];

  // Group by meat keyword in label
  const meatKeywords = ["brisket", "ribs", "pork shoulder", "chicken", "turkey", "butt", "pulled pork"];
  const meatGroups: Record<string, any[]> = {};

  for (const c of trackedCooks) {
    const label = (c.label ?? "").toLowerCase();
    for (const meat of meatKeywords) {
      if (label.includes(meat)) {
        if (!meatGroups[meat]) meatGroups[meat] = [];
        meatGroups[meat].push(outcomeMap[c.id]);
        break;
      }
    }
  }

  for (const [meat, meatOutcomes] of Object.entries(meatGroups)) {
    if (meatOutcomes.length < 2) continue;

    const meatTenderness = meatOutcomes.filter((o: any) => o.tenderness).map((o: any) => o.tenderness);
    const meatBark = meatOutcomes.filter((o: any) => o.bark_quality).map((o: any) => o.bark_quality);
    const meatMoisture = meatOutcomes.filter((o: any) => o.moisture_level).map((o: any) => o.moisture_level);

    const avgTenderness = avg(meatTenderness);
    const avgBark = avg(meatBark);
    const avgMoisture = avg(meatMoisture);

    if (avgTenderness >= 4) {
      meatSpecific.push(`Your ${meat} tenderness averages ${avgTenderness.toFixed(1)}/5 across ${meatTenderness.length} cooks. Strong and consistent.`);
    } else if (avgTenderness <= 2.5 && meatTenderness.length >= 2) {
      meatSpecific.push(`${capitalize(meat)} tenderness averages ${avgTenderness.toFixed(1)}/5 — a recurring issue. Go longer on the rest and check probe feel, not just temp.`);
    }

    if (avgBark <= 2.5 && meatBark.length >= 2) {
      meatSpecific.push(`${capitalize(meat)} bark is averaging ${avgBark.toFixed(1)}/5. Wrap timing is the likely culprit — let the bark set harder before sealing.`);
    }

    if (avgMoisture <= 2.5 && meatMoisture.length >= 2) {
      meatSpecific.push(`${capitalize(meat)} is finishing dry on average. Try dropping pit temp 10–15°F and adding 30 minutes to the rest.`);
    }

    // High temp + dry correlation
    const hotDryCooks = meatOutcomes.filter((o: any) =>
      o.pit_temp_high && o.pit_temp_high > 285 && o.moisture_level && o.moisture_level <= 2
    );
    if (hotDryCooks.length >= 2) {
      meatSpecific.push(`Your ${meat} dries out when pit temp exceeds 285°F. Keep it under 275°F and wrap earlier on hot cook days.`);
    }
  }

  // ── IMPROVEMENT TRENDS ────────────────────────────────────────────────
  const improvements: string[] = [];

  const recentThree = trackedCooks.slice(0, 3).map((c: any) => outcomeMap[c.id]).filter(Boolean);
  const olderCooks = trackedCooks.slice(3).map((c: any) => outcomeMap[c.id]).filter(Boolean);

  if (recentThree.length >= 2 && olderCooks.length >= 2) {
    const recentOverall = avg(recentThree.filter((o: any) => o.overall_success).map((o: any) => o.overall_success));
    const olderOverall = avg(olderCooks.filter((o: any) => o.overall_success).map((o: any) => o.overall_success));

    if (recentOverall - olderOverall >= 0.5) {
      improvements.push(`Your last 3 cooks average ${recentOverall.toFixed(1)}/5 overall — up from ${olderOverall.toFixed(1)}/5 on older cooks. You're trending in the right direction.`);
    }

    const recentBark = avg(recentThree.filter((o: any) => o.bark_quality).map((o: any) => o.bark_quality));
    const olderBark = avg(olderCooks.filter((o: any) => o.bark_quality).map((o: any) => o.bark_quality));
    if (recentBark - olderBark >= 0.7) {
      improvements.push(`Bark quality has jumped ${(recentBark - olderBark).toFixed(1)} points in your last 3 cooks. Your wrap timing adjustment is working.`);
    }

    const recentTenderness = avg(recentThree.filter((o: any) => o.tenderness).map((o: any) => o.tenderness));
    const olderTenderness = avg(olderCooks.filter((o: any) => o.tenderness).map((o: any) => o.tenderness));
    if (recentTenderness - olderTenderness >= 0.7) {
      improvements.push(`Tenderness improved by ${(recentTenderness - olderTenderness).toFixed(1)} points recently. Your rest time discipline is paying off.`);
    }
  }

  // Fewer adjustments trend
  const recentAdjustments = recentThree.filter((o: any) => o.adjustments_made && o.adjustments_made.trim().length > 0).length;
  const olderAdjustments = olderCooks.slice(0, 3).filter((o: any) => o.adjustments_made && o.adjustments_made.trim().length > 0).length;
  if (recentAdjustments < olderAdjustments && olderAdjustments >= 2) {
    improvements.push(`You're making fewer mid-cook adjustments in recent cooks. That means your setup process is getting tighter before the meat goes on.`);
  }

  // Consistent rest times improving tenderness
  const restTimesRecent = recentThree.filter((o: any) => o.rest_time_minutes).map((o: any) => o.rest_time_minutes);
  if (restTimesRecent.length >= 2 && variance(restTimesRecent) < 200) {
    improvements.push(`Your rest times are getting more consistent across recent cooks. That discipline directly improves tenderness and moisture retention.`);
  }

  if (improvements.length === 0 && trackedCooks.length >= 3) {
    improvements.push(`You have ${trackedCooks.length} tracked cooks logged. Keep tracking — improvement trends become visible after 5+ cooks.`);
  }

  // ── WEAKNESS TRENDS ────────────────────────────────────────────────────
  const weaknesses: string[] = [];

  const softBarkCount = trackedCooks.filter((c: any) => outcomeMap[c.id]?.bark_quality && outcomeMap[c.id].bark_quality <= 2).length;
  if (softBarkCount >= 2) {
    weaknesses.push(`Soft bark is your most persistent issue — appearing in ${softBarkCount} of ${trackedCooks.length} tracked cooks. Wrap later and finish unwrapped at 275°F.`);
  }

  const dryCount = trackedCooks.filter((c: any) => outcomeMap[c.id]?.moisture_level && outcomeMap[c.id].moisture_level <= 2).length;
  if (dryCount >= 2) {
    weaknesses.push(`Dry finishes show up in ${dryCount} of ${trackedCooks.length} cooks. This is a systemic issue — not a one-off. Audit your pit temp, wrap timing, and rest length.`);
  }

  const toughCount = trackedCooks.filter((c: any) => outcomeMap[c.id]?.tenderness && outcomeMap[c.id].tenderness <= 2).length;
  if (toughCount >= 2) {
    weaknesses.push(`Tenderness issues in ${toughCount} tracked cooks. You're likely pulling meat before the collagen has fully converted. Add time, not heat.`);
  }

  const longStallCount = trackedCooks.filter((c: any) => outcomeMap[c.id]?.stall_time_minutes && outcomeMap[c.id].stall_time_minutes > 180).length;
  if (longStallCount >= 2) {
    weaknesses.push(`Long stalls in ${longStallCount} cooks — over 3 hours each. This is a pit environment pattern. Consider wrapping at the 2-hour mark to reclaim time consistently.`);
  }

  const fireIssueCount = trackedCooks.filter((c: any) => outcomeMap[c.id]?.fire_issues && outcomeMap[c.id].fire_issues.trim().length > 5).length;
  if (fireIssueCount >= 2) {
    weaknesses.push(`Fire management issues logged in ${fireIssueCount} cooks. This is a pre-cook setup problem — get your fire established and stable before the meat goes on.`);
  }

  if (weaknesses.length === 0) {
    weaknesses.push(`No persistent weaknesses detected across your tracked cooks. Stay consistent and keep logging data.`);
  }

  return {
    consistency: consistency.slice(0, 5),
    pitBehavior: pitBehavior.slice(0, 5),
    meatSpecific: meatSpecific.slice(0, 5),
    improvements: improvements.slice(0, 5),
    weaknesses: weaknesses.slice(0, 5),
  };
}