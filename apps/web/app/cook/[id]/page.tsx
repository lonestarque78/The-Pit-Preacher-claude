"use client";

import { use, useEffect, useState } from "react";
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
    if (SECTION_HEADERS.includes(trimmed)) {
      if (currentHeader) {
        sections.push({ header: currentHeader, content: currentLines.join("\n").trim() });
      }
      currentHeader = trimmed;
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

    try {
      const res = await fetch("/api/preacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cookId: cookData.id,
          message: "Generate a full cook plan for this cook.",
          cookContext: {
            label: cookData.label,
            eat_time: cookData.eat_time,
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
    await supabase.from("cooks").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", cook.id);
    window.location.href = `/cook/${cookId}/summary`;
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

  const NAV_LINKS = [
    { label: "Live Mode", href: `/cook/${cookId}/live` },
    { label: "Timeline",  href: `/cook/${cookId}/timeline` },
    { label: "Guide",     href: `/cook/${cookId}/guide` },
    { label: "Events",    href: `/cook/${cookId}/events` },
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
    letterSpacing: "0.1em",
    marginBottom: "var(--space-2)",
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
        @media (max-width: 767px) {
          .cook-grid { grid-template-columns: 1fr !important; }
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
            fontFamily: "var(--font-ui)",
            fontSize: "0.78rem",
            padding: "3px 10px",
            borderRadius: "var(--radius-md)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            background: statusIsCompleted ? "rgba(45,106,79,0.2)" : "rgba(201,151,58,0.2)",
            color: statusIsCompleted ? "#2D6A4F" : "#C9973A",
          }}>
            {cook.status ? capitalize(cook.status) : "In Progress"}
          </span>

          {cook.cooking_style && (
            <span style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.78rem",
              padding: "3px 10px",
              borderRadius: "var(--radius-md)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              background: "rgba(201,151,58,0.12)",
              color: "var(--color-text-muted)",
            }}>
              {capitalize(cook.cooking_style)}
            </span>
          )}

          {hasFlavorData && (
            <span style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.78rem",
              padding: "3px 10px",
              borderRadius: "var(--radius-md)",
              background: "rgba(201,151,58,0.08)",
              color: "var(--color-text-muted)",
            }}>
              Smoke {flavorSmoke ?? "—"} · Bark {flavorBark ?? "—"} · Tenderness {flavorTenderness ?? "—"}
            </span>
          )}
        </div>
      </div>

      {/* ── TWO-COLUMN GRID ── */}
      <div
        className="cook-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "3fr 2fr",
          gap: "var(--space-4)",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "var(--space-4) var(--space-4) 80px var(--space-4)",
        }}
      >
        {/* LEFT — The Preacher's Plan */}
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
            <div>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
                {[85, 100, 70, 92, 60].map((w, i) => (
                  <div key={i} style={{
                    width: `${w}%`,
                    height: "16px",
                    background: "rgba(201,151,58,0.1)",
                    borderRadius: "4px",
                    animation: "pulse 1.5s ease-in-out infinite",
                    animationDelay: `${i * 0.15}s`,
                  }} />
                ))}
              </div>
              {loadingVerse && (
                <p style={{
                  fontFamily: "var(--font-body)",
                  fontStyle: "italic",
                  color: "var(--color-text-muted)",
                  fontSize: "0.9rem",
                  lineHeight: 1.7,
                  margin: 0,
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
                    <p style={{
                      ...sectionContentStyle,
                      borderLeft: "3px solid #C9973A",
                      paddingLeft: "var(--space-3)",
                      fontStyle: "italic",
                      fontSize: "1rem",
                    }}>
                      {section.content}
                    </p>
                  ) : (
                    <p style={sectionContentStyle}>{section.content}</p>
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

        {/* RIGHT — Cook Details */}
        <div style={cardStyle}>

          {/* Pit Breakdown */}
          <div style={{ ...sectionLabelStyle, marginTop: 0 }}>Pit Breakdown</div>

          {planTools.length > 0 ? (
            <div style={{ marginBottom: "var(--space-4)" }}>
              {planTools.map((tool, idx) => {
                const assigned = planItemsList.filter(
                  i => i.smokerId != null && String(i.smokerId) === String(tool.id)
                );
                return (
                  <div key={tool.id} style={{ marginBottom: idx < planTools.length - 1 ? "var(--space-3)" : 0 }}>
                    <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, color: "var(--color-text)", marginBottom: "2px" }}>
                      {tool.name || `Smoker ${idx + 1}`}
                    </div>
                    {tool.wood && (
                      <div style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "var(--space-1)" }}>
                        {tool.wood}
                      </div>
                    )}
                    {assigned.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: "var(--space-3)", fontFamily: "var(--font-body)", fontSize: "0.875rem", lineHeight: 1.7 }}>
                        {assigned.map(item => (
                          <li key={item.name}>
                            {item.name}{item.weight ? ` · ${item.weight} lbs` : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ marginBottom: "var(--space-4)" }}>
              {(cook.smoker_type || cook.wood_type) && (
                <>
                  {cook.smoker_type && (
                    <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, color: "var(--color-text)", marginBottom: "2px" }}>
                      {cook.smoker_type}
                    </div>
                  )}
                  {cook.wood_type && (
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: "var(--space-1)" }}>
                      {cook.wood_type}
                    </div>
                  )}
                </>
              )}
              {cookItems.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: "var(--space-3)", fontFamily: "var(--font-body)", fontSize: "0.875rem", lineHeight: 1.7 }}>
                  {cookItems.map((item: any) => <li key={item.id}>{item.name}</li>)}
                </ul>
              )}
            </div>
          )}

          {/* Cook Details */}
          <div style={{ ...sectionLabelStyle, marginTop: "var(--space-4)" }}>Cook Details</div>

          {isEditing ? (
            <div style={{ marginBottom: "var(--space-3)" }}>
              {(["Label", "Smoker", "Wood"] as const).map(field => {
                const val = field === "Label" ? editLabel : field === "Smoker" ? editSmokerType : editWoodType;
                const setter = field === "Label" ? setEditLabel : field === "Smoker" ? setEditSmokerType : setEditWoodType;
                return (
                  <div key={field} style={{ marginBottom: "var(--space-2)" }}>
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
              <div style={{ marginBottom: "var(--space-3)" }}>
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
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <button
                  onClick={handleEditSave}
                  style={{ flex: 1, background: "#C9973A", color: "var(--color-bg)", border: "none", borderRadius: "var(--radius-md)", fontFamily: "var(--font-ui)", fontSize: "0.8rem", padding: "8px", cursor: "pointer" }}
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{ flex: 1, background: "transparent", border: "1px solid rgba(201,151,58,0.3)", color: "var(--color-text-muted)", borderRadius: "var(--radius-md)", fontFamily: "var(--font-ui)", fontSize: "0.8rem", padding: "8px", cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", lineHeight: 2, marginBottom: "var(--space-1)" }}>
              <div>
                <span style={{ color: "var(--color-text-muted)" }}>Status</span>
                {" · "}
                {cook.status ? capitalize(cook.status) : "—"}
              </div>
              {cook.eat_time && (
                <div>
                  <span style={{ color: "var(--color-text-muted)" }}>Eating</span>
                  {" · "}
                  {formatDateTime(cook.eat_time)}
                </div>
              )}
              {cook.cooking_style && (
                <div>
                  <span style={{ color: "var(--color-text-muted)" }}>Style</span>
                  {" · "}
                  {capitalize(cook.cooking_style)}
                </div>
              )}
              {cook.created_at && (
                <div>
                  <span style={{ color: "var(--color-text-muted)" }}>Created</span>
                  {" · "}
                  {formatDateTime(cook.created_at)}
                </div>
              )}
            </div>
          )}

          {!isEditing && (
            <div style={{ marginBottom: "var(--space-3)" }}>
              <button
                onClick={() => {
                  setEditLabel(cook.label || "");
                  setEditSmokerType(cook.smoker_type || "");
                  setEditWoodType(cook.wood_type || "");
                  setEditEatTime(toDateTimeLocal(cook.eat_time));
                  setIsEditing(true);
                }}
                style={{ background: "transparent", border: "none", color: "#C9973A", fontFamily: "var(--font-ui)", fontSize: "0.8rem", cursor: "pointer", padding: 0 }}
              >
                ✎ Edit Cook Details
              </button>
              {saveSuccess && (
                <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.8rem", color: "#C9973A", marginLeft: "var(--space-3)" }}>
                  Cook updated.
                </span>
              )}
            </div>
          )}

          {/* Regenerate */}
          {planText && !planLoading && userTier !== "free" && (
            <div style={{ borderTop: "1px solid rgba(201,151,58,0.1)", paddingTop: "var(--space-3)" }}>
              <button
                onClick={regeneratePlan}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                ↺ Generate New Plan
              </button>
            </div>
          )}

          {/* Complete This Cook */}
          {cook.status === "in_progress" && (
            <div style={{ borderTop: "1px solid rgba(201,151,58,0.15)", marginTop: "var(--space-3)", paddingTop: "var(--space-3)" }}>
              {!showCompleteConfirm ? (
                <button
                  onClick={() => setShowCompleteConfirm(true)}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "1px solid rgba(201,151,58,0.4)",
                    color: "#C9973A",
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.85rem",
                    padding: "8px 16px",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                  }}
                >
                  Complete This Cook →
                </button>
              ) : (
                <div>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-muted)", margin: "0 0 var(--space-2)" }}>
                    Mark this cook as complete and write your summary?
                  </p>
                  <div style={{ display: "flex", gap: "var(--space-2)" }}>
                    <button
                      onClick={handleComplete}
                      style={{
                        flex: 1,
                        background: "#C9973A",
                        color: "var(--color-bg)",
                        border: "none",
                        borderRadius: "var(--radius-md)",
                        fontFamily: "var(--font-ui)",
                        fontSize: "0.8rem",
                        padding: "8px",
                        cursor: "pointer",
                      }}
                    >
                      Yes, complete it
                    </button>
                    <button
                      onClick={() => setShowCompleteConfirm(false)}
                      style={{
                        flex: 1,
                        background: "transparent",
                        border: "1px solid rgba(201,151,58,0.3)",
                        color: "var(--color-text-muted)",
                        borderRadius: "var(--radius-md)",
                        fontFamily: "var(--font-ui)",
                        fontSize: "0.8rem",
                        padding: "8px",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
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
