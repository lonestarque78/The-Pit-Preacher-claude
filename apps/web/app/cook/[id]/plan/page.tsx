import Link from "next/link";
import Button from "@/components/Button";
import { createServerClient } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PrepChecklist from "./PrepChecklist";
import { autoAdjustPlan } from "@/lib/plan/autoAdjustPlan";
import AdjustmentsBanner from "@/components/plan/AdjustmentsBanner";
import NextCookStrategyCard from "@/components/strategy/NextCookStrategyCard";
import { getTier, tierMeetsRequirement } from "@/lib/premium";
import { normalizeMeatType } from "@/lib/insights/normalizers";

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

export default async function CookPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: cookId } = await params;
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const tier = await getTier(user.id, supabase);
  const isPitmaster = tierMeetsRequirement(tier, "pitmaster");

  const { data: cook } = await supabase
    .from("cooks")
    .select("*")
    .eq("id", cookId)
    .single();

  if (!cook) {
    return (
      <div style={{ padding: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Cook Not Found</h1>
      </div>
    );
  }

  const { data: cookItems } = await supabase
    .from("cook_items")
    .select("*")
    .eq("cook_id", cookId);

  let session: any = null;
  if (cook.prep_session_id) {
    const { data } = await supabase
      .from("meal_prep_sessions")
      .select("*")
      .eq("id", cook.prep_session_id)
      .single();
    session = data;
  }

  const plan = cook.plan as { tools?: PlanTool[]; items?: PlanItem[] } | null;
  const planTools: PlanTool[] = plan?.tools ?? [];
  const planItems: PlanItem[] = plan?.items ?? [];

  // ── AUTO-ADJUSTMENT ENGINE ──────────────────────────────────────────────
  const pitType = cook.smoker_type ?? "";
  const meatType = cook.label ?? "";

  const { adjustments, hasAdjustments } = await autoAdjustPlan(
    cookId,
    user.id,
    pitType,
    meatType
  );

  // Forward the auth cookie so /api/preacher can verify the session
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join("; ");

  // Build adjustment context string for the Preacher prompt
  let adjustmentContext = "";
  if (hasAdjustments) {
    const parts: string[] = [];
    if (adjustments.startTimeAdjustment !== null) {
      parts.push(`Start ${Math.abs(adjustments.startTimeAdjustment)} minutes ${adjustments.startTimeAdjustment < 0 ? "earlier" : "later"} than normal`);
    }
    if (adjustments.pitTempAdjustment !== null) {
      parts.push(`Run pit ${Math.abs(adjustments.pitTempAdjustment)}°F ${adjustments.pitTempAdjustment < 0 ? "cooler" : "hotter"} than target`);
    }
    if (adjustments.wrapAdjustment !== null) {
      parts.push(`Wrap ${Math.abs(adjustments.wrapAdjustment)} minutes ${adjustments.wrapAdjustment > 0 ? "later" : "earlier"} than normal`);
    }
    if (adjustments.restTimeAdjustment !== null) {
      parts.push(`Rest ${Math.abs(adjustments.restTimeAdjustment)} minutes ${adjustments.restTimeAdjustment > 0 ? "longer" : "shorter"} than normal`);
    }
    adjustmentContext = `\n\nBased on past cook data, apply these adjustments to the plan: ${parts.join(". ")}.`;
  }

  let aiReply = "";
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const res = await fetch(`${siteUrl}/api/preacher`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({
        cookId: cook.id,
        message:
          "Generate a full cook plan for this cook. Include: when to trim and season each meat, when to light each smoker, key milestones (wrap windows, spritz windows, probe tender check), rest time, and slice/serve time. Be specific with clock times working backward from the eating time. Write in your voice — direct, confident, no fluff. End with a one paragraph overall read on this cook." + adjustmentContext,
        cookContext: {
          label: cook.label,
          eat_time: cook.eat_time,
          cooking_style: cook.cooking_style,
          tools: planTools,
          planItems,
          flavor_smoke: session?.flavor_smoke ?? null,
          flavor_bark: session?.flavor_bark ?? null,
          flavor_tenderness: session?.flavor_tenderness ?? null,
          recentEvents: [],
        },
      }),
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      aiReply = json.reply || "";
    }
  } catch (err) {
    console.error("Preacher fetch failed:", err);
  }

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
      items: cookItems.flatMap(item => [
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
        <Link href={`/cook/${cookId}`}>
          <Button>← Back to Cook</Button>
        </Link>
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
          <Link href="/fix" style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.82rem",
            color: "#8B6914",
            textDecoration: "none",
            opacity: 0.85,
          }}>
            Something not going to plan?{" "}<span style={{ color: "#C9973A" }}>→ Pit Rescue</span>
          </Link>
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
      <Link href={`/cook/${cookId}/live`}>
        <Button>Go Live →</Button>
      </Link>
    </div>
  );
}
