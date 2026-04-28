"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { generateTimeline } from "./engine";
import Link from "next/link";
import Button from "@/components/Button";

type PlanTool = { id: string; name: string; wood: string };
type PlanItem = {
  name: string;
  category?: string;
  quantity?: number;
  weight?: string | number | null;
  notes?: string;
  smokerId?: string | null;
};
type EngineStep = { label: string; detail: string; time: Date };
type StepType = "FIRE" | "PREP" | "WRAP" | "REST" | "SLICE" | "CHECK";

const NODE_COLORS: Record<StepType, React.CSSProperties> = {
  FIRE:  { background: "var(--color-accent)",     border: "none" },
  PREP:  { background: "var(--color-bg-alt)",      border: "2px solid var(--color-border, #444)" },
  WRAP:  { background: "#8B6914",                  border: "none" },
  REST:  { background: "#2a3a4a",                  border: "none" },
  SLICE: { background: "#2D6A4F",                  border: "none" },
  CHECK: { background: "#1a3a5c",                  border: "none" },
};

const BADGE_COLORS: Record<StepType, React.CSSProperties> = {
  FIRE:  { background: "var(--color-accent)",    color: "var(--color-bg)" },
  PREP:  { background: "var(--color-bg-alt)",     color: "var(--color-text-muted)",
           border: "1px solid var(--color-border, #444)" },
  WRAP:  { background: "#8B6914",                color: "#fff" },
  REST:  { background: "#2a3a4a",                color: "#fff" },
  SLICE: { background: "#2D6A4F",                color: "#fff" },
  CHECK: { background: "#1a3a5c",                color: "#fff" },
};

function getStepType(label: string): StepType {
  const l = label.toLowerCase();
  if (l === "fire up") return "FIRE";
  if (l === "wrap") return "WRAP";
  if (l === "rest") return "REST";
  if (l === "slice" || l === "serve") return "SLICE";
  if (l.startsWith("probe") || l === "check") return "CHECK";
  return "PREP";
}

function formatCountdown(eatTime: string, now: Date): string {
  const diff = new Date(eatTime).getTime() - now.getTime();
  if (diff <= 0) return "Time to eat.";
  const totalMin = Math.floor(diff / 60000);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hours === 0) return `Eating in ${mins}m`;
  return `Eating in ${hours}h ${mins}m`;
}

