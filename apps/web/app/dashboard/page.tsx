export const metadata = {
  title: 'Your Pitmaster Dashboard',
  description: 'Track your active cooks, review your cook history, and manage your BBQ cook log. Your personal pitmaster dashboard from The Pit Preacher.'
}

import { createServerClient } from "@/lib/supabase-server";
import { getTier } from "@/lib/premium";
import { VERSES } from "@/lib/verses";
import Link from "next/link";
import CookList from "./CookList";

function getDailyVerse() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return VERSES[dayOfYear % VERSES.length] ?? VERSES[0]!;
}

function tierBadgeStyle(tier: string): { bg: string; border: string; label: string } {
  if (tier === "basic")     return { bg: "rgba(201,151,58,0.1)", border: "1px solid rgba(201,151,58,0.3)", label: "Basic" };
  if (tier === "backyard")  return { bg: "rgba(139,105,26,0.2)", border: "1px solid rgba(201,151,58,0.3)", label: "Backyard" };
  if (tier === "pitmaster") return { bg: "rgba(201,151,58,0.2)", border: "1px solid #C9973A",              label: "\u2756 Pitmaster" };
  return { bg: "rgba(201,151,58,0.1)", border: "1px solid rgba(201,151,58,0.3)", label: "Free Plan" };
}

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const verse = getDailyVerse();

  const heroSection = (
    <div style={{
      background: "radial-gradient(ellipse at 50% 0%, rgba(201,151,58,0.12) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(180,80,20,0.18) 0%, transparent 50%), linear-gradient(180deg, #0e0b07 0%, #1c1108 35%, #0e0b07 100%)",
      padding: "clamp(4rem, 10vw, 7rem) var(--space-4) clamp(3rem, 8vw, 5rem)",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ember glow accents */}
      <div style={{
        position: "absolute",
        top: "15%",
        left: "10%",
        width: "300px",
        height: "300px",
        background: "radial-gradient(circle, rgba(201,100,20,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        bottom: "10%",
        right: "8%",
        width: "250px",
        height: "250px",
        background: "radial-gradient(circle, rgba(201,151,58,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Eyebrow */}
      <p style={{
        fontFamily: "var(--font-ui)",
        fontSize: "0.7rem",
        color: "#C9973A",
        textTransform: "uppercase",
        letterSpacing: "0.25em",
        margin: "0 0 var(--space-3)",
        position: "relative",
      }}>
        ✦ Lone Star Que ✦
      </p>

      {/* Headline */}
      <h1 style={{
        fontFamily: "var(--font-heading)",
        fontSize: "clamp(2.2rem, 6vw, 4.5rem)",
        color: "#F5E6C8",
        fontWeight: 900,
        lineHeight: 1.08,
        margin: "0 0 var(--space-4)",
        maxWidth: "760px",
        marginLeft: "auto",
        marginRight: "auto",
        position: "relative",
      }}>
        Your Pitmaster<br />
        <span style={{ color: "transparent", WebkitTextStroke: "2px #C9973A" }}>in Your Pocket</span>
      </h1>

      {/* Subheadline */}
      <p style={{
        fontFamily: "var(--font-body)",
        fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
        color: "#A89070",
        lineHeight: 1.7,
        maxWidth: "520px",
        margin: "0 auto var(--space-5)",
        position: "relative",
      }}>
        Cook with confidence. Learn your pit. Understand your meat. Get guidance that fits the way you cook.
      </p>

      {/* CTAs */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-3)",
        position: "relative",
      }}>
        {/* Primary CTA */}
        <Link
          href="/auth/login?tab=signup"
          style={{
            display: "inline-block",
            background: "#C9973A",
            color: "#111",
            fontFamily: "var(--font-ui)",
            fontSize: "1rem",
            fontWeight: 700,
            padding: "14px 36px",
            borderRadius: "var(--radius-md)",
            textDecoration: "none",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Start a Cook
        </Link>

        {/* Secondary CTAs */}
        <div style={{
          display: "flex",
          gap: "var(--space-4)",
          flexWrap: "wrap",
          justifyContent: "center",
        }}>
          {[
            { label: "Meet the Preacher", href: "/meet-the-preacher" },
            { label: "How It Works", href: "/how-it-works" },
            { label: "Features", href: "/features" },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.85rem",
                color: "#A89070",
                textDecoration: "none",
                letterSpacing: "0.05em",
                borderBottom: "1px solid rgba(201,151,58,0.25)",
                paddingBottom: "2px",
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Daily verse */}
      <div style={{
        marginTop: "var(--space-6)",
        borderTop: "1px solid rgba(201,151,58,0.12)",
        paddingTop: "var(--space-4)",
        maxWidth: "480px",
        marginLeft: "auto",
        marginRight: "auto",
        position: "relative",
      }}>
        <p style={{
          fontFamily: "var(--font-body)",
          fontStyle: "italic",
          color: "rgba(201,151,58,0.55)",
          fontSize: "0.85rem",
          margin: "0 0 4px",
          lineHeight: 1.65,
        }}>
          &ldquo;{verse.text}&rdquo;
        </p>
        <p style={{
          fontFamily: "var(--font-ui)",
          fontSize: "0.6rem",
          color: "rgba(201,151,58,0.35)",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          margin: 0,
        }}>
          {verse.chapter}
        </p>
      </div>
    </div>
  );

  // ── LOGGED OUT ─────────────────────────────────────────────────────────────

  if (!user) {
    return (
      <div>
        {heroSection}

        <div style={{ height: "1px", background: "rgba(201,151,58,0.1)" }} />

        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)", padding: "var(--space-2) var(--space-4) var(--space-5)" }}>
          {[
            { heading: "The Preacher",      body: "Your personal pitmaster available at 3am when your brisket is stalling. Ask anything. Get real answers from someone who has cooked it.",                                         tag: "Available on all plans" },
            { heading: "Live Cook Mode",    body: "Real-time coaching from the moment the fire starts to the moment you slice. The Preacher watches your cook and tells you exactly what to do next.",                             tag: "Available on all plans" },
            { heading: "Your Cook History", body: "Every cook logged. Every lesson saved. Every temp recorded. Build a personal library of your best cooks and what made them great.",                                             tag: "Basic plan and above"   },
          ].map(card => (
            <div key={card.heading} style={{ background: "var(--color-bg-alt)", borderTop: "2px solid #C9973A", borderRadius: "var(--radius-lg)", padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", color: "#F5E6C8", margin: 0 }}>{card.heading}</h3>
              <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)", fontSize: "0.9rem", lineHeight: 1.6, margin: 0, flex: 1 }}>{card.body}</p>
              <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>{card.tag}</p>
            </div>
          ))}
        </div>

      </div>
    );
  }

  // ── LOGGED IN — data ───────────────────────────────────────────────────────

  const [profileRes, tier, allCooksRes] = await Promise.all([
    supabase.from("profiles").select("display_name, profile_complete").eq("id", user.id).single(),
    getTier(user.id, supabase),
    supabase.from("cooks").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
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

  // ── LOGGED IN — render ─────────────────────────────────────────────────────

  return (
    <div>

      {/* Compact header bar */}
      <div style={{ background: "var(--color-bg-alt)", borderBottom: "1px solid rgba(201,151,58,0.15)", padding: "var(--space-2) var(--space-4)", minHeight: "72px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-4)", flexWrap: "wrap" }}>
        <div>
          <p style={{ fontFamily: "var(--font-ui)", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.65rem", margin: "0 0 2px" }}>\u2756 The Pit Preacher \u2756</p>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", color: "#F5E6C8", margin: 0, fontWeight: 400 }}>The Pit Preacher</h1>
        </div>
        <div style={{ textAlign: "right", maxWidth: "280px" }}>
          <p style={{ fontFamily: "var(--font-body)", fontStyle: "italic", color: "#D9C9A8", fontSize: "0.75rem", margin: "0 0 2px", lineHeight: 1.4 }}>
            &ldquo;{verse.text.length > 80 ? verse.text.slice(0, 80) + "\u2026" : verse.text}&rdquo;
          </p>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.6rem", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.15em", margin: 0 }}>{verse.chapter}</p>
        </div>
      </div>

      {/* Welcome row */}
      <div style={{ padding: "var(--space-2) var(--space-4)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--space-3)", borderBottom: "1px solid rgba(201,151,58,0.08)" }}>
        <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "#F5E6C8", margin: 0 }}>Welcome back, {displayName}</p>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", padding: "4px 14px", borderRadius: "100px", background: badge.bg, color: "#C9973A", border: badge.border, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
          {badge.label}
        </span>
      </div>

      {/* Cook list */}
      <CookList cooks={finalCooks} logsMap={cookLogMap} />

      {/* Tier-aware marketing */}
      {tier !== "pitmaster" && (
        <>
          <div style={{ margin: "0 var(--space-4) var(--space-3)", display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(201,151,58,0.15)" }} />
            <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.65rem", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.2em", margin: 0, whiteSpace: "nowrap" }}>\u2756 Level Up Your Cook \u2756</p>
            <div style={{ flex: 1, height: "1px", background: "rgba(201,151,58,0.15)" }} />
          </div>
          <div style={{ padding: "0 var(--space-4) var(--space-4)" }}>

            {tier === "free" && (
              <div style={{ background: "var(--color-bg-alt)", border: "1px solid rgba(201,151,58,0.3)", borderRadius: "var(--radius-lg)", padding: "var(--space-4)" }}>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "#F5E6C8", margin: "0 0 var(--space-2)" }}>Unlock the Full Pit Preacher Experience</h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0 0 var(--space-3)" }}>You&apos;re on the free plan. Here&apos;s what you&apos;re missing:</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", marginBottom: "var(--space-4)" }}>
                  {[
                    "Cook Logs & History — track every cook, every lesson, every rating",
                    "Flavor Memory — save the flavor combos that work for you",
                    "Wood Flavor Lab — learn exactly how every wood affects every meat",
                    "Fix My Cook — panic button for mid-cook emergencies",
                  ].map(f => (
                    <p key={f} style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0 }}>
                      <span style={{ color: "#C9973A" }}>·</span> {f}
                    </p>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
                  <Link href="/premium" style={{ display: "inline-block", background: "#C9973A", color: "var(--color-bg)", fontFamily: "var(--font-ui)", fontSize: "0.85rem", padding: "10px 20px", borderRadius: "var(--radius-md)", textDecoration: "none" }}>
                    Upgrade to Basic — $3.99/mo
                  </Link>
                  <Link href="/premium" style={{ display: "inline-block", background: "transparent", border: "1px solid rgba(201,151,58,0.4)", color: "#C9973A", fontFamily: "var(--font-ui)", fontSize: "0.85rem", padding: "10px 20px", borderRadius: "var(--radius-md)", textDecoration: "none" }}>
                    See All Plans
                  </Link>
                </div>
              </div>
            )}

            {tier === "basic" && (
              <div style={{ background: "var(--color-bg-alt)", border: "1px solid rgba(201,151,58,0.15)", borderRadius: "var(--radius-lg)", padding: "var(--space-4)" }}>
                <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "#F5E6C8", margin: "0 0 var(--space-2)" }}>Ready for More?</h3>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0 0 var(--space-3)" }}>
                  Upgrade to Backyard and unlock advanced features including the Pitmaster&apos;s Playbook, Pit Rescue Mode, and your full Cook Log.
                </p>
                <Link href="/premium" style={{ display: "inline-block", background: "#C9973A", color: "var(--color-bg)", fontFamily: "var(--font-ui)", fontSize: "0.85rem", padding: "10px 20px", borderRadius: "var(--radius-md)", textDecoration: "none" }}>
                  Upgrade to Backyard — $7.99/mo
                </Link>
              </div>
            )}

            {tier === "backyard" && (
              <div style={{ background: "var(--color-bg-alt)", border: "1px solid rgba(201,151,58,0.1)", borderRadius: "var(--radius-lg)", padding: "var(--space-3) var(--space-4)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-2)" }}>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0 }}>
                  Ready for the Pitmaster tier? Unlock Trend Analysis, Meat Profiles, Pit Profiles, and elite cook intelligence.
                </p>
                <Link href="/premium" style={{ fontFamily: "var(--font-ui)", fontSize: "0.8rem", color: "#C9973A", textDecoration: "none", whiteSpace: "nowrap" }}>
                  Learn more \u2192
                </Link>
              </div>
            )}

          </div>
        </>
      )}

    </div>
  );
}
