"use client";

import { use, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { generatePhases, type Phase } from "./engine";
import Link from "next/link";

type PlanTool = { id: string; name: string; wood: string };
type PlanItem = {
  name: string;
  category?: string;
  quantity?: number;
  weight?: string | number | null;
  notes?: string;
  smokerId?: string | null;
};

type CompletionDetail = { completedAt: string; tempEntered: string | null };

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

function formatStartDisplay(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function formatElapsed(fromIso: string, toDate: Date): string {
  const diff = toDate.getTime() - new Date(fromIso).getTime();
  if (diff <= 0) return "0 min elapsed";
  const totalMin = Math.floor(diff / 60000);
  const hrs = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  return hrs > 0 ? `${hrs} hrs ${mins} min elapsed` : `${mins} min elapsed`;
}

function initHour(): string {
  const h = new Date().getHours();
  return String(h > 12 ? h - 12 : h === 0 ? 12 : h);
}
function initMinute(): string {
  const m = new Date().getMinutes();
  return String(Math.floor(m / 15) * 15).padStart(2, "0");
}
function initAmPm(): string {
  return new Date().getHours() >= 12 ? "PM" : "AM";
}

export default function TimelinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: cookId } = use(params);
  const supabase = createClient();

  // Data state
  const [cook, setCook] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [completedPhaseIds, setCompletedPhaseIds] = useState<string[]>([]);
  const [phaseCompletionDetails, setPhaseCompletionDetails] = useState<Record<string, CompletionDetail>>({});

  // UI state
  const [expandedCompletedId, setExpandedCompletedId] = useState<string | null>(null);
  const [expandedScienceId, setExpandedScienceId] = useState<string | null>(null);
  const [tempInputs, setTempInputs] = useState<Record<string, string>>({});
  const [editCompletedTemps, setEditCompletedTemps] = useState<Record<string, string>>({});
  const [now, setNow] = useState(new Date());
  const [toast, setToast] = useState<string | null>(null);

  // Start time state
  const [actualStart, setActualStart] = useState<string | null>(null);
  const [showStartCard, setShowStartCard] = useState(false);
  const [showingFallback, setShowingFallback] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showAdjustPicker, setShowAdjustPicker] = useState(false);
  const [pickerHour, setPickerHour] = useState(initHour);
  const [pickerMinute, setPickerMinute] = useState(initMinute);
  const [pickerAmPm, setPickerAmPm] = useState(initAmPm);
  const [savingStart, setSavingStart] = useState(false);

  const phaseRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadData();
    const ticker = setInterval(() => setNow(new Date()), 60000);
    return () => {
      clearInterval(ticker);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [cookId]);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/auth/login"; return; }

    const { data: cookData } = await supabase
      .from("cooks")
      .select("*")
      .eq("id", cookId)
      .eq("user_id", user.id)
      .single();

    if (!cookData) { setLoading(false); return; }
    setCook(cookData);

    const { data: itemsData } = await supabase
      .from("cook_items").select("*").eq("cook_id", cookId);

    let sessionData: any = null;
    if (cookData.prep_session_id) {
      const { data } = await supabase
        .from("meal_prep_sessions").select("*").eq("id", cookData.prep_session_id).single();
      sessionData = data;
    }
    if (sessionData) setSession(sessionData);

    const { data: phaseEvents } = await supabase
      .from("cook_events")
      .select("*")
      .eq("cook_id", cookId)
      .eq("event_type", "phase_complete")
      .order("created_at", { ascending: true });

    const completedIds: string[] = [];
    const details: Record<string, CompletionDetail> = {};
    for (const event of phaseEvents || []) {
      try {
        const parsed = JSON.parse(event.message);
        if (parsed.phaseId) {
          completedIds.push(parsed.phaseId);
          details[parsed.phaseId] = {
            completedAt: parsed.completedAt || event.created_at,
            tempEntered: parsed.tempEntered || null,
          };
        }
      } catch { /* skip malformed */ }
    }
    setCompletedPhaseIds(completedIds);
    setPhaseCompletionDetails(details);

    // Determine actual_start
    if (cookData.actual_start) {
      setActualStart(cookData.actual_start);
      setShowStartCard(false);
    } else {
      setShowStartCard(true);
    }

    // Generate phases from plan items or cook_items
    const plan = cookData.plan as any;
    const planItems: PlanItem[] = plan?.items ?? [];
    const effectiveItems = planItems.length > 0 ? planItems : (itemsData || []);
    setPhases(generatePhases(cookData, effectiveItems, sessionData));

    setLoading(false);
  };

  const handleJustNow = async () => {
    setSavingStart(true);
    const iso = new Date().toISOString();
    await supabase.from("cooks").update({ actual_start: iso }).eq("id", cook.id);
    setActualStart(iso);
    setShowStartCard(false);
    setSavingStart(false);
  };

  const handleConfirmTime = async () => {
    setSavingStart(true);
    const h = parseInt(pickerHour);
    const mn = parseInt(pickerMinute);
    const isPM = pickerAmPm === "PM";
    const hour24 = isPM ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h);
    const d = new Date();
    d.setHours(hour24, mn, 0, 0);
    const iso = d.toISOString();
    await supabase.from("cooks").update({ actual_start: iso }).eq("id", cook.id);
    setActualStart(iso);
    setShowStartCard(false);
    setShowTimePicker(false);
    setShowAdjustPicker(false);
    setSavingStart(false);
  };

  const handleSkip = () => {
    setShowStartCard(false);
    setShowingFallback(true);
  };

  const handleSaveCompletedTemp = async (phase: Phase) => {
    const newTemp = editCompletedTemps[phase.id] ?? "";

    const { data: events } = await supabase
      .from("cook_events")
      .select("*")
      .eq("cook_id", cook.id)
      .eq("event_type", "phase_complete");

    const matchingEvent = (events || []).find(e => {
      try {
        return JSON.parse(e.message).phaseId === phase.id;
      } catch { return false; }
    });

    if (!matchingEvent) return;

    const parsed = JSON.parse(matchingEvent.message);
    const updatedMessage = JSON.stringify({ ...parsed, tempEntered: newTemp || null });

    await supabase
      .from("cook_events")
      .update({ message: updatedMessage })
      .eq("id", matchingEvent.id);

    setPhaseCompletionDetails(prev => ({
      ...prev,
      [phase.id]: { ...prev[phase.id]!, tempEntered: newTemp || null },
    }));
  };

  const handleMarkComplete = async (phase: Phase) => {
    const tempVal = tempInputs[phase.id] || null;

    await supabase.from("cook_events").insert({
      cook_id: cook.id,
      event_type: "phase_complete",
      message: JSON.stringify({
        phaseId: phase.id,
        phaseName: phase.name,
        tempEntered: tempVal,
        completedAt: new Date().toISOString(),
      }),
    });

    const completedAt = new Date().toISOString();
    setCompletedPhaseIds(prev => [...prev, phase.id]);
    setPhaseCompletionDetails(prev => ({
      ...prev,
      [phase.id]: { completedAt, tempEntered: tempVal },
    }));

    const isLastPhase = phases[phases.length - 1]?.id === phase.id;

    if (isLastPhase) {
      await supabase
        .from("cooks")
        .update({ status: "completed", completed_at: completedAt })
        .eq("id", cook.id);
      setCook((prev: any) => ({ ...prev, status: "completed", completed_at: completedAt }));
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      setToast("The cook is complete. The congregation has been fed. Head to your Summary to record this cook for history.");
      toastTimeoutRef.current = setTimeout(() => {
        setToast(null);
        window.location.href = `/cook/${cookId}/summary`;
      }, 2000);
      return;
    }

    if (phase.completionPrompt) {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      setToast(phase.completionPrompt);
      toastTimeoutRef.current = setTimeout(() => setToast(null), 4000);
    }

    const currentIdx = phases.findIndex(p => p.id === phase.id);
    const nextPhase = phases[currentIdx + 1];
    if (nextPhase) {
      setTimeout(() => {
        phaseRefs.current[nextPhase.id]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "var(--space-4)", fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
        Loading...
      </div>
    );
  }

  if (!cook) {
    return (
      <div style={{ padding: "var(--space-4)" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>Cook Not Found</h1>
        <Link href="/" style={{ color: "var(--color-accent)", fontFamily: "var(--font-body)" }}>Back to Home</Link>
      </div>
    );
  }

  // Derived values
  const completedSet = new Set(completedPhaseIds);
  const activePhaseIndex = phases.findIndex(p => !completedSet.has(p.id));
  const progressPercent = phases.length > 0 ? (completedPhaseIds.length / phases.length) * 100 : 0;
  const activePhaseName = activePhaseIndex >= 0 ? phases[activePhaseIndex]!.name : "Complete";

  const elapsedFrom = actualStart ?? (showingFallback ? cook.created_at : null);

  const plan = cook?.plan as any;
  const planTools: PlanTool[] = plan?.tools ?? [];
  const smokerSubtitle = [
    planTools.map((t: PlanTool) => t.name).filter(Boolean).join(", ") || cook?.smoker_type || null,
    planTools.map((t: PlanTool) => t.wood).filter(Boolean).join(", ") || cook?.wood_type || null,
    cook?.eat_time ? formatDateTime(cook.eat_time) : null,
  ].filter(Boolean).join(" · ");

  const flavorSmoke = session?.flavor_smoke;
  const flavorBark = session?.flavor_bark;
  const flavorTenderness = session?.flavor_tenderness;
  const hasFlavorData = flavorSmoke != null || flavorBark != null || flavorTenderness != null;
  const statusIsCompleted = cook?.status === "completed";

  const NAV_LINKS = [
    { label: "Live Mode", href: `/cook/${cookId}/live` },
    { label: "Timeline",  href: `/cook/${cookId}/timeline`, active: true },
    { label: "Fire",      href: `/cook/${cookId}/fire` },
    { label: "Rubs",      href: `/cook/${cookId}/rubs` },
    { label: "Events",    href: `/cook/${cookId}/events` },
    { label: "Summary",   href: `/cook/${cookId}/summary` },
  ];

  const selectStyle: React.CSSProperties = {
    background: "var(--color-bg)",
    border: "1px solid rgba(201,151,58,0.3)",
    borderRadius: "var(--radius-sm)",
    color: "var(--color-text)",
    fontFamily: "var(--font-ui)",
    fontSize: "0.9rem",
    padding: "6px 10px",
    cursor: "pointer",
  };

  return (
    <div style={{ paddingBottom: "80px" }}>
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
        .phase-completed-header { cursor: pointer; }
        .phase-completed-header:hover { opacity: 0.85; }
        @keyframes toastSlide {
          0% { opacity: 0; transform: translateX(-50%) translateY(8px); }
          10% { opacity: 1; transform: translateX(-50%) translateY(0); }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>

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

      {/* ── START THE CLOCK CARD ── */}
      {showStartCard && (
        <div style={{ padding: "var(--space-4)" }}>
          <div style={{
            maxWidth: 480,
            margin: "0 auto",
            border: "1px solid rgba(201,151,58,0.4)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-5)",
            textAlign: "center",
            background: "var(--color-bg-alt)",
          }}>
            <h2 style={{
              fontFamily: "var(--font-heading)",
              color: "#F5E6C8",
              fontSize: "1.4rem",
              margin: "0 0 var(--space-2)",
            }}>
              When did the meat go on?
            </h2>
            <p style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-text-muted)",
              fontSize: "0.95rem",
              margin: "0 0 var(--space-4)",
              lineHeight: 1.6,
            }}>
              This sets the foundation for your entire cook.
            </p>

            {!showTimePicker ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <button
                  onClick={handleJustNow}
                  disabled={savingStart}
                  style={{
                    background: "#C9973A",
                    color: "var(--color-bg)",
                    border: "none",
                    borderRadius: "var(--radius-md)",
                    fontFamily: "var(--font-ui)",
                    fontSize: "1rem",
                    padding: "12px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {savingStart ? "Saving..." : "Just Now"}
                </button>
                <button
                  onClick={() => setShowTimePicker(true)}
                  style={{
                    background: "transparent",
                    color: "#C9973A",
                    border: "1px solid rgba(201,151,58,0.4)",
                    borderRadius: "var(--radius-md)",
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.95rem",
                    padding: "11px",
                    cursor: "pointer",
                  }}
                >
                  Pick a Time
                </button>
                <button
                  onClick={handleSkip}
                  style={{
                    background: "transparent",
                    color: "var(--color-text-muted)",
                    border: "none",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.85rem",
                    padding: "8px",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Skip for Now
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "center", marginBottom: "var(--space-3)" }}>
                  <select value={pickerHour} onChange={e => setPickerHour(e.target.value)} style={selectStyle}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                      <option key={h} value={String(h)}>{h}</option>
                    ))}
                  </select>
                  <select value={pickerMinute} onChange={e => setPickerMinute(e.target.value)} style={selectStyle}>
                    {["00", "15", "30", "45"].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select value={pickerAmPm} onChange={e => setPickerAmPm(e.target.value)} style={selectStyle}>
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: "var(--space-2)" }}>
                  <button
                    onClick={handleConfirmTime}
                    disabled={savingStart}
                    style={{
                      flex: 1,
                      background: "#C9973A",
                      color: "var(--color-bg)",
                      border: "none",
                      borderRadius: "var(--radius-md)",
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.95rem",
                      padding: "10px",
                      cursor: "pointer",
                    }}
                  >
                    {savingStart ? "Saving..." : "Confirm"}
                  </button>
                  <button
                    onClick={() => setShowTimePicker(false)}
                    style={{
                      background: "transparent",
                      color: "var(--color-text-muted)",
                      border: "1px solid rgba(201,151,58,0.2)",
                      borderRadius: "var(--radius-md)",
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.95rem",
                      padding: "10px 16px",
                      cursor: "pointer",
                    }}
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PROGRESS BAR ── */}
      {(actualStart || showingFallback) && phases.length > 0 && (
        <div style={{ padding: "var(--space-3) var(--space-4) 0" }}>
          <div style={{
            fontFamily: "var(--font-ui)",
            fontSize: "0.8rem",
            color: "var(--color-text-muted)",
            marginBottom: "var(--space-1)",
          }}>
            Phase {completedPhaseIds.length} of {phases.length} — {activePhaseName}
          </div>
          <div style={{
            height: 6,
            background: "rgba(201,151,58,0.15)",
            borderRadius: 3,
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${progressPercent}%`,
              background: "#C9973A",
              borderRadius: 3,
              transition: "width 0.4s ease",
            }} />
          </div>
        </div>
      )}

      {/* ── ELAPSED ROW ── */}
      {elapsedFrom && (
        <div style={{
          padding: "var(--space-1) var(--space-4)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
        }}>
          <span style={{
            fontFamily: "var(--font-ui)",
            fontSize: "0.8rem",
            color: "var(--color-text-muted)",
          }}>
            Cook started: {formatStartDisplay(elapsedFrom)} · {formatElapsed(elapsedFrom, now)}
          </span>
          <button
            onClick={() => setShowAdjustPicker(prev => !prev)}
            style={{
              background: "none",
              border: "none",
              color: "#C9973A",
              fontFamily: "var(--font-body)",
              fontSize: "0.8rem",
              cursor: "pointer",
              padding: "2px 4px",
            }}
          >
            ✎ Adjust start time
          </button>
        </div>
      )}

      {/* ── ADJUST PICKER ── */}
      {showAdjustPicker && (
        <div style={{
          padding: "var(--space-2) var(--space-4)",
          background: "var(--color-bg-alt)",
          borderTop: "1px solid rgba(201,151,58,0.15)",
          borderBottom: "1px solid rgba(201,151,58,0.15)",
        }}>
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center", flexWrap: "wrap" }}>
            <select value={pickerHour} onChange={e => setPickerHour(e.target.value)} style={selectStyle}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                <option key={h} value={String(h)}>{h}</option>
              ))}
            </select>
            <select value={pickerMinute} onChange={e => setPickerMinute(e.target.value)} style={selectStyle}>
              {["00", "15", "30", "45"].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select value={pickerAmPm} onChange={e => setPickerAmPm(e.target.value)} style={selectStyle}>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
            <button
              onClick={handleConfirmTime}
              disabled={savingStart}
              style={{
                background: "#C9973A",
                color: "var(--color-bg)",
                border: "none",
                borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-ui)",
                fontSize: "0.85rem",
                padding: "7px 16px",
                cursor: "pointer",
              }}
            >
              {savingStart ? "Saving..." : "Update"}
            </button>
            <button
              onClick={() => setShowAdjustPicker(false)}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-body)",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── PHASE CARDS ── */}
      <div style={{
        padding: "var(--space-3) var(--space-4)",
        maxWidth: 760,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-3)",
      }}>
        {phases.map((phase, idx) => {
          const isCompleted = completedSet.has(phase.id);
          const isActive = idx === activePhaseIndex;
          const isUpcoming = !isCompleted && !isActive && idx <= activePhaseIndex + 2;
          const isFuture = !isCompleted && !isActive && !isUpcoming;
          const detail = phaseCompletionDetails[phase.id];
          const isExpandedCompleted = expandedCompletedId === phase.id;
          const isScienceOpen = expandedScienceId === phase.id;

          // COMPLETED
          if (isCompleted) {
            return (
              <div
                key={phase.id}
                ref={el => { phaseRefs.current[phase.id] = el; }}
                style={{
                  background: "rgba(45,106,79,0.1)",
                  border: "1px solid rgba(45,106,79,0.3)",
                  borderRadius: "var(--radius-lg)",
                  overflow: "hidden",
                }}
              >
                <div
                  className="phase-completed-header"
                  onClick={() => setExpandedCompletedId(isExpandedCompleted ? null : phase.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    padding: "var(--space-2) var(--space-3)",
                  }}
                >
                  <span style={{ color: "#2D6A4F", fontSize: "1rem", fontFamily: "var(--font-ui)" }}>
                    {phase.icon}
                  </span>
                  <span style={{
                    flex: 1,
                    fontFamily: "var(--font-heading)",
                    fontSize: "1rem",
                    color: "var(--color-text-muted)",
                  }}>
                    {phase.name}
                  </span>
                  {detail?.tempEntered && (
                    <span style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.75rem",
                      color: "#2D6A4F",
                      marginRight: "var(--space-1)",
                    }}>
                      {detail.tempEntered}°F
                    </span>
                  )}
                  {detail?.completedAt && (
                    <span style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.75rem",
                      color: "var(--color-text-muted)",
                      marginRight: "var(--space-1)",
                    }}>
                      {new Date(detail.completedAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                    </span>
                  )}
                  <span style={{ color: "#2D6A4F", fontFamily: "var(--font-ui)", fontSize: "1rem" }}>✓</span>
                  <span style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-ui)", fontSize: "0.75rem", marginLeft: 4 }}>
                    {isExpandedCompleted ? "▲" : "▼"}
                  </span>
                </div>

                {isExpandedCompleted && (
                  <div style={{ padding: "0 var(--space-3) var(--space-3)", borderTop: "1px solid rgba(45,106,79,0.2)" }}>
                    <div style={{ marginTop: "var(--space-2)", fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                      {phase.science}
                    </div>
                    <div style={{ marginTop: "var(--space-2)" }}>
                      {phase.watchFor.map((item, i) => (
                        <div key={i} style={{ display: "flex", gap: "var(--space-1)", fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text-muted)", marginBottom: 4 }}>
                          <span style={{ color: "#C9973A", flexShrink: 0 }}>·</span>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: "var(--space-2)", borderLeft: "3px solid #C9973A", paddingLeft: "var(--space-2)" }}>
                      <p style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: "0.9rem", color: "#C9973A", margin: 0, lineHeight: 1.6 }}>
                        {phase.preacherNote}
                      </p>
                    </div>
                    {phase.requiresTempEntry && (
                      <div style={{ marginTop: "var(--space-3)", display: "flex", alignItems: "center", gap: "var(--space-2)", flexWrap: "wrap" }}>
                        <label style={{
                          fontFamily: "var(--font-ui)",
                          fontSize: "0.75rem",
                          color: "var(--color-text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}>
                          Adjust recorded temp:
                        </label>
                        <input
                          type="number"
                          value={editCompletedTemps[phase.id] ?? phaseCompletionDetails[phase.id]?.tempEntered ?? ""}
                          onChange={e => setEditCompletedTemps(prev => ({ ...prev, [phase.id]: e.target.value }))}
                          placeholder="°F"
                          style={{
                            width: 72,
                            background: "var(--color-bg)",
                            border: "1px solid rgba(45,106,79,0.3)",
                            borderRadius: "var(--radius-sm)",
                            color: "var(--color-text)",
                            fontFamily: "var(--font-ui)",
                            fontSize: "0.9rem",
                            padding: "5px 8px",
                            textAlign: "center",
                          }}
                        />
                        <button
                          onClick={() => handleSaveCompletedTemp(phase)}
                          style={{
                            background: "transparent",
                            border: "1px solid rgba(45,106,79,0.4)",
                            borderRadius: "var(--radius-sm)",
                            color: "#2D6A4F",
                            fontFamily: "var(--font-ui)",
                            fontSize: "0.8rem",
                            padding: "5px 12px",
                            cursor: "pointer",
                          }}
                        >
                          Save
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          }

          // ACTIVE
          if (isActive) {
            return (
              <div
                key={phase.id}
                ref={el => { phaseRefs.current[phase.id] = el; }}
                style={{
                  background: "var(--color-bg-alt)",
                  border: "2px solid #C9973A",
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "0 0 20px rgba(201,151,58,0.15)",
                  padding: "var(--space-4)",
                }}
              >
                {/* Phase header */}
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
                  <span style={{ color: "#C9973A", fontSize: "1.5rem", lineHeight: 1 }}>{phase.icon}</span>
                  <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", color: "#F5E6C8", margin: 0 }}>
                    {phase.name}
                  </h2>
                </div>

                {/* Trigger */}
                <div style={{ marginBottom: "var(--space-2)" }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    TRIGGER:
                  </span>{" "}
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
                    {phase.trigger}
                  </span>
                </div>

                {/* Temp range bar */}
                {phase.tempRange && (
                  <div style={{ marginBottom: "var(--space-3)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: 4 }}>
                      <span>{phase.tempRange.min}°F</span>
                      <span style={{ color: "#C9973A", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Target Range</span>
                      <span>{phase.tempRange.max}°F</span>
                    </div>
                    <div style={{ height: 6, background: "rgba(201,151,58,0.15)", borderRadius: 3 }}>
                      <div style={{ height: "100%", background: "rgba(201,151,58,0.5)", borderRadius: 3 }} />
                    </div>
                  </div>
                )}

                {/* Duration */}
                <div style={{ marginBottom: "var(--space-3)" }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    ESTIMATED:
                  </span>{" "}
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
                    {phase.duration}
                  </span>
                </div>

                {/* Science — collapsible */}
                <div style={{ marginBottom: "var(--space-3)" }}>
                  <button
                    onClick={() => setExpandedScienceId(isScienceOpen ? null : phase.id)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.75rem",
                      color: "var(--color-text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    What&apos;s happening {isScienceOpen ? "▲" : "▼"}
                  </button>
                  {isScienceOpen && (
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text-muted)", lineHeight: 1.6, margin: "var(--space-2) 0 0" }}>
                      {phase.science}
                    </p>
                  )}
                </div>

                {/* Watch For */}
                <div style={{ marginBottom: "var(--space-3)" }}>
                  <div style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "var(--space-1)" }}>
                    Watch For
                  </div>
                  {phase.watchFor.map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: "var(--space-1)", fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text)", marginBottom: 6, lineHeight: 1.5 }}>
                      <span style={{ color: "#C9973A", flexShrink: 0 }}>·</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* Common Mistake */}
                <div style={{ marginBottom: "var(--space-3)", fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "#8B6914", lineHeight: 1.5 }}>
                  ⚠ {phase.commonMistakes}
                </div>

                {/* Preacher Note */}
                <div style={{
                  borderLeft: "3px solid #C9973A",
                  paddingLeft: "var(--space-2)",
                  marginBottom: "var(--space-3)",
                }}>
                  <p style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: "0.95rem", color: "#C9973A", margin: 0, lineHeight: 1.6 }}>
                    {phase.preacherNote}
                  </p>
                </div>

                {/* Temp entry */}
                {phase.requiresTempEntry && (
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-3)", flexWrap: "wrap" }}>
                    <label style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
                      Internal temp at this point:
                    </label>
                    <input
                      type="number"
                      value={tempInputs[phase.id] || ""}
                      onChange={e => setTempInputs(prev => ({ ...prev, [phase.id]: e.target.value }))}
                      placeholder="°F"
                      style={{
                        width: 72,
                        background: "var(--color-bg)",
                        border: "1px solid rgba(201,151,58,0.3)",
                        borderRadius: "var(--radius-sm)",
                        color: "var(--color-text)",
                        fontFamily: "var(--font-ui)",
                        fontSize: "0.9rem",
                        padding: "6px 8px",
                        textAlign: "center",
                      }}
                    />
                  </div>
                )}

                {/* Mark Complete */}
                {(() => {
                  const nextPhaseInRender = phases[idx + 1];
                  const btnLabel = nextPhaseInRender
                    ? `Next: ${nextPhaseInRender.name} →`
                    : "Complete This Cook ✓";
                  return (
                    <button
                      onClick={() => handleMarkComplete(phase)}
                      style={{
                        width: "100%",
                        background: "#C9973A",
                        color: "var(--color-bg)",
                        border: "none",
                        borderRadius: "var(--radius-md)",
                        fontFamily: "var(--font-ui)",
                        fontSize: "1rem",
                        fontWeight: 600,
                        padding: "10px",
                        cursor: "pointer",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {btnLabel}
                    </button>
                  );
                })()}
              </div>
            );
          }

          // UPCOMING (next 1–2 after active)
          if (isUpcoming) {
            return (
              <div
                key={phase.id}
                ref={el => { phaseRefs.current[phase.id] = el; }}
                style={{
                  background: "var(--color-bg-alt)",
                  border: "1px solid rgba(201,151,58,0.2)",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--space-3)",
                  opacity: 0.7,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                  <span style={{ color: "var(--color-text-muted)", fontSize: "1rem" }}>{phase.icon}</span>
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: "1rem", color: "var(--color-text-muted)" }}>
                    {phase.name}
                  </span>
                </div>
                <div style={{ marginTop: "var(--space-1)", fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                  {phase.trigger}
                </div>
              </div>
            );
          }

          // FUTURE
          return (
            <div
              key={phase.id}
              ref={el => { phaseRefs.current[phase.id] = el; }}
              style={{
                border: "1px solid rgba(201,151,58,0.1)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-2) var(--space-3)",
                opacity: 0.4,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>{phase.icon}</span>
                <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem", color: "var(--color-text-muted)" }}>
                  {phase.name}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── STICKY BOTTOM BAR ── */}
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

      {/* ── TOAST ── */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: 66,
          left: "50%",
          transform: "translateX(-50%)",
          maxWidth: "min(560px, 90vw)",
          width: "100%",
          background: "#0e0c0a",
          border: "1px solid rgba(201,151,58,0.5)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-3) var(--space-4)",
          zIndex: 200,
          animation: "toastSlide 4s ease forwards",
          pointerEvents: "none",
        }}>
          <p style={{
            fontFamily: "var(--font-body)",
            fontStyle: "italic",
            fontSize: "0.95rem",
            color: "#F5E6C8",
            margin: 0,
            lineHeight: 1.6,
            textAlign: "center",
          }}>
            {toast}
          </p>
        </div>
      )}
    </div>
  );
}
