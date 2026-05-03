"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import PitmasterInsightsOverlay from "@/components/insights/PitmasterInsightsOverlay";

interface TrendsResult {
  consistency: string[];
  pitBehavior: string[];
  meatSpecific: string[];
  improvements: string[];
  weaknesses: string[];
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
  background: "var(--color-bg-alt)",
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

export default function TrendsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [trends, setTrends] = useState<TrendsResult | null>(null);
  const [tier, setTier] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("tier")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      const userTier = sub?.tier ?? "free";
      setTier(userTier);

      if (userTier !== "pitmaster") {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/trends");
        if (!res.ok) throw new Error("Failed to load trends");
        const data = await res.json();
        setTrends(data);
      } catch (err) {
        setError("Could not load trends. Try again.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const isPitmaster = tier === "pitmaster";

  if (loading) {
    return (
      <div style={{ padding: "40px", fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
        Loading trends...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "var(--space-5) var(--space-4)" }}>

      {/* Header */}
      <div style={{ marginBottom: "var(--space-5)" }}>
        <p style={{
          fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#C9973A",
          textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 6px",
        }}>
          Pitmaster Tier
        </p>
        <h1 style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
          color: "#F5E6C8", margin: "0 0 var(--space-2)", lineHeight: 1.1,
        }}>
          Trend Analysis
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text-muted)", margin: "0 0 var(--space-3)" }}>
          Your long-term cooking patterns across all tracked cooks.
        </p>
        <PitmasterInsightsOverlay
          isPitmaster={isPitmaster}
        />
      </div>

      {/* Premium gate */}
      {!isPitmaster && (
        <div style={{
          position: "relative",
          background: "var(--color-bg-alt)",
          border: "1px solid rgba(201,151,58,0.2)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-6)",
          textAlign: "center",
        }}>
          <div style={{
            fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#C9973A",
            textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "var(--space-2)",
          }}>
            🔒 Pitmaster Tier Required
          </div>
          <h2 style={{
            fontFamily: "var(--font-heading)", fontSize: "1.4rem",
            color: "#F5E6C8", margin: "0 0 var(--space-3)",
          }}>
            Unlock your long-term cooking trends
          </h2>
          <p style={{
            fontFamily: "var(--font-body)", fontSize: "0.9rem",
            color: "var(--color-text-muted)", margin: "0 0 var(--space-4)", lineHeight: 1.6,
          }}>
            See how your consistency, bark quality, tenderness, and pit behavior trend across every cook you've tracked.
          </p>
          <Link href="/premium" style={{
            display: "inline-block",
            background: "#C9973A", color: "var(--color-bg)",
            fontFamily: "var(--font-ui)", fontSize: "0.85rem",
            padding: "12px 24px", borderRadius: "var(--radius-md)",
            textDecoration: "none", letterSpacing: "0.05em",
          }}>
            Upgrade to Pitmaster
          </Link>
        </div>
      )}

      {/* Error state */}
      {isPitmaster && error && (
        <div style={{ ...cardStyle, borderColor: "rgba(139,26,26,0.3)" }}>
          <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)", margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Trends content */}
      {isPitmaster && trends && (
        <>
          {/* Trend Overview */}
          <div style={{
            ...cardStyle,
            borderLeft: "3px solid #C9973A",
            marginBottom: "var(--space-5)",
          }}>
            <div style={sectionLabelStyle}>Trend Overview</div>
            {trends.improvements.length > 0 ? (
              <p style={{
                fontFamily: "var(--font-heading)", fontStyle: "italic",
                fontSize: "1.1rem", color: "#F5E6C8", margin: 0, lineHeight: 1.5,
              }}>
                {trends.improvements[0]}
              </p>
            ) : (
              <p style={{
                fontFamily: "var(--font-body)", fontSize: "0.9rem",
                color: "var(--color-text-muted)", margin: 0, fontStyle: "italic",
              }}>
                Track more cooks to generate your trend overview.
              </p>
            )}
          </div>

          {/* Two column grid on desktop */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: "var(--space-4)",
          }}>

            {/* Consistency */}
            <div style={cardStyle}>
              <div style={sectionLabelStyle}>Consistency</div>
              <InsightList items={trends.consistency} bullet="◆" color="#C9973A" />
            </div>

            {/* Pit Behavior */}
            <div style={cardStyle}>
              <div style={sectionLabelStyle}>Pit Behavior</div>
              <InsightList items={trends.pitBehavior} bullet="◆" color="#C9973A" />
            </div>

            {/* Meat-Specific */}
            <div style={cardStyle}>
              <div style={sectionLabelStyle}>Meat-Specific</div>
              <InsightList items={trends.meatSpecific} bullet="◆" color="#C9973A" />
            </div>

            {/* Improvements */}
            <div style={{ ...cardStyle, borderColor: "rgba(45,106,79,0.3)" }}>
              <div style={{ ...sectionLabelStyle, color: "#2D6A4F" }}>Improvements</div>
              <InsightList items={trends.improvements} bullet="↑" color="#2D6A4F" />
            </div>

          </div>

          {/* Weaknesses — full width */}
          <div style={{ ...cardStyle, borderColor: "rgba(201,151,58,0.35)", marginTop: "var(--space-2)" }}>
            <div style={{ ...sectionLabelStyle, color: "#C9973A" }}>Persistent Weaknesses</div>
            <InsightList items={trends.weaknesses} bullet="—" color="#C9973A" />
          </div>

          {/* Back link */}
          <div style={{ marginTop: "var(--space-4)" }}>
            <Link href="/dashboard" style={{
              fontFamily: "var(--font-ui)", fontSize: "0.8rem",
              color: "var(--color-text-muted)", textDecoration: "none",
            }}>
              ← Back to Dashboard
            </Link>
          </div>
        </>
      )}

      {/* No data state */}
      {isPitmaster && !trends && !error && (
        <div style={cardStyle}>
          <p style={{
            fontFamily: "var(--font-body)", fontSize: "0.875rem",
            color: "var(--color-text-muted)", margin: 0, fontStyle: "italic",
          }}>
            No tracked cook data found. Complete and track at least 3 cooks to generate trend analysis.
          </p>
        </div>
      )}
    </div>
  );
}
