"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Button from "@/components/Button";
import Link from "next/link";

type Cook = {
  id: string;
  label: string;
  status: string;
  smoker_type: string | null;
  wood_type: string | null;
  created_at: string;
};

type CookLog = {
  id: string;
  cook_id: string;
  rating: number;
  summary: string;
  lessons: string | null;
};

function StatusBadge({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <span style={{
        background:    "#2D6A4F",
        color:         "#fff",
        fontFamily:    "var(--font-ui)",
        fontSize:      "0.7rem",
        padding:       "3px 8px",
        borderRadius:  "var(--radius-sm)",
        textTransform: "uppercase" as const,
        letterSpacing: "0.05em",
        whiteSpace:    "nowrap" as const,
        flexShrink:    0,
      }}>
        Completed
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span style={{
        background:    "var(--color-accent)",
        color:         "var(--color-bg)",
        fontFamily:    "var(--font-ui)",
        fontSize:      "0.7rem",
        padding:       "3px 8px",
        borderRadius:  "var(--radius-sm)",
        textTransform: "uppercase" as const,
        letterSpacing: "0.05em",
        whiteSpace:    "nowrap" as const,
        flexShrink:    0,
      }}>
        In Progress
      </span>
    );
  }
  if (status === "abandoned") {
    return (
      <span style={{
        background:    "rgba(100,100,100,0.2)",
        color:         "var(--color-text-muted)",
        fontFamily:    "var(--font-ui)",
        fontSize:      "0.7rem",
        padding:       "3px 8px",
        borderRadius:  "var(--radius-sm)",
        textTransform: "uppercase" as const,
        letterSpacing: "0.05em",
        whiteSpace:    "nowrap" as const,
        flexShrink:    0,
      }}>
        Archived
      </span>
    );
  }
  return (
    <span style={{
      background:    "var(--color-bg-alt)",
      color:         "var(--color-text-muted)",
      border:        "1px solid var(--color-border, #333)",
      fontFamily:    "var(--font-ui)",
      fontSize:      "0.7rem",
      padding:       "3px 8px",
      borderRadius:  "var(--radius-sm)",
      textTransform: "uppercase" as const,
      letterSpacing: "0.05em",
      whiteSpace:    "nowrap" as const,
      flexShrink:    0,
    }}>
      {status}
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  const filled = Math.max(0, Math.min(5, rating));
  return (
    <span>
      <span style={{ color: "var(--color-accent)", fontSize: "1rem" }}>
        {"★".repeat(filled)}
      </span>
      <span style={{ color: "var(--color-text-muted)", fontSize: "1rem" }}>
        {"☆".repeat(5 - filled)}
      </span>
    </span>
  );
}

const inputStyle: React.CSSProperties = {
  padding:      "10px 14px",
  background:   "var(--color-bg-alt)",
  border:       "1px solid var(--color-border, #333)",
  borderRadius: "var(--radius-md)",
  color:        "var(--color-text)",
  fontFamily:   "var(--font-ui)",
  fontSize:     "0.9rem",
  outline:      "none",
  boxSizing:    "border-box",
};

