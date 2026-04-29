"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Link from "next/link";

type PlanItem = {
  name: string;
  category?: string;
  quantity?: number;
  weight?: string | number | null;
  notes?: string;
  smokerId?: string | null;
};

type DisplayItem = {
  key: string;
  name: string;
  category: "beef" | "pork" | "poultry" | "other";
  defaultWeight: string;
};

// ── DATA TABLES ─────────────────────────────────────────────────────────────

const STYLES = [
  { id: "texas",       label: "Texas BBQ" },
  { id: "kc",          label: "Kansas City" },
  { id: "memphis",     label: "Memphis" },
  { id: "carolina",    label: "Carolina" },
  { id: "backyard",    label: "Backyard Classic" },
  { id: "competition", label: "Competition Style" },
];

const RUB_PROFILES: Record<string, Record<string, string>> = {
  texas: {
    beef:    "Coarse black pepper and kosher salt. 50/50 by weight. Nothing else. This is the law.",
    pork:    "Salt, pepper, and a touch of garlic. Keep it simple and let the smoke work.",
    poultry: "Salt, pepper, garlic powder, onion powder. Light hand on the pepper.",
    other:   "Salt and pepper. Texas does not overcomplicate.",
  },
  kc: {
    beef:    "Brown sugar, paprika, salt, pepper, garlic, onion, cayenne. Sweet and bold.",
    pork:    "Heavy on the brown sugar and paprika. The sauce will finish the flavor story.",
    poultry: "Brown sugar, paprika, garlic, onion, a pinch of cayenne.",
    other:   "KC style welcomes sweetness. Brown sugar and paprika on almost anything.",
  },
  memphis: {
    beef:    "Paprika, salt, pepper, garlic, onion, celery salt, dry mustard.",
    pork:    "The classic Memphis dry rub: paprika, salt, pepper, garlic, onion, celery salt, brown sugar, dry mustard, cayenne.",
    poultry: "Paprika, garlic, onion, celery salt, a touch of cayenne.",
    other:   "Memphis leans on paprika and celery salt. Build from there.",
  },
  carolina: {
    beef:    "Simple salt and pepper with a touch of red pepper flake.",
    pork:    "Salt, pepper, red pepper flake, a little brown sugar. The vinegar sauce does the heavy lifting.",
    poultry: "Salt, pepper, garlic, paprika. Keep it light.",
    other:   "Salt, pepper, red pepper. Let the sauce tell the story.",
  },
  backyard: {
    beef:    "Salt, pepper, garlic powder, onion powder, smoked paprika. The all-purpose beef rub.",
    pork:    "Brown sugar, paprika, salt, pepper, garlic, onion, cayenne. Crowd pleaser every time.",
    poultry: "Butter under the skin. Salt, pepper, garlic powder, onion powder on top.",
    other:   "Season with confidence. Salt first, then build flavor.",
  },
  competition: {
    beef:    "Salt, pepper, garlic. Clean and precise. Let the technique win the box.",
    pork:    "Brown sugar base, paprika, salt, pepper, garlic, onion, a hint of cayenne. Built for the judges.",
    poultry: "Butter injection, then salt, pepper, garlic, onion, a touch of brown sugar for color.",
    other:   "Every detail matters. Season evenly and let it set.",
  },
};

const BINDERS: Record<string, string> = {
  beef:    "Yellow mustard or olive oil. Mustard burns off clean.",
  pork:    "Yellow mustard or hot sauce. Hot sauce adds a subtle layer.",
  poultry: "Olive oil or melted butter. Butter adds richness.",
  other:   "Olive oil works on everything.",
};

const SALT_RATIOS: Record<string, number> = {
  beef:    0.0075,
  pork:    0.005,
  poultry: 0.004,
  other:   0.005,
};

const SALT_RATIO_LABEL: Record<string, string> = {
  beef:    "0.75% of meat weight",
  pork:    "0.5% of meat weight",
  poultry: "0.4% of meat weight",
  other:   "0.5% of meat weight",
};

const TIMING_STEPS = [
  "Apply binder 30 minutes before seasoning",
  "Season the night before for deep bark penetration",
  "Or season 1 hour before if cooking same day",
  "Let the rub sweat in — do not wrap immediately after seasoning",
];

// ── HELPERS ──────────────────────────────────────────────────────────────────

