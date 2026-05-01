"use client";

import { use, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { getRandomVerse } from "@/lib/verses";
import Link from "next/link";

type PlanTool = { id: string; name: string; wood: string };
type PlanItem = {
  name: string;
  quantity?: number;
  weight?: string | number | null;
  smokerId?: string | null;
};
type CookPlan = {
  tools?: PlanTool[];
  items?: PlanItem[];
  preacherPlan?: string;
  preacherReflection?: string;
};

function capitalize(str: string): string {
  return str.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: "short", month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  } catch { return iso; }
}

function formatElapsedTime(start: string, end: string): string {
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  if (diffMs < 0) return "—";
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export default function SummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: cookId } = use(params);
  const supabase = createClient();

  const [cook, setCook] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [cookLog, setCookLog] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [reflection, setReflection] = useState<string | null>(null);
  const [reflectionLoading, setReflectionLoading] = useState(false);

  const [editingVerdict, setEditingVerdict] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [summary, setSummary] = useState("");
  const [lessons, setLessons] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [showVerseOverlay, setShowVerseOverlay] = useState(false);
  const [completionVerse] = useState(() => getRandomVerse());

  useEffect(() => { loadData(); }, [cookId]);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: cookData } = await supabase
      .from("cooks").select("*").eq("id", cookId).single();

    const [itemsResult, eventsResult, logResult] = await Promise.all([
      supabase.from("cook_items").select("*").eq("cook_id", cookId),
      supabase.from("cook_events").select("*").eq("cook_id", cookId).order("created_at", { ascending: false }),
      supabase.from("cook_logs").select("*").eq("cook_id", cookId).maybeSingle(),
    ]);

    setCook(cookData);
    setItems(itemsResult.data || []);
    setEvents(eventsResult.data || []);
    setCookLog(logResult.data);

    if (cookData?.prep_session_id) {
      const { data: sessionData } = await supabase
        .from("meal_prep_sessions").select("*").eq("id", cookData.prep_session_id).single();
      setSession(sessionData);
    }

    setLoading(false);

    const existingPlan = cookData?.plan as CookPlan | null;
    if (existingPlan?.preacherReflection) {
      setReflection(existingPlan.preacherReflection);
    } else if (cookData?.status === "completed") {
      fetchReflection(cookData, itemsResult.data || [], eventsResult.data || []);
    }
  };

  const fetchReflection = async (cookData: any, cookItems: any[], cookEvents: any[]) => {
    setReflectionLoading(true);
    const plan = cookData.plan as CookPlan | null;
    const planTools: PlanTool[] = plan?.tools ?? [];
    const planItemsList: PlanItem[] = plan?.items ?? [];
    const recentEvents = cookEvents
      .filter((e: any) => e.event_type !== "preacher_chat")
      .slice(0, 5)
      .map((e: any) => ({ created_at: e.created_at, type: e.event_type, note: e.note }));

    try {
      const res = await fetch("/api/preacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cookId: cookData.id,
          message: "REFLECTION: Write a 2-3 sentence personal reflection on this completed cook. Reference the specific meat, smoker, wood, and cook time. Sound like a pitmaster who watched this cook happen. Be specific not generic. End with one line of scripture.",
          cookContext: {
            label: cookData.label,
            smoker_type: cookData.smoker_type,
            wood_type: cookData.wood_type,
            eat_time: cookData.eat_time,
            tools: planTools,
            planItems: planItemsList,
            recentEvents,
          },
        }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      const json = await res.json();
      const reply: string = json.reply ?? "";
      setReflection(reply);

      if (reply) {
        await supabase
          .from("cooks")
          .update({ plan: { ...(cookData.plan ?? {}), preacherReflection: reply } })
          .eq("id", cookData.id);
      }
    } catch (err) {
      console.error("Reflection fetch failed:", err);
    } finally {
      setReflectionLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!summary.trim()) { alert("Please add a summary"); return; }
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("You must be logged in"); setSubmitting(false); return; }

    if (cookLog && editingVerdict) {
      const { error } = await supabase.from("cook_logs")
        .update({ summary, lessons, rating })
        .eq("id", cookLog.id);
      if (error) { console.error(error); alert("Error updating verdict"); setSubmitting(false); return; }
      setSubmitting(false);
      setEditingVerdict(false);
      loadData();
      return;
    }

    const { error: logError } = await supabase.from("cook_logs").insert({
      cook_id: cookId, user_id: user.id, summary, lessons, rating,
    });

    if (logError) { console.error(logError); alert("Error saving verdict"); setSubmitting(false); return; }

    if (!cook?.completed_at) {
      await supabase.from("cooks")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", cookId);
    }

    setSubmitting(false);
    setShowVerseOverlay(true);
    setTimeout(() => {
      setShowVerseOverlay(false);
      window.location.reload();
    }, 3000);
  };

  if (loading) {
    return (
      <div style={{ padding: "40px", fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
        Loading...
      </div>
    );
  }

  if (!cook) {
    return (
      <div style={{ padding: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Cook Not Found</h1>
      </div>
    );
  }

  const plan = cook?.plan as CookPlan | null;
  const planTools: PlanTool[] = plan?.tools ?? [];

  const smokerSubtitle = [
    planTools.map(t => t.name).filter(Boolean).join(", ") || cook?.smoker_type || null,
    planTools.map(t => t.wood).filter(Boolean).join(", ") || cook?.wood_type || null,
    cook?.eat_time ? formatDateTime(cook.eat_time) : null,
  ].filter(Boolean).join(" · ");

  const flavorSmoke = session?.flavor_smoke;
  const flavorBark = session?.flavor_bark;
  const flavorTenderness = session?.flavor_tenderness;
  const hasFlavorData = flavorSmoke != null || flavorBark != null || flavorTenderness != null;
  const statusIsCompleted = cook?.status === "completed";

  const nonChatEvents = events.filter(e => e.event_type !== "preacher_chat");
  const cookStart = cook.actual_start ?? cook.created_at;
  const cookTimeDisplay = cook.completed_at && cookStart
    ? formatElapsedTime(cookStart, cook.completed_at)
    : "—";

  const NAV_LINKS = [
    { label: "Live Mode", href: `/cook/${cookId}/live` },
    { label: "Timeline",  href: `/cook/${cookId}/timeline` },
    { label: "Guide",     href: `/cook/${cookId}/guide` },
    { label: "Journal",   href: `/cook/${cookId}/events` },
    { label: "Summary",   href: `/cook/${cookId}/summary`, active: true },
  ];

  const cardStyle: React.CSSProperties = {
    background: "var(--color-bg-alt)",
    border: "1px solid rgba(201,151,58,0.15)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-4)",
  };

  const textareaStyle: React.CSSProperties = {
    width: "100%",
    padding: "var(--space-2)",
    background: "var(--color-bg)",
    border: "1px solid rgba(201,151,58,0.3)",
    borderRadius: "var(--radius-md)",
    color: "var(--color-text)",
    fontFamily: "var(--font-body)",
    fontSize: "1rem",
    boxSizing: "border-box",
    resize: "vertical",
  };

  const statLabelStyle: React.CSSProperties = {
    fontFamily: "var(--font-ui)",
    fontSize: "0.7rem",
    color: "var(--color-text-muted)",
    textTransform: "uppercase",
  };

  const statValueStyle: React.CSSProperties = {
    fontFamily: "var(--font-body)",
    fontSize: "0.9rem",
    color: "var(--color-text)",
    textAlign: "right",
    maxWidth: "60%",
  };

  const showForm = !cookLog || editingVerdict;

  return (
    <div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .cook-nav-btn {
          background: transparent;
          border: 1px solid rgba(201,151,58,0.3);
          color: var(--color-text-muted);
          font-family: var(--font-ui);
          font-size: 0.8rem;
          padding: 6px 14px;
          border-radius: var(--radius-md);
          cursor: pointer;
          text-decoration: none;
          transition: border-color 0.12s, color 0.12s;
          display: inline-block;
          white-space: nowrap;
        }
        .cook-nav-btn:hover { border-color: #C9973A; color: #C9973A; }
        .cook-nav-btn-active { border-color: #C9973A !important; color: #C9973A !important; }
        @media (max-width: 767px) {
          .cook-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── VERSE OVERLAY ── */}
      {showVerseOverlay && (
        <div style={{
          position: "fixed", inset: 0, background: "var(--color-bg)", zIndex: 999,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "var(--space-5)", textAlign: "center",
        }}>
          <p style={{
            fontFamily: "var(--font-heading)", fontStyle: "italic",
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)", color: "var(--color-text)",
            maxWidth: "600px", lineHeight: 1.55, marginBottom: "var(--space-4)",
          }}>
            &ldquo;{completionVerse.text}&rdquo;
          </p>
          <p style={{
            fontFamily: "var(--font-ui)", color: "var(--color-accent)",
            textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.9rem", margin: 0,
          }}>
            ✦ Well done, Pitmaster ✦
          </p>
        </div>
      )}

      {/* ── PAGE TITLE ── */}
      <div style={{
        fontFamily: "var(--font-heading)",
        fontSize: "clamp(1.4rem, 3vw, 2rem)",
        color: "#F5E6C8",
        padding: "var(--space-2) var(--space-4) 0",
      }}>
        The Verdict
      </div>

      {/* ── MISSION CARD ── */}
      <div style={{
        background: "var(--color-bg-alt)",
        borderBottom: "1px solid rgba(201,151,58,0.2)",
        padding: "var(--space-3) var(--space-4)",
      }}>
        <h1 style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(1.4rem, 3vw, 2rem)",
          color: "#F5E6C8",
          margin: "0 0 var(--space-1)",
          lineHeight: 1.1,
        }}>
          {cook.label}
        </h1>

        {smokerSubtitle && (
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            color: "var(--color-text-muted)",
            margin: "0 0 var(--space-2)",
          }}>
            {smokerSubtitle}
          </p>
        )}

        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <span style={{
            fontFamily: "var(--font-ui)", fontSize: "0.78rem", padding: "3px 10px",
            borderRadius: "var(--radius-md)", textTransform: "uppercase", letterSpacing: "0.06em",
            background: statusIsCompleted ? "rgba(45,106,79,0.2)" : "rgba(201,151,58,0.2)",
            color: statusIsCompleted ? "#2D6A4F" : "#C9973A",
          }}>
            {cook.status ? capitalize(cook.status) : "In Progress"}
          </span>

          {cook.cooking_style && (
            <span style={{
              fontFamily: "var(--font-ui)", fontSize: "0.78rem", padding: "3px 10px",
              borderRadius: "var(--radius-md)", textTransform: "uppercase", letterSpacing: "0.06em",
              background: "rgba(201,151,58,0.12)", color: "var(--color-text-muted)",
            }}>
              {capitalize(cook.cooking_style)}
            </span>
          )}

          {hasFlavorData && (
            <span style={{
              fontFamily: "var(--font-ui)", fontSize: "0.78rem", padding: "3px 10px",
              borderRadius: "var(--radius-md)", background: "rgba(201,151,58,0.08)", color: "var(--color-text-muted)",
            }}>
              Smoke {flavorSmoke ?? "—"} · Bark {flavorBark ?? "—"} · Tenderness {flavorTenderness ?? "—"}
            </span>
          )}
        </div>
      </div>

      {/* ── TWO COLUMN GRID ── */}
      <div
        className="cook-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "3fr 2fr",
          gap: "var(--space-4)",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "var(--space-3) var(--space-4) 80px",
        }}
      >
        {/* ── LEFT COLUMN ── */}
        <div>
          {/* Cook Stats Card */}
          <div style={cardStyle}>
            <div style={{
              fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#C9973A",
              textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "var(--space-3)",
            }}>
              The Cook
            </div>

            {[
              { label: "Items", value: items.map((i: any) => i.name).join(" · ") || "—" },
              { label: "Smoker", value: cook.smoker_type || "—" },
              { label: "Wood", value: cook.wood_type || "—" },
              { label: "Completed", value: cook.completed_at ? new Date(cook.completed_at).toLocaleString() : "—" },
              { label: "Events logged", value: String(nonChatEvents.length) },
              { label: "Cook time", value: cookTimeDisplay },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "baseline",
                borderBottom: "1px solid rgba(201,151,58,0.08)",
                padding: "var(--space-1) 0",
              }}>
                <span style={statLabelStyle}>{label}</span>
                <span style={statValueStyle}>{value}</span>
              </div>
            ))}
          </div>

          {/* Preacher Reflection Card */}
          <div style={{
            ...cardStyle,
            marginTop: "var(--space-3)",
            borderLeft: "3px solid #C9973A",
          }}>
            <div style={{
              display: "flex", flexDirection: "row", gap: "var(--space-2)",
              alignItems: "center", marginBottom: "var(--space-3)",
            }}>
              <img
                src="/logo.jpeg"
                alt="The Pit Preacher"
                style={{
                  width: 36, height: 36, borderRadius: "50%", objectFit: "cover",
                  animation: reflectionLoading ? "pulse 1.5s ease-in-out infinite" : undefined,
                }}
              />
              <span style={{ fontFamily: "var(--font-heading)", color: "#F5E6C8", fontSize: "1rem" }}>
                The Preacher&apos;s Read
              </span>
            </div>

            {reflectionLoading ? (
              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                {[0, 0.2, 0.4].map((delay, i) => (
                  <span key={i} style={{
                    display: "inline-block", width: 7, height: 7, borderRadius: "50%",
                    background: "#C9973A", opacity: 0.6,
                    animation: `pulse 1.2s ease-in-out ${delay}s infinite`,
                  }} />
                ))}
              </div>
            ) : reflection ? (
              <p style={{
                fontFamily: "var(--font-body)", fontStyle: "italic",
                color: "#F5E6C8", fontSize: "0.95rem", lineHeight: 1.7, margin: 0,
              }}>
                {reflection}
              </p>
            ) : (
              <p style={{
                fontFamily: "var(--font-body)", color: "var(--color-text-muted)",
                fontSize: "0.9rem", margin: 0,
              }}>
                Complete the cook to receive the Preacher&apos;s reflection.
              </p>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div>
          {cookLog && !editingVerdict ? (
            /* Verdict Display */
            <div style={cardStyle}>
              <div style={{
                fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#C9973A",
                textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "var(--space-3)",
              }}>
                The Verdict
              </div>

              <div>
                {Array.from({ length: cookLog.rating ?? 0 }, (_, i) => (
                  <span key={i} style={{ fontSize: "2rem", color: "#C9973A" }}>★</span>
                ))}
                {Array.from({ length: 5 - (cookLog.rating ?? 0) }, (_, i) => (
                  <span key={i} style={{ fontSize: "2rem", color: "var(--color-text-muted)" }}>☆</span>
                ))}
              </div>

              <p style={{
                fontFamily: "var(--font-heading)", fontStyle: "italic",
                color: "#F5E6C8", fontSize: "1.1rem", lineHeight: 1.5,
                marginTop: "var(--space-3)", marginBottom: 0,
              }}>
                {cookLog.summary}
              </p>

              {cookLog.lessons && (
                <p style={{
                  fontFamily: "var(--font-body)", color: "var(--color-text-muted)",
                  fontSize: "0.9rem", marginTop: "var(--space-2)", marginBottom: 0,
                }}>
                  {cookLog.lessons}
                </p>
              )}

              <button
                onClick={() => {
                  setRating(cookLog.rating ?? 0);
                  setSummary(cookLog.summary || "");
                  setLessons(cookLog.lessons || "");
                  setEditingVerdict(true);
                }}
                style={{
                  display: "block", marginTop: "var(--space-3)",
                  background: "none", border: "none",
                  color: "#C9973A", fontFamily: "var(--font-ui)",
                  fontSize: "0.75rem", cursor: "pointer", padding: 0,
                }}
              >
                Edit Verdict
              </button>
            </div>
          ) : (
            /* Verdict Form */
            <div style={cardStyle}>
              <div style={{
                fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#C9973A",
                textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "var(--space-3)",
              }}>
                {editingVerdict ? "Edit Verdict" : "Seal the Cook"}
              </div>

              {/* Rating */}
              <div style={{ marginBottom: "var(--space-3)" }}>
                <div style={{
                  fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#C9973A",
                  textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "var(--space-1)",
                }}>
                  Your Rating
                </div>
                <div>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverStar(star)}
                      onMouseLeave={() => setHoverStar(0)}
                      style={{
                        background: "none", border: "none", fontSize: "2rem",
                        cursor: "pointer", padding: "0 2px",
                        color: star <= (hoverStar || rating) ? "#C9973A" : "var(--color-text-muted)",
                      }}
                    >
                      {star <= (hoverStar || rating) ? "★" : "☆"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div style={{ marginBottom: "var(--space-3)" }}>
                <div style={{
                  fontFamily: "var(--font-ui)", fontSize: "0.75rem",
                  color: "var(--color-text-muted)", textTransform: "uppercase",
                  marginBottom: "var(--space-1)",
                }}>
                  How did it turn out?
                </div>
                <textarea
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  rows={4}
                  style={textareaStyle}
                />
              </div>

              {/* Lessons */}
              <div>
                <div style={{
                  fontFamily: "var(--font-ui)", fontSize: "0.75rem",
                  color: "var(--color-text-muted)", textTransform: "uppercase",
                  marginBottom: "var(--space-1)",
                }}>
                  What would you do differently?
                </div>
                <textarea
                  value={lessons}
                  onChange={e => setLessons(e.target.value)}
                  rows={3}
                  style={textareaStyle}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{
                  width: "100%", background: "#C9973A", color: "var(--color-bg)",
                  fontFamily: "var(--font-ui)", fontSize: "1rem", padding: "12px",
                  borderRadius: "var(--radius-lg)", border: "none",
                  cursor: submitting ? "not-allowed" : "pointer",
                  marginTop: "var(--space-3)", opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "Saving..." : "Seal the Cook ✦"}
              </button>

              {editingVerdict && (
                <button
                  onClick={() => setEditingVerdict(false)}
                  style={{
                    width: "100%", background: "transparent",
                    border: "1px solid rgba(201,151,58,0.3)",
                    color: "var(--color-text-muted)", fontFamily: "var(--font-ui)",
                    fontSize: "0.85rem", padding: "8px", borderRadius: "var(--radius-md)",
                    cursor: "pointer", marginTop: "var(--space-2)",
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── STICKY BOTTOM BAR ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "var(--color-bg-alt)",
        borderTop: "1px solid rgba(201,151,58,0.2)",
        padding: "var(--space-2) var(--space-4)",
        display: "flex", justifyContent: "center", gap: "var(--space-3)", flexWrap: "wrap",
      }}>
        {NAV_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`cook-nav-btn${link.active ? " cook-nav-btn-active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
