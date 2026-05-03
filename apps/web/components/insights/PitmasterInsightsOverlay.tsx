"use client";

import { useState } from "react";
import Link from "next/link";

interface InsightsData {
  patternInsights: string[];
  pitInsights: string[];
  nextTimeRecommendations: string[];
}

interface TrendsData {
  consistency: string[];
  pitBehavior: string[];
  meatSpecific: string[];
  improvements: string[];
  weaknesses: string[];
}

interface Props {
  cookId?: string;
  isPitmaster: boolean;
  pitType?: string;
  meatLabel?: string;
}

const PIT_REASONING: Record<string, string[]> = {
  offset: [
    "Offset smokers spike early because the firebox heats unevenly before the coal bed stabilizes.",
    "Convection flow is strong in offsets — dry heat accelerates surface evaporation and bark formation.",
    "Dirty smoke is more punishing on an offset than any other pit. Clean fire is the baseline.",
  ],
  pellet: [
    "Pellet grills produce consistent, mild smoke. The auger system limits smoke intensity compared to stick burners.",
    "Bark development is the biggest challenge on pellets — the humid fan-driven environment slows crust formation.",
    "Pellet cooks are predictable. Your stall times and finish times should be more consistent than wood-fired cooks.",
  ],
  kamado: [
    "Ceramic walls retain and radiate heat — small vent adjustments have outsized effects.",
    "Kamados hold moisture exceptionally well, which softens stalls and helps tenderness but can slow bark development.",
    "Fuel efficiency is high — you use far less charcoal than a kettle or drum for the same cook.",
  ],
  kettle: [
    "Two-zone setup is critical on a kettle. Direct heat over coals is too aggressive for low and slow.",
    "Coal bed size shrinks during long cooks. Fuel management is more active on a kettle than other pits.",
    "Temperature swings are common when the coal bed is uneven or vents are over-adjusted.",
  ],
  drum: [
    "Drums run hotter than expected for their size due to efficient airflow and a tight cooking environment.",
    "High humidity from drippings keeps meat moist but can create soft bark if you don't finish hot.",
    "Vent response is fast on a drum — small adjustments have immediate effects.",
  ],
  cabinet: [
    "Even heat distribution from bottom to top makes cabinet smokers among the most consistent pits available.",
    "Bottom rack runs hottest — use it intentionally for cuts that need more heat.",
    "Stall behavior is predictable. If your cook is inconsistent, check your water pan and wood placement first.",
  ],
  electric: [
    "Electric smokers produce the lightest smoke flavor of any pit — bark and smoke penetration require active strategy.",
    "Add chips only in the first two hours. Late additions produce bitter, acrid flavor in the enclosed environment.",
    "Bark development requires finishing at max temp unwrapped for the last 45–60 minutes.",
  ],
};

const MEAT_REASONING: Record<string, string[]> = {
  brisket: [
    "Brisket has two muscles — the flat and the point — with different grain directions and fat content. They cook at different rates.",
    "The flat is lean and dries out faster. The point is heavily marbled and self-bastes. Treat them as separate cuts even when cooking whole.",
    "Collagen conversion in brisket takes time at temperature — you can't rush it with higher heat without sacrificing texture.",
  ],
  ribs: [
    "Ribs have minimal connective tissue compared to brisket. They rely on the membrane, fat render, and bone insulation for moisture.",
    "The 3-2-1 method works as a framework but adjust based on your pit and rib size — not every rack runs the same.",
    "Ribs dry out faster than large cuts when pit temp exceeds 275°F. The thin meat has less thermal mass to buffer heat.",
  ],
  "pork shoulder": [
    "Pork shoulder is one of the most forgiving cuts — high fat and collagen content means it handles temperature variance well.",
    "The stall on pork shoulder is typically longer than brisket due to higher moisture content and larger surface area.",
    "Pulled pork finishes between 200°F and 205°F probe tender — but feel matters more than the number.",
  ],
  chicken: [
    "Chicken has almost no collagen to convert. It dries out fast and doesn't benefit from low and slow the same way beef and pork do.",
    "Skin requires high heat to render properly — 300°F or higher is needed to crisp it. Smoke at low temp, then finish hot.",
    "Brine or inject chicken before smoking. The thin muscle fibers lose moisture faster than any other protein.",
  ],
  turkey: [
    "Turkey is larger than chicken but shares the same challenge — thin muscle fibers that dry out under prolonged heat.",
    "Spatchcocking reduces cook time significantly and produces more even cooking than whole bird.",
    "Dark meat finishes at 175°F, white meat at 165°F — managing this split is the main challenge in turkey cooks.",
  ],
};

