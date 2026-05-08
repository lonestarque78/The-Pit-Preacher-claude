"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

const ISSUES = [
  { title: "Fire went out", desc: "Lost the fire completely or it burned down to nothing" },
  { title: "Running too hot", desc: "Temperature spiked above target and will not come down" },
  { title: "Running too cold", desc: "Temperature dropped and the fire will not recover" },
  { title: "Dirty smoke", desc: "Thick white or gray smoke coming from the cooker" },
  { title: "Bark will not set", desc: "Surface is still soft, tacky, or pale after hours on the pit" },
  { title: "Behind schedule", desc: "Running significantly behind and need to speed up the cook" },
  { title: "Meat looks dry", desc: "Surface is cracking or losing too much moisture" },
  { title: "Stall will not break", desc: "Internal temp has been stuck for an unusually long time" },
  { title: "Think I overcooked it", desc: "Pulled too late or internal temp went too high" },
  { title: "Something else", desc: "Describe the problem in your own words" },
];

const HOURS_OPTIONS = [
  "Just started",
  "1-2 hours in",
  "2-4 hours in",
  "4-6 hours in",
  "6-8 hours in",
  "8+ hours in",
  "Almost done",
];

type ActiveCookRow = {
  id: string;
  label: string;
  smoker_type: string | null;
  wood_type: string | null;
  eat_time: string | null;
};

function parseDiagnosis(text: string): { header: string; content: string }[] {
  const headers = ["WHAT IS HAPPENING", "WHAT TO DO RIGHT NOW", "WHAT TO WATCH FOR"]
  const result: { header: string; content: string }[] = []

  let remaining = text

  for (let i = 0; i < headers.length; i++) {
    const header = headers[i]
    if (!header) continue
    const idx = remaining.indexOf(header)
    if (idx === -1) continue

    const afterHeader = remaining.slice(idx + header.length).replace(/^[\s:]+/, "")

    let content = afterHeader
    for (let j = i + 1; j < headers.length; j++) {
      const nextHeader = headers[j]
      if (!nextHeader) continue
      const nextIdx = afterHeader.indexOf(nextHeader)
      if (nextIdx !== -1) {
        content = afterHeader.slice(0, nextIdx).trim()
        break
      }
    }

    result.push({ header, content: content.trim() })
    remaining = remaining.slice(idx + header.length)
  }

  return result
}

