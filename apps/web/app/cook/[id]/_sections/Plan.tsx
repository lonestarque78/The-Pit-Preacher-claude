"use client";

import { use, useEffect, useState } from "react";
import Button from "@/components/Button";
import PrepChecklist from "./PrepChecklist";
import AdjustmentsBanner from "@/components/plan/AdjustmentsBanner";
import NextCookStrategyCard from "@/components/strategy/NextCookStrategyCard";
import { normalizeMeatType } from "@/lib/insights/normalizers";
import type { PlanAdjustments } from "@/lib/plan/autoAdjustPlan";

type PlanTool = { id: string; name: string; wood: string };
type PlanItem = {
  name: string;
  category?: string;
  quantity?: number;
  weight?: string | number | null;
  notes?: string;
  smokerId?: string | null;
};
type StepType = "FIRE" | "PREP" | "WRAP" | "REST" | "SLICE" | "CHECK";
type TimelineStep = { time: string; type: StepType; text: string; smokerIdx: number };

const STEP_BADGE: Record<StepType, React.CSSProperties> = {
  FIRE:  { background: "var(--color-accent)",      color: "var(--color-bg)",          border: "none" },
  PREP:  { background: "var(--color-bg-alt)",       color: "var(--color-text-muted)",  border: "1px solid var(--color-border, #333)" },
  WRAP:  { background: "#8B6914",                   color: "#fff",                     border: "none" },
  REST:  { background: "var(--color-text-muted)",   color: "var(--color-bg)",          border: "none" },
  SLICE: { background: "#2D6A4F",                   color: "#fff",                     border: "none" },
  CHECK: { background: "#1a3a5c",                   color: "#fff",                     border: "none" },
};

const BADGE_BASE: React.CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: "0.7rem",
  padding: "2px 8px",
  borderRadius: "var(--radius-sm)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  flexShrink: 0,
};

function detectStepType(text: string): StepType {
  const t = text.toLowerCase();
  if (/\b(light|fire up|kindle|ignite|start.{0,20}smoker)\b/.test(t)) return "FIRE";
  if (/\b(wrap|foil|butcher paper)\b/.test(t)) return "WRAP";
  if (/\b(rest|resting|pull off|off the pit|into the cooler)\b/.test(t)) return "REST";
  if (/\b(slice|serve|slicing|serving)\b/.test(t)) return "SLICE";
  if (/\b(probe|check temp|internal temp|thermometer|probe tender)\b/.test(t)) return "CHECK";
  if (/\b(trim|season|rub|apply|binder|inject|spritz|baste|mop|prep)\b/.test(t)) return "PREP";
  return "CHECK";
}

function detectSmokerIdx(text: string, tools: PlanTool[]): number {
  const t = text.toLowerCase();
  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    if (tool && tool.name && t.includes(tool.name.toLowerCase())) return i;
    if (t.includes(`smoker ${i + 1}`)) return i;
  }
  return 0;
}

function parseTimeline(aiText: string, tools: PlanTool[]): TimelineStep[] | null {
  const TIME_RE = /\b(\d{1,2}:\d{2}\s*(?:AM|PM))\b/i;
  const steps: TimelineStep[] = [];

  const lines = aiText.split("\n").filter(l => l.trim());
  for (const line of lines) {
    const m = line.match(TIME_RE);
    if (m) {
      const cleaned = line
        .replace(TIME_RE, "")
        .replace(/^[\s—–\-:]+/, "")
        .trim();
      steps.push({
        time: m[0].toUpperCase(),
        type: detectStepType(line),
        text: cleaned || line.trim(),
        smokerIdx: detectSmokerIdx(line, tools),
      });
    }
  }

  if (steps.length > 0) return steps;

  const sentences = aiText.split(/(?<=[.!?])\s+/);
  for (const s of sentences) {
    const m = s.match(TIME_RE);
    if (m) {
      const cleaned = s.replace(TIME_RE, "").replace(/^[\s—–\-:]+/, "").trim();
      steps.push({
        time: m[0].toUpperCase(),
        type: detectStepType(s),
        text: cleaned || s.trim(),
        smokerIdx: detectSmokerIdx(s, tools),
      });
    }
  }

  return steps.length > 0 ? steps : null;
}