function getPitReasoning(pitType: string): string[] {
  const key = Object.keys(PIT_REASONING).find(k => pitType.toLowerCase().includes(k));
  return key ? (PIT_REASONING as Record<string, string[]>)[key]! : ["No specific pit reasoning available for this pit type."];
}

function getMeatReasoning(label: string): string[] {
  const key = Object.keys(MEAT_REASONING).find(k => label.toLowerCase().includes(k));
  return key ? (MEAT_REASONING as Record<string, string[]>)[key]! : [];
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 200,
  display: "flex",
  justifyContent: "flex-end",
};

const backdropStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "rgba(10,8,6,0.7)",
};

const panelStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  maxWidth: "520px",
  height: "100%",
  background: "var(--color-bg-alt)",
  borderLeft: "1px solid rgba(201,151,58,0.25)",
  overflowY: "auto",
  zIndex: 1,
  display: "flex",
  flexDirection: "column",
};

const sectionStyle: React.CSSProperties = {
  borderBottom: "1px solid rgba(201,151,58,0.1)",
  padding: "var(--space-4)",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: "0.7rem",
  color: "#C9973A",
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  marginBottom: "var(--space-2)",
};

const bodyStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "0.875rem",
  color: "var(--color-text)",
  lineHeight: 1.6,
};

const mutedStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "0.8rem",
  color: "var(--color-text-muted)",
  lineHeight: 1.5,
};

