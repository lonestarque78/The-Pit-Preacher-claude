"use client";

import { useState } from "react";

interface PlanAdjustments {
  startTimeAdjustment: number | null;
  wrapAdjustment: number | null;
  pitTempAdjustment: number | null;
  restTimeAdjustment: number | null;
  notes: string[];
}

interface Props {
  adjustments: PlanAdjustments;
  onRevert: () => void;
}

function formatAdjustment(label: string, value: number, unit: string): string {
  if (value > 0) return `${label} +${value}${unit}`;
  return `${label} ${value}${unit}`;
}

export default function AdjustmentsBanner({ adjustments, onRevert }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [reverted, setReverted] = useState(false);

  const summaryParts: string[] = [];
  if (adjustments.startTimeAdjustment !== null) {
    summaryParts.push(formatAdjustment("Start time", adjustments.startTimeAdjustment, " min"));
  }
  if (adjustments.pitTempAdjustment !== null) {
    summaryParts.push(formatAdjustment("Pit temp", adjustments.pitTempAdjustment, "°F"));
  }
  if (adjustments.wrapAdjustment !== null) {
    summaryParts.push(formatAdjustment("Wrap time", adjustments.wrapAdjustment, " min"));
  }
  if (adjustments.restTimeAdjustment !== null) {
    summaryParts.push(formatAdjustment("Rest time", adjustments.restTimeAdjustment, " min"));
  }

  if (reverted) {
    return (
      <div style={{
        background: "var(--color-bg-alt)",
        border: "1px solid rgba(201,151,58,0.2)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-2) var(--space-3)",
        marginBottom: "var(--space-4)",
        fontFamily: "var(--font-ui)",
        fontSize: "0.8rem",
        color: "var(--color-text-muted)",
      }}>
        Adjustments reverted. Plan running on original settings.
      </div>
    );
  }

  return (
    <>
      {/* Banner */}
      <div style={{
        background: "rgba(201,151,58,0.08)",
        border: "1px solid rgba(201,151,58,0.35)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-3) var(--space-4)",
        marginBottom: "var(--space-4)",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "var(--space-3)",
          flexWrap: "wrap",
        }}>
          <div>
            <div style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.7rem",
              color: "#C9973A",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: "6px",
            }}>
              ◆ Recommended Adjustments Applied
            </div>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              color: "var(--color-text)",
              margin: 0,
              lineHeight: 1.5,
            }}>
              {summaryParts.join(" · ")}
            </p>
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)", flexShrink: 0, alignItems: "center" }}>
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: "none",
                border: "none",
                color: "#C9973A",
                fontFamily: "var(--font-ui)",
                fontSize: "0.75rem",
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              Why these?
            </button>
            <button
              onClick={() => {
                setReverted(true);
                onRevert();
              }}
              style={{
                background: "transparent",
                border: "1px solid rgba(201,151,58,0.3)",
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-ui)",
                fontSize: "0.75rem",
                padding: "5px 12px",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
              }}
            >
              Revert
            </button>
          </div>
        </div>
      </div>

      {/* Why modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,8,6,0.85)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "var(--space-4)",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: "var(--color-bg-alt)",
              border: "1px solid rgba(201,151,58,0.3)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-5)",
              maxWidth: "480px",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <div style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.7rem",
              color: "#C9973A",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: "var(--space-2)",
            }}>
              Why These Adjustments
            </div>
            <h2 style={{
              fontFamily: "var(--font-heading)",
              fontSize: "1.3rem",
              color: "#F5E6C8",
              margin: "0 0 var(--space-4)",
            }}>
              Based on your past cooks
            </h2>

            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {adjustments.notes.map((note, i) => (
                <li key={i} style={{
                  display: "flex",
                  gap: "var(--space-2)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.875rem",
                  color: "var(--color-text)",
                  padding: "var(--space-2) 0",
                  borderBottom: "1px solid rgba(201,151,58,0.08)",
                  lineHeight: 1.5,
                }}>
                  <span style={{ color: "#C9973A", flexShrink: 0 }}>—</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setShowModal(false)}
              style={{
                marginTop: "var(--space-4)",
                width: "100%",
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
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
