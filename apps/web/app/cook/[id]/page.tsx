"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { getRandomVerse } from "@/lib/verses";
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
type CookPlan = {
  tools?: PlanTool[];
  items?: PlanItem[];
  preacherPlan?: string;
};

const SECTION_HEADERS = [
  "THE NIGHT BEFORE",
  "FIRE & TIMING",
  "THE COOK",
  "THE FINISH",
  "THE PREACHER'S WORD",
];

function capitalize(str: string): string {
  return str.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function stripMarkdown(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').trim();
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: "short", month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function parsePlan(text: string): { header: string; content: string }[] | null {
  const sections: { header: string; content: string }[] = [];
  let currentHeader = "";
  let currentLines: string[] = [];

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    const stripped = stripMarkdown(trimmed);
    if (SECTION_HEADERS.includes(stripped)) {
      if (currentHeader) {
        sections.push({ header: currentHeader, content: currentLines.join("\n").trim() });
      }
      currentHeader = stripped;
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  if (currentHeader) {
    sections.push({ header: currentHeader, content: currentLines.join("\n").trim() });
  }

  return sections.length >= 3 ? sections : null;
}

export default function CookDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: cookId } = use(params);
  const supabase = createClient();

  const [cook, setCook] = useState<any>(null);
  const [cookItems, setCookItems] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [planText, setPlanText] = useState<string | null>(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [userTier, setUserTier] = useState<string>("free");
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [loadingVerse, setLoadingVerse] = useState<{ text: string; chapter: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState("");
  const [editSmokerType, setEditSmokerType] = useState("");
  const [editWoodType, setEditWoodType] = useState("");
  const [editEatTime, setEditEatTime] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setLoadingVerse(getRandomVerse());
  }, []);

  useEffect(() => {
    loadData();
  }, [cookId]);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    const { data: subData } = await supabase.from("subscriptions").select("tier").eq("user_id", user.id).single();
    setUserTier(subData?.tier ?? "free");

    const { data: cookData } = await supabase
      .from("cooks")
      .select("*")
      .eq("id", cookId)
      .eq("user_id", user.id)
      .single();

    if (!cookData) {
      setLoading(false);
      return;
    }

    setCook(cookData);

    const { data: itemsData } = await supabase
      .from("cook_items")
      .select("*")
      .eq("cook_id", cookId);

    setCookItems(itemsData || []);

    let sessionData: any = null;
    if (cookData.prep_session_id) {
      const { data } = await supabase
        .from("meal_prep_sessions")
        .select("*")
        .eq("id", cookData.prep_session_id)
        .single();
      sessionData = data;
    }
    if (sessionData) setSession(sessionData);

    setLoading(false);

    const existingPlan = cookData.plan as CookPlan | null;
    if (existingPlan?.preacherPlan) {
      setPlanText(existingPlan.preacherPlan);
    } else {
      fetchPlan(cookData, sessionData);
    }
  };

  const fetchPlan = async (cookData: any, sessionData: any) => {
    setPlanLoading(true);

    const plan = cookData.plan as CookPlan | null;
    const planTools: PlanTool[] = plan?.tools ?? [];
    const planItems: PlanItem[] = plan?.items ?? [];

    const eatTimeLocal = cookData.eat_time
      ? new Date(cookData.eat_time).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
      : 'Not set';

    try {
      const res = await fetch("/api/preacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cookId: cookData.id,
          message: "Generate a full cook plan for this cook.",
          cookContext: {
            label: cookData.label,
            eat_time: eatTimeLocal,
            cooking_style: cookData.cooking_style,
            tools: planTools,
            planItems,
            recentEvents: [],
            flavor_smoke: sessionData?.flavor_smoke ?? null,
            flavor_bark: sessionData?.flavor_bark ?? null,
            flavor_tenderness: sessionData?.flavor_tenderness ?? null,
          },
        }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);

      const json = await res.json();
      const reply: string = json.reply ?? "";

      setPlanText(reply);

      if (reply) {
        const existingPlan = cookData.plan as CookPlan | null;
        await supabase
          .from("cooks")
          .update({ plan: { ...existingPlan, preacherPlan: reply } })
          .eq("id", cookData.id);
      }
    } catch (err) {
      console.error("Plan fetch failed:", err);
    } finally {
      setPlanLoading(false);
    }
  };

  function toDateTimeLocal(iso: string | null | undefined): string {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch { return ""; }
  }

  const handleEditSave = async () => {
    const updatedPlan = cook.plan ? JSON.parse(JSON.stringify(cook.plan)) : null;
    if (updatedPlan?.tools?.[0]) {
      updatedPlan.tools[0].name = editSmokerType;
      updatedPlan.tools[0].wood = editWoodType;
    }
    const updates: any = {
      label: editLabel,
      smoker_type: editSmokerType,
      wood_type: editWoodType,
      eat_time: editEatTime || null,
    };
    if (updatedPlan) updates.plan = updatedPlan;
    const { error } = await supabase.from("cooks").update(updates).eq("id", cook.id);
    if (error) { console.error(error); return; }
    setCook((prev: any) => ({ ...prev, ...updates }));
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleComplete = async () => {
    await supabase
      .from("cooks")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", cook.id);
    setShowCompleteConfirm(true);
  };

  const regeneratePlan = async () => {
    if (!cook || planLoading) return;
    setPlanText(null);

    const existingPlan = cook.plan as CookPlan | null;
    const { preacherPlan: _removed, ...planWithoutCache } = { ...(existingPlan ?? {}) };

    await supabase
      .from("cooks")
      .update({ plan: planWithoutCache })
      .eq("id", cook.id);

    const updatedCook = { ...cook, plan: planWithoutCache };
    setCook(updatedCook);

    fetchPlan(updatedCook, session);
  };

  const plan = cook?.plan as CookPlan | null;
  const planTools: PlanTool[] = plan?.tools ?? [];
  const planItemsList: PlanItem[] = plan?.items ?? [];
  const parsedSections = planText ? parsePlan(planText) : null;

  const NAV_LINKS = [
    { label: "Live Mode", href: `/cook/${cookId}/live` },
    { label: "Timeline",  href: `/cook/${cookId}/timeline` },
    { label: "Guide",     href: `/cook/${cookId}/guide` },
    { label: "Journal",   href: `/cook/${cookId}/events` },
    { label: "Summary",   href: `/cook/${cookId}/summary` },
  ];

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
        <Link href="/dashboard" style={{ color: "var(--color-accent)", fontFamily: "var(--font-body)" }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    background: "var(--color-bg-alt)",
    border: "1px solid rgba(201,151,58,0.15)",
    borderRadius: "var(--radius-lg)",
    padding: "var(--space-4)",
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontFamily: "var(--font-ui)",
    fontSize: "0.75rem",
    color: "#C9973A",
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    marginBottom: "var(--space-1)",
  };

  const sectionContentStyle: React.CSSProperties = {
    fontFamily: "var(--font-body)",
    fontSize: "0.95rem",
    color: "var(--color-text)",
    lineHeight: 1.7,
    margin: 0,
    whiteSpace: "pre-wrap",
  };

  return (
    <div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes pitDot {
          0%, 100% { opacity: 0.2; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.15); }
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
        .cook-nav-btn:hover {
          border-color: #C9973A;
          color: #C9973A;
        }
      `}</style>

      {/* ── TRACKER MODAL ── */}
      {showCompleteConfirm && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(10,8,6,0.85)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-4)",
        }}>
          <div style={{
            background: "var(--color-bg-alt)",
            border: "1px solid rgba(201,151,58,0.3)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-5)",
            maxWidth: "420px",
            width: "100%",
            textAlign: "center",
          }}>
            <h2 style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.5rem",
              color: "#F5E6C8",
              margin: "0 0 var(--space-2)",
            }}>
              How did this cook go?
            </h2>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.9rem",
              color: "var(--color-text-muted)",
              margin: "0 0 var(--space-4)",
              lineHeight: 1.6,
            }}>
              Track what actually happened to improve your next cook.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <button
                onClick={() => {
                  setShowCompleteConfirm(false);
                  window.location.href = `/cook/${cookId}/tracker`;
                }}
                style={{
                  background: "#C9973A",
                  border: "none",
                  color: "var(--color-bg)",
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.9rem",
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                  letterSpacing: "0.03em",
                }}
              >
                Track This Cook
              </button>
              <button
                onClick={() => {
                  setShowCompleteConfirm(false);
                  window.location.href = `/cook/${cookId}/summary`;
                }}
                style={{
                  background: "transparent",
                  border: "1px solid rgba(201,151,58,0.3)",
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.85rem",
                  padding: "10px",
                  borderRadius: "var(--radius-md)",
                  cursor: "pointer",
                }}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MISSION CARD ── */}
      <div style={{
        background: "var(--color-bg-alt)",
        borderBottom: "1px solid rgba(201,151,58,0.2)",
        padding: "var(--space-3) var(--space-4)",
      }}>
        {isEditing ? (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
              {(["Label", "Smoker", "Wood"] as const).map(field => {
                const val = field === "Label" ? editLabel : field === "Smoker" ? editSmokerType : editWoodType;
                const setter = field === "Label" ? setEditLabel : field === "Smoker" ? setEditSmokerType : setEditWoodType;
                return (
                  <div key={field}>
                    <label style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                      {field}
                    </label>
                    <input
                      type="text"
                      value={val}
                      onChange={e => setter(e.target.value)}
                      style={{ background: "var(--color-bg)", border: "1px solid rgba(201,151,58,0.3)", color: "var(--color-text)", fontFamily: "var(--font-body)", padding: "8px", borderRadius: "var(--radius-md)", width: "100%", boxSizing: "border-box", fontSize: "0.875rem" }}
                    />
                  </div>
                );
              })}
              <div>
                <label style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                  Eating Time
                </label>
                <input
                  type="datetime-local"
                  value={editEatTime}
                  onChange={e => setEditEatTime(e.target.value)}
                  style={{ background: "var(--color-bg)", border: "1px solid rgba(201,151,58,0.3)", color: "var(--color-text)", fontFamily: "var(--font-body)", padding: "8px", borderRadius: "var(--radius-md)", width: "100%", boxSizing: "border-box", fontSize: "0.875rem" }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "var(--space-2)" }}>
              <button
                onClick={handleEditSave}
                style={{ background: "#C9973A", color: "var(--color-bg)", border: "none", borderRadius: "var(--radius-md)", fontFamily: "var(--font-ui)", fontSize: "0.8rem", padding: "8px 16px", cursor: "pointer" }}
              >
                Save Changes
              </button>
              <button
                onClick={() => setIsEditing(false)}
                style={{ background: "transparent", border: "1px solid rgba(201,151,58,0.3)", color: "var(--color-text-muted)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-ui)", fontSize: "0.8rem", padding: "8px 16px", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ROW 1: Label + Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-3)" }}>
              <h1 style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.4rem, 3vw, 2rem)",
                color: "#F5E6C8",
                fontWeight: 900,
                margin: 0,
                lineHeight: 1.1,
              }}>
                {cook.label}
              </h1>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.75rem", flexShrink: 0, paddingTop: "4px", whiteSpace: "nowrap" }}>
                <button
                  onClick={() => {
                    setEditLabel(cook.label || "");
                    setEditSmokerType(cook.smoker_type || "");
                    setEditWoodType(cook.wood_type || "");
                    setEditEatTime(toDateTimeLocal(cook.eat_time));
                    setIsEditing(true);
                  }}
                  style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#C9973A", padding: 0 }}
                >✎ Edit</button>
                <span style={{ color: "var(--color-text-muted)" }}> · </span>
                <button
                  onClick={regeneratePlan}
                  disabled={planLoading}
                  style={{ background: "none", border: "none", cursor: planLoading ? "default" : "pointer", fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "var(--color-text-muted)", padding: 0, opacity: planLoading ? 0.5 : 1 }}
                >↺ New Plan</button>
                <span style={{ color: "var(--color-text-muted)" }}> · </span>
                <button
                  onClick={handleComplete}
                  style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "var(--color-text-muted)", padding: 0 }}
                >Complete →</button>
              </span>
            </div>

            {/* ROW 2: Eating time */}
            {cook.eat_time && (
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "var(--space-1) 0 0" }}>
                Eating {formatDateTime(cook.eat_time)}
              </p>
            )}

            {/* ROW 3: Smoker · Wood · Items */}
            {(() => {
              const smokerName = planTools[0]?.name || cook.smoker_type;
              const wood = planTools[0]?.wood || cook.wood_type;
              const items: { name: string; weight?: string | number | null }[] =
                planItemsList.length > 0 ? planItemsList : cookItems.map((i: any) => ({ name: i.name, weight: i.weight }));
              const parts: string[] = [];
              if (smokerName) parts.push(smokerName);
              if (wood) parts.push(wood);
              items.forEach(item => {
                parts.push(item.weight ? `${item.name} ${item.weight}lbs` : item.name);
              });
              return parts.length > 0 ? (
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "var(--space-1) 0 0" }}>
                  {parts.join(" · ")}
                </p>
              ) : null;
            })()}

            {/* ROW 4: Status · Style */}
            {(() => {
              const parts = [
                cook.status ? capitalize(cook.status) : "In Progress",
                cook.cooking_style ? capitalize(cook.cooking_style) : null,
              ].filter(Boolean) as string[];
              return (
                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "var(--space-1) 0 0" }}>
                  {parts.join(" · ")}
                </p>
              );
            })()}

            {saveSuccess && (
              <div style={{ marginTop: "var(--space-2)", fontFamily: "var(--font-ui)", fontSize: "0.8rem", color: "#C9973A" }}>
                Cook updated.
              </div>
            )}
          </>
        )}
      </div>

      {/* ── PLAN ── */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "var(--space-4) var(--space-4) 80px" }}>
        <div style={cardStyle}>
          <h2 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1.2rem",
            color: "#C9973A",
            margin: "0 0 var(--space-3)",
          }}>
            The Preacher&apos;s Plan
          </h2>

          {planLoading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)", padding: "var(--space-4) 0" }}>
              <img
                src="/logo.jpeg"
                style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(201,151,58,0.3)" }}
                alt=""
              />
              <div style={{ display: "flex", gap: "8px" }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "rgba(201,151,58,0.7)",
                    animation: "pitDot 1.2s ease-in-out infinite",
                    animationDelay: `${i * 0.3}s`,
                  }} />
                ))}
              </div>
              {loadingVerse && (
                <p style={{
                  fontFamily: "var(--font-body)",
                  fontStyle: "italic",
                  color: "var(--color-text-muted)",
                  fontSize: "0.85rem",
                  lineHeight: 1.7,
                  margin: 0,
                  textAlign: "center",
                }}>
                  &ldquo;{loadingVerse.text}&rdquo;
                </p>
              )}
            </div>
          ) : parsedSections ? (
            <div>
              {parsedSections.map(section => (
                <div key={section.header}>
                  <div style={{ ...sectionLabelStyle, marginTop: "var(--space-4)" }}>
                    {section.header}
                  </div>
                  {section.header === "THE PREACHER'S WORD" ? (
                    <div>
                      <p style={{
                        ...sectionContentStyle,
                        borderLeft: "3px solid #C9973A",
                        paddingLeft: "var(--space-3)",
                        fontStyle: "italic",
                        fontSize: "1rem",
                      }}>
                        {stripMarkdown(section.content)}
                      </p>
                      <p style={{
                        fontFamily: "var(--font-body)",
                        fontStyle: "italic",
                        color: "var(--color-text-muted)",
                        fontSize: "0.9rem",
                        margin: "var(--space-2) 0 0",
                        paddingLeft: "var(--space-3)",
                      }}>
                        When you are ready —{" "}
                        <Link
                          href={`/cook/${cookId}/live`}
                          style={{ color: "#C9973A", fontFamily: "var(--font-ui)", fontSize: "0.8rem", textDecoration: "none" }}
                        >
                          step into Live Mode →
                        </Link>
                      </p>
                    </div>
                  ) : (
                    <p style={sectionContentStyle}>{stripMarkdown(section.content)}</p>
                  )}
                </div>
              ))}
            </div>
          ) : planText ? (
            <p style={sectionContentStyle}>{planText}</p>
          ) : (
            <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)", fontSize: "0.9rem", margin: 0 }}>
              Plan could not be generated.
            </p>
          )}
        </div>
      </div>

      {/* ── STICKY BOTTOM BAR ── */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
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
          <Link key={link.href} href={link.href} className="cook-nav-btn">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