export default function FixPage() {
  const supabase = createClient();

  const [tier, setTier] = useState("free");
  const [activeCook, setActiveCook] = useState<ActiveCookRow | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const [selectedIssue, setSelectedIssue] = useState("");
  const [customIssue, setCustomIssue] = useState("");
  const [hoursIn, setHoursIn] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [cookDescription, setCookDescription] = useState("");
  const [editingCookDesc, setEditingCookDesc] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    const { data: subData } = await supabase
      .from("subscriptions")
      .select("tier")
      .eq("user_id", user.id)
      .single();
    setTier(subData?.tier ?? "free");

    const { data: cookData } = await supabase
      .from("cooks")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "in_progress")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (cookData) {
      setActiveCook(cookData);
      setCookDescription(`${cookData.label} on ${cookData.smoker_type}`);
    }

    setPageLoading(false);
  };

  const handleGetFix = async () => {
    setStep(3);
    setLoading(true);
    setDiagnosis("");

    const message =
      "RESCUE: " +
      selectedIssue +
      (customIssue ? " — " + customIssue : "") +
      ". Cook: " + cookDescription +
      ". Time into cook: " + hoursIn +
      ". Additional: " + additionalContext;

    try {
      const res = await fetch("/api/preacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          cookContext: {
            label: cookDescription,
            smoker_type: activeCook?.smoker_type ?? "",
            wood_type: activeCook?.wood_type ?? "",
            eat_time: activeCook?.eat_time ?? "",
            tools: [],
            planItems: [],
            recentEvents: [],
          },
          cookId: activeCook?.id ?? "",
        }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      setDiagnosis(data.reply ?? "");
    } catch (err) {
      console.error("Rescue request failed:", err);
      setDiagnosis("Lost the signal at the pit. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    setSelectedIssue("");
    setCustomIssue("");
    setHoursIn("");
    setAdditionalContext("");
    setDiagnosis("");
    setStep(1);
  };

  if (pageLoading) {
    return (
      <div style={{ padding: "var(--space-4)", fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
        Loading...
      </div>
    );
  }

  const isLocked = tier === "free" || tier === "basic";
  const diagnosisSections = diagnosis ? parseDiagnosis(diagnosis) : [];

  return (
    <div>
      <style>{`
        @keyframes logoPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .fix-issue-card:hover {
          border-color: rgba(201,151,58,0.4) !important;
        }
        .fix-issue-card:focus {
          outline: none;
        }
        .fix-nav-btn {
          background: transparent;
          border: 1px solid rgba(201,151,58,0.3);
          color: var(--color-text-muted);
          font-family: var(--font-ui);
          font-size: 0.8rem;
          padding: 6px 14px;
          border-radius: var(--radius-md);
          cursor: pointer;
          text-decoration: none;
          transition: border-color 0.12s, color 0.12s;
          display: inline-block;
          white-space: nowrap;
        }
        .fix-nav-btn:hover {
          border-color: #C9973A;
          color: #C9973A;
        }
        .fix-input:focus {
          outline: none;
          border-color: rgba(201,151,58,0.5);
        }
        .fix-select:focus {
          outline: none;
          border-color: rgba(201,151,58,0.5);
        }
      `}</style>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "var(--space-4) var(--space-4) 80px" }}>

        {/* HEADER */}
        <h1 style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(1.4rem, 3vw, 2rem)",
          color: "#F5E6C8",
          margin: "0 0 var(--space-1)",
          lineHeight: 1.2,
        }}>
          Pit Rescue Mode
        </h1>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.9rem",
          color: "var(--color-text-muted)",
          margin: "0 0 var(--space-3)",
        }}>
          Something went wrong. Tell the Preacher. Get the fix.
        </p>
        <div style={{ borderBottom: "1px solid rgba(201,151,58,0.3)", marginBottom: "var(--space-4)" }} />

        {/* LOCKED */}
        {isLocked && (
          <div style={{
            background: "var(--color-bg-alt)",
            border: "1px solid rgba(201,151,58,0.2)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4)",
            textAlign: "center",
          }}>
            <p style={{
              fontFamily: "var(--font-body)",
              color: "var(--color-text-muted)",
              margin: "0 0 var(--space-2)",
              fontSize: "0.95rem",
            }}>
              Pit Rescue Mode is available on Backyard and Pitmaster plans.
            </p>
            <Link href="/premium" style={{ fontFamily: "var(--font-ui)", color: "#C9973A", fontSize: "0.9rem" }}>
              Upgrade to unlock →
            </Link>
          </div>
        )}

        {/* STEP 1 — ISSUE GRID */}
        {!isLocked && step === 1 && (
          <>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "var(--space-2)",
              marginBottom: "var(--space-3)",
            }}>
              {ISSUES.map((issue) => (
                <button
                  key={issue.title}
                  className="fix-issue-card"
                  onClick={() => setSelectedIssue(issue.title)}
                  style={{
                    background: selectedIssue === issue.title ? "rgba(201,151,58,0.08)" : "var(--color-bg-alt)",
                    border: selectedIssue === issue.title
                      ? "2px solid #C9973A"
                      : "1px solid rgba(201,151,58,0.15)",
                    borderRadius: "var(--radius-lg)",
                    padding: "var(--space-3) var(--space-4)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "border-color 0.12s, background 0.12s",
                  }}
                >
                  <div style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 600,
                    color: "var(--color-text)",
                    fontSize: "0.95rem",
                  }}>
                    {issue.title}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-muted)",
                    fontSize: "0.8rem",
                    marginTop: "4px",
                  }}>
                    {issue.desc}
                  </div>
                </button>
              ))}
            </div>

            {selectedIssue === "Something else" && (
              <textarea
                className="fix-input"
                rows={3}
                value={customIssue}
                onChange={e => setCustomIssue(e.target.value)}
                placeholder="Describe what's happening at the pit..."
                style={{
                  width: "100%",
                  background: "var(--color-bg)",
                  border: "1px solid rgba(201,151,58,0.3)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-text)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.95rem",
                  padding: "10px 14px",
                  resize: "vertical",
                  marginBottom: "var(--space-3)",
                  boxSizing: "border-box",
                }}
              />
            )}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                disabled={!selectedIssue}
                onClick={() => setStep(2)}
                style={{
                  background: selectedIssue ? "#C9973A" : "rgba(201,151,58,0.3)",
                  color: selectedIssue ? "var(--color-bg)" : "rgba(201,151,58,0.5)",
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.95rem",
                  padding: "10px 24px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  cursor: selectedIssue ? "pointer" : "not-allowed",
                }}
              >
                Next →
              </button>
            </div>
          </>
        )}

        {/* STEP 2 — CONTEXT */}
        {!isLocked && step === 2 && (
          <>
            <label style={{
              display: "block",
              fontFamily: "var(--font-ui)",
              fontSize: "0.75rem",
              color: "#C9973A",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "var(--space-3)",
            }}>
              Give the Preacher some context
            </label>

            {/* Cook description */}
            <div style={{ marginBottom: "var(--space-3)" }}>
              {activeCook && !editingCookDesc ? (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  background: "var(--color-bg-alt)",
                  border: "1px solid rgba(201,151,58,0.2)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 14px",
                }}>
                  <span style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text)",
                    fontSize: "0.95rem",
                    flex: 1,
                  }}>
                    {cookDescription}
                  </span>
                  <button
                    onClick={() => setEditingCookDesc(true)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#C9973A",
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      padding: 0,
                      flexShrink: 0,
                    }}
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <input
                  className="fix-input"
                  type="text"
                  value={cookDescription}
                  onChange={e => setCookDescription(e.target.value)}
                  placeholder="Brisket, ribs, chicken..."
                  style={{
                    width: "100%",
                    background: "var(--color-bg)",
                    border: "1px solid rgba(201,151,58,0.3)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--color-text)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.95rem",
                    padding: "10px 14px",
                    boxSizing: "border-box",
                  }}
                />
              )}
            </div>

            {/* Hours into cook */}
            <div style={{ marginBottom: "var(--space-3)" }}>
              <select
                className="fix-select"
                value={hoursIn}
                onChange={e => setHoursIn(e.target.value)}
                style={{
                  width: "100%",
                  background: "var(--color-bg)",
                  border: "1px solid rgba(201,151,58,0.3)",
                  color: "var(--color-text)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.95rem",
                  padding: "8px",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <option value="" disabled>How far into the cook are you?</option>
                {HOURS_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Additional context */}
            <textarea
              className="fix-input"
              rows={2}
              value={additionalContext}
              onChange={e => setAdditionalContext(e.target.value)}
              placeholder="Pit temp, internal temp, weather, anything relevant..."
              style={{
                width: "100%",
                background: "var(--color-bg)",
                border: "1px solid rgba(201,151,58,0.3)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text)",
                fontFamily: "var(--font-body)",
                fontSize: "0.95rem",
                padding: "10px 14px",
                resize: "vertical",
                marginBottom: "var(--space-4)",
                boxSizing: "border-box",
              }}
            />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#C9973A",
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                ← Back
              </button>
              <button
                onClick={handleGetFix}
                style={{
                  background: "#C9973A",
                  color: "var(--color-bg)",
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.95rem",
                  padding: "10px 24px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Get the Fix →
              </button>
            </div>
          </>
        )}

        {/* STEP 3 — DIAGNOSIS */}
        {!isLocked && step === 3 && (
          <>
            {loading ? (
              <div style={{ textAlign: "center", padding: "var(--space-6) 0" }}>
                <img
                  src="/logo.jpeg"
                  alt=""
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid rgba(201,151,58,0.3)",
                    animation: "logoPulse 1.2s ease-in-out infinite",
                    display: "block",
                    margin: "0 auto var(--space-3)",
                  }}
                />
                <p style={{
                  fontFamily: "var(--font-body)",
                  fontStyle: "italic",
                  color: "var(--color-text-muted)",
                  margin: "0 0 var(--space-2)",
                }}>
                  The Preacher is diagnosing...
                </p>
                <div style={{ display: "flex", gap: "5px", justifyContent: "center" }}>
                  {([0, 0.3, 0.6] as number[]).map((delay, i) => (
                    <div
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#C9973A",
                        animation: "dotPulse 1.2s ease-in-out infinite",
                        animationDelay: `${delay}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {diagnosisSections.length > 0 ? (
                  diagnosisSections.map((section) => (
                    <div key={section.header}>
                      <div style={{
                        fontFamily: "var(--font-ui)",
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        color: "#C9973A",
                        letterSpacing: "0.15em",
                        marginTop: "var(--space-3)",
                        marginBottom: "var(--space-2)",
                      }}>
                        {section.header}
                      </div>
                      <div style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.95rem",
                        color: "var(--color-text)",
                        lineHeight: 1.7,
                      }}>
                        {section.header === "WHAT TO DO RIGHT NOW"
                          ? section.content.split("\n").map((line, idx) => {
                              const match = line.match(/^(\d+[.)]\s*)(.*)/);
                              if (match) {
                                return (
                                  <div key={idx} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                                    <span style={{
                                      fontFamily: "var(--font-ui)",
                                      fontWeight: 700,
                                      color: "#C9973A",
                                      flexShrink: 0,
                                    }}>
                                      {match[1]?.trim()}
                                    </span>
                                    <span>{match[2] ?? ''}</span>
                                  </div>
                                );
                              }
                              return line.trim()
                                ? <p key={idx} style={{ margin: "0 0 6px" }}>{line}</p>
                                : null;
                            })
                          : section.content
                        }
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.95rem",
                    color: "var(--color-text)",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                  }}>
                    {diagnosis}
                  </div>
                )}

                <div style={{
                  display: "flex",
                  gap: "var(--space-3)",
                  marginTop: "var(--space-5)",
                  flexWrap: "wrap",
                }}>
                  <button
                    onClick={handleStartOver}
                    style={{
                      background: "transparent",
                      border: "1px solid #C9973A",
                      color: "#C9973A",
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.9rem",
                      padding: "10px 20px",
                      borderRadius: "var(--radius-md)",
                      cursor: "pointer",
                    }}
                  >
                    Start Over
                  </button>
                  <Link
                    href={activeCook ? `/cook/${activeCook.id}/live` : "/dashboard"}
                    style={{
                      background: "#C9973A",
                      color: "var(--color-bg)",
                      fontFamily: "var(--font-ui)",
                      fontSize: "0.9rem",
                      padding: "10px 20px",
                      borderRadius: "var(--radius-md)",
                      textDecoration: "none",
                      display: "inline-block",
                    }}
                  >
                    Go to Live Mode →
                  </Link>
                </div>

                <p style={{
                  fontFamily: "var(--font-body)",
                  fontStyle: "italic",
                  color: "var(--color-text-muted)",
                  fontSize: "0.8rem",
                  marginTop: "var(--space-3)",
                }}>
                  Pit Rescue Mode gives you the immediate fix. Head to Live Mode to keep the conversation going.
                </p>
              </>
            )}
          </>
        )}
      </div>

      {/* STICKY BOTTOM BAR */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "var(--color-bg-alt)",
        borderTop: "1px solid rgba(201,151,58,0.2)",
        padding: "var(--space-2) var(--space-4)",
        display: "flex",
        justifyContent: "center",
        gap: "var(--space-3)",
        flexWrap: "wrap",
      }}>
        <Link href="/dashboard" className="fix-nav-btn">← Dashboard</Link>
        <Link href="/" className="fix-nav-btn">Start a Cook →</Link>
      </div>
    </div>
  );
}
