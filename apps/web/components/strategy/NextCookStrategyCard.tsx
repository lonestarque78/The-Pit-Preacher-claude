"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface NextCookStrategy {
  headline: string;
  keyFocus: string[];
  timingAdjustments: string[];
  pitManagement: string[];
  meatSpecificTips: string[];
  riskFactors: string[];
  confidenceContext: string[];
  finalStrategy: string[];
}

interface Props {
  cookId: string;
  meatType: string;
  pitType: string;
  isPitmaster: boolean;
}

function BulletList({ items, bullet = "—", color = "#C9973A" }: { items: string[]; bullet?: string; color?: string }) {
  if (items.length === 0) return null;
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
      {items.map((item, i) => (
        <li key={i} style={{
          display: "flex", gap: "10px",
          fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text)",
          padding: "5px 0", borderBottom: "1px solid rgba(201,151,58,0.07)", lineHeight: 1.55,
        }}>
          <span style={{ color, flexShrink: 0 }}>{bullet}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const subLabelStyle: React.CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: "0.65rem",
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  marginBottom: "var(--space-1)",
  marginTop: "var(--space-3)",
};

export default function NextCookStrategyCard({ cookId, meatType, pitType, isPitmaster }: Props) {
  const [strategy, setStrategy] = useState<NextCookStrategy | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isPitmaster || !open || strategy) return;
    setLoading(true);
    const params = new URLSearchParams({ meatType, pitType, cookId });
    fetch(`/api/strategy?${params}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && !d.error) setStrategy(d); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open, isPitmaster, meatType, pitType, cookId]);

  const cardBase: React.CSSProperties = {
    background: "var(--color-bg-alt)",
    border: "1px solid rgba(201,151,58,0.2)",
    borderRadius: "var(--radius-lg)",
    marginBottom: "var(--space-4)",
    overflow: "hidden",
  };

  return (
    <div style={cardBase}>
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: "var(--space-3) var(--space-4)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div>
          <span style={{
            fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "#C9973A",
            textTransform: "uppercase", letterSpacing: "0.15em", display: "block", marginBottom: "4px",
          }}>
            {isPitmaster ? "◆ Next Cook Strategy" : "🔒 Next Cook Strategy"}
          </span>
          <span style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            {isPitmaster ? "Personalized strategy based on your cook history" : "Pitmaster tier feature"}
          </span>
        </div>
        <span style={{ color: "#C9973A", fontFamily: "var(--font-ui)", fontSize: "0.8rem", flexShrink: 0, marginLeft: "var(--space-3)" }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {/* Content */}
      {open && (
        <div style={{ padding: "0 var(--space-4) var(--space-4)" }}>

          {/* Premium gate */}
          {!isPitmaster && (
            <div style={{
              border: "1px solid rgba(201,151,58,0.2)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-4)",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "var(--space-2)" }}>🔒</div>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-muted)", margin: "0 0 var(--space-3)", lineHeight: 1.5 }}>
                Unlock Pitmaster Tier to view your personalized cook strategy based on past performance.
              </p>
              <Link href="/premium" style={{
                background: "#C9973A", color: "var(--color-bg)",
                fontFamily: "var(--font-ui)", fontSize: "0.8rem",
                padding: "8px 20px", borderRadius: "var(--radius-md)", textDecoration: "none",
              }}>
                Upgrade to Pitmaster
              </Link>
            </div>
          )}

          {/* Loading */}
          {isPitmaster && loading && (
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-muted)", fontStyle: "italic", margin: 0 }}>
              Building your strategy...
            </p>
          )}

          {/* No data */}
          {isPitmaster && !loading && !strategy && (
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text-muted)", fontStyle: "italic", margin: 0 }}>
              Track more cooks to generate a personalized strategy.
            </p>
          )}

          {/* Strategy content */}
          {isPitmaster && !loading && strategy && (
            <div>
              {/* Headline */}
              <div style={{
                borderLeft: "3px solid #C9973A",
                paddingLeft: "var(--space-3)",
                marginBottom: "var(--space-3)",
              }}>
                <p style={{
                  fontFamily: "var(--font-heading)", fontStyle: "italic",
                  fontSize: "1rem", color: "#F5E6C8", margin: 0, lineHeight: 1.5,
                }}>
                  {strategy.headline}
                </p>
              </div>

              {/* Two-column grid on larger screens */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)" }}>

                {/* Left column */}
                <div>
                  {strategy.keyFocus.length > 0 && (
                    <>
                      <div style={subLabelStyle}>Key Focus</div>
                      <BulletList items={strategy.keyFocus} bullet="◆" />
                    </>
                  )}

                  {strategy.timingAdjustments.length > 0 && (
                    <>
                      <div style={subLabelStyle}>Timing</div>
                      <BulletList items={strategy.timingAdjustments} bullet="⏱" color="#C9973A" />
                    </>
                  )}

                  {strategy.confidenceContext.length > 0 && (
                    <>
                      <div style={subLabelStyle}>Confidence</div>
                      <BulletList items={strategy.confidenceContext} bullet="◆" color="#7a6a55" />
                    </>
                  )}
                </div>

                {/* Right column */}
                <div>
                  {strategy.pitManagement.length > 0 && (
                    <>
                      <div style={subLabelStyle}>Pit Management</div>
                      <BulletList items={strategy.pitManagement} bullet="🔥" color="#C9973A" />
                    </>
                  )}

                  {strategy.meatSpecificTips.length > 0 && (
                    <>
                      <div style={subLabelStyle}>Meat Tips</div>
                      <BulletList items={strategy.meatSpecificTips} bullet="—" />
                    </>
                  )}

                  {strategy.riskFactors.length > 0 && (
                    <>
                      <div style={subLabelStyle}>Watch For</div>
                      <BulletList items={strategy.riskFactors} bullet="⚠" color="#C9973A" />
                    </>
                  )}
                </div>
              </div>

              {/* Final Strategy — full width */}
              {strategy.finalStrategy.length > 0 && (
                <div style={{
                  marginTop: "var(--space-4)",
                  background: "rgba(201,151,58,0.05)",
                  border: "1px solid rgba(201,151,58,0.15)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-3)",
                }}>
                  <div style={{ ...subLabelStyle, marginTop: 0, color: "#C9973A" }}>Game Plan</div>
                  <BulletList items={strategy.finalStrategy} bullet="→" color="#2D6A4F" />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
