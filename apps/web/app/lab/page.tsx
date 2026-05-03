"use client";

import Link from "next/link";
import { useState } from "react";
import { WOODS, MEATS, PAIRINGS } from "@/lib/woodPairings";

function getRatingStyle(rating: string): React.CSSProperties {
  switch (rating) {
    case "Classic":
      return { background: "rgba(201,151,58,0.2)", color: "#C9973A", border: "1px solid #C9973A" };
    case "Excellent":
      return { background: "rgba(45,106,79,0.15)", color: "#2D6A4F", border: "1px solid #2D6A4F" };
    case "Good":
      return { background: "rgba(201,151,58,0.1)", color: "#C9973A", border: "1px solid rgba(201,151,58,0.3)" };
    case "Use Caution":
      return { background: "rgba(139,105,26,0.2)", color: "#8B6914", border: "1px solid #8B6914" };
    case "Avoid":
      return { background: "rgba(120,40,40,0.2)", color: "#c0392b", border: "1px solid #c0392b" };
    default:
      return { background: "rgba(201,151,58,0.1)", color: "#C9973A", border: "1px solid rgba(201,151,58,0.3)" };
  }
}

export default function LabPage() {
  const [selectedWood, setSelectedWood] = useState<string | null>(null);
  const [selectedMeat, setSelectedMeat] = useState<string | null>(null);

  const pairingKey = selectedWood && selectedMeat ? selectedWood + "_" + selectedMeat : null;
  const pairing = pairingKey ? PAIRINGS[pairingKey] : null;

  const selectedWoodObj = WOODS.find((w) => w.id === selectedWood);
  const selectedMeatObj = MEATS.find((m) => m.id === selectedMeat);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "var(--space-4)" }}>
      <Link
        href="/dashboard"
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: "0.8rem",
          color: "#C9973A",
          textDecoration: "none",
          display: "inline-block",
          marginBottom: "var(--space-3)",
        }}
      >
        ← Back
      </Link>

      <h1
        style={{
          fontFamily: "var(--font-heading)",
          color: "#F5E6C8",
          fontSize: "clamp(1.4rem, 3vw, 2rem)",
          margin: "0 0 var(--space-1)",
          fontWeight: 700,
        }}
      >
        Wood Flavor Lab
      </h1>
      <p
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--color-text-muted)",
          fontSize: "0.9rem",
          margin: "0 0 var(--space-3)",
        }}
      >
        Find the right wood for your cook.
      </p>
      <div
        style={{
          height: 1,
          background: "linear-gradient(to right, #C9973A, rgba(201,151,58,0.1))",
          marginBottom: "var(--space-4)",
        }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "var(--space-4)",
          marginBottom: "var(--space-4)",
        }}
      >
        {/* Wood selector */}
        <div>
          <div
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.75rem",
              color: "#C9973A",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "var(--space-2)",
            }}
          >
            Select Your Wood
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "var(--space-2)",
            }}
          >
            {WOODS.map((wood) => {
              const selected = selectedWood === wood.id;
              return (
                <div
                  key={wood.id}
                  onClick={() => setSelectedWood(selected ? null : wood.id)}
                  style={{
                    background: selected ? "rgba(201,151,58,0.08)" : "var(--color-bg-alt)",
                    border: selected ? "2px solid #C9973A" : "1px solid rgba(201,151,58,0.15)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-3)",
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 600,
                      color: "var(--color-text)",
                      fontSize: "0.9rem",
                    }}
                  >
                    {wood.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-muted)",
                      fontSize: "0.75rem",
                      marginTop: 4,
                      lineHeight: 1.4,
                    }}
                  >
                    {wood.flavor}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 2,
                      marginTop: "var(--space-1)",
                    }}
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: 8,
                          height: 4,
                          borderRadius: 1,
                          background: i < wood.intensity ? "#C9973A" : "rgba(201,151,58,0.15)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Meat selector */}
        <div>
          <div
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.75rem",
              color: "#C9973A",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "var(--space-2)",
            }}
          >
            Select Your Meat
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "var(--space-2)",
            }}
          >
            {MEATS.map((meat) => {
              const selected = selectedMeat === meat.id;
              return (
                <div
                  key={meat.id}
                  onClick={() => setSelectedMeat(selected ? null : meat.id)}
                  style={{
                    background: selected ? "rgba(201,151,58,0.08)" : "var(--color-bg-alt)",
                    border: selected ? "2px solid #C9973A" : "1px solid rgba(201,151,58,0.15)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--space-3)",
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 600,
                      color: "var(--color-text)",
                      fontSize: "0.95rem",
                    }}
                  >
                    {meat.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-body)",
                      color: "var(--color-text-muted)",
                      fontSize: "0.75rem",
                      marginTop: 4,
                    }}
                  >
                    {meat.sub}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pairing result */}
      {selectedWood && selectedMeat && (
        <div
          style={{
            background: "var(--color-bg-alt)",
            border: "1px solid rgba(201,151,58,0.3)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4)",
          }}
        >
          {pairing ? (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "var(--space-2)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-heading)",
                    color: "#F5E6C8",
                    fontSize: "1.2rem",
                  }}
                >
                  {selectedWoodObj?.name} + {selectedMeatObj?.name}
                </div>
                <div
                  style={{
                    ...getRatingStyle(pairing.rating),
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    padding: "4px 12px",
                    borderRadius: 20,
                  }}
                >
                  {pairing.rating}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: "var(--space-1)",
                  marginTop: "var(--space-2)",
                }}
              >
                {pairing.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      border: "1px solid rgba(201,151,58,0.2)",
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.7rem",
                      color: "var(--color-text-muted)",
                      padding: "2px 10px",
                      borderRadius: 10,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div
                style={{
                  borderLeft: "3px solid #C9973A",
                  paddingLeft: "var(--space-3)",
                  marginTop: "var(--space-3)",
                  fontFamily: "var(--font-body)",
                  fontStyle: "italic",
                  color: "#F5E6C8",
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                }}
              >
                {pairing.preacher}
              </div>

              <div style={{ marginTop: "var(--space-3)" }}>
                <div
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.7rem",
                    color: "#C9973A",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  Cook Notes
                </div>
                {pairing.notes.map((note, i) => (
                  <div
                    key={i}
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.85rem",
                      color: "var(--color-text-muted)",
                      lineHeight: 1.6,
                      paddingLeft: "var(--space-2)",
                      borderLeft: "1px solid rgba(201,151,58,0.2)",
                      marginBottom: "var(--space-1)",
                    }}
                  >
                    {note}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontStyle: "italic",
                color: "var(--color-text-muted)",
                margin: 0,
              }}
            >
              The Preacher is still learning this combination. Trust your instincts and start with a light hand.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
