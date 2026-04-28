"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Link from "next/link";

type PlanTool = { id: string; name: string; wood: string };
type PlanItem = {
  name: string;
  category: string;
  quantity: number;
  weight: string | number | null;
  notes: string;
  smokerId: string | null;
};

function getWoodProfile(wood: string): string {
  const w = (wood || "").toLowerCase().trim();
  if (w.includes("post oak")) return "Clean, medium smoke. The backbone of Texas BBQ.";
  if (w.includes("hickory") && w.includes("oak")) return "Best of both worlds. Bold flavor with clean finish.";
  if (w.includes("competition")) return "Engineered for bark and color. Trust the bag.";
  if (w.includes("hickory")) return "Strong and bold. Pairs with pork and beef. Easy to over-smoke.";
  if (w.includes("mesquite")) return "Intense and fast-burning. Use sparingly. West Texas tradition.";
  if (w.includes("apple")) return "Mild and sweet. Perfect for poultry and pork. Patient wood.";
  if (w.includes("cherry")) return "Fruity and rich. Beautiful color on the bark. Mixes well.";
  if (w.includes("pecan")) return "Nutty and mild. A Texas staple. Forgiving on long cooks.";
  if (w.includes("maple")) return "Subtle sweetness. Great for poultry and ham.";
  return "Know your wood. Every species burns different.";
}

function inferSmokerType(name: string, fallback = ""): string {
  const n = (name + " " + fallback).toLowerCase();
  if (
    n.includes("pellet") ||
    n.includes("traeger") ||
    n.includes("recteq") ||
    n.includes("camp chef") ||
    n.includes("pit boss")
  ) return "pellet";
  if (n.includes("kamado") || n.includes("big green egg") || n.includes("primo")) return "kamado";
  if (n.includes("offset")) return "offset";
  if (n.includes("drum") || n.includes("uds")) return "drum";
  if (n.includes("kettle")) return "kettle";
  return "other";
}

const FIRE_STEPS: Record<string, string[]> = {
  offset: [
    "Build a small hot fire in the firebox with kindling and one split",
    "Let it establish before adding your main cook wood",
    "Target 250°F in the cook chamber before loading meat",
    "Add one split every 45–60 minutes to maintain temperature",
    "Watch your exhaust — thin blue smoke is the goal",
    "Keep the intake vent 75% open, exhaust fully open",
  ],
  pellet: [
    "Fill the hopper completely before starting",
    "Run the startup cycle and let it reach set temperature",
    "Allow 15 minutes at temperature before loading meat",
    "Check hopper level every 3–4 hours on long cooks",
    "Keep the grill area clear for consistent airflow",
    "Trust the controller — resist the urge to constantly adjust",
  ],
  kamado: [
    "Light a small amount of lump charcoal in the center",
    "Open top and bottom vents fully until temperature rises",
    "Begin closing vents gradually as you approach target temp",
    "Final setting: bottom vent cracked 1/4 inch, top vent barely open",
    "Kamado holds heat extremely well — small vent adjustments only",
    "Add wood chunks (not chips) directly on the coals",
  ],
  drum: [
    "Fill the charcoal basket 3/4 full with lump or briquettes",
    "Light one corner using a chimney starter",
    "Install drum with all intakes open until temperature climbs",
    "Close intakes to about 1/4 open as you approach 250°F",
    "Add wood chunks on top of the lit coals",
    "Drum runs hot — watch your intakes carefully",
  ],
  kettle: [
    "Use the snake method for low and slow cooks",
    "Place unlit briquettes in a C shape around the outer edge",
    "Light 10–15 briquettes in a chimney and place at one end of the snake",
    "Add 3–4 wood chunks spaced along the snake",
    "Set up for indirect cooking with vents over the meat",
    "Top vent half open, bottom vent quarter open",
  ],
  other: [
    "Know your pit before you cook on it",
    "Establish your fire before loading any meat",
    "Target your cook temperature and stabilize for 20 minutes",
    "Thin blue smoke means clean combustion",
    "Add fuel before your temperature drops — not after",
  ],
};

const TROUBLE_CARDS = [
  {
    title: "Fire is running too hot",
    fix: "Close your intake vents in small increments. Do not close the exhaust. Give it 10 minutes before adjusting again. If you have a water pan, add cold water. Do not open the lid — you will feed the fire.",
  },
  {
    title: "Fire is running too cold",
    fix: "Open your intake vents wider. Check your fuel — you may need to add a split or stoke the coals. Make sure your exhaust is fully open. On a pellet grill, check the hopper and auger.",
  },
  {
    title: "Dirty smoke (thick white or gray)",
    fix: "Your wood is not combusting cleanly. Open the exhaust fully. Add more heat to get the wood burning properly. Do not load meat until you see thin blue smoke. Thick smoke will make your meat bitter.",
  },
  {
    title: "Temperature keeps spiking and dropping",
    fix: "You are chasing the temperature. Stop adjusting. Pick a vent position and hold it for 20 minutes. Pellet grill spikes usually mean a dirty firepot — check and clean between cooks.",
  },
];

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: "0.8rem",
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  display: "block",
  marginBottom: "var(--space-1)",
};