export default function LogsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [cooks, setCooks]       = useState<Cook[]>([]);
  const [logsMap, setLogsMap]   = useState<Record<string, CookLog>>({});
  const [loading, setLoading]   = useState(true);
  const [searchQuery, setSearchQuery]   = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [hoveredId, setHoveredId]       = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: cooksData } = await supabase
        .from("cooks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const cookList: Cook[] = cooksData || [];
      setCooks(cookList);

      if (cookList.length > 0) {
        const cookIds = cookList.map(c => c.id);
        const { data: logsData } = await supabase
          .from("cook_logs")
          .select("*")
          .in("cook_id", cookIds);

        const map: Record<string, CookLog> = {};
        for (const log of logsData || []) {
          map[log.cook_id] = log;
        }
        setLogsMap(map);
      }

      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Loading...</h1>
      </div>
    );
  }

  const filtered = cooks.filter(cook => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = q === "" || cook.label.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === "all" ||
      cook.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ padding: "40px", maxWidth: "800px" }}>

      {/* ── HEADER ── */}
      <h1 style={{
        fontFamily:   "var(--font-heading)",
        marginTop:    0,
        marginBottom: "var(--space-1)",
      }}>
        Cook History
      </h1>
      <p style={{
        fontFamily:   "var(--font-body)",
        fontStyle:    "italic",
        color:        "var(--color-text-muted)",
        marginTop:    0,
        marginBottom: "var(--space-4)",
        fontSize:     "1rem",
      }}>
        Every cook. Every lesson. Every win.
      </p>

      {/* ── SEARCH AND FILTER ── */}
      <div style={{
        display:       "flex",
        gap:           "var(--space-2)",
        marginBottom:  "var(--space-4)",
        flexWrap:      "wrap" as const,
      }}>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search cooks..."
          style={{ ...inputStyle, flex: "1 1 200px" }}
        />
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ ...inputStyle, flex: "0 0 auto" }}
        >
          <option value="all">All</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="abandoned">Archived</option>
        </select>
      </div>

      {/* ── EMPTY: NO COOKS AT ALL ── */}
      {cooks.length === 0 && (
        <div style={{ textAlign: "center" as const, padding: "var(--space-6) 0" }}>
          <p style={{
            fontFamily:   "var(--font-body)",
            color:        "var(--color-text-muted)",
            marginBottom: "var(--space-4)",
          }}>
            No cooks yet. Start your first cook.
          </p>
          <Link href="/prep">
            <Button>Start a Cook</Button>
          </Link>
        </div>
      )}

      {/* ── EMPTY: SEARCH NO RESULTS ── */}
      {cooks.length > 0 && filtered.length === 0 && (
        <p style={{
          fontFamily: "var(--font-body)",
          color:      "var(--color-text-muted)",
          fontStyle:  "italic",
        }}>
          No cooks match your search.
        </p>
      )}

      {/* ── COOK LIST ── */}
      <div>
        {filtered.map(cook => {
          const log     = logsMap[cook.id] ?? null;
          const hovered = hoveredId === cook.id;
          const date    = new Date(cook.created_at).toLocaleDateString(undefined, {
            month: "long",
            day:   "numeric",
            year:  "numeric",
          });

          const smokerWood = [cook.smoker_type, cook.wood_type]
            .filter(Boolean)
            .join(" · ");

          return (
            <div
              key={cook.id}
              onMouseEnter={() => setHoveredId(cook.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                background:    "var(--color-bg-alt)",
                border:        hovered
                  ? "1px solid rgba(255, 106, 0, 0.5)"
                  : "1px solid var(--color-border, #333)",
                borderRadius:  "var(--radius-lg)",
                padding:       "var(--space-4)",
                marginBottom:  "var(--space-3)",
                transition:    "border-color 0.15s",
              }}
            >
              {/* Label + status */}
              <div style={{
                display:       "flex",
                justifyContent:"space-between",
                alignItems:    "flex-start",
                gap:           "var(--space-2)",
                marginBottom:  "var(--space-2)",
              }}>
                <h3 style={{
                  fontFamily: "var(--font-heading)",
                  fontSize:   "1.1rem",
                  margin:     0,
                  lineHeight: 1.3,
                }}>
                  {cook.label}
                </h3>
                <StatusBadge status={cook.status} />
              </div>

              {/* Smoker · wood · date */}
              <p style={{
                fontFamily:   "var(--font-body)",
                fontSize:     "0.9rem",
                color:        "var(--color-text-muted)",
                margin:       0,
                marginBottom: "var(--space-3)",
              }}>
                {smokerWood ? `${smokerWood} · ` : ""}{date}
              </p>

              {/* Abandoned notice */}
              {cook.status === "abandoned" && (
                <p style={{
                  fontFamily:   "var(--font-body)",
                  fontSize:     "0.85rem",
                  color:        "var(--color-text-muted)",
                  fontStyle:    "italic",
                  margin:       0,
                  marginBottom: "var(--space-3)",
                }}>
                  This cook was archived after 48 hours of inactivity.
                </p>
              )}

              {/* Cook log */}
              {log ? (
                <div style={{ marginBottom: "var(--space-3)" }}>
                  <div style={{ marginBottom: "var(--space-1)" }}>
                    <StarRating rating={log.rating} />
                  </div>
                  {log.summary && (
                    <p style={{
                      fontFamily: "var(--font-body)",
                      fontStyle:  "italic",
                      fontSize:   "0.9rem",
                      color:      "var(--color-text-muted)",
                      margin:     0,
                      lineHeight: 1.5,
                    }}>
                      {log.summary.length > 120
                        ? log.summary.slice(0, 120) + "..."
                        : log.summary}
                    </p>
                  )}
                </div>
              ) : (
                <p style={{
                  fontFamily:   "var(--font-body)",
                  fontSize:     "0.875rem",
                  color:        "var(--color-text-muted)",
                  fontStyle:    "italic",
                  margin:       0,
                  marginBottom: "var(--space-3)",
                }}>
                  No summary yet
                </p>
              )}

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" as const }}>
                <Link href={`/cook/${cook.id}`}>
                  <Button>View Cook</Button>
                </Link>
                {cook.status === "completed" && !log && (
                  <Link href={`/cook/${cook.id}/summary`}>
                    <button style={{
                      background:    "transparent",
                      border:        "1px solid var(--color-accent)",
                      borderRadius:  "var(--radius-md)",
                      color:         "var(--color-accent)",
                      fontFamily:    "var(--font-ui)",
                      fontSize:      "0.875rem",
                      padding:       "8px 16px",
                      cursor:        "pointer",
                      letterSpacing: "0.03em",
                    }}>
                      Add Summary
                    </button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