function inferStyleId(cookingStyle: string): string {
  const s = (cookingStyle || "").toLowerCase();
  if (s.includes("texas"))       return "texas";
  if (s.includes("kansas") || s.includes(" kc")) return "kc";
  if (s.includes("memphis"))     return "memphis";
  if (s.includes("carolina"))    return "carolina";
  if (s.includes("competition")) return "competition";
  if (s.includes("backyard"))    return "backyard";
  return "texas";
}

function inferCategory(name: string, category?: string): "beef" | "pork" | "poultry" | "other" {
  const c = (category || "").toLowerCase();
  if (c === "beef"    || c.startsWith("beef"))    return "beef";
  if (c === "pork"    || c.startsWith("pork"))    return "pork";
  if (c === "poultry" || c.startsWith("poultry") ||
      c.includes("chicken") || c.includes("turkey")) return "poultry";

  const n = name.toLowerCase();
  if (/\b(brisket|beef|ribeye|chuck|prime rib|short rib|tri.?tip|wagyu|sirloin|flank|skirt)\b/.test(n)) return "beef";
  if (/\b(pork|butt|shoulder|spare rib|baby back|belly|ham|bacon|sausage|\brib\b)\b/.test(n)) return "pork";
  if (/\b(chicken|turkey|duck|quail|wing|breast|thigh|drumstick|cornish)\b/.test(n)) return "poultry";
  return "other";
}

function buildDisplayItems(planItems: PlanItem[], cookItems: any[]): DisplayItem[] {
  if (planItems.length > 0) {
    return planItems.map((item, idx) => ({
      key:           `${item.name}-${idx}`,
      name:          item.name,
      category:      inferCategory(item.name, item.category),
      defaultWeight: item.weight != null ? String(item.weight) : "",
    }));
  }
  return cookItems.map((item: any, idx: number) => ({
    key:           `${item.name}-${idx}`,
    name:          item.name,
    category:      inferCategory(item.name),
    defaultWeight: "",
  }));
}

// ── SHARED STYLES ─────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontFamily:    "var(--font-ui)",
  fontSize:      "0.78rem",
  color:         "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  display:       "block",
  marginBottom:  "var(--space-1)",
};

