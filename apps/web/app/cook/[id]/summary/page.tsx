"use client";

import { use, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { getRandomVerse } from "@/lib/verses";
import Link from "next/link";
import PitmasterInsightsOverlay from "@/components/insights/PitmasterInsightsOverlay";
import { normalizeMeatType, normalizePitType } from "@/lib/insights/normalizers";

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

type CookRow = {
  id: string;
  label: string | null;
  status: string;
  created_at: string | null;
  actual_start: string | null;
  completed_at: string | null;
  eat_time: string | null;
  smoker_type: string | null;
  wood_type: string | null;
  cooking_style: string | null;
  prep_session_id: string | null;
  plan: unknown;
};
type CookItemRow = {
  id: string;
  cook_id: string;
  name: string;
};
type CookEventRow = {
  id: string;
  cook_id: string;
  event_type: string;
  created_at: string | null;
};
type CookLogRow = {
  id: string;
  cook_id: string;
  rating: number | null;
  summary: string | null;
  lessons: string | null;
};
type OutcomeRow = {
  id: string;
  cook_id: string | null;
  start_time_actual: string | null;
  finish_time_actual: string | null;
  rest_time_minutes: number | null;
  pit_temp_low: number | null;
  pit_temp_high: number | null;
  wood_used: string | null;
  stall_time_minutes: number | null;
  final_internal_temp: number | null;
  weather_impact: string | null;
  fire_issues: string | null;
  adjustments_made: string | null;
  tenderness: number | null;
  bark_quality: number | null;
  moisture_level: number | null;
  smoke_profile: number | null;
  flavor_balance: number | null;
  overall_success: number | null;
  wrap_time: string | null;
};
type TrackerNotesRow = {
  id: string;
  cook_id: string | null;
  note_1: string | null;
  note_2: string | null;
  note_3: string | null;
  note_4: string | null;
  note_5: string | null;
};
type SessionRow = {
  id: string;
  flavor_smoke: number | null;
  flavor_bark: number | null;
  flavor_tenderness: number | null;
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

const RATING_LABELS: Record<number, string> = {
  1: "Poor", 2: "Below Average", 3: "Solid", 4: "Great", 5: "Perfect",
};

export default function SummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: cookId } = use(params);
  const supabase = createClient();

  const [cook, setCook] = useState<CookRow | null>(null);
  const [items, setItems] = useState<CookItemRow[]>([]);
  const [events, setEvents] = useState<CookEventRow[]>([]);
  const [cookLog, setCookLog] = useState<CookLogRow | null>(null);
  const [session, setSession] = useState<SessionRow | null>(null);
  const [outcome, setOutcome] = useState<OutcomeRow | null>(null);
  const [trackerNotes, setTrackerNotes] = useState<TrackerNotesRow | null>(null);
  const [userTier, setUserTier] = useState<string>("free");
  const [insights, setInsights] = useState<{
    patternInsights: string[];
    pitInsights: string[];
    nextTimeRecommendations: string[];
  } | null>(null);
  const [confidenceScore, setConfidenceScore] = useState<{
    score: number;
    breakdown: {
      pitStability: number;
      planAdherence: number;
      outcomeConsistency: number;
      cookEfficiency: number;
    };
    notes: string[];
  } | null>(null);
  const [fireControlScore, setFireControlScore] = useState<{
    score: number;
    breakdown: { stability: number; responsiveness: number; efficiency: number };
    notes: string[];
  } | null>(null);
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

  const [copied, setCopied] = useState(false);
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => { loadData(); }, [cookId]);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: subData } = await supabase
      .from("subscriptions")
      .select("tier")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    setUserTier(subData?.tier ?? "free");

    const { data: cookData } = await supabase
      .from("cooks").select("*").eq("id", cookId).single();

    const [itemsResult, eventsResult, logResult, outcomeResult, trackerNotesResult] = await Promise.all([
      supabase.from("cook_items").select("*").eq("cook_id", cookId),
      supabase.from("cook_events").select("*").eq("cook_id", cookId).order("created_at", { ascending: false }),
      supabase.from("cook_logs").select("*").eq("cook_id", cookId).maybeSingle(),
      supabase.from("cook_outcomes").select("*").eq("cook_id", cookId).maybeSingle(),
      supabase.from("cook_tracker_notes").select("*").eq("cook_id", cookId).maybeSingle(),
    ]);

    setCook(cookData);
    setItems(itemsResult.data || []);
    setEvents(eventsResult.data || []);
    setCookLog(logResult.data);
    setOutcome(outcomeResult.data);
    setTrackerNotes(trackerNotesResult.data);

    if (outcomeResult.data) {
      fetch(`/api/insights?cookId=${cookId}`)
        .then(r => r.json())
        .then(setInsights)
        .catch(console.error);

      fetch(`/api/confidence?cookId=${cookId}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d && !d.error) setConfidenceScore(d); })
        .catch(console.error);

      fetch(`/api/fire-control?cookId=${cookId}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d && !d.error) setFireControlScore(d); })
        .catch(console.error);
    }

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

  const hasTrackerData = !!(outcome || trackerNotes);

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

  const trackerLabelStyle: React.CSSProperties = {
    fontFamily: "var(--font-ui)",
    fontSize: "0.7rem",
    color: "var(--color-text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: "var(--space-2)",
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
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "var(--space-2) var(--space-4) 0",
      }}>
        <span style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(1.4rem, 3vw, 2rem)",
          color: "#F5E6C8",
        }}>
          The Verdict
        </span>
        <button
          onClick={handleCopyLink}
          style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: "5px",
            color: "#C9973A", fontFamily: "var(--font-ui)", fontSize: "0.75rem",
            padding: "4px 0", opacity: 0.85,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
          {copied ? "Link copied" : "Share Cook"}
        </button>
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

          {hasTrackerData && (
            <span style={{
              fontFamily: "var(--font-ui)", fontSize: "0.78rem", padding: "3px 10px",
              borderRadius: "var(--radius-md)", background: "rgba(201,151,58,0.12)", color: "#C9973A",
            }}>
              ✦ Tracked
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
          paddingTop: "var(--space-3)",
        paddingLeft: "var(--space-4)",
        paddingRight: "var(--space-4)",
        paddingBottom: "calc(80px + env(safe-area-inset-bottom))",
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
              { label: "Items", value: items.map(i => i.name).join(" · ") || "—" },
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

          {/* ── COOK TRACKER SECTION ── */}
          {hasTrackerData && (
            <div style={{ marginTop: "var(--space-4)" }}>
              <div style={{
                fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#C9973A",
                textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "var(--space-3)",
              }}>
                Cook Tracker
              </div>

              {/* Actual Times */}
              {outcome && (outcome.start_time_actual || outcome.finish_time_actual || outcome.rest_time_minutes) && (
                <div style={{ ...cardStyle, marginBottom: "var(--space-3)" }}>
                  <div style={trackerLabelStyle}>Actual Times</div>
                  {[
                    { label: "Start", value: outcome.start_time_actual ? new Date(outcome.start_time_actual).toLocaleString() : null },
                    { label: "Finish", value: outcome.finish_time_actual ? new Date(outcome.finish_time_actual).toLocaleString() : null },
                    { label: "Rest", value: outcome.rest_time_minutes ? `${outcome.rest_time_minutes} min` : null },
                  ].filter(r => r.value).map(({ label, value }) => (
                    <div key={label} style={{
                      display: "flex", justifyContent: "space-between",
                      borderBottom: "1px solid rgba(201,151,58,0.08)", padding: "var(--space-1) 0",
                    }}>
                      <span style={statLabelStyle}>{label}</span>
                      <span style={statValueStyle}>{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Pit Behavior */}
              {outcome && (outcome.pit_temp_low || outcome.pit_temp_high || outcome.wood_used || outcome.fire_issues || outcome.weather_impact || outcome.stall_time_minutes || outcome.final_internal_temp || outcome.adjustments_made) && (
                <div style={{ ...cardStyle, marginBottom: "var(--space-3)" }}>
                  <div style={trackerLabelStyle}>Pit Behavior</div>
                  {[
                    { label: "Temp Range", value: outcome.pit_temp_low && outcome.pit_temp_high ? `${outcome.pit_temp_low}°F – ${outcome.pit_temp_high}°F` : null },
                    { label: "Wood", value: outcome.wood_used },
                    { label: "Stall", value: outcome.stall_time_minutes ? `${outcome.stall_time_minutes} min` : null },
                    { label: "Final Temp", value: outcome.final_internal_temp ? `${outcome.final_internal_temp}°F` : null },
                    { label: "Weather", value: outcome.weather_impact },
                    { label: "Fire Issues", value: outcome.fire_issues },
                    { label: "Adjustments", value: outcome.adjustments_made },
                  ].filter(r => r.value).map(({ label, value }) => (
                    <div key={label} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                      gap: "var(--space-2)", borderBottom: "1px solid rgba(201,151,58,0.08)", padding: "var(--space-1) 0",
                    }}>
                      <span style={statLabelStyle}>{label}</span>
                      <span style={{ ...statValueStyle, maxWidth: "65%" }}>{value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Outcome Ratings */}
              {outcome && (outcome.tenderness || outcome.bark_quality || outcome.moisture_level || outcome.smoke_profile || outcome.flavor_balance || outcome.overall_success) && (
                <div style={{ ...cardStyle, marginBottom: "var(--space-3)" }}>
                  <div style={trackerLabelStyle}>Outcome</div>
                  {[
                    { label: "Tenderness", value: outcome.tenderness },
                    { label: "Bark", value: outcome.bark_quality },
                    { label: "Moisture", value: outcome.moisture_level },
                    { label: "Smoke", value: outcome.smoke_profile },
                    { label: "Flavor", value: outcome.flavor_balance },
                    { label: "Overall", value: outcome.overall_success },
                  ].filter(r => r.value).map(({ label, value }) => (
                    <div key={label} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      borderBottom: "1px solid rgba(201,151,58,0.08)", padding: "var(--space-1) 0",
                    }}>
                      <span style={statLabelStyle}>{label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "#C9973A", fontSize: "0.9rem" }}>
                          {"★".repeat(value!)}{"☆".repeat(5 - value!)}
                        </span>
                        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                          {RATING_LABELS[value!]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Next-Time Notes */}
              {trackerNotes && [trackerNotes.note_1, trackerNotes.note_2, trackerNotes.note_3, trackerNotes.note_4, trackerNotes.note_5].some(Boolean) && (
                <div style={cardStyle}>
                  <div style={trackerLabelStyle}>Next Time</div>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {[trackerNotes.note_1, trackerNotes.note_2, trackerNotes.note_3, trackerNotes.note_4, trackerNotes.note_5]
                      .filter((n): n is string => Boolean(n))
                      .map((note, i: number) => (
                        <li key={i} style={{
                          display: "flex", gap: "var(--space-2)",
                          fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text)",
                          padding: "var(--space-1) 0", borderBottom: "1px solid rgba(201,151,58,0.08)",
                        }}>
                          <span style={{ color: "#C9973A", flexShrink: 0 }}>—</span>
                          <span>{note}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}


          {/* ── COOK INSIGHTS SECTION ── */}
          {insights && (insights.patternInsights.length > 0 || insights.pitInsights.length > 0 || insights.nextTimeRecommendations.length > 0) && (
            <div style={{ marginTop: "var(--space-4)" }}>
              <div style={{
                fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#C9973A",
                textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "var(--space-3)",
              }}>
                Cook Insights
              </div>

              {/* Pattern Insights */}
              {insights.patternInsights.length > 0 && (
                <div style={{ ...cardStyle, marginBottom: "var(--space-3)" }}>
                  <div style={trackerLabelStyle}>Patterns</div>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {insights.patternInsights.map((insight, i) => (
                      <li key={i} style={{
                        display: "flex", gap: "var(--space-2)",
                        fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text)",
                        padding: "var(--space-1) 0", borderBottom: "1px solid rgba(201,151,58,0.08)",
                        lineHeight: 1.5,
                      }}>
                        <span style={{ color: "#C9973A", flexShrink: 0, marginTop: "2px" }}>◆</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Pit-Specific Insights */}
              {insights.pitInsights.length > 0 && (
                <div style={{ ...cardStyle, marginBottom: "var(--space-3)" }}>
                  <div style={trackerLabelStyle}>Your Pit</div>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {insights.pitInsights.map((insight, i) => (
                      <li key={i} style={{
                        display: "flex", gap: "var(--space-2)",
                        fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text)",
                        padding: "var(--space-1) 0", borderBottom: "1px solid rgba(201,151,58,0.08)",
                        lineHeight: 1.5,
                      }}>
                        <span style={{ color: "#C9973A", flexShrink: 0, marginTop: "2px" }}>◆</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next-Time Recommendations */}
              {insights.nextTimeRecommendations.length > 0 && (
                <div style={cardStyle}>
                  <div style={trackerLabelStyle}>Next Time</div>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {insights.nextTimeRecommendations.map((rec, i) => (
                      <li key={i} style={{
                        display: "flex", gap: "var(--space-2)",
                        fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text)",
                        padding: "var(--space-1) 0", borderBottom: "1px solid rgba(201,151,58,0.08)",
                        lineHeight: 1.5,
                      }}>
                        <span style={{ color: "#C9973A", flexShrink: 0, marginTop: "2px" }}>—</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {/* Track this cook CTA if not yet tracked */}
          {!hasTrackerData && statusIsCompleted && (
            <div style={{
              ...cardStyle,
              marginTop: "var(--space-3)",
              border: "1px solid rgba(201,151,58,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--space-3)",
              flexWrap: "wrap",
            }}>
              <div>
                <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.8rem", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px" }}>
                  Cook Tracker
                </p>
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-muted)", margin: 0 }}>
                  Capture what actually happened to improve your next cook.
                </p>
              </div>
              <Link href={`/cook/${cookId}/tracker`} style={{
                background: "#C9973A",
                color: "var(--color-bg)",
                fontFamily: "var(--font-ui)",
                fontSize: "0.8rem",
                padding: "8px 16px",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}>
                Track This Cook
              </Link>
            </div>
          )}


          {/* ── PLANNED VS ACTUAL ── */}
          {outcome && (
            <div style={{ marginTop: "var(--space-4)" }}>
              <div style={{
                fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#C9973A",
                textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "var(--space-3)",
              }}>
                Planned vs Actual
              </div>
              <div style={cardStyle}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "var(--space-2)",
                  marginBottom: "var(--space-2)",
                }}>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.1em" }}>Planned</div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.1em" }}>Actual</div>
                </div>
                {[
                  {
                    label: "Start",
                    planned: cook.created_at ? new Date(cook.created_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "—",
                    actual: outcome.start_time_actual ? new Date(outcome.start_time_actual).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "—",
                  },
                  {
                    label: "Finish",
                    planned: cook.eat_time ? new Date(cook.eat_time).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "—",
                    actual: outcome.finish_time_actual ? new Date(outcome.finish_time_actual).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "—",
                  },
                  {
                    label: "Rest",
                    planned: "60 min",
                    actual: outcome.rest_time_minutes ? `${outcome.rest_time_minutes} min` : "—",
                  },
                  {
                    label: "Final Temp",
                    planned: "203°F",
                    actual: outcome.final_internal_temp ? `${outcome.final_internal_temp}°F` : "—",
                  },
                ].map(({ label, planned, actual }) => (
                  <div key={label} style={{
                    display: "grid",
                    gridTemplateColumns: "80px 1fr 1fr",
                    gap: "var(--space-2)",
                    alignItems: "center",
                    borderBottom: "1px solid rgba(201,151,58,0.08)",
                    padding: "var(--space-1) 0",
                  }}>
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>{label}</span>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{planned}</span>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text)", fontWeight: "500" }}>{actual}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── COOK TRACKER RESULTS ── */}
          {outcome && (
            <div style={{ marginTop: "var(--space-4)" }}>
              <div style={{
                fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#C9973A",
                textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "var(--space-3)",
              }}>
                Cook Tracker Results
              </div>

              {/* Pit Behavior */}
              <div style={{ ...cardStyle, marginBottom: "var(--space-3)" }}>
                <div style={trackerLabelStyle}>Pit Behavior</div>
                {[
                  { label: "Temp Range", value: outcome.pit_temp_low && outcome.pit_temp_high ? `${outcome.pit_temp_low}°F – ${outcome.pit_temp_high}°F` : null },
                  { label: "Wood", value: outcome.wood_used },
                  { label: "Stall", value: outcome.stall_time_minutes ? `${outcome.stall_time_minutes} min` : null },
                  { label: "Wrap Time", value: outcome.wrap_time ? new Date(outcome.wrap_time).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : null },
                  { label: "Final Temp", value: outcome.final_internal_temp ? `${outcome.final_internal_temp}°F` : null },
                  { label: "Weather", value: outcome.weather_impact },
                  { label: "Fire Issues", value: outcome.fire_issues },
                  { label: "Adjustments", value: outcome.adjustments_made },
                ].filter(r => r.value).map(({ label, value }) => (
                  <div key={label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                    gap: "var(--space-2)", borderBottom: "1px solid rgba(201,151,58,0.08)", padding: "var(--space-1) 0",
                  }}>
                    <span style={statLabelStyle}>{label}</span>
                    <span style={{ ...statValueStyle, maxWidth: "65%" }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Outcome Ratings */}
              {(outcome.tenderness || outcome.bark_quality || outcome.moisture_level || outcome.smoke_profile || outcome.flavor_balance || outcome.overall_success) && (
                <div style={cardStyle}>
                  <div style={trackerLabelStyle}>Outcome Ratings</div>
                  {[
                    { label: "Tenderness", value: outcome.tenderness },
                    { label: "Bark", value: outcome.bark_quality },
                    { label: "Moisture", value: outcome.moisture_level },
                    { label: "Smoke", value: outcome.smoke_profile },
                    { label: "Flavor", value: outcome.flavor_balance },
                    { label: "Overall", value: outcome.overall_success },
                  ].filter(r => r.value).map(({ label, value }) => (
                    <div key={label} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      borderBottom: "1px solid rgba(201,151,58,0.08)", padding: "var(--space-1) 0",
                      gap: "var(--space-2)",
                    }}>
                      <span style={statLabelStyle}>{label}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flex: 1, justifyContent: "flex-end" }}>
                        <div style={{
                          flex: 1,
                          maxWidth: "100px",
                          height: "4px",
                          background: "rgba(201,151,58,0.15)",
                          borderRadius: "2px",
                          overflow: "hidden",
                        }}>
                          <div style={{
                            height: "100%",
                            width: `${(value! / 5) * 100}%`,
                            background: value! >= 4 ? "#2D6A4F" : value! >= 3 ? "#C9973A" : "#8B1A1A",
                            borderRadius: "2px",
                          }} />
                        </div>
                        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "#C9973A", minWidth: "16px", textAlign: "right" }}>
                          {value}/5
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── NEXT-TIME NOTES (USER) ── */}
          {trackerNotes && [trackerNotes.note_1, trackerNotes.note_2, trackerNotes.note_3, trackerNotes.note_4, trackerNotes.note_5].some(Boolean) && (
            <div style={{ marginTop: "var(--space-4)" }}>
              <div style={{
                fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#C9973A",
                textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "var(--space-3)",
              }}>
                Next-Time Notes
              </div>
              <div style={cardStyle}>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {[trackerNotes.note_1, trackerNotes.note_2, trackerNotes.note_3, trackerNotes.note_4, trackerNotes.note_5]
                    .filter((n): n is string => Boolean(n))
                    .map((note, i: number) => (
                      <li key={i} style={{
                        display: "flex", gap: "var(--space-2)",
                        fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text)",
                        padding: "var(--space-1) 0", borderBottom: "1px solid rgba(201,151,58,0.08)", lineHeight: 1.5,
                      }}>
                        <span style={{ color: "#C9973A", flexShrink: 0 }}>—</span>
                        <span>{note}</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}

          {/* ── AI INSIGHTS ── */}
          {insights && (insights.patternInsights.length > 0 || insights.pitInsights.length > 0 || insights.nextTimeRecommendations.length > 0) ? (
            <div style={{ marginTop: "var(--space-4)" }}>
              <div style={{
                fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#C9973A",
                textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "var(--space-3)",
              }}>
                AI Insights
              </div>

              {insights.patternInsights.length > 0 && (
                <div style={{ ...cardStyle, marginBottom: "var(--space-3)" }}>
                  <div style={trackerLabelStyle}>Patterns</div>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {insights.patternInsights.map((insight: string, i: number) => (
                      <li key={i} style={{
                        display: "flex", gap: "var(--space-2)",
                        fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text)",
                        padding: "var(--space-1) 0", borderBottom: "1px solid rgba(201,151,58,0.08)", lineHeight: 1.5,
                      }}>
                        <span style={{ color: "#C9973A", flexShrink: 0, marginTop: "2px" }}>◆</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {insights.pitInsights.length > 0 && (
                <div style={{ ...cardStyle, marginBottom: "var(--space-3)" }}>
                  <div style={trackerLabelStyle}>Your Pit</div>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {insights.pitInsights.map((insight: string, i: number) => (
                      <li key={i} style={{
                        display: "flex", gap: "var(--space-2)",
                        fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text)",
                        padding: "var(--space-1) 0", borderBottom: "1px solid rgba(201,151,58,0.08)", lineHeight: 1.5,
                      }}>
                        <span style={{ color: "#C9973A", flexShrink: 0, marginTop: "2px" }}>◆</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {insights.nextTimeRecommendations.length > 0 && (
                <div style={cardStyle}>
                  <div style={trackerLabelStyle}>Next Time</div>
                  <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {insights.nextTimeRecommendations.map((rec: string, i: number) => (
                      <li key={i} style={{
                        display: "flex", gap: "var(--space-2)",
                        fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text)",
                        padding: "var(--space-1) 0", borderBottom: "1px solid rgba(201,151,58,0.08)", lineHeight: 1.5,
                      }}>
                        <span style={{ color: "#C9973A", flexShrink: 0, marginTop: "2px" }}>—</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : outcome && (
            <div style={{ ...cardStyle, marginTop: "var(--space-4)", borderStyle: "dashed" }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-muted)", margin: 0, fontStyle: "italic" }}>
                More tracked cooks are needed before we can generate insights.
              </p>
            </div>
          )}

          {/* No tracker data CTA */}
          {!outcome && !trackerNotes && statusIsCompleted && (
            <div style={{ ...cardStyle, marginTop: "var(--space-4)", border: "1px solid rgba(201,151,58,0.25)" }}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-muted)", margin: "0 0 var(--space-2)", fontStyle: "italic" }}>
                Track your next cook to unlock personalized insights.
              </p>
              <a href={`/cook/${cookId}/tracker`} style={{
                color: "#C9973A", fontFamily: "var(--font-ui)", fontSize: "0.8rem", textDecoration: "none",
              }}>
                Track This Cook →
              </a>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div>
          {cookLog && !editingVerdict ? (
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
            <div style={cardStyle}>
              <div style={{
                fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#C9973A",
                textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "var(--space-3)",
              }}>
                {editingVerdict ? "Edit Verdict" : "Seal the Cook"}
              </div>

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

              <div style={{ marginBottom: "var(--space-3)" }}>
                <div style={{
                  fontFamily: "var(--font-ui)", fontSize: "0.75rem",
                  color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: "var(--space-1)",
                }}>
                  How did it turn out?
                </div>
                <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={4} style={textareaStyle} />
              </div>

              <div>
                <div style={{
                  fontFamily: "var(--font-ui)", fontSize: "0.75rem",
                  color: "var(--color-text-muted)", textTransform: "uppercase", marginBottom: "var(--space-1)",
                }}>
                  What would you do differently?
                </div>
                <textarea value={lessons} onChange={e => setLessons(e.target.value)} rows={3} style={textareaStyle} />
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


          {/* ── COOK CONFIDENCE SCORE ── */}
          {userTier === "pitmaster" && outcome ? (
            confidenceScore ? (
              <div style={{ marginTop: "var(--space-4)" }}>
                <div style={{
                  fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#C9973A",
                  textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "var(--space-3)",
                }}>
                  Cook Confidence Score
                </div>
                <div style={cardStyle}>
                  {/* Score display */}
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
                    <span style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "4rem",
                      color: confidenceScore.score >= 75 ? "#2D6A4F" : confidenceScore.score >= 50 ? "#C9973A" : "#8B1A1A",
                      lineHeight: 1,
                    }}>
                      {confidenceScore.score}
                    </span>
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: "1rem", color: "var(--color-text-muted)", paddingBottom: "8px" }}>
                      / 100
                    </span>
                    <span style={{
                      fontFamily: "var(--font-ui)", fontSize: "0.7rem",
                      color: confidenceScore.score >= 75 ? "#2D6A4F" : confidenceScore.score >= 50 ? "#C9973A" : "#8B1A1A",
                      textTransform: "uppercase", letterSpacing: "0.1em",
                      paddingBottom: "10px",
                    }}>
                      {confidenceScore.score >= 85 ? "Elite" : confidenceScore.score >= 70 ? "Strong" : confidenceScore.score >= 55 ? "Solid" : confidenceScore.score >= 40 ? "Developing" : "Needs Work"}
                    </span>
                  </div>

                  {/* Breakdown bars */}
                  <div style={{ marginBottom: "var(--space-3)" }}>
                    {[
                      { label: "Pit Stability", value: confidenceScore.breakdown.pitStability },
                      { label: "Plan Adherence", value: confidenceScore.breakdown.planAdherence },
                      { label: "Outcome Quality", value: confidenceScore.breakdown.outcomeConsistency },
                      { label: "Cook Efficiency", value: confidenceScore.breakdown.cookEfficiency },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ marginBottom: "var(--space-2)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                            {label}
                          </span>
                          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "#C9973A" }}>
                            {value}/25
                          </span>
                        </div>
                        <div style={{ height: "4px", background: "rgba(201,151,58,0.15)", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{
                            height: "100%",
                            width: `${(value / 25) * 100}%`,
                            background: value >= 20 ? "#2D6A4F" : value >= 14 ? "#C9973A" : "#8B1A1A",
                            borderRadius: "2px",
                            transition: "width 0.3s ease",
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  {confidenceScore.notes.length > 0 && (
                    <div style={{ borderTop: "1px solid rgba(201,151,58,0.1)", paddingTop: "var(--space-3)" }}>
                      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                        {confidenceScore.notes.map((note, i) => (
                          <li key={i} style={{
                            display: "flex", gap: "var(--space-2)",
                            fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text-muted)",
                            padding: "4px 0", lineHeight: 1.5,
                          }}>
                            <span style={{ color: "#C9973A", flexShrink: 0 }}>—</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : null
          ) : outcome && statusIsCompleted && (
            <div style={{ marginTop: "var(--space-4)" }}>
              <div style={{
                fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#C9973A",
                textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "var(--space-3)",
              }}>
                Cook Confidence Score
              </div>
              <div style={{
                ...cardStyle,
                position: "relative",
                overflow: "hidden",
                minHeight: "120px",
              }}>
                <div style={{
                  filter: "blur(4px)",
                  pointerEvents: "none",
                  userSelect: "none",
                }}>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: "4rem", color: "#C9973A", lineHeight: 1 }}>
                    —
                  </div>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: "var(--space-2)" }}>
                    Pit Stability · Plan Adherence · Outcome Quality · Cook Efficiency
                  </div>
                </div>
                <div style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(14,12,10,0.7)",
                  padding: "var(--space-3)",
                  textAlign: "center",
                }}>
                  <span style={{ fontSize: "1.2rem", marginBottom: "var(--space-2)" }}>🔒</span>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text-muted)", margin: "0 0 var(--space-2)", lineHeight: 1.5 }}>
                    Cook Confidence Score is a Pitmaster-tier feature.
                  </p>
                  <Link href="/premium" style={{
                    color: "#C9973A", fontFamily: "var(--font-ui)", fontSize: "0.75rem", textDecoration: "none",
                  }}>
                    Upgrade to Pitmaster →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ── FIRE CONTROL SCORE ── */}
          {userTier === "pitmaster" && outcome ? (
            fireControlScore ? (
              <div style={{ marginTop: "var(--space-4)" }}>
                <div style={{
                  fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#C9973A",
                  textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "var(--space-3)",
                }}>
                  Fire Control Score
                </div>
                <div style={cardStyle}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
                    <span style={{
                      fontFamily: "var(--font-heading)", fontSize: "4rem", lineHeight: 1,
                      color: fireControlScore.score >= 75 ? "#2D6A4F" : fireControlScore.score >= 50 ? "#C9973A" : "#8B1A1A",
                    }}>
                      {fireControlScore.score}
                    </span>
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: "1rem", color: "var(--color-text-muted)", paddingBottom: "8px" }}>/100</span>
                    <span style={{
                      fontFamily: "var(--font-ui)", fontSize: "0.7rem",
                      color: fireControlScore.score >= 75 ? "#2D6A4F" : fireControlScore.score >= 50 ? "#C9973A" : "#8B1A1A",
                      textTransform: "uppercase", letterSpacing: "0.1em", paddingBottom: "10px",
                    }}>
                      {fireControlScore.score >= 85 ? "Elite" : fireControlScore.score >= 70 ? "Strong" : fireControlScore.score >= 55 ? "Solid" : fireControlScore.score >= 40 ? "Developing" : "Needs Work"}
                    </span>
                  </div>
                  <div style={{ marginBottom: "var(--space-3)" }}>
                    {[
                      { label: "Stability", value: fireControlScore.breakdown.stability },
                      { label: "Responsiveness", value: fireControlScore.breakdown.responsiveness },
                      { label: "Efficiency", value: fireControlScore.breakdown.efficiency },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ marginBottom: "var(--space-2)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
                          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "#C9973A" }}>{value}/100</span>
                        </div>
                        <div style={{ height: "4px", background: "rgba(201,151,58,0.15)", borderRadius: "2px", overflow: "hidden" }}>
                          <div style={{
                            height: "100%", width: `${value}%`,
                            background: value >= 75 ? "#2D6A4F" : value >= 50 ? "#C9973A" : "#8B1A1A",
                            borderRadius: "2px",
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {fireControlScore.notes.length > 0 && (
                    <div style={{ borderTop: "1px solid rgba(201,151,58,0.1)", paddingTop: "var(--space-3)" }}>
                      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                        {fireControlScore.notes.map((note, i) => (
                          <li key={i} style={{
                            display: "flex", gap: "var(--space-2)",
                            fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text-muted)",
                            padding: "4px 0", lineHeight: 1.5,
                          }}>
                            <span style={{ color: "#C9973A", flexShrink: 0 }}>—</span>
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : null
          ) : outcome && statusIsCompleted && (
            <div style={{ marginTop: "var(--space-4)" }}>
              <div style={{
                fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#C9973A",
                textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "var(--space-3)",
              }}>
                Fire Control Score
              </div>
              <div style={{ ...cardStyle, position: "relative", overflow: "hidden", minHeight: "100px" }}>
                <div style={{ filter: "blur(4px)", pointerEvents: "none", userSelect: "none" }}>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: "3rem", color: "#C9973A", lineHeight: 1 }}>—</div>
                </div>
                <div style={{
                  position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  background: "rgba(14,12,10,0.7)", padding: "var(--space-3)", textAlign: "center",
                }}>
                  <span style={{ fontSize: "1.1rem", marginBottom: "var(--space-1)" }}>🔒</span>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text-muted)", margin: "0 0 var(--space-2)", lineHeight: 1.4 }}>
                    Fire Control Score is a Pitmaster-tier feature.
                  </p>
                  <Link href="/premium" style={{ color: "#C9973A", fontFamily: "var(--font-ui)", fontSize: "0.75rem", textDecoration: "none" }}>
                    Upgrade to Pitmaster →
                  </Link>
                </div>
              </div>
            </div>
          )}
      {/* ── DEEP INSIGHTS TRIGGER ── */}
      {statusIsCompleted && (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 var(--space-4) var(--space-2)" }}>
          <PitmasterInsightsOverlay
            cookId={cookId}
            isPitmaster={userTier === "pitmaster"}
            pitType={cook?.smoker_type ?? ""}
            meatLabel={cook?.label ?? ""}
          />
        </div>
      )}

      {/* ── PITMASTER TRENDS LINK ── */}
      {userTier === "pitmaster" && (
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 var(--space-4) var(--space-3)", display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
          <Link
            href="/pitmaster/trends"
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.75rem",
              color: "#C9973A",
              textDecoration: "none",
              letterSpacing: "0.05em",
              opacity: 0.8,
            }}
          >
            ◆ View your long-term trends →
          </Link>
          {(() => {
            const meatSlug = normalizeMeatType(cook?.label ?? "");
            if (!meatSlug) return null;
            return (
              <Link
                href={`/pitmaster/meat/${encodeURIComponent(meatSlug.replace(/ /g, "-"))}`}
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.75rem",
                  color: "#C9973A",
                  textDecoration: "none",
                  letterSpacing: "0.05em",
                  opacity: 0.8,
                }}
              >
                ◆ View your {meatSlug} profile →
              </Link>
            );
          })()}
          {(() => {
            const pitSlug = cook?.smoker_type ? normalizePitType(cook.smoker_type) : null;
            if (!pitSlug) return null;
            return (
              <Link
                href={`/pitmaster/pit/${encodeURIComponent(pitSlug)}`}
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.75rem",
                  color: "#C9973A",
                  textDecoration: "none",
                  letterSpacing: "0.05em",
                  opacity: 0.8,
                }}
              >
                ◆ View your {pitSlug} profile →
              </Link>
            );
          })()}
        </div>
      )}

      {/* ── STICKY BOTTOM BAR ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
        background: "var(--color-bg-alt)",
        borderTop: "1px solid rgba(201,151,58,0.2)",
        paddingTop: "var(--space-2)",
        paddingLeft: "var(--space-4)",
        paddingRight: "var(--space-4)",
        paddingBottom: "calc(var(--space-2) + env(safe-area-inset-bottom))",
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
