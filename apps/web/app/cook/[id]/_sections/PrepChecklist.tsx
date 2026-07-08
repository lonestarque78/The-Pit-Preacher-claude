"use client";

import { useState } from "react";

type ChecklistItem = { id: string; label: string };
type SmokerChecklist = { smokerName: string; items: ChecklistItem[] };

export default function PrepChecklist({ checklists }: { checklists: SmokerChecklist[] }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (id: string) =>
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  return (
    <div style={{
      display: "grid",
      gap: "var(--space-4)",
      gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    }}>
      {checklists.map(group => (
        <div key={group.smokerName} style={{
          background: "var(--color-bg-alt)",
          padding: "var(--space-4)",
          borderRadius: "var(--radius-lg)",
        }}>
          <h3 style={{
            fontFamily: "var(--font-heading)",
            fontSize: "1rem",
            marginTop: 0,
            marginBottom: "var(--space-3)",
          }}>
            {group.smokerName}
          </h3>
          <div>
            {group.items.map(item => {
              const isChecked = !!checked[item.id];
              return (
                <label
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "var(--space-2)",
                    marginBottom: "var(--space-2)",
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.9rem",
                    color: isChecked ? "var(--color-text-muted)" : "var(--color-text)",
                    textDecoration: isChecked ? "line-through" : "none",
                    lineHeight: 1.4,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggle(item.id)}
                    style={{
                      accentColor: "var(--color-accent)",
                      width: "16px",
                      height: "16px",
                      cursor: "pointer",
                      flexShrink: 0,
                      marginTop: "2px",
                    }}
                  />
                  {item.label}
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