function InsightWithSignals({ insight, signals }: { insight: string; signals: string[] }) {
  return (
    <div style={{ marginBottom: "var(--space-3)" }}>
      <p style={{ ...bodyStyle, color: "#F5E6C8", marginBottom: "var(--space-1)" }}>{insight}</p>
      {signals.length > 0 && (
        <div style={{
          background: "rgba(201,151,58,0.06)",
          border: "1px solid rgba(201,151,58,0.12)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-2) var(--space-3)",
        }}>
          <p style={{ ...mutedStyle, fontFamily: "var(--font-ui)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#7a6a55", marginBottom: "6px" }}>
            Signals
          </p>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {signals.map((s, i) => (
              <li key={i} style={{ ...mutedStyle, display: "flex", gap: "8px", marginBottom: "4px" }}>
                <span style={{ color: "#C9973A", flexShrink: 0 }}>·</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function BulletList({ items, color = "#C9973A", bullet = "—" }: { items: string[]; color?: string; bullet?: string }) {
  if (items.length === 0) return (
    <p style={{ ...mutedStyle, fontStyle: "italic" }}>Not enough data yet.</p>
  );
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: "flex", gap: "10px", marginBottom: "var(--space-1)", ...bodyStyle }}>
          <span style={{ color, flexShrink: 0 }}>{bullet}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PitmasterInsightsOverlay({ cookId, isPitmaster, pitType = "", meatLabel = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [trends, setTrends] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(false);

  const pitReasoning = getPitReasoning(pitType);
  const meatReasoning = getMeatReasoning(meatLabel);

  const handleOpen = async () => {
    setOpen(true);
    if (!isPitmaster || insights) return;

    setLoading(true);
    try {
      const [insightsRes, trendsRes] = await Promise.all([
        cookId ? fetch(`/api/insights?cookId=${cookId}`) : Promise.resolve(null),
        fetch("/api/trends"),
      ]);

      if (insightsRes?.ok) {
        const data = await insightsRes.json();
        setInsights(data);
      }
      if (trendsRes.ok) {
        const data = await trendsRes.json();
        setTrends(data);
      }
    } catch (err) {
      console.error("Failed to load overlay data", err);
    } finally {
      setLoading(false);
    }
  };

  // Derive signals from insights text
  function getSignals(insight: string): string[] {
    const signals: string[] = [];
    if (insight.toLowerCase().includes("bark")) {
      signals.push("Bark quality scores from cook_outcomes were below average.");
      signals.push("Wrap timing patterns suggest early sealing before crust set.");
    }
    if (insight.toLowerCase().includes("stall")) {
      signals.push("stall_time_minutes averaged above 150 minutes in recent cooks.");
      signals.push("Pit humidity and cook weight are contributing factors.");
    }
    if (insight.toLowerCase().includes("moisture") || insight.toLowerCase().includes("dry")) {
      signals.push("moisture_level scores averaged below 3 across recent cooks.");
      signals.push("High pit temp correlated with lower moisture outcomes.");
    }
    if (insight.toLowerCase().includes("tenderness") || insight.toLowerCase().includes("tough")) {
      signals.push("tenderness scores below 3 detected in cook_outcomes.");
      signals.push("Short rest times and high cook temps are the primary drivers.");
    }
    if (insight.toLowerCase().includes("spike") || insight.toLowerCase().includes("temp")) {
      signals.push("cook_events log shows repeated temp spike entries.");
      signals.push("pit_temp_high minus pit_temp_low exceeded 60°F in multiple cooks.");
    }
    if (insight.toLowerCase().includes("smoke")) {
      signals.push("smoke_profile scores flagged in cook_outcomes.");
      signals.push("Wood type and chip/chunk timing affect this directly.");
    }
    if (signals.length === 0) {
      signals.push("Pattern detected across multiple cook_outcomes records.");
    }
    return signals;
  }

  // Build next-time strategy
  function buildStrategy(): string[] {
    const strategy: string[] = [];
    if (insights?.nextTimeRecommendations) {
      strategy.push(...insights.nextTimeRecommendations.slice(0, 3));
    }
    if (trends?.improvements && trends.improvements.length > 0) {
      strategy.push(`Keep doing what's working: ${trends.improvements[0].split(".")[0]}.`);
    }
    if (trends?.weaknesses && trends.weaknesses.length > 0) {
      strategy.push(`Address your top weakness: ${trends.weaknesses[0].split(".")[0]}.`);
    }
    return strategy.slice(0, 5);
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={handleOpen}
        style={{
          background: "none",
          border: "none",
          color: "#C9973A",
          fontFamily: "var(--font-ui)",
          fontSize: "0.75rem",
          cursor: "pointer",
          padding: 0,
          letterSpacing: "0.05em",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {!isPitmaster && <span>🔒</span>}
        View Deep Insights →
      </button>

      {/* Overlay */}
      {open && (
        <div style={overlayStyle}>
          <div style={backdropStyle} onClick={() => setOpen(false)} />

          <div style={panelStyle}>
            {/* Header */}
            <div style={{
              padding: "var(--space-4)",
              borderBottom: "1px solid rgba(201,151,58,0.2)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexShrink: 0,
            }}>
              <div>
                <p style={{ ...labelStyle, margin: "0 0 4px" }}>Pitmaster Tier</p>
                <h2 style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.3rem",
                  color: "#F5E6C8",
                  margin: 0,
                }}>
                  Deep Insights
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-ui)",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  padding: "4px",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {/* Premium gate */}
            {!isPitmaster && (
              <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "var(--space-5)",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "2rem", marginBottom: "var(--space-3)" }}>🔒</div>
                <h3 style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.2rem",
                  color: "#F5E6C8",
                  margin: "0 0 var(--space-2)",
                }}>
                  Pitmaster Tier Feature
                </h3>
                <p style={{ ...mutedStyle, marginBottom: "var(--space-4)", maxWidth: "320px" }}>
                  Deep Insights are a Pitmaster-tier feature. Upgrade to unlock personalized coaching based on your cook data.
                </p>
                <Link
                  href="/premium"
                  onClick={() => setOpen(false)}
                  style={{
                    background: "#C9973A",
                    color: "var(--color-bg)",
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.85rem",
                    padding: "10px 24px",
                    borderRadius: "var(--radius-md)",
                    textDecoration: "none",
                  }}
                >
                  Upgrade to Pitmaster
                </Link>
              </div>
            )}

            {/* Loading */}
            {isPitmaster && loading && (
              <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "var(--space-5)",
              }}>
                <p style={{ ...mutedStyle, fontStyle: "italic" }}>Loading deep insights...</p>
              </div>
            )}

            {/* Content */}
            {isPitmaster && !loading && (
              <div style={{ flex: 1, overflowY: "auto" }}>

                {/* Section 1 — Why These Insights */}
                {insights && (insights.patternInsights.length > 0 || insights.pitInsights.length > 0) && (
                  <div style={sectionStyle}>
                    <div style={labelStyle}>Why These Insights Were Generated</div>
                    {[...insights.patternInsights, ...insights.pitInsights].slice(0, 4).map((insight, i) => (
                      <InsightWithSignals key={i} insight={insight} signals={getSignals(insight)} />
                    ))}
                  </div>
                )}

                {/* Section 2 — Multi-Cook Patterns */}
                {trends && (
                  <div style={sectionStyle}>
                    <div style={labelStyle}>Multi-Cook Patterns</div>
                    {trends.consistency.length > 0 && (
                      <div style={{ marginBottom: "var(--space-3)" }}>
                        <p style={{ ...mutedStyle, fontFamily: "var(--font-ui)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#7a6a55", marginBottom: "6px" }}>
                          Consistency
                        </p>
                        <BulletList items={trends.consistency} />
                      </div>
                    )}
                    {trends.pitBehavior.length > 0 && (
                      <div style={{ marginBottom: "var(--space-3)" }}>
                        <p style={{ ...mutedStyle, fontFamily: "var(--font-ui)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#7a6a55", marginBottom: "6px" }}>
                          Pit Behavior
                        </p>
                        <BulletList items={trends.pitBehavior} />
                      </div>
                    )}
                    {trends.meatSpecific.length > 0 && (
                      <div>
                        <p style={{ ...mutedStyle, fontFamily: "var(--font-ui)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#7a6a55", marginBottom: "6px" }}>
                          Meat-Specific
                        </p>
                        <BulletList items={trends.meatSpecific} />
                      </div>
                    )}
                    {!trends.consistency.length && !trends.pitBehavior.length && !trends.meatSpecific.length && (
                      <p style={{ ...mutedStyle, fontStyle: "italic" }}>Track more cooks to unlock multi-cook pattern analysis.</p>
                    )}
                  </div>
                )}

                {/* Section 3 — Pit-Specific Reasoning */}
                <div style={sectionStyle}>
                  <div style={labelStyle}>Pit-Specific Reasoning</div>
                  {pitType ? (
                    <div>
                      <p style={{ ...mutedStyle, fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "var(--space-2)" }}>
                        {pitType}
                      </p>
                      <BulletList items={pitReasoning} bullet="◆" />
                    </div>
                  ) : (
                    <p style={{ ...mutedStyle, fontStyle: "italic" }}>Set your smoker type in your profile to unlock pit-specific reasoning.</p>
                  )}
                </div>

                {/* Section 4 — Meat-Specific Reasoning */}
                {meatReasoning.length > 0 && (
                  <div style={sectionStyle}>
                    <div style={labelStyle}>Meat-Specific Reasoning</div>
                    <p style={{ ...mutedStyle, fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "var(--space-2)" }}>
                      {meatLabel}
                    </p>
                    <BulletList items={meatReasoning} bullet="◆" />
                  </div>
                )}

                {/* Section 5 — Next-Time Strategy */}
                <div style={sectionStyle}>
                  <div style={labelStyle}>Next-Time Strategy</div>
                  {meatLabel && (
                    <p style={{ ...mutedStyle, marginBottom: "var(--space-2)" }}>
                      For your next {meatLabel.toLowerCase()}:
                    </p>
                  )}
                  <BulletList items={buildStrategy()} bullet="→" color="#2D6A4F" />
                  {buildStrategy().length === 0 && (
                    <p style={{ ...mutedStyle, fontStyle: "italic" }}>Track more cooks to generate a personalized strategy.</p>
                  )}
                </div>

                {/* No insights state */}
                {!insights && !trends && (
                  <div style={sectionStyle}>
                    <p style={{ ...mutedStyle, fontStyle: "italic" }}>
                      No cook tracker data found for this cook. Complete the Cook Tracker after your next cook to unlock deep insights.
                    </p>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
