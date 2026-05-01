"use client";

import { use, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

// ── HELPERS ──────────────────────────────────────────────────────────────────

function formatElapsed(startIso: string, toIso: string): string {
  const diff = new Date(toIso).getTime() - new Date(startIso).getTime();
  if (diff <= 0) return "0 min";
  const totalMin = Math.floor(diff / 60000);
  const hrs = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hrs === 0) return `${mins} min`;
  if (mins === 0) return `${hrs} hr`;
  return `${hrs} hr ${mins} min`;
}

function getMinutesFromStart(startIso: string, eventIso: string): number {
  return Math.max(0, Math.floor((new Date(eventIso).getTime() - new Date(startIso).getTime()) / 60000));
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function parseTempFromMessage(message: string): { pit: number | null; internal: number | null } {
  const pitMatch = message?.match(/Pit:\s*(\d+)/i);
  const internalMatch = message?.match(/Internal:\s*(\d+)/i);
  return {
  pit: pitMatch?.[1] ? parseInt(pitMatch[1]) : null,
internal: internalMatch?.[1] ? parseInt(internalMatch[1]) : null,
  };
}

function getEventIcon(eventType: string): string {
  switch (eventType) {
    case "wrap":           return "◈";
    case "spritz":         return "≋";
    case "probe_check":    return "⌾";
    case "pull":           return "↑";
    case "rest_start":     return "◎";
    case "phase_complete": return "✓";
    default:               return "·";
  }
}

function getEventColor(eventType: string): string {
  switch (eventType) {
    case "wrap":           return "#6FA8DC";
    case "spritz":         return "#93C5FD";
    case "probe_check":    return "#C084FC";
    case "pull":           return "#4ADE80";
    case "rest_start":     return "#2DD4BF";
    case "phase_complete": return "#86EFAC";
    default:               return "#C9973A";
  }
}

function capitalize(str: string): string {
  return str.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

// ── COMPONENT ─────────────────────────────────────────────────────────────────

export default function CookJournalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: cookId } = use(params);
  const supabase = createClient();

  const [cook, setCook] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [cookLog, setCookLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAllChats, setShowAllChats] = useState(false);

  useEffect(() => {
    loadData();
  }, [cookId]);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const [
      { data: cookData },
      { data: eventsData },
      { data: logData },
    ] = await Promise.all([
      supabase.from("cooks").select("*").eq("id", cookId).single(),
      supabase.from("cook_events").select("*").eq("cook_id", cookId).order("created_at", { ascending: true }),
      supabase.from("cook_logs").select("*").eq("cook_id", cookId).maybeSingle(),
    ]);

    setCook(cookData);
    setEvents(eventsData || []);
    setCookLog(logData);
    setLoading(false);
  };

  const NAV_LINKS = [
    { label: "Live Mode", href: `/cook/${cookId}/live` },
    { label: "Timeline",  href: `/cook/${cookId}/timeline` },
    { label: "Guide",     href: `/cook/${cookId}/guide` },
    { label: "Journal",   href: `/cook/${cookId}/events`, active: true },
    { label: "Summary",   href: `/cook/${cookId}/summary` },
  ];

  if (loading) {
    return (
      <div style={{ padding: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Loading...</h1>
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

  // ── DATA PROCESSING ──────────────────────────────────────────────────────

  const startTime = cook.actual_start ?? cook.created_at;
  const endTime = cook.completed_at ?? new Date().toISOString();
  const totalMinutes = Math.max(getMinutesFromStart(startTime, endTime), 1);

  const tempEvents = events.filter(e => e.event_type === "temp_log");
  const milestoneEvents = events.filter(e =>
    ["wrap", "spritz", "probe_check", "pull", "rest_start", "phase_complete"].includes(e.event_type)
  );
  const chatEvents = events.filter(e => e.event_type === "preacher_chat");

  // ── TEMPERATURE CHART ────────────────────────────────────────────────────

  const tempPoints = tempEvents.map(e => {
    const { pit, internal } = parseTempFromMessage(e.message ?? "");
    return { minutes: getMinutesFromStart(startTime, e.created_at), pit, internal };
  });

  const pitPoints = tempPoints.filter(p => p.pit !== null);
  const internalPoints = tempPoints.filter(p => p.internal !== null);

  const allTemps = [
    ...pitPoints.map(p => p.pit as number),
    ...internalPoints.map(p => p.internal as number),
  ];
  const maxTemp = allTemps.length > 0 ? Math.max(...allTemps) + 20 : 300;
  const minTemp = allTemps.length > 0 ? Math.max(Math.min(...allTemps) - 20, 0) : 100;
  const tempRange = Math.max(maxTemp - minTemp, 50);

  const toX = (minutes: number) => 40 + (minutes / totalMinutes) * 530;
  const toY = (temp: number) => 10 + ((maxTemp - temp) / tempRange) * 160;

  const pitPath = pitPoints.length >= 2
    ? pitPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.minutes).toFixed(1)} ${toY(p.pit as number).toFixed(1)}`).join(" ")
    : null;

  const internalPath = internalPoints.length >= 2
    ? internalPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(p.minutes).toFixed(1)} ${toY(p.internal as number).toFixed(1)}`).join(" ")
    : null;

  const showChart = tempPoints.length > 0;

  const milestoneMarkers = milestoneEvents.map(e => ({
    x: toX(getMinutesFromStart(startTime, e.created_at)),
    color: getEventColor(e.event_type),
  }));

  // ── STYLES ───────────────────────────────────────────────────────────────

  const cardStyle: React.CSSProperties = {
    background: "var(--color-bg-alt)",
    border: "1px solid rgba(201,151,58,0.15)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-4)",
    marginBottom: "var(--space-4)",
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontFamily: "var(--font-ui)",
    fontSize: "0.75rem",
    color: "#C9973A",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    margin: "0 0 var(--space-3)",
  };

  const visibleChats = showAllChats ? chatEvents : chatEvents.slice(0, 5);

  return (
    <div style={{ padding: "var(--space-4)", maxWidth: "760px", paddingBottom: "80px" }}>

      <Link href={`/cook/${cookId}`} style={{
        display: "block",
        padding: "0 0 var(--space-4) 0",
        fontFamily: "var(--font-ui)",
        fontSize: "0.8rem",
        color: "#C9973A",
        textDecoration: "none",
      }}>
        ← Back to Cook
      </Link>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <h1 style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(1.4rem, 3vw, 2rem)",
          color: "#F5E6C8",
          margin: "0 0 var(--space-1)",
        }}>
          Cook Journal
        </h1>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.9rem",
          color: "var(--color-text-muted)",
          margin: 0,
        }}>
          {cook.label} · {formatElapsed(startTime, endTime)}
          {cook.status === "completed" && cook.completed_at && (
            <> · Completed {new Date(cook.completed_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</>
          )}
        </p>
      </div>

      {/* ── STATS BAR ── */}
      <div style={{
        ...cardStyle,
        display: "flex",
        gap: "var(--space-5)",
        flexWrap: "wrap",
        padding: "var(--space-3) var(--space-4)",
      }}>
        {[
          { label: "Total Events", value: events.length },
          { label: "Temp Logs", value: tempEvents.length },
          { label: "Milestones", value: milestoneEvents.length },
          { label: "Chats", value: chatEvents.length },
        ].map(stat => (
          <div key={stat.label}>
            <div style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.7rem",
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "2px",
            }}>
              {stat.label}
            </div>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", color: "#C9973A" }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── TEMPERATURE CHART ── */}
      {showChart && (
        <div style={cardStyle}>
          <p style={sectionLabelStyle}>Temperature History</p>
          <div style={{ overflowX: "auto" }}>
            <svg viewBox="0 0 600 210" style={{ width: "100%", minWidth: "300px", display: "block" }}>
              {/* Grid lines */}
              {[0, 40, 80, 120, 160].map(y => (
                <line key={y} x1="40" y1={10 + y} x2="570" y2={10 + y}
                  stroke="rgba(201,151,58,0.08)" strokeWidth="1" />
              ))}
              {/* Y axis temp labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
                const temp = Math.round(maxTemp - frac * tempRange);
                return (
                  <text key={i} x="36" y={10 + frac * 160 + 4}
                    textAnchor="end" fill="rgba(201,151,58,0.45)"
                    fontSize="10" fontFamily="monospace">
                    {temp}
                  </text>
                );
              })}
              {/* X axis start/end labels */}
              <text x="40" y="202" textAnchor="middle" fill="rgba(201,151,58,0.35)" fontSize="9" fontFamily="monospace">
                {formatTime(startTime)}
              </text>
              <text x="570" y="202" textAnchor="end" fill="rgba(201,151,58,0.35)" fontSize="9" fontFamily="monospace">
                {formatTime(endTime)}
              </text>
              {/* Milestone vertical markers */}
              {milestoneMarkers.map((m, i) => (
                <line key={i}
                  x1={m.x.toFixed(1)} y1="10" x2={m.x.toFixed(1)} y2="170"
                  stroke={m.color} strokeWidth="1" strokeDasharray="3,3" opacity="0.45" />
              ))}
              {/* Pit temp — dashed amber */}
              {pitPath && (
                <path d={pitPath} fill="none" stroke="rgba(201,151,58,0.55)" strokeWidth="2" strokeDasharray="6,3" />
              )}
              {!pitPath && pitPoints.map((p, i) => (
                <circle key={i}
                  cx={toX(p.minutes).toFixed(1)} cy={toY(p.pit as number).toFixed(1)}
                  r="3" fill="rgba(201,151,58,0.6)" />
              ))}
              {/* Internal temp — solid cream with dots */}
              {internalPath && (
                <path d={internalPath} fill="none" stroke="#F5E6C8" strokeWidth="2" />
              )}
              {internalPoints.map((p, i) => (
                <circle key={i}
                  cx={toX(p.minutes).toFixed(1)} cy={toY(p.internal as number).toFixed(1)}
                  r="3" fill="#C9973A" />
              ))}
            </svg>
          </div>
          {/* Legend */}
          <div style={{ display: "flex", gap: "var(--space-4)", marginTop: "var(--space-1)" }}>
            {pitPoints.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="20" height="8">
                  <line x1="0" y1="4" x2="20" y2="4" stroke="rgba(201,151,58,0.55)" strokeWidth="2" strokeDasharray="4,2" />
                </svg>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.72rem", color: "var(--color-text-muted)" }}>Pit Temp</span>
              </div>
            )}
            {internalPoints.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="20" height="8">
                  <line x1="0" y1="4" x2="20" y2="4" stroke="#F5E6C8" strokeWidth="2" />
                </svg>
                <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.72rem", color: "var(--color-text-muted)" }}>Internal Temp</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── THE STORY ── */}
      {milestoneEvents.length > 0 && (
        <div style={cardStyle}>
          <p style={sectionLabelStyle}>The Story</p>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {milestoneEvents.map((event, idx) => (
              <div key={event.id} style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
                {/* Icon + connector line */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: "28px" }}>
                  <div style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: "rgba(201,151,58,0.08)",
                    border: `1px solid ${getEventColor(event.event_type)}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    color: getEventColor(event.event_type),
                    flexShrink: 0,
                  }}>
                    {getEventIcon(event.event_type)}
                  </div>
                  {idx < milestoneEvents.length - 1 && (
                    <div style={{
                      width: "1px",
                      flex: 1,
                      minHeight: "14px",
                      background: "rgba(201,151,58,0.12)",
                      margin: "2px 0",
                    }} />
                  )}
                </div>
                {/* Content */}
                <div style={{
                  paddingBottom: idx < milestoneEvents.length - 1 ? "var(--space-3)" : 0,
                  flex: 1,
                }}>
                  <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "baseline", flexWrap: "wrap" }}>
                    <span style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.9rem",
                      color: "var(--color-text)",
                      fontWeight: 500,
                    }}>
                      {capitalize(event.event_type)}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.72rem",
                      color: "var(--color-text-muted)",
                    }}>
                      {formatTime(event.created_at)} · +{formatElapsed(startTime, event.created_at)}
                    </span>
                  </div>
                  {event.message && (
                    <p style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.85rem",
                      color: "var(--color-text-muted)",
                      margin: "2px 0 0",
                      lineHeight: 1.5,
                    }}>
                      {event.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PREACHER'S COUNSEL ── */}
      {chatEvents.length > 0 && (
        <div style={cardStyle}>
          <p style={sectionLabelStyle}>Preacher&apos;s Counsel</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {visibleChats.map(event => (
              <div key={event.id} style={{
                borderLeft: "2px solid rgba(201,151,58,0.25)",
                paddingLeft: "var(--space-3)",
              }}>
                <p style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.875rem",
                  color: "var(--color-text-muted)",
                  margin: "0 0 2px",
                  lineHeight: 1.6,
                }}>
                  {event.message && event.message.length > 120
                    ? event.message.slice(0, 120) + "…"
                    : event.message ?? ""}
                </p>
                <span style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.7rem",
                  color: "rgba(201,151,58,0.45)",
                }}>
                  {formatTime(event.created_at)} · +{formatElapsed(startTime, event.created_at)}
                </span>
              </div>
            ))}
          </div>
          {chatEvents.length > 5 && (
            <button
              onClick={() => setShowAllChats(!showAllChats)}
              style={{
                marginTop: "var(--space-3)",
                background: "none",
                border: "none",
                color: "#C9973A",
                fontFamily: "var(--font-ui)",
                fontSize: "0.8rem",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {showAllChats ? "Show less" : `Show all ${chatEvents.length} exchanges`}
            </button>
          )}
        </div>
      )}

      {/* ── THE VERDICT ── */}
      <div style={cardStyle}>
        <p style={sectionLabelStyle}>The Verdict</p>

        {cookLog ? (
          <div>
            <div style={{ color: "#C9973A", fontSize: "1.3rem", marginBottom: "var(--space-2)" }}>
              {"★".repeat(cookLog.rating)}
              <span style={{ color: "var(--color-text-muted)" }}>{"☆".repeat(5 - cookLog.rating)}</span>
            </div>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.95rem",
              color: "var(--color-text)",
              lineHeight: 1.7,
              margin: cookLog.lessons ? "0 0 var(--space-3)" : 0,
            }}>
              {cookLog.summary}
            </p>
            {cookLog.lessons && (
              <div style={{ borderTop: "1px solid rgba(201,151,58,0.1)", paddingTop: "var(--space-2)" }}>
                <span style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.72rem",
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  Lessons Learned
                </span>
                <p style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.875rem",
                  color: "var(--color-text-muted)",
                  margin: "var(--space-1) 0 0",
                  lineHeight: 1.6,
                }}>
                  {cookLog.lessons}
                </p>
              </div>
            )}
          </div>
        ) : cook.status === "completed" ? (
          <div>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.9rem",
              color: "var(--color-text-muted)",
              margin: "0 0 var(--space-3)",
            }}>
              Cook is complete. No verdict written yet.
            </p>
            <Link href={`/cook/${cookId}/summary`} style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.85rem",
              color: "#C9973A",
              textDecoration: "none",
              border: "1px solid rgba(201,151,58,0.4)",
              padding: "6px 16px",
              borderRadius: "var(--radius-md)",
              display: "inline-block",
            }}>
              Write Your Verdict →
            </Link>
          </div>
        ) : (
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            color: "var(--color-text-muted)",
            margin: 0,
          }}>
            The verdict gets written when the cook is complete.
          </p>
        )}
      </div>

      {/* ── STICKY BOTTOM NAV ── */}
      <style>{`
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
      `}</style>
      <div style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        zIndex: 50,
        background: "var(--color-bg-alt)",
        borderTop: "1px solid rgba(201,151,58,0.2)",
        padding: "var(--space-2) var(--space-4)",
        display: "flex",
        justifyContent: "center",
        gap: "var(--space-3)",
        flexWrap: "wrap",
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
