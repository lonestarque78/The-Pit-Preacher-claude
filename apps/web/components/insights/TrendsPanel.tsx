"use client";

import { useEffect, useState } from "react";

interface TrendsResult {
  consistency: string[];
  pitBehavior: string[];
  meatSpecific: string[];
  improvements: string[];
  weaknesses: string[];
}

interface VariabilityResult {
  index: number;
  components: { timingVariability: number; pitVariability: number; outcomeVariability: number };
  notes: string[];
}

function InsightList({ items, bullet, color }: { items: string[]; bullet: string; color: string }) {
  if (items.length === 0) return (
    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-muted)", fontStyle: "italic", margin: 0 }}>
      Not enough data yet. Track more cooks to unlock this section.
    </p>
  );
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
      {items.map((item, i) => (
        <li key={i} style={{
          display: "flex", gap: "12px",
          fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text)",
          padding: "10px 0", borderBottom: "1px solid rgba(201,151,58,0.08)", lineHeight: 1.6,
        }}>
          <span style={{ color, flexShrink: 0, marginTop: "2px" }}>{bullet}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const cardStyle: React.CSSProperties = {
  background: "rgba(201,151,58,0.04)",
  border: "1px solid rgba(201,151,58,0.15)",
  borderRadius: "var(--radius-lg)",
  padding: "var(--space-4)",
  marginBottom: "var(--space-4)",
};

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: "0.7rem",
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  marginBottom: "var(--space-2)",
};

export default function TrendsPanel() {
  const [trends, setTrends] = useState<TrendsResult | null>(null);
  const [variabilityIndex, setVariabilityIndex] = useState<VariabilityResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [trendsRes, varRes] = await Promise.all([
          fetch("/api/trends"),
          fetch("/api/variability"),
        ]);
        if (cancelled) return;
        if (!trendsRes.ok) throw new Error("Failed to load trends");
        setTrends(await trendsRes.json());
        if (varRes.ok) {
          const varData = await varRes.json();
          if (!varData.error) setVariabilityIndex(varData);
        }
      } catch {
        if (!cancelled) setError("Could not load trends. Try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>Loading trends...</p>;
  }

  if (error) {
    return <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>{error}</p>;
  }

  if (!trends) {
    return (
      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-muted)", fontStyle: "italic" }}>
        No tracked cook data found. Complete and track at least 3 cooks to generate trend analysis.
      </p>
    );
  }

  return (
    <div>
      <div style={{ ...cardStyle, borderLeft: "3px solid #C9973A" }}>
        <div style={sectionLabelStyle}>Trend Overview</div>
        {trends.improvements.length > 0 ? (
          <p style={{ fontFamily: "var(--font-heading)", fontStyle: "italic", fontSize: "1rem", color: "#F5E6C8", margin: 0, lineHeight: 1.5 }}>
            {trends.improvements[0]}
          </p>
        ) : (
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0, fontStyle: "italic" }}>
            Track more cooks to generate your trend overview.
          </p>
        )}
      </div>

      <div style={cardStyle}>
        <div style={sectionLabelStyle}>Consistency</div>
        <InsightList items={trends.consistency} bullet="◆" color="#C9973A" />
      </div>
      <div style={cardStyle}>
        <div style={sectionLabelStyle}>Pit Behavior</div>
        <InsightList items={trends.pitBehavior} bullet="◆" color="#C9973A" />
      </div>
      <div style={cardStyle}>
        <div style={sectionLabelStyle}>Meat-Specific</div>
        <InsightList items={trends.meatSpecific} bullet="◆" color="#C9973A" />
      </div>
      <div style={{ ...cardStyle, borderColor: "rgba(45,106,79,0.3)" }}>
        <div style={{ ...sectionLabelStyle, color: "#2D6A4F" }}>Improvements</div>
        <InsightList items={trends.improvements} bullet="↑" color="#2D6A4F" />
      </div>
      <div style={{ ...cardStyle, borderColor: "rgba(201,151,58,0.35)" }}>
        <div style={{ ...sectionLabelStyle, color: "#C9973A" }}>Persistent Weaknesses</div>
        <InsightList items={trends.weaknesses} bullet="—" color="#C9973A" />
      </div>

      {/* Cook Variability Index */}
      {variabilityIndex ? (
        <div style={cardStyle}>
          <div style={{ ...sectionLabelStyle, color: "#C9973A" }}>Cook Variability Index</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
            <span style={{
              fontFamily: "var(--font-heading)", fontSize: "2.4rem", lineHeight: 1,
              color: variabilityIndex.index >= 75 ? "#2D6A4F" : variabilityIndex.index >= 50 ? "#C9973A" : "#8B1A1A",
            }}>
              {variabilityIndex.index}
            </span>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.85rem", color: "var(--color-text-muted)", paddingBottom: "6px" }}>/100</span>
            <span style={{
              fontFamily: "var(--font-ui)", fontSize: "0.7rem",
              color: variabilityIndex.index >= 75 ? "#2D6A4F" : variabilityIndex.index >= 50 ? "#C9973A" : "#8B1A1A",
              textTransform: "uppercase", letterSpacing: "0.1em", paddingBottom: "8px",
            }}>
              {variabilityIndex.index >= 80 ? "Highly Consistent" : variabilityIndex.index >= 60 ? "Developing" : "High Variance"}
            </span>
          </div>
          <div style={{ marginBottom: "var(--space-3)" }}>
            {[
              { label: "Timing Consistency", value: variabilityIndex.components.timingVariability },
              { label: "Pit Consistency", value: variabilityIndex.components.pitVariability },
              { label: "Outcome Consistency", value: variabilityIndex.components.outcomeVariability },
            ].map(({ label, value }) => (
              <div key={label} style={{ marginBottom: "var(--space-2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "#C9973A" }}>{value}/100</span>
                </div>
                <div style={{ height: "4px", background: "rgba(201,151,58,0.15)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${value}%`,
                    background: value >= 75 ? "#2D6A4F" : value >= 50 ? "#C9973A" : "#8B1A1A",
                    borderRadius: "2px",
                  }} />
                </div>
              </div>
            ))}
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {variabilityIndex.notes.map((note, i) => (
              <li key={i} style={{
                display: "flex", gap: "10px", padding: "5px 0",
                fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text)",
                borderBottom: "1px solid rgba(201,151,58,0.08)", lineHeight: 1.5,
              }}>
                <span style={{ color: "#C9973A", flexShrink: 0 }}>◆</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div style={cardStyle}>
          <div style={{ ...sectionLabelStyle, color: "#C9973A" }}>Cook Variability Index</div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-muted)", fontStyle: "italic", margin: 0 }}>
            Track at least 3 cooks with the Cook Tracker to generate your variability index.
          </p>
        </div>
      )}

      {/* Fire Control Trends */}
      <div style={cardStyle}>
        <div style={{ ...sectionLabelStyle, color: "#C9973A" }}>Fire Control Trends</div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-muted)", margin: "0 0 var(--space-3)", lineHeight: 1.5 }}>
          Your Fire Control Score is computed after each tracked cook. It measures pit stability, responsiveness, and efficiency. View it on the Summary tab after each cook.
        </p>
        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
          {[
            { label: "Improve Stability", value: "Stabilize your pit 25–30 min before adding meat. Fewer spikes = higher stability score." },
            { label: "Improve Responsiveness", value: "Make smaller adjustments and wait longer before the next one. Fast corrections cause overcorrection." },
            { label: "Improve Efficiency", value: "Set a check schedule and stick to it. Every unnecessary lid opening costs you temp and score points." },
          ].map(({ label, value }) => (
            <div key={label} style={{
              flex: "1 1 160px",
              background: "rgba(201,151,58,0.05)",
              border: "1px solid rgba(201,151,58,0.12)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-2) var(--space-3)",
            }}>
              <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.65rem", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 6px" }}>
                {label}
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.5 }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Confidence Score Trends */}
      <div style={cardStyle}>
        <div style={{ ...sectionLabelStyle, color: "#C9973A" }}>Confidence Score Trends</div>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-muted)", margin: "0 0 var(--space-3)", lineHeight: 1.5 }}>
          Your Cook Confidence Score is computed after each tracked cook. Complete and track more cooks to build your score history. View your score on the Summary tab after each cook.
        </p>
        <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
          {[
            { label: "How to improve Pit Stability", value: "Stabilize fire 30+ min before adding meat. Keep exhaust fully open." },
            { label: "How to improve Plan Adherence", value: "Use the timeline as a hard anchor. Build a 90-min buffer into every cook." },
            { label: "How to improve Outcome Quality", value: "Focus on your lowest-rated category each cook. One improvement at a time." },
            { label: "How to improve Cook Efficiency", value: "Minimize lid openings. Set a check schedule and stick to it." },
          ].map(({ label, value }) => (
            <div key={label} style={{
              flex: "1 1 160px",
              background: "rgba(201,151,58,0.05)",
              border: "1px solid rgba(201,151,58,0.12)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-2) var(--space-3)",
            }}>
              <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.65rem", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 6px" }}>
                {label}
              </p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.5 }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