export default function FirePage({ params }: { params: { id: string } }) {
  const cookId = params.id;
  const supabase = createClient();

  const [cook, setCook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedToolId, setSelectedToolId] = useState<string>("");
  const [openCards, setOpenCards] = useState<Record<number, boolean>>({});
  const [fireQuestion, setFireQuestion] = useState("");
  const [preacherReply, setPreacherReply] = useState<string | null>(null);
  const [askLoading, setAskLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: cookData } = await supabase
        .from("cooks")
        .select("*")
        .eq("id", cookId)
        .single();

      setCook(cookData);

      const tools: PlanTool[] = (cookData?.plan as any)?.tools ?? [];
      if (tools.length > 0) setSelectedToolId(String(tools[0].id));

      setLoading(false);
    };
    load();
  }, [cookId]);

  const toggleCard = (idx: number) =>
    setOpenCards(prev => ({ ...prev, [idx]: !prev[idx] }));

  const handleAsk = async () => {
    if (!fireQuestion.trim()) return;
    setAskLoading(true);
    setPreacherReply(null);

    const planTools: PlanTool[] = (cook?.plan as any)?.tools ?? [];
    const planItems: PlanItem[] = (cook?.plan as any)?.items ?? [];

    try {
      const res = await fetch("/api/preacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cookId,
          message: `[Fire Management] ${fireQuestion}`,
          cookContext: {
            label: cook?.label ?? "",
            eat_time: cook?.eat_time ?? "",
            cooking_style: cook?.cooking_style ?? "",
            tools: planTools,
            planItems,
            recentEvents: [],
          },
        }),
      });
      const data = await res.json();
      setPreacherReply(data.reply ?? "The Preacher is silent. Try again.");
    } catch {
      setPreacherReply("Could not reach the Preacher. Check your connection.");
    }

    setFireQuestion("");
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

  const planTools: PlanTool[] = (cook?.plan as any)?.tools ?? [];
  const planItems: PlanItem[] = (cook?.plan as any)?.items ?? [];
  const hasMultipleSmokers = planTools.length > 1;

  const activeTool: PlanTool | null =
    planTools.find(t => String(t.id) === selectedToolId) ?? planTools[0] ?? null;

  const smokerName = activeTool?.name || cook.smoker_type || "Smoker";
  const woodType = activeTool?.wood || cook.wood_type || "";
  const smokerType = inferSmokerType(smokerName, cook.smoker_type || "");
  const fireSteps = FIRE_STEPS[smokerType] ?? FIRE_STEPS.other;
  const woodProfile = woodType ? getWoodProfile(woodType) : "";

  return (
    <div style={{ padding: "40px", maxWidth: "760px" }}>

      {/* ── HEADER ── */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <Link href={`/cook/${cookId}`}>
          <Button>← Back to Cook</Button>
        </Link>
      </div>

      <h1 style={{
        fontFamily: "var(--font-heading)",
        marginTop: 0,
        marginBottom: "var(--space-1)",
      }}>
        Fire Management
      </h1>
      <p style={{
        fontFamily: "var(--font-body)",
        color: "var(--color-text-muted)",
        marginTop: 0,
        marginBottom: "var(--space-4)",
      }}>
        {cook.label}
      </p>

      {/* ── SMOKER TABS ── */}
      {hasMultipleSmokers && (
        <div style={{
          display: "flex",
          gap: "var(--space-2)",
          flexWrap: "wrap",
          marginBottom: "var(--space-4)",
        }}>
          {planTools.map((tool, idx) => {
            const isActive = String(tool.id) === selectedToolId;
            return (
              <button
                key={tool.id}
                onClick={() => setSelectedToolId(String(tool.id))}
                style={{
                  background: isActive ? "var(--color-bg-alt)" : "transparent",
                  border: isActive
                    ? "1px solid var(--color-accent)"
                    : "1px solid var(--color-border, #444)",
                  borderRadius: "var(--radius-md)",
                  padding: "8px 16px",
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.85rem",
                  color: isActive ? "var(--color-accent)" : "var(--color-text-muted)",
                  fontWeight: isActive ? "bold" : "normal",
                  letterSpacing: "0.03em",
                  cursor: "pointer",
                }}
              >
                Smoker {idx + 1}{tool.name ? ` — ${tool.name}` : ""}
                {tool.wood ? ` · ${tool.wood}` : ""}
              </button>
            );
          })}
        </div>
      )}

      {/* ── SECTION 1: FIRE PROFILE ── */}
      <div style={{
        background: "var(--color-bg-alt)",
        padding: "var(--space-4)",
        borderRadius: "var(--radius-lg)",
        marginBottom: "var(--space-4)",
      }}>
        <h2 style={{
          fontFamily: "var(--font-heading)",
          marginTop: 0,
          marginBottom: "var(--space-3)",
        }}>
          Fire Profile
        </h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: woodType ? "1fr 1fr" : "1fr",
          gap: "var(--space-3)",
          marginBottom: woodProfile ? "var(--space-3)" : 0,
        }}>
          <div>
            <span style={labelStyle}>Smoker</span>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "1rem", margin: 0 }}>
              {smokerName}
              {smokerType !== "other" && (
                <span style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.75rem",
                  color: "var(--color-accent)",
                  marginLeft: "var(--space-2)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  {smokerType}
                </span>
              )}
            </p>
          </div>

          {woodType && (
            <div>
              <span style={labelStyle}>Wood</span>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "1rem", margin: 0 }}>
                {woodType}
              </p>
            </div>
          )}
        </div>

        {woodProfile && (
          <div style={{
            borderLeft: "3px solid var(--color-accent)",
            paddingLeft: "var(--space-3)",
          }}>
            <p style={{
              fontFamily: "var(--font-body)",
              fontStyle: "italic",
              fontSize: "0.95rem",
              color: "var(--color-text-muted)",
              margin: 0,
              lineHeight: 1.5,
            }}>
              {woodProfile}
            </p>
          </div>
        )}
      </div>

      {/* ── SECTION 2: FIRE SETUP GUIDE ── */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <h2 style={{
          fontFamily: "var(--font-heading)",
          marginTop: 0,
          marginBottom: "var(--space-3)",
        }}>
          How to Build This Fire
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {fireSteps.map((step, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "var(--space-3)",
                background: "var(--color-bg-alt)",
                padding: "var(--space-3)",
                borderRadius: "var(--radius-md)",
              }}
            >
              <span style={{
                fontFamily: "var(--font-ui)",
                fontSize: "1.1rem",
                fontWeight: "bold",
                color: "var(--color-accent)",
                flexShrink: 0,
                minWidth: "20px",
                lineHeight: 1.4,
              }}>
                {idx + 1}
              </span>
              <p style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.95rem",
                color: "var(--color-text)",
                margin: 0,
                lineHeight: 1.5,
              }}>
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 3: TEMPERATURE TROUBLE GUIDE ── */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <h2 style={{
          fontFamily: "var(--font-heading)",
          marginTop: 0,
          marginBottom: "var(--space-3)",
        }}>
          When Things Go Wrong
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {TROUBLE_CARDS.map((card, idx) => {
            const isOpen = !!openCards[idx];
            return (
              <div
                key={idx}
                style={{
                  background: "var(--color-bg-alt)",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => toggleCard(idx)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    background: "none",
                    border: "none",
                    padding: "var(--space-3)",
                    cursor: "pointer",
                    textAlign: "left" as const,
                  }}
                >
                  <span style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.95rem",
                    color: isOpen ? "var(--color-accent)" : "var(--color-text)",
                    letterSpacing: "0.02em",
                  }}>
                    {card.title}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: "1.3rem",
                    color: "var(--color-accent)",
                    lineHeight: 1,
                    marginLeft: "var(--space-3)",
                    flexShrink: 0,
                  }}>
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div style={{
                    padding: "0 var(--space-3) var(--space-3)",
                    borderTop: "1px solid var(--color-border, #333)",
                  }}>
                    <p style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.9rem",
                      color: "var(--color-text)",
                      margin: "var(--space-3) 0 0",
                      lineHeight: 1.7,
                    }}>
                      {card.fix}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 4: ASK THE PREACHER ABOUT FIRE ── */}
      <div style={{ marginBottom: "var(--space-5)" }}>
        <h2 style={{
          fontFamily: "var(--font-heading)",
          marginTop: 0,
          marginBottom: "var(--space-3)",
        }}>
          Ask the Preacher About Fire
        </h2>

        <div style={{
          background: "var(--color-bg-alt)",
          padding: "var(--space-4)",
          borderRadius: "var(--radius-lg)",
        }}>
          <Input
            value={fireQuestion}
            onChange={e => setFireQuestion(e.target.value)}
            placeholder="What's your fire doing?"
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter" && !askLoading) handleAsk();
            }}
          />
          <Button
            onClick={handleAsk}
            disabled={askLoading || !fireQuestion.trim()}
            style={{ marginTop: "var(--space-3)" }}
          >
            {askLoading ? "The Preacher is thinking..." : "Ask"}
          </Button>

          {preacherReply && (
            <div style={{
              marginTop: "var(--space-4)",
              padding: "var(--space-4)",
              background: "var(--color-bg)",
              borderRadius: "var(--radius-md)",
              borderLeft: "4px solid var(--color-accent)",
            }}>
              <p style={{
                fontFamily: "var(--font-body)",
                fontStyle: "italic",
                lineHeight: 1.7,
                color: "var(--color-text)",
                margin: 0,
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
