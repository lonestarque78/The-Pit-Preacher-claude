// components/ui/shared.tsx
// Shared UI primitives used across cook summary, profiles, and pitmaster pages

import React from "react";

// ── RATING BAR ──────────────────────────────────────────────────────────────
interface RatingBarProps {
  label: string;
  value: number;
  max?: number;
}

export function RatingBar({ label, value, max = 5 }: RatingBarProps) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const color = value >= (max * 0.8) ? "#2D6A4F" : value >= (max * 0.6) ? "#C9973A" : "#8B1A1A";
  return (
    <div style={{ marginBottom: "var(--space-2)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{
          fontFamily: "var(--font-ui)", fontSize: "0.7rem",
          color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
          {label}
        </span>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "#C9973A" }}>
          {value > 0 ? `${value}/${max}` : "—"}
        </span>
      </div>
      <div style={{ height: "4px", background: "rgba(201,151,58,0.15)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "2px" }} />
      </div>
    </div>
  );
}

// ── DELTA ROW ───────────────────────────────────────────────────────────────
interface DeltaRowProps {
  label: string;
  planned: string;
  actual: string;
}

export function DeltaRow({ label, planned, actual }: DeltaRowProps) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "80px 1fr 1fr",
      gap: "var(--space-2)", alignItems: "center",
      borderBottom: "1px solid rgba(201,151,58,0.08)", padding: "var(--space-1) 0",
    }}>
      <span style={{
        fontFamily: "var(--font-ui)", fontSize: "0.7rem",
        color: "var(--color-text-muted)", textTransform: "uppercase",
      }}>
        {label}
      </span>
      <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
        {planned}
      </span>
      <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text)", fontWeight: 500 }}>
        {actual}
      </span>
    </div>
  );
}

// ── INSIGHT CARD ────────────────────────────────────────────────────────────
interface InsightCardProps {
  label: string;
  items: string[];
  bullet?: string;
  accentColor?: string;
  style?: React.CSSProperties;
}

export function InsightCard({ label, items, bullet = "—", accentColor = "#C9973A", style }: InsightCardProps) {
  return (
    <div style={{
      background: "var(--color-bg-alt)",
      border: "1px solid rgba(201,151,58,0.15)",
      borderRadius: "var(--radius-lg)",
      padding: "var(--space-4)",
      ...style,
    }}>
      <div style={{
        fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: accentColor,
        textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "var(--space-2)",
      }}>
        {label}
      </div>
      {items.length === 0 ? (
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-muted)", fontStyle: "italic", margin: 0 }}>
          Not enough data yet.
        </p>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {items.map((item, i) => (
            <li key={i} style={{
              display: "flex", gap: "10px",
              fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text)",
              padding: "6px 0", borderBottom: "1px solid rgba(201,151,58,0.08)", lineHeight: 1.55,
            }}>
              <span style={{ color: accentColor, flexShrink: 0 }}>{bullet}</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── SCORE DISPLAY ────────────────────────────────────────────────────────────
interface ScoreDisplayProps {
  score: number;
  label?: string;
  size?: "sm" | "lg";
}

export function ScoreDisplay({ score, label, size = "lg" }: ScoreDisplayProps) {
  const color = score >= 75 ? "#2D6A4F" : score >= 50 ? "#C9973A" : "#8B1A1A";
  const grade = score >= 85 ? "Elite" : score >= 70 ? "Strong" : score >= 55 ? "Solid" : score >= 40 ? "Developing" : "Needs Work";
  const fontSize = size === "lg" ? "3.5rem" : "2rem";

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
      <span style={{ fontFamily: "var(--font-heading)", fontSize, color, lineHeight: 1 }}>
        {score}
      </span>
      <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.9rem", color: "var(--color-text-muted)", paddingBottom: size === "lg" ? "6px" : "4px" }}>
        / 100
      </span>
      {label && (
        <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color, textTransform: "uppercase", letterSpacing: "0.1em", paddingBottom: size === "lg" ? "8px" : "5px" }}>
          {grade}
        </span>
      )}
    </div>
  );
}

// ── PREMIUM LOCK OVERLAY ─────────────────────────────────────────────────────
interface PremiumLockProps {
  message?: string;
  minHeight?: string;
}

export function PremiumLock({ message = "This is a Pitmaster-tier feature.", minHeight = "120px" }: PremiumLockProps) {
  return (
    <div style={{ position: "relative", minHeight, overflow: "hidden", borderRadius: "var(--radius-md)" }}>
      <div style={{ filter: "blur(4px)", pointerEvents: "none", userSelect: "none", padding: "var(--space-3)" }}>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: "2rem", color: "#C9973A" }}>—</div>
        <div style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: "var(--space-1)" }}>
          ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
        </div>
      </div>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        background: "rgba(14,12,10,0.75)", padding: "var(--space-3)", textAlign: "center",
      }}>
        <span style={{ fontSize: "1.1rem", marginBottom: "var(--space-1)" }}>🔒</span>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text-muted)", margin: "0 0 var(--space-2)", lineHeight: 1.4 }}>
          {message}
        </p>
        <a href="/premium" style={{ color: "#C9973A", fontFamily: "var(--font-ui)", fontSize: "0.75rem", textDecoration: "none" }}>
          Upgrade to Pitmaster →
        </a>
      </div>
    </div>
  );
}