const sectionH2: React.CSSProperties = {
  fontFamily:    "var(--font-heading)",
  marginTop:     0,
  marginBottom:  "var(--space-3)",
};

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function RubsPage({ params }: { params: { id: string } }) {
  const cookId = params.id;
  const supabase = createClient();

  const [cook, setCook]           = useState<any>(null);
  const [cookItems, setCookItems] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selectedStyle, setSelectedStyle] = useState<string>("texas");
  const [weightInputs, setWeightInputs]   = useState<Record<string, string>>({});
  const [seasonQuestion, setSeasonQuestion] = useState("");
  const [preacherReply, setPreacherReply]   = useState<string | null>(null);
  const [askLoading, setAskLoading]         = useState(false);

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

      setCook(cookData);
      setCookItems(itemsData || []);

      if (cookData?.cooking_style) {
        setSelectedStyle(inferStyleId(cookData.cooking_style));
      }

      setLoading(false);
    };
    load();
  }, [cookId]);

  const handleAsk = async () => {
    if (!seasonQuestion.trim()) return;
    setAskLoading(true);
    setPreacherReply(null);

    const planTools = (cook?.plan as any)?.tools ?? [];
    const planItems = (cook?.plan as any)?.items ?? [];

    try {
      const res = await fetch("/api/preacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cookId,
          message: `[Seasoning & Rubs] ${seasonQuestion}`,
          cookContext: {
            label:          cook?.label ?? "",
            eat_time:       cook?.eat_time ?? "",
            cooking_style:  cook?.cooking_style ?? "",
            tools:          planTools,
            planItems,
            recentEvents:   [],
          },
        }),
      });
      const data = await res.json();
      setPreacherReply(data.reply ?? "The Preacher is silent. Try again.");
    } catch {
      setPreacherReply("Could not reach the Preacher. Check your connection.");
    }

    setSeasonQuestion("");
    setAskLoading(false);
  };

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

  const planItems: PlanItem[] = (cook?.plan as any)?.items ?? [];
  const planTools             = (cook?.plan as any)?.tools ?? [];
  const displayItems          = buildDisplayItems(planItems, cookItems);

  return (
    <div style={{ padding: "40px", maxWidth: "760px" }}>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <Link href={`/cook/${cookId}`}>
          <Button>← Back to Cook</Button>
        </Link>
      </div>

      <h1 style={{ fontFamily: "var(--font-heading)", marginTop: 0, marginBottom: "var(--space-1)" }}>
        Seasoning &amp; Rubs
      </h1>
      <p style={{
        fontFamily:   "var(--font-body)",
        color:        "var(--color-text-muted)",
        marginTop:    0,
        marginBottom: "var(--space-4)",
      }}>
        {cook.label}
      </p>

      {/* ── SECTION 1: REGIONAL PROFILE SELECTOR ── */}
      <div style={{ marginBottom: "var(--space-5)" }}>
        <h2 style={sectionH2}>Start With a Style</h2>

        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap:                 "var(--space-2)",
        }}>
          {STYLES.map(style => {
            const active = selectedStyle === style.id;
            return (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                style={{
                  background:   active ? "var(--color-bg-alt)" : "transparent",
                  border:       active
                    ? "1px solid var(--color-accent)"
                    : "1px solid var(--color-border, #444)",
                  borderRadius: "var(--radius-md)",
                  padding:      "12px var(--space-3)",
                  fontFamily:   "var(--font-ui)",
                  fontSize:     "0.85rem",
                  color:        active ? "var(--color-accent)" : "var(--color-text-muted)",
                  fontWeight:   active ? "bold" : "normal",
                  letterSpacing:"0.03em",
                  cursor:       "pointer",
                  textAlign:    "center" as const,
                  transition:   "border-color 0.15s, color 0.15s",
                }}
              >
                {style.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 2: RUB RECOMMENDATIONS ── */}
      <div style={{ marginBottom: "var(--space-5)" }}>
        <h2 style={sectionH2}>Rubs for Your Cook</h2>

        {displayItems.length === 0 ? (
          <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
            No items found for this cook.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {displayItems.map(item => {
              const profile    = RUB_PROFILES[selectedStyle]?.[item.category] ?? RUB_PROFILES["texas"]?.["other"] ?? "";
              const binder     = BINDERS[item.category] ?? "";
              const ratio      = SALT_RATIOS[item.category] ?? 0.005;
              const ratioLabel = SALT_RATIO_LABEL[item.category] ?? "";

              const rawWeight  = weightInputs[item.key] ?? item.defaultWeight;
              const weightNum  = parseFloat(rawWeight);
              const saltOz     = !isNaN(weightNum) && weightNum > 0
                ? (weightNum * ratio * 16).toFixed(2)
                : null;

              return (
                <div
                  key={item.key}
                  style={{
                    background:   "var(--color-bg-alt)",
                    borderRadius: "var(--radius-lg)",
                    padding:      "var(--space-4)",
                  }}
                >
                  {/* Item header */}
                  <div style={{
                    display:       "flex",
                    alignItems:    "center",
                    gap:           "var(--space-2)",
                    marginBottom:  "var(--space-3)",
                  }}>
                    <h3 style={{
                      fontFamily: "var(--font-heading)",
                      fontSize:   "1.1rem",
                      margin:     0,
                    }}>
                      {item.name}
                    </h3>
                    <span style={{
                      fontFamily:    "var(--font-ui)",
                      fontSize:      "0.7rem",
                      color:         "var(--color-bg)",
                      background:    "var(--color-accent)",
                      padding:       "2px 8px",
                      borderRadius:  "var(--radius-sm)",
                      textTransform: "uppercase" as const,
                      letterSpacing: "0.05em",
                    }}>
                      {item.category}
                    </span>
                  </div>

                  {/* Rub recommendation */}
                  <div style={{ marginBottom: "var(--space-3)" }}>
                    <span style={labelStyle}>Rub</span>
                    <p style={{
                      fontFamily: "var(--font-body)",
                      fontSize:   "0.95rem",
                      color:      "var(--color-text)",
                      margin:     0,
                      lineHeight: 1.5,
                    }}>
                      {profile}
                    </p>
                  </div>

                  {/* Binder */}
                  <div style={{ marginBottom: "var(--space-3)" }}>
                    <span style={labelStyle}>Binder</span>
                    <p style={{
                      fontFamily: "var(--font-body)",
                      fontSize:   "0.9rem",
                      color:      "var(--color-text-muted)",
                      margin:     0,
                      lineHeight: 1.5,
                    }}>
                      {binder}
                    </p>
                  </div>

                  {/* Salt ratio + weight input */}
                  <div style={{
                    display:       "flex",
                    alignItems:    "flex-end",
                    gap:           "var(--space-3)",
                    flexWrap:      "wrap",
                    paddingTop:    "var(--space-3)",
                    borderTop:     "1px solid var(--color-border, #333)",
                  }}>
                    <div style={{ flex: "1 1 160px" }}>
                      <span style={labelStyle}>Salt Ratio</span>
                      <p style={{
                        fontFamily: "var(--font-ui)",
                        fontSize:   "0.9rem",
                        color:      "var(--color-accent)",
                        margin:     0,
                        fontWeight: "bold",
                      }}>
                        {ratioLabel}
                      </p>
                    </div>

                    <div style={{ flex: "1 1 160px" }}>
                      <span style={labelStyle}>Weight (lbs)</span>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={rawWeight}
                        onChange={e =>
                          setWeightInputs(prev => ({ ...prev, [item.key]: e.target.value }))
                        }
                        placeholder="e.g. 14"
                        style={{
                          width:        "100%",
                          padding:      "8px 12px",
                          background:   "var(--color-bg)",
                          border:       "1px solid var(--color-border, #444)",
                          borderRadius: "var(--radius-md)",
                          color:        "var(--color-text)",
                          fontFamily:   "var(--font-body)",
                          fontSize:     "0.95rem",
                          boxSizing:    "border-box" as const,
                        }}
                      />
                    </div>

                    {saltOz && (
                      <div style={{ flex: "1 1 100%", marginTop: "var(--space-1)" }}>
                        <p style={{
                          fontFamily: "var(--font-body)",
                          fontSize:   "0.9rem",
                          color:      "var(--color-text)",
                          margin:     0,
                        }}>
                          Use{" "}
                          <strong style={{ color: "var(--color-accent)", fontFamily: "var(--font-ui)" }}>
                            {saltOz} oz
                          </strong>{" "}
                          of salt for this cook
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── SECTION 3: BINDER TIMING GUIDE ── */}
      <div style={{ marginBottom: "var(--space-5)" }}>
        <h2 style={sectionH2}>When to Season</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {TIMING_STEPS.map((step, idx) => (
            <div
              key={idx}
              style={{
                display:      "flex",
                alignItems:   "flex-start",
                gap:          "var(--space-3)",
                background:   "var(--color-bg-alt)",
                padding:      "var(--space-3)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <span style={{
                fontFamily: "var(--font-ui)",
                fontSize:   "1.1rem",
                fontWeight: "bold",
                color:      "var(--color-accent)",
                flexShrink: 0,
                minWidth:   "20px",
                lineHeight: 1.4,
              }}>
                {idx + 1}
              </span>
              <p style={{
                fontFamily: "var(--font-body)",
                fontSize:   "0.95rem",
                color:      "var(--color-text)",
                margin:     0,
                lineHeight: 1.5,
              }}>
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 4: ASK THE PREACHER ABOUT SEASONING ── */}
      <div style={{ marginBottom: "var(--space-5)" }}>
        <h2 style={sectionH2}>Ask the Preacher About Seasoning</h2>

        <div style={{
          background:   "var(--color-bg-alt)",
          padding:      "var(--space-4)",
          borderRadius: "var(--radius-lg)",
        }}>
          <Input
            value={seasonQuestion}
            onChange={e => setSeasonQuestion(e.target.value)}
            placeholder="Ask about rubs, seasoning, or flavor..."
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter" && !askLoading) handleAsk();
            }}
          />
          <Button
            onClick={handleAsk}
            disabled={askLoading || !seasonQuestion.trim()}
            style={{ marginTop: "var(--space-3)" }}
          >
            {askLoading ? "The Preacher is thinking..." : "Ask"}
          </Button>

          {preacherReply && (
            <div style={{
              marginTop:    "var(--space-4)",
              padding:      "var(--space-4)",
              background:   "var(--color-bg)",
              borderRadius: "var(--radius-md)",
              borderLeft:   "4px solid var(--color-accent)",
            }}>
              <p style={{
                fontFamily: "var(--font-body)",
                fontStyle:  "italic",
                lineHeight: 1.7,
                color:      "var(--color-text)",
                margin:     0,
              }}>
                {preacherReply}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── GO LIVE ── */}
      <Link href={`/cook/${cookId}/live`}>
        <Button>Go Live →</Button>
      </Link>
    </div>
  );
}
