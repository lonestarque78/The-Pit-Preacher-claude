import { createServerClient } from "@/lib/supabase-server";
import { getTier } from "@/lib/premium";
import { getRandomVerse } from "@/lib/verses";
import Link from "next/link";

function formatCountdown(eatTime: string): string {
  const now = new Date();
  const eat = new Date(eatTime);
  const diffMs = eat.getTime() - now.getTime();
  if (diffMs <= 0) return "Time to eat";
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffM = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (diffH > 0) return `Eating in ${diffH}h ${diffM}m`;
  return `Eating in ${diffM}m`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch { return iso; }
}

function tierBadgeStyle(tier: string): { bg: string; border: string; label: string } {
  if (tier === "basic")     return { bg: "rgba(201,151,58,0.1)", border: "1px solid rgba(201,151,58,0.3)", label: "Basic" };
  if (tier === "backyard")  return { bg: "rgba(139,105,26,0.2)", border: "1px solid rgba(201,151,58,0.3)", label: "Backyard" };
  if (tier === "pitmaster") return { bg: "rgba(201,151,58,0.2)", border: "1px solid #C9973A",              label: "✦ Pitmaster" };
  return { bg: "rgba(201,151,58,0.1)", border: "1px solid rgba(201,151,58,0.3)", label: "Free Plan" };
}

