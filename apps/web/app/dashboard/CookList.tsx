"use client";

import { useState } from "react";
import Link from "next/link";

type Cook = {
  id: string;
  label: string;
  status: string;
  smoker_type: string | null;
  wood_type: string | null;
  created_at: string;
  completed_at: string | null;
  eat_time: string | null;
  plan: any;
};

type CookLog = {
  id: string;
  cook_id: string;
  rating: number;
  summary: string | null;
};

type Props = {
  cooks: Cook[];
  logsMap: Record<string, CookLog>;
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch { return iso; }
}

function getElapsed(createdAt: string): string {
  const diffMs = new Date().getTime() - new Date(createdAt).getTime();
  const diffH = diffMs / (1000 * 60 * 60);
  const diffDays = Math.floor(diffH / 24);
  if (diffDays >= 1) return `Started ${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  return `Started ${Math.floor(diffH)} hrs ago`;
}

function getAgeHours(createdAt: string): number {
  return (new Date().getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
}

function StarRow({ rating }: { rating: number }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= rating ? "#C9973A" : "var(--color-text-muted)", fontSize: "0.85rem" }}>★</span>
      ))}
    </span>
  );
}

export default function CookList({ cooks, logsMap }: Props) {
  const [activeFilter, setActiveFilter] = useState<"all" | "in_progress" | "completed">("all");

  const nonAbandoned  = cooks.filter(c => c.status !== "abandoned");
  const inProgress    = nonAbandoned.filter(c => c.status === "in_progress");
  const completed     = nonAbandoned.filter(c => c.status === "completed");

  const filtered =
    activeFilter === "in_progress" ? inProgress :
    activeFilter === "completed"   ? completed  :
    nonAbandoned;

  const filterCards = [
    { key: "all"         as const, label: "Total",       count: nonAbandoned.length },
    { key: "in_progress" as const, label: "In Progress", count: inProgress.length   },
    { key: "completed"   as const, label: "Completed",   count: completed.length    },
  ];

  return (
    <div style={{ padding: "var(--space-3) var(--space-4) var(--space-4)" }}>

      {/* Filter stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
        {filterCards.map(card => {
          const isActive = activeFilter === card.key;
          return (
            <button
              key={card.key}
              onClick={() => setActiveFilter(card.key)}
              style={{
                background:   isActive ? "rgba(201,151,58,0.12)" : "var(--color-bg-alt)",
                border:       isActive ? "1px solid #C9973A" : "1px solid rgba(201,151,58,0.1)",
                borderRadius: "var(--radius-md)",
                padding:      "var(--space-2) var(--space-3)",
                textAlign:    "center",
                cursor:       "pointer",
                transition:   "border-color 0.15s, background 0.15s",
              }}
            >
              <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", color: isActive ? "#C9973A" : "#F5E6C8", margin: "0 0 2px" }}>
                {card.count}
              </p>
              <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.65rem", color: isActive ? "#C9973A" : "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>
                {card.label}
              </p>
            </button>
          );
        })}
        <Link
          href="/preacher"
          style={{
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            background:     "rgba(201,151,58,0.08)",
            border:         "1px solid #C9973A",
            borderRadius:   "var(--radius-md)",
            padding:        "var(--space-2) var(--space-3)",
            textAlign:      "center",
            textDecoration: "none",
            gap:            "4px",
          }}
        >
          <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.85rem", fontWeight: 700, color: "#C9973A", margin: 0, lineHeight: 1.2 }}>
            Ask the<br />Preacher
          </p>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.65rem", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0, opacity: 0.7 }}>
            →
          </p>
        </Link>
      </div>

      {/* Cook list */}
      {filtered.length === 0 ? (
        <div style={{ border: "1px solid rgba(201,151,58,0.15)", background: "var(--color-bg-alt)", borderRadius: "var(--radius-lg)", padding: "var(--space-4)", textAlign: "center" }}>
          {activeFilter === "all" && (
            <>
              <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "#F5E6C8", margin: "0 0 var(--space-1)" }}>The pit is cold.</p>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0 0 var(--space-3)" }}>Ready when you are.</p>
              <Link href="/" style={{ display: "inline-block", background: "#C9973A", color: "var(--color-bg)", fontFamily: "var(--font-ui)", fontSize: "0.85rem", padding: "8px 20px", borderRadius: "var(--radius-md)", textDecoration: "none" }}>
                Start a Cook →
              </Link>
            </>
          )}
          {activeFilter === "in_progress" && (
            <>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0 0 var(--space-3)" }}>No active cooks right now.</p>
              <Link href="/" style={{ display: "inline-block", background: "#C9973A", color: "var(--color-bg)", fontFamily: "var(--font-ui)", fontSize: "0.85rem", padding: "8px 20px", borderRadius: "var(--radius-md)", textDecoration: "none" }}>
                Start a Cook →
              </Link>
            </>
          )}
          {activeFilter === "completed" && (
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", margin: 0 }}>
              No completed cooks yet. Your history will build here.
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {filtered.map(cook => {
            const log        = logsMap[cook.id] ?? null;
            const plan       = cook.plan ?? {};
            const tools      = plan.tools ?? [];
            const smokerLine = [tools[0]?.name || cook.smoker_type, tools[0]?.wood || cook.wood_type].filter(Boolean).join(" · ");
            const isActive   = cook.status === "in_progress";
            const ageHours   = isActive ? getAgeHours(cook.created_at) : 0;
            const is36h      = ageHours >= 36;

            return (
              <div
                key={cook.id}
                style={{
                  background:     "var(--color-bg-alt)",
                  border:         isActive ? "2px solid #C9973A" : "1px solid rgba(201,151,58,0.15)",
                  borderRadius:   "var(--radius-lg)",
                  boxShadow:      isActive ? "0 0 12px rgba(201,151,58,0.08)" : "none",
                  padding:        "var(--space-3) var(--space-4)",
                  display:        "flex",
                  justifyContent: "space-between",
                  alignItems:     "center",
                  flexWrap:       "wrap",
                  gap:            "var(--space-3)",
                }}
              >
                {/* Left content */}
                <div style={{ flex: "3 1 180px" }}>
                  <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.05rem", color: "#F5E6C8", margin: "0 0 4px" }}>
                    {cook.label || "Unnamed Cook"}
                  </p>
                  {smokerLine && (
                    <p style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--color-text-muted)", margin: "0 0 4px" }}>
                      {smokerLine}
                    </p>
                  )}

                  {isActive ? (
                    <>
                      <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.8rem", color: "var(--color-text-muted)", margin: "0 0 2px" }}>
                        {getElapsed(cook.created_at)}
                      </p>
                      {is36h && (
                        <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#8B6914", margin: "0 0 2px" }}>
                          ⚠ Inactive 36+ hrs — complete or it will be archived
                        </p>
                      )}
                      <Link href="/fix" style={{ fontFamily: "var(--font-ui)", fontSize: "0.78rem", color: "#8B6914", textDecoration: "none", display: "inline-block", marginTop: "2px", opacity: 0.9 }}>
                        Pit Rescue →
                      </Link>
                    </>
                  ) : (
                    <>
                      <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "var(--color-text-muted)", margin: "0 0 4px" }}>
                        {formatDate(cook.completed_at || cook.created_at)}
                      </p>
                      {log && (
                        <div>
                          <StarRow rating={log.rating} />
                          {log.summary && (
                            <p style={{ fontFamily: "var(--font-body)", fontStyle: "italic", fontSize: "0.8rem", color: "var(--color-text-muted)", margin: "4px 0 0", lineHeight: 1.4 }}>
                              {log.summary.length > 80 ? log.summary.slice(0, 80) + "..." : log.summary}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Right buttons */}
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", flex: "0 0 auto" }}>
                  {isActive && (
                    <Link href={`/cook/${cook.id}/live`} style={{ display: "block", textAlign: "center", background: "#C9973A", color: "var(--color-bg)", fontFamily: "var(--font-ui)", fontSize: "0.8rem", padding: "6px 16px", borderRadius: "var(--radius-md)", textDecoration: "none", whiteSpace: "nowrap" }}>
                      Live Mode →
                    </Link>
                  )}
                  <Link href={isActive ? `/cook/${cook.id}` : `/cook/${cook.id}/summary`} style={{ display: "block", textAlign: "center", background: "transparent", border: "1px solid rgba(201,151,58,0.5)", color: "#C9973A", fontFamily: "var(--font-ui)", fontSize: "0.8rem", padding: "6px 16px", borderRadius: "var(--radius-md)", textDecoration: "none", whiteSpace: "nowrap" }}>
                    View Cook →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {nonAbandoned.length > 0 && (
        <div style={{ textAlign: "right", marginTop: "var(--space-3)" }}>
          <Link href="/logs" style={{ fontFamily: "var(--font-ui)", fontSize: "0.8rem", color: "#C9973A", textDecoration: "none" }}>
            View All History →
          </Link>
        </div>
      )}

    </div>
  );
}