function extractPreachersWord(aiText: string): string {
  const paragraphs = aiText.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  if (paragraphs.length > 1) return paragraphs[paragraphs.length - 1] ?? "";
  const sentences = aiText.split(/(?<=[.!?])\s+/).filter(Boolean);
  return sentences.slice(-2).join(" ").trim() || aiText.trim();
}

function formatEatTime(eatTime: string): string {
  const d = new Date(eatTime);
  const time = d.toLocaleString(undefined, { hour: "numeric", minute: "2-digit" });
  const date = d.toLocaleString(undefined, { weekday: "long", month: "long", day: "numeric" });
  return `Eating at ${time} — ${date}`;
}

function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div style={{ position: "relative", paddingLeft: "24px" }}>
      <div style={{
        position: "absolute",
        left: "8px",
        top: 0,
        bottom: 0,
        width: "2px",
        background: "rgba(255, 106, 0, 0.5)",
      }} />
      {steps.map((step, i) => (
        <div
          key={i}
          style={{
            marginBottom: i < steps.length - 1 ? "var(--space-3)" : 0,
            background: "var(--color-bg-alt)",
            border: "1px solid var(--color-border, #333)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-2) var(--space-3)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
            <span style={{
              fontFamily: "var(--font-ui)",
              fontWeight: "bold",
              color: "var(--color-accent)",
              fontSize: "0.85rem",
            }}>
              {step.time}
            </span>
            <span style={{ ...BADGE_BASE, ...STEP_BADGE[step.type] }}>
              {step.type}
            </span>
          </div>
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            color: "var(--color-text)",
            margin: 0,
            lineHeight: 1.5,
          }}>
            {step.text}
          </p>
        </div>
      ))}
    </div>
  );
}

const MEAT_CATEGORIES = new Set(["beef", "pork", "poultry", "lamb", "seafood", "other-meat", "meats"]);

type CookRow = {
  id: string;
  label: string | null;
  eat_time: string | null;
  cooking_style: string | null;
  smoker_type: string | null;
};

type PlanData = {
  cook: CookRow;
  cookItems: PlanItem[];
  session: { flavor_smoke?: number; flavor_bark?: number; flavor_tenderness?: number } | null;
  isPitmaster: boolean;
  adjustments: PlanAdjustments;
  hasAdjustments: boolean;
  aiReply: string;
};