export default async function DashboardPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const verse = getRandomVerse();

  const heroSection = (
    <>
      <div style={{
        background: "radial-gradient(ellipse at 50% 110%, rgba(232,98,10,0.15) 0%, transparent 55%), linear-gradient(180deg, #0c0a08 0%, #1a1008 40%, #0c0a08 100%)",
        padding: "1.5rem 2rem 1rem",
        textAlign: "center",
      }}>
        <p style={{ fontFamily: "var(--font-ui)", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.75rem", marginTop: 0, marginBottom: "var(--space-3)" }}>
          ✦ Lone Star Que ✦
        </p>
        <p style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", color: "#C9973A", fontSize: "clamp(1rem, 2.5vw, 1.4rem)", fontWeight: 400, marginTop: 0, marginBottom: "var(--space-2)" }}>
          The Gospel of Great BBQ
        </p>
        <h1 style={{ margin: 0, lineHeight: 1.05 }}>
          <span style={{ display: "block", fontFamily: "var(--font-heading)", color: "#F5E6C8", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 400 }}>The</span>
          <span style={{ display: "inline", fontFamily: "var(--font-heading)", color: "#F5E6C8", fontSize: "clamp(3rem, 8vw, 7rem)", fontWeight: 900 }}>Pit</span>
          {" "}
          <span style={{ display: "inline", fontFamily: "var(--font-heading)", color: "transparent", WebkitTextStroke: "2px #C9973A", fontSize: "clamp(3rem, 8vw, 7rem)", fontWeight: 900, fontStyle: "italic" }}>Preacher</span>
        </h1>
      </div>
      <div style={{ height: "1px", background: "rgba(201,151,58,0.2)" }} />
      <p style={{ fontFamily: "var(--font-body)", fontStyle: "italic", color: "var(--color-text-muted)", fontSize: "0.85rem", textAlign: "center", margin: "var(--space-2) auto 0", maxWidth: "520px", lineHeight: 1.6, padding: "0 var(--space-3)" }}>
        &ldquo;{verse.text}&rdquo;
      </p>
    </>
  );

  // ── LOGGED OUT ─────────────────────────────────────────────────────────────

  if (!user) {
    return (
      <div>
        {heroSection}

        <div style={{ textAlign: "center", padding: "var(--space-5) var(--space-4)" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.8rem, 4vw, 2.5rem)", color: "#F5E6C8", margin: "0 0 var(--space-3)" }}>
            Welcome to the Pulpit
          </h2>
          <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)", maxWidth: "520px", margin: "0 auto var(--space-4)" }}>
            The Pit Preacher is your personal BBQ coach. Built by a pitmaster, powered by 25 years of fire and smoke.
          </p>
          <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth/login" style={{ display: "inline-block", background: "#C9973A", color: "var(--color-bg)", fontFamily: "var(--font-ui)", padding: "12px 28px", borderRadius: "var(--radius-lg)", textDecoration: "none" }}>
              Join Free →
            </Link>
            <Link href="/premium" style={{ display: "inline-block", background: "transparent", border: "1px solid rgba(201,151,58,0.4)", color: "#C9973A", fontFamily: "var(--font-ui)", padding: "12px 28px", borderRadius: "var(--radius-lg)", textDecoration: "none" }}>
              See Plans
            </Link>
          </div>
        </div>

        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)", padding: "var(--space-2) var(--space-4) var(--space-5)" }}>
          {[
            { heading: "The Preacher",      body: "Your personal pitmaster available at 3am when your brisket is stalling. Ask anything. Get real answers from someone who has cooked it.",                                           tag: "Available on all plans" },
            { heading: "Live Cook Mode",    body: "Real-time coaching from the moment the fire starts to the moment you slice. The Preacher watches your cook and tells you exactly what to do next.",                               tag: "Available on all plans" },
            { heading: "Your Cook History", body: "Every cook logged. Every lesson saved. Every temp recorded. Build a personal library of your best cooks and what made them great.",                                               tag: "Basic plan and above"   },
          ].map(card => (
            <div key={card.heading} style={{ background: "var(--color-bg-alt)", borderTop: "2px solid #C9973A", borderRadius: "var(--radius-lg)", padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", color: "#F5E6C8", margin: 0 }}>{card.heading}</h3>
              <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)", fontSize: "0.9rem", lineHeight: 1.6, margin: 0, flex: 1 }}>{card.body}</p>
              <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>{card.tag}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", padding: "var(--space-4)" }}>
          <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)", fontSize: "0.85rem", margin: "0 0 var(--space-3)" }}>
            Free to start. No credit card required.
          </p>
          <Link href="/auth/login" style={{ display: "inline-block", background: "#C9973A", color: "var(--color-bg)", fontFamily: "var(--font-ui)", padding: "12px 28px", borderRadius: "var(--radius-lg)", textDecoration: "none" }}>
            Join Free →
          </Link>
        </div>
      </div>
    );
  }

  // ── LOGGED IN — data ───────────────────────────────────────────────────────

  const [profileRes, tier, activeCooksRes, recentCooksRes, pitsRes] = await Promise.all([
    supabase.from("profiles").select("display_name, profile_complete").eq("id", user.id).single(),
    getTier(user.id, supabase),
    supabase.from("cooks").select("*").eq("user_id", user.id).eq("status", "in_progress").order("created_at", { ascending: false }).limit(3),
    supabase.from("cooks").select("*").eq("user_id", user.id).eq("status", "completed").order("completed_at", { ascending: false }).limit(5),
    supabase.from("pits").select("*").eq("user_id", user.id),
  ]);

  const profile      = profileRes.data;
  const activeCooks  = (activeCooksRes.data  ?? []) as any[];
  const recentCooks  = (recentCooksRes.data  ?? []) as any[];
  const pits         = (pitsRes.data         ?? []) as any[];
  const displayName  = profile?.display_name || "Pitmaster";
  const badge        = tierBadgeStyle(tier);

  const cookIds = recentCooks.map(c => c.id as string);
  let cookLogMap: Record<string, any> = {};
  if (cookIds.length > 0) {
    const { data: logsData } = await supabase.from("cook_logs").select("*").in("cook_id", cookIds);
    for (const log of logsData ?? []) cookLogMap[log.cook_id] = log;
  }

  // ── LOGGED IN — render ─────────────────────────────────────────────────────

  return (
    <div>
      <style>{`
        @media (min-width: 768px) {
          .dashboard-two-col { grid-template-columns: 3fr 2fr !important; }
        }
        .qa-card:hover { border-color: rgba(201,151,58,0.4) !important; }
      `}</style>

      {heroSection}

      {/* Welcome row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--space-3) var(--space-4)", flexWrap: "wrap", gap: "var(--space-2)" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.4rem, 3vw, 2rem)", color: "#F5E6C8", margin: 0 }}>
          Welcome back, {displayName}
        </h1>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.78rem", padding: "4px 14px", borderRadius: "100px", background: badge.bg, color: "#C9973A", border: badge.border, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {badge.label}
        </span>
      </div>

      {/* Gospel verse card */}
      <div style={{ margin: "0 var(--space-4) var(--space-3)", background: "var(--color-bg-alt)", borderLeft: "3px solid #C9973A", padding: "var(--space-3) var(--space-4)", borderRadius: "var(--radius-md)" }}>
        <p style={{ fontFamily: "var(--font-body)", fontStyle: "italic", color: "#F5E6C8", fontSize: "0.95rem", margin: "0 0 var(--space-1)", lineHeight: 1.6 }}>
          &ldquo;{verse.text}&rdquo;
        </p>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.15em", margin: 0 }}>
          {verse.chapter}
        </p>
      </div>

      {/* Active cooks */}
      <div style={{ padding: "0 var(--space-4) var(--space-3)" }}>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 var(--space-2)" }}>
          On the Pit
        </p>

        {activeCooks.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {activeCooks.map(cook => {
              const plan    = cook.plan ?? {};
              const tools   = plan.tools ?? [];
              const smokerLine = [tools[0]?.name || cook.smoker_type, tools[0]?.wood || cook.wood_type].filter(Boolean).join(" · ");
              const countdown  = cook.eat_time ? formatCountdown(cook.eat_time) : null;
              return (
                <div key={cook.id} style={{ background: "var(--color-bg-alt)", border: "2px solid #C9973A", borderRadius: "var(--radius-lg)", boxShadow: "0 0 16px rgba(201,151,58,0.1)", padding: "var(--space-3) var(--space-4)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-3)" }}>
                  <div style={{ flex: "3 1 180px" }}>
                    <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "#F5E6C8", margin: "0 0 4px" }}>{cook.label || "Unnamed Cook"}</p>
                    {smokerLine && <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0 0 6px" }}>{smokerLine}</p>}
                    {countdown  && <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.9rem", color: "#C9973A", margin: 0 }}>{countdown}</p>}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", flex: "2 1 140px" }}>
                    <Link href={`/cook/${cook.id}/live`} style={{ display: "block", textAlign: "center", background: "#C9973A", color: "var(--color-bg)", fontFamily: "var(--font-ui)", fontSize: "0.8rem", padding: "6px 16px", borderRadius: "var(--radius-md)", textDecoration: "none" }}>
                      Live Mode →
                    </Link>
                    <Link href={`/cook/${cook.id}/timeline`} style={{ display: "block", textAlign: "center", background: "transparent", border: "1px solid rgba(201,151,58,0.5)", color: "#C9973A", fontFamily: "var(--font-ui)", fontSize: "0.8rem", padding: "6px 16px", borderRadius: "var(--radius-md)", textDecoration: "none" }}>
                      Timeline →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ border: "1px solid rgba(201,151,58,0.15)", background: "var(--color-bg-alt)", borderRadius: "var(--radius-lg)", padding: "var(--space-4)", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "#F5E6C8", margin: "0 0 var(--space-1)" }}>The pit is cold.</p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0 0 var(--space-3)" }}>Ready when you are.</p>
            <Link href="/" style={{ display: "inline-block", background: "#C9973A", color: "var(--color-bg)", fontFamily: "var(--font-ui)", fontSize: "0.85rem", padding: "8px 20px", borderRadius: "var(--radius-md)", textDecoration: "none" }}>
              Start a Cook →
            </Link>
          </div>
        )}
      </div>

      {/* Two column — recent cooks + pits */}
      <div className="dashboard-two-col" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-4)", maxWidth: "1200px", margin: "0 auto", padding: "var(--space-4)" }}>

        {/* Left — Recent Cooks */}
        <div>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 var(--space-2)" }}>Recent Cooks</p>

          {recentCooks.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {recentCooks.map(cook => {
                const log         = cookLogMap[cook.id];
                const plan        = cook.plan ?? {};
                const tools       = plan.tools ?? [];
                const smokerLine  = [tools[0]?.name || cook.smoker_type, tools[0]?.wood || cook.wood_type].filter(Boolean).join(" · ");
                const rating      = log?.rating ?? 0;
                const rawSummary  = log?.summary as string | null;
                const summary     = rawSummary ? (rawSummary.length > 80 ? rawSummary.slice(0, 80) + "..." : rawSummary) : null;
                const dateStr     = formatDate(cook.completed_at || cook.created_at);
                return (
                  <div key={cook.id} style={{ background: "var(--color-bg-alt)", border: "1px solid rgba(201,151,58,0.15)", borderRadius: "var(--radius-md)", padding: "var(--space-3)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px", flexWrap: "wrap", gap: "4px" }}>
                      <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.95rem", color: "var(--color-text)", margin: 0 }}>{cook.label || "Unnamed Cook"}</p>
                      <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "var(--color-text-muted)", margin: 0 }}>{dateStr}</p>
                    </div>
                    {smokerLine && <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text-muted)", margin: "0 0 var(--space-1)" }}>{smokerLine}</p>}
                    {log && (
                      <div style={{ marginBottom: "var(--space-1)" }}>
                        <span>{[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= rating ? "#C9973A" : "var(--color-text-muted)", fontSize: "0.85rem" }}>★</span>)}</span>
                        {summary && <p style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: "0.8rem", color: "var(--color-text-muted)", margin: "4px 0 0", lineHeight: 1.5 }}>{summary}</p>}
                      </div>
                    )}
                    <Link href={`/cook/${cook.id}`} style={{ fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#C9973A", textDecoration: "none" }}>View Cook →</Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0 }}>
              No completed cooks yet. Your history will build here.
            </p>
          )}

          <Link href="/logs" style={{ display: "inline-block", fontFamily: "var(--font-ui)", fontSize: "0.8rem", color: "#C9973A", textDecoration: "none", marginTop: "var(--space-3)" }}>
            View All History →
          </Link>
        </div>

        {/* Right — Your Pits */}
        <div>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 var(--space-2)" }}>Your Pits</p>

          {pits.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {pits.slice(0, 3).map(pit => (
                <div key={pit.id} style={{ background: "var(--color-bg-alt)", border: "1px solid rgba(201,151,58,0.15)", borderRadius: "var(--radius-md)", padding: "var(--space-3)" }}>
                  <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "0.95rem", color: "var(--color-text)", margin: "0 0 4px" }}>{pit.name}</p>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text-muted)", margin: "0 0 var(--space-2)" }}>
                    {[pit.type, pit.default_wood].filter(Boolean).join(" · ")}
                  </p>
                  <Link href="/" style={{ fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#C9973A", textDecoration: "none" }}>Cook on this →</Link>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0 0 var(--space-2)" }}>No pits added yet.</p>
              <Link href="/setup/pits" style={{ fontFamily: "var(--font-ui)", fontSize: "0.8rem", color: "#C9973A", textDecoration: "none" }}>Add a Pit →</Link>
            </div>
          )}
        </div>
      </div>

      {/* Tier-aware marketing */}
      {tier !== "pitmaster" && (
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
                Upgrade to Backyard and unlock advanced features including Secret Finishing Moves, Smoke Color Interpreter, and Pit Preacher Challenges.
              </p>
              <Link href="/premium" style={{ display: "inline-block", background: "#C9973A", color: "var(--color-bg)", fontFamily: "var(--font-ui)", fontSize: "0.85rem", padding: "10px 20px", borderRadius: "var(--radius-md)", textDecoration: "none" }}>
                Upgrade to Backyard — $7.99/mo
              </Link>
            </div>
          )}

          {tier === "backyard" && (
            <div style={{ background: "var(--color-bg-alt)", border: "1px solid rgba(201,151,58,0.1)", borderRadius: "var(--radius-lg)", padding: "var(--space-3) var(--space-4)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-2)" }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0 }}>
                Ready for the Pitmaster tier? Unlock The Pitmaster&apos;s Table and elite techniques.
              </p>
              <Link href="/premium" style={{ fontFamily: "var(--font-ui)", fontSize: "0.8rem", color: "#C9973A", textDecoration: "none", whiteSpace: "nowrap" }}>
                Learn more →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-3)", padding: "var(--space-4)", maxWidth: "1200px", margin: "0 auto" }}>
        {[
          { label: "Start a New Cook",   href: "/"        },
          { label: "Cook History",        href: "/logs"    },
          { label: "Premium Features",    href: "/premium" },
        ].map(action => (
          <Link key={action.label} href={action.href} className="qa-card" style={{ background: "var(--color-bg-alt)", border: "1px solid rgba(201,151,58,0.15)", borderRadius: "var(--radius-lg)", padding: "var(--space-3)", textAlign: "center", textDecoration: "none", display: "block", transition: "border-color 0.12s" }}>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.85rem", color: "var(--color-text)", margin: "0 0 4px" }}>{action.label}</p>
            <p style={{ color: "#C9973A", margin: 0 }}>→</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