function getProgress(createdAt: string, eatTime: string): number {
  if (!createdAt || !eatTime) return 0;
  const start = new Date(createdAt).getTime();
  const end = new Date(eatTime).getTime();
  const now = Date.now();
  if (end <= start) return 0;
  return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function TimelinePage({ params }: { params: { id: string } }) {
  const cookId = params.id;
  const supabase = createClient();

  const [cook, setCook] = useState<any>(null);
  const [cookItems, setCookItems] = useState<any[]>([]);
  const [cookEvents, setCookEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    const load = async () => {
      const { data: cookData } = await supabase
        .from("cooks")
        .select("*")
        .eq("id", cookId)
        .single();

      const { data: itemsData } = await supabase
        .from("cook_items")
        .select("*")
        .eq("cook_id", cookId);

      const { data: eventsData } = await supabase
        .from("cook_events")
        .select("*")
        .eq("cook_id", cookId)
        .order("created_at", { ascending: true });

      setCook(cookData);
      setCookItems(itemsData || []);
      setCookEvents(eventsData || []);
      setLoading(false);
    };

    load();
    const ticker = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(ticker);
  }, [cookId]);

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

  const plan = cook.plan as { tools?: PlanTool[]; items?: PlanItem[] } | null;
  const planTools: PlanTool[] = plan?.tools ?? [];
  const planItems: PlanItem[] = plan?.items ?? [];
  const hasMultipleSmokers = planTools.length > 1;

  const tabs = hasMultipleSmokers
    ? [
        { id: "all", label: "All Pits" },
        ...planTools.map((t, i) => ({
          id: t.id,
          label: (`Smoker ${i + 1}${t.name ? ` — ${t.name}` : ""}`).slice(0, 24),
        })),
      ]
    : [];

  const filteredItems =
    !hasMultipleSmokers || activeTab === "all"
      ? planItems.length > 0 ? planItems : cookItems
      : planItems.filter(i => String(i.smokerId) === activeTab);

  const steps: EngineStep[] = generateTimeline(cook, filteredItems, cookEvents);

  if (cook.eat_time) {
    steps.push({ label: "Serve", detail: "", time: new Date(cook.eat_time) });
  }

  const countdown = cook.eat_time ? formatCountdown(cook.eat_time, now) : "";
  const progress = cook.eat_time ? getProgress(cook.created_at, cook.eat_time) : 0;

  // Sticky header is ~56px tall (padding 24px + text ~26px + progress bar 3px + border 1px)
  const HEADER_H = 58;

  return (
    <div style={{ paddingBottom: "120px" }}>

      {/* Back button — scrolls away */}
      <div style={{ padding: "var(--space-4)" }}>
        <Link href={`/cook/${cookId}`}>
          <Button>← Back to Cook</Button>
        </Link>
      </div>

      {/* ── STICKY HEADER ── */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "var(--color-bg-alt)",
        borderBottom: "1px solid var(--color-border, #333)",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px var(--space-4)",
        }}>
          <span style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.1rem",
            color: "var(--color-text)",
          }}>
            {cook.label}
          </span>
          {countdown && (
            <span style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.9rem",
              fontWeight: "bold",
              color: "var(--color-accent)",
              letterSpacing: "0.03em",
            }}>
              {countdown}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div style={{ height: "3px", background: "var(--color-bg)", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: "var(--color-accent)",
            transition: "width 0.5s ease",
          }} />
        </div>
      </div>

      {/* ── SMOKER TABS ── */}
      {hasMultipleSmokers && (
        <div style={{
          position: "sticky",
          top: `${HEADER_H}px`,
          zIndex: 99,
          background: "var(--color-bg)",
          borderBottom: "1px solid var(--color-border, #333)",
          display: "flex",
          overflowX: "auto",
          padding: "0 var(--space-3)",
        }}>
          {tabs.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: "none",
                  border: "none",
                  borderBottom: active
                    ? "2px solid var(--color-accent)"
                    : "2px solid transparent",
                  padding: "12px var(--space-3)",
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.85rem",
                  color: active ? "var(--color-accent)" : "var(--color-text-muted)",
                  fontWeight: active ? "bold" : "normal",
                  letterSpacing: "0.03em",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "color 0.15s",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* ── TIMELINE STRIP ── */}
      <div style={{
        position: "relative",
        padding: "var(--space-4)",
        paddingLeft: "36px",
        maxWidth: "720px",
      }}>

        {/* Vertical accent line */}
        {steps.length > 0 && (
          <div style={{
            position: "absolute",
            left: "15px",
            top: "calc(var(--space-4) + 28px)",
            bottom: "calc(var(--space-4) + 28px)",
            width: "2px",
            background: "rgba(255, 106, 0, 0.4)",
          }} />
        )}

        {steps.length === 0 && (
          <p style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-text-muted)",
            fontStyle: "italic",
          }}>
            No timeline steps. Add items to your cook to generate a plan.
          </p>
        )}

        {steps.map((step, i) => {
          const isFinishLine = i === steps.length - 1 && !!cook.eat_time;
          const stepType = getStepType(step.label);
          const isPast = step.time < now;
          const isCurrent = !isPast && (step.time.getTime() - now.getTime()) <= 60 * 60 * 1000;

          // ── Finish Line Card ──
          if (isFinishLine) {
            return (
              <div key={i} style={{ position: "relative" }}>
                <div style={{
                  position: "absolute",
                  left: "-28px",
                  top: "20px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "#2D6A4F",
                  zIndex: 1,
                }} />
                <div style={{
                  background: "var(--color-accent)",
                  color: "var(--color-bg)",
                  padding: "var(--space-4)",
                  borderRadius: "var(--radius-lg)",
                }}>
                  <p style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1.2rem",
                    margin: 0,
                    marginBottom: "var(--space-2)",
                    lineHeight: 1.3,
                  }}>
                    Time to eat. Pull it, rest it, slice it. You earned this.
                  </p>
                  <p style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.9rem",
                    margin: 0,
                    opacity: 0.85,
                  }}>
                    {step.time.toLocaleString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          }

          // ── Normal Step Card ──
          let cardBg = "var(--color-bg-alt)";
          let cardShadow = "none";
          let cardBorderLeft = "none";

          if (isPast)    cardBg = "rgba(45, 106, 79, 0.15)";
          if (isCurrent) {
            cardShadow    = "0 0 16px rgba(255, 106, 0, 0.3)";
            cardBorderLeft = "3px solid var(--color-accent)";
          }

          return (
            <div key={i} style={{ position: "relative", marginBottom: "var(--space-3)" }}>

              {/* Node circle */}
              <div style={{
                position: "absolute",
                left: "-28px",
                top: "20px",
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                zIndex: 1,
                ...NODE_COLORS[stepType],
              }} />

              {/* Card */}
              <div style={{
                background: cardBg,
                borderRadius: "var(--radius-md)",
                padding: "var(--space-3)",
                boxShadow: cardShadow,
                borderLeft: cardBorderLeft,
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "var(--space-1)",
                }}>
                  <span style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: "var(--color-accent)",
                    lineHeight: 1,
                  }}>
                    {formatTime(step.time)}
                  </span>

                  {isPast ? (
                    <span style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: "1rem",
                      color: "var(--color-text-muted)",
                    }}>
                      ✓
                    </span>
                  ) : (
                    <span style={{
                      ...BADGE_COLORS[stepType],
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.7rem",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.05em",
                    }}>
                      {step.label}
                    </span>
                  )}
                </div>

                <p style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.95rem",
                  color: isPast ? "var(--color-text-muted)" : "var(--color-text)",
                  margin: 0,
                  lineHeight: 1.5,
                }}>
                  {step.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── FLOATING GO LIVE ── */}
      <Link
        href={`/cook/${cookId}/live`}
        style={{
          position: "fixed",
          bottom: "var(--space-4)",
          right: "var(--space-4)",
          background: "var(--color-accent)",
          color: "var(--color-bg)",
          fontFamily: "var(--font-ui)",
          fontSize: "0.95rem",
          fontWeight: "bold",
          padding: "12px 24px",
          borderRadius: "50px",
          boxShadow: "0 4px 20px rgba(255, 106, 0, 0.4)",
          textDecoration: "none",
          letterSpacing: "0.03em",
          zIndex: 200,
          display: "inline-block",
        }}
      >
        Go Live →
      </Link>
    </div>
  );
}