export default function CookPlanPage({ params, onNavigate }: { params: Promise<{ id: string }>; onNavigate?: (tab: string) => void }) {
  const { id: cookId } = use(params);
  const [data, setData] = useState<PlanData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/cook-plan?cookId=${cookId}`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const json = await res.json();
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [cookId]);

  if (loading) {
    return (
      <div style={{ padding: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Loading...</h1>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div style={{ padding: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Cook Not Found</h1>
      </div>
    );
  }

  const { cook, cookItems, session, isPitmaster, adjustments, hasAdjustments, aiReply } = data;

  const plan = (cook as any).plan as { tools?: PlanTool[]; items?: PlanItem[] } | null;
  const planTools: PlanTool[] = plan?.tools ?? [];
  const planItems: PlanItem[] = plan?.items ?? [];

  const timelineSteps = aiReply ? parseTimeline(aiReply, planTools) : null;
  const preachersWord = aiReply ? extractPreachersWord(aiReply) : "";

  const prepChecklists: { smokerName: string; items: { id: string; label: string }[] }[] = [];

  if (planTools.length > 0) {
    for (let i = 0; i < planTools.length; i++) {
      const tool = planTools[i];
      if (!tool) continue;
      const assigned = planItems.filter(item => String(item.smokerId) === String(tool.id));
      const meats = assigned.filter(item =>
        !item.category || MEAT_CATEGORIES.has((item.category || "").toLowerCase())
      );
      const source = meats.length > 0 ? meats : assigned;
      if (source.length === 0) continue;
      prepChecklists.push({
        smokerName: `Smoker ${i + 1}${tool.name ? ` — ${tool.name}` : ""}`,
        items: source.flatMap(item => [
          { id: `trim-${tool.id}-${item.name}`,   label: `Trim ${item.name}` },
          { id: `binder-${tool.id}-${item.name}`, label: `Apply binder to ${item.name}` },
          { id: `season-${tool.id}-${item.name}`, label: `Season ${item.name}` },
          { id: `fridge-${tool.id}-${item.name}`, label: `Rest seasoned ${item.name} in fridge (if time allows)` },
        ]),
      });
    }
  } else if (cookItems && cookItems.length > 0) {
    prepChecklists.push({
      smokerName: "Prep",
      items: cookItems.flatMap((item: any) => [
        { id: `trim-${item.id}`,   label: `Trim ${item.name}` },
        { id: `binder-${item.id}`, label: `Apply binder to ${item.name}` },
        { id: `season-${item.id}`, label: `Season ${item.name}` },
        { id: `fridge-${item.id}`, label: `Rest seasoned ${item.name} in fridge (if time allows)` },
      ]),
    });
  }

  const eatTimeFormatted = cook.eat_time ? formatEatTime(cook.eat_time) : null;
  const flavorSmoke = session?.flavor_smoke;
  const flavorBark = session?.flavor_bark;
  const flavorTenderness = session?.flavor_tenderness;

  const flavorPills = [
    flavorSmoke != null && `Smoke ${flavorSmoke}`,
    flavorBark != null && `Bark ${flavorBark}`,
    flavorTenderness != null && `Tenderness ${flavorTenderness}`,
  ].filter(Boolean) as string[];

  return (
    <div style={{ padding: "40px", maxWidth: "1100px" }}>

      {/* Back nav */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <Button onClick={() => onNavigate?.("overview")}>← Back to Cook</Button>
      </div>

      {/* ── NEXT COOK STRATEGY CARD ── */}
      <NextCookStrategyCard
        cookId={cookId}
        meatType={normalizeMeatType(cook.label ?? "") ?? ""}
        pitType={cook.smoker_type ?? ""}
        isPitmaster={isPitmaster}
      />

      {/* ── AUTO-ADJUSTMENT BANNER ── */}
      {hasAdjustments && (
        <AdjustmentsBanner
          adjustments={adjustments}
          onRevert={() => {}}
        />
      )}

      {/* ── SECTION 1: MISSION BRIEF ── */}
      <div style={{
        background: "var(--color-bg-alt)",
        padding: "var(--space-5)",
        borderRadius: "var(--radius-lg)",
        marginBottom: "var(--space-5)",
      }}>
        <h1 style={{
          fontFamily: "var(--font-heading)",
          marginTop: 0,
          marginBottom: eatTimeFormatted ? "var(--space-2)" : "var(--space-3)",
        }}>
          {cook.label}
        </h1>

        {eatTimeFormatted && (
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "1.05rem",
            color: "var(--color-text-muted)",
            marginTop: 0,
            marginBottom: "var(--space-3)",
          }}>
            {eatTimeFormatted}
          </p>
        )}

        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          {cook.cooking_style && (
            <span style={{
              background: "var(--color-accent)",
              color: "var(--color-bg)",
              fontFamily: "var(--font-ui)",
              fontSize: "0.8rem",
              padding: "4px 12px",
              borderRadius: "var(--radius-md)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
              {cook.cooking_style}
            </span>
          )}
          {flavorPills.map(pill => (
            <span key={pill} style={{
              background: "var(--color-accent)",
              color: "var(--color-bg)",
              fontFamily: "var(--font-ui)",
              fontSize: "0.8rem",
              padding: "4px 12px",
              borderRadius: "var(--radius-md)",
            }}>
              {pill}
            </span>
          ))}
        </div>
      </div>

      {/* ── SECTION 2: PIT TIMELINES ── */}
      <div style={{ marginBottom: "var(--space-5)" }}>
        <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-4)" }}>
          Pit Timelines
        </h2>

        {planTools.length > 0 ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--space-4)",
          }}>
            {planTools.map((tool, toolIdx) => {
              const smokerSteps = timelineSteps
                ? timelineSteps.filter(s => s.smokerIdx === toolIdx)
                : [];

              return (
                <div key={tool.id}>
                  <div style={{
                    background: "var(--color-accent)",
                    color: "var(--color-bg)",
                    padding: "var(--space-2) var(--space-3)",
                    borderRadius: "var(--radius-md)",
                    marginBottom: "var(--space-3)",
                    fontFamily: "var(--font-ui)",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>
                    {tool.name || `Smoker ${toolIdx + 1}`}
                    {tool.wood && (
                      <span style={{
                        fontWeight: "normal",
                        opacity: 0.85,
                        marginLeft: "var(--space-2)",
                        fontSize: "0.8rem",
                        textTransform: "none",
                        letterSpacing: 0,
                      }}>
                        · {tool.wood}
                      </span>
                    )}
                  </div>

                  {smokerSteps.length > 0 ? (
                    <Timeline steps={smokerSteps} />
                  ) : timelineSteps !== null ? (
                    <p style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.9rem",
                      color: "var(--color-text-muted)",
                      fontStyle: "italic",
                    }}>
                      No steps assigned to this smoker.
                    </p>
                  ) : aiReply ? (
                    <div style={{
                      background: "var(--color-bg-alt)",
                      border: "1px solid var(--color-border, #333)",
                      borderRadius: "var(--radius-md)",
                      padding: "var(--space-3)",
                    }}>
                      <p style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.9rem",
                        color: "var(--color-text)",
                        margin: 0,
                        lineHeight: 1.7,
                      }}>
                        {aiReply}
                      </p>
                    </div>
                  ) : (
                    <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                      Plan unavailable.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          timelineSteps ? (
            <div style={{ maxWidth: "640px" }}>
              <Timeline steps={timelineSteps} />
            </div>
          ) : aiReply ? (
            <div style={{
              background: "var(--color-bg-alt)",
              border: "1px solid var(--color-border, #333)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-4)",
              maxWidth: "640px",
            }}>
              <p style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.95rem",
                color: "var(--color-text)",
                margin: 0,
                lineHeight: 1.7,
              }}>
                {aiReply}
              </p>
            </div>
          ) : (
            <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
              Plan could not be generated. Check your connection and try again.
            </p>
          )
        )}
        <div style={{ textAlign: "right", marginTop: "var(--space-3)" }}>
          <a href="/dashboard?fix=1" style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.82rem",
            color: "#8B6914",
            textDecoration: "none",
            opacity: 0.85,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
          }}>
            Something not going to plan?{" "}<span style={{ color: "#C9973A" }}>→ Pit Rescue</span>
          </a>
        </div>
      </div>

      {/* ── SECTION 3: PREP CHECKLIST ── */}
      {prepChecklists.length > 0 && (
        <div style={{ marginBottom: "var(--space-5)" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-4)" }}>
            Prep Checklist
          </h2>
          <PrepChecklist checklists={prepChecklists} />
        </div>
      )}

      {/* ── SECTION 4: THE PREACHER'S WORD ── */}
      {preachersWord && (
        <div style={{
          borderLeft: "4px solid var(--color-accent)",
          padding: "var(--space-4)",
          background: "var(--color-bg-alt)",
          borderRadius: "var(--radius-lg)",
          marginBottom: "var(--space-5)",
        }}>
          <h2 style={{
            fontFamily: "var(--font-heading)",
            fontStyle: "italic",
            marginTop: 0,
            marginBottom: "var(--space-3)",
          }}>
            The Preacher's Word
          </h2>
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "1.1rem",
            fontStyle: "italic",
            color: "var(--color-text)",
            margin: 0,
            lineHeight: 1.7,
          }}>
            {preachersWord}
          </p>
        </div>
      )}

      {/* Go Live */}
      <Button onClick={() => onNavigate?.("live")}>Go Live →</Button>
    </div>
  );
}
