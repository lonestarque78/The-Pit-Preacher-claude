export const metadata = {
  title: 'Your Pitmaster Dashboard',
  description: 'Track your active cooks, review your cook history, and manage your BBQ cook log. Your personal pitmaster dashboard from The Pit Preacher.'
}

import { createServerClient } from "@/lib/supabase-server";
import { getTier } from "@/lib/premium";
import { redirect } from "next/navigation";
import DailyVerse from "@/components/gospel/DailyVerse";
import Link from "next/link";
import CookList from "./CookList";
import DashboardTools from "./DashboardTools";

function tierBadgeStyle(tier: string): { bg: string; border: string; label: string } {
  if (tier === "pitmaster") return { bg: "rgba(201,151,58,0.2)", border: "1px solid #C9973A", label: "❖ Pitmaster" };
  return { bg: "rgba(201,151,58,0.1)", border: "1px solid rgba(201,151,58,0.3)", label: "Free Plan" };
}

// This route sits behind middleware.ts's PROTECTED_PATHS, so `user` is always present here.
// The public marketing landing experience lives at "/", not this route (see COMPARISON.md #1) —
// this page previously duplicated a hero for a logged-out branch that middleware made unreachable.
export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [profileRes, tier, allCooksRes] = await Promise.all([
    supabase.from("profiles").select("display_name, profile_complete").eq("user_id", user.id).single(),
    getTier(user.id, supabase),
    supabase.from("cooks").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100),
  ]);

  const profile     = profileRes.data;
  const allCooks    = (allCooksRes.data ?? []) as any[];
  const displayName = profile?.display_name || "Pitmaster";
  const badge       = tierBadgeStyle(tier);

  const cookIds = allCooks.map(c => c.id as string);
  let cookLogMap: Record<string, any> = {};
  if (cookIds.length > 0) {
    const { data: logsData } = await supabase.from("cook_logs").select("*").in("cook_id", cookIds);
    for (const log of logsData ?? []) cookLogMap[log.cook_id] = log;
  }

  const renderNow = new Date();
  const fortyEightHoursAgo = new Date(renderNow.getTime() - 48 * 60 * 60 * 1000).toISOString();
  const finalCooks: any[] = [];
  for (const cook of allCooks) {
    if (cook.status === "in_progress") {
      const cookAgeMs = renderNow.getTime() - new Date(cook.created_at).getTime();
      if (cookAgeMs > 48 * 60 * 60 * 1000) {
        const { count } = await supabase
          .from("cook_events")
          .select("*", { count: "exact", head: true })
          .eq("cook_id", cook.id)
          .gte("created_at", fortyEightHoursAgo);
        if ((count ?? 0) === 0) {
          await supabase.from("cooks").update({ status: "abandoned" }).eq("id", cook.id);
          finalCooks.push({ ...cook, status: "abandoned" });
          continue;
        }
      }
    }
    finalCooks.push(cook);
  }

  return (
    <div>

      {/* Compact header bar */}
      <div style={{ background: "var(--color-bg-alt)", borderBottom: "1px solid rgba(201,151,58,0.15)", padding: "var(--space-2) var(--space-4)", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "var(--space-4)", flexWrap: "wrap" }}>
        <div style={{ textAlign: "right", maxWidth: "280px" }}>
          <DailyVerse />
        </div>
      </div>

      {/* Welcome row */}
      <div style={{ padding: "var(--space-2) var(--space-4)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)", borderBottom: "1px solid rgba(201,151,58,0.08)" }}>
        <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "#F5E6C8", margin: 0 }}>Welcome back, {displayName}</p>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", padding: "4px 14px", borderRadius: "100px", background: badge.bg, color: "#C9973A", border: badge.border, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
          {badge.label}
        </span>
      </div>

      {/* Tools: Cook Log, Wood Lab, Fix My Cook */}
      <DashboardTools />

      {/* Cook list */}
      <CookList cooks={finalCooks} logsMap={cookLogMap} />

      {/* Tier-aware marketing */}
      {tier !== "pitmaster" && (
        <>
          <div style={{ margin: "0 var(--space-4) var(--space-3)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(201,151,58,0.15)" }} />
            <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.65rem", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.2em", margin: 0, whiteSpace: "nowrap" }}>❖ Level Up Your Cook ❖</p>
            <div style={{ flex: 1, height: "1px", background: "rgba(201,151,58,0.15)" }} />
          </div>
          <div style={{ padding: "0 var(--space-4) var(--space-4)" }}>
            <div style={{ background: "var(--color-bg-alt)", border: "1px solid rgba(201,151,58,0.3)", borderRadius: "var(--radius-lg)", padding: "var(--space-4)" }}>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "#F5E6C8", margin: "0 0 var(--space-2)" }}>Unlock the Full Pit Preacher Experience</h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0 0 var(--space-3)" }}>You&apos;re on the free plan. Here&apos;s what Pitmaster adds:</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", marginBottom: "var(--space-4)" }}>
                {[
                  "Ask the Preacher — unlimited questions",
                  "Unlimited cooks",
                  "Cook Confidence Score & Fire Control Score",
                  "Trend Analysis, Meat & Pit Profiles",
                  "Next Cook Strategy Card",
                ].map(f => (
                  <p key={f} style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0 }}>
                    <span style={{ color: "#C9973A" }}>·</span> {f}
                  </p>
                ))}
              </div>
              <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
                <Link href="/premium" style={{ display: "inline-block", background: "#C9973A", color: "var(--color-bg)", fontFamily: "var(--font-ui)", fontSize: "0.85rem", padding: "10px 20px", borderRadius: "var(--radius-md)", textDecoration: "none" }}>
                  Upgrade to Pitmaster — $7.99/mo
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
