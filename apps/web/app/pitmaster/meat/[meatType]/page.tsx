"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

interface MeatProfile {
  meatType: string;
  strengths: string[];
  weaknesses: string[];
  tendencies: string[];
  timingProfile: {
    averageCookTime: number;
    averageStallTime: number;
    averageWrapTime: string | null;
    averageRestTime: number;
  };
  pitBehavior: string[];
  outcomeAverages: {
    tenderness: number;
    bark: number;
    moisture: number;
    smoke: number;
    flavor: number;
    overall: number;
  };
  recommendedStrategy: string[];
  cookCount: number;
}

function minutesToDisplay(min: number): string {
  if (min === 0) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const cardStyle: React.CSSProperties = {
  background: "var(--color-bg-alt)",
  border: "1px solid rgba(201,151,58,0.15)",
  borderRadius: "var(--radius-lg)",
  padding: "var(--space-4)",
  marginBottom: "var(--space-4)",
};

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: "0.7rem",
  color: "#C9973A",
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  marginBottom: "var(--space-2)",
};

const bodyStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "0.875rem",
  color: "var(--color-text)",
  lineHeight: 1.6,
};

const mutedStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "0.875rem",
  color: "var(--color-text-muted)",
  lineHeight: 1.5,
};

function BulletList({ items, bullet = "—", color = "#C9973A" }: { items: string[]; bullet?: string; color?: string }) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: "flex", gap: "10px", padding: "6px 0", borderBottom: "1px solid rgba(201,151,58,0.08)", ...bodyStyle }}>
          <span style={{ color, flexShrink: 0 }}>{bullet}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ marginBottom: "var(--space-2)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {label}
        </span>
        <span style={{ fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "#C9973A" }}>
          {value > 0 ? `${value}/5` : "—"}
        </span>
      </div>
      <div style={{ height: "4px", background: "rgba(201,151,58,0.15)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: value > 0 ? `${(value / 5) * 100}%` : "0%",
          background: value >= 4 ? "#2D6A4F" : value >= 3 ? "#C9973A" : "#8B1A1A",
          borderRadius: "2px",
        }} />
      </div>
    </div>
  );
}

const MEAT_TYPES = ["brisket", "ribs", "pork shoulder", "chicken", "turkey"];

export default function MeatProfilePage({ params }: { params: Promise<{ meatType: string }> }) {
  const { meatType: rawMeatType } = use(params);
  const meatType = decodeURIComponent(rawMeatType).replace(/-/g, " ");
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<MeatProfile | null>(null);
  const [isPitmaster, setIsPitmaster] = useState(false);
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

      const tier = sub?.tier ?? "free";
      const pitmaster = tier === "pitmaster";
      setIsPitmaster(pitmaster);

      if (!pitmaster) { setLoading(false); return; }

      try {
        const res = await fetch(`/api/meat-profile?meatType=${encodeURIComponent(meatType)}`);
        if (res.status === 404) {
          setError(`No tracked ${meatType} cooks found yet.`);
        } else if (!res.ok) {
          setError("Could not load profile.");
        } else {
          const data = await res.json();
          setProfile(data);
        }
      } catch {
        setError("Could not load profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [meatType]);

  if (loading) {
    return (
      <div style={{ padding: "40px", fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
        Loading profile...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "var(--space-5) var(--space-4)" }}>

      {/* Header */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <Link href="/pitmaster/trends" style={{ fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "var(--color-text-muted)", textDecoration: "none" }}>
          ← Trends
        </Link>
      </div>

      <div style={{ marginBottom: "var(--space-5)" }}>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 6px" }}>
          Pitmaster · Meat Profile
        </p>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "#F5E6C8", margin: "0 0 var(--space-2)", lineHeight: 1.1 }}>
          {capitalize(meatType)}
        </h1>
        {profile && (
          <p style={mutedStyle}>
            Based on {profile.cookCount} tracked {meatType} cook{profile.cookCount !== 1 ? "s" : ""}.
          </p>
        )}
      </div>

      {/* Meat type nav */}
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginBottom: "var(--space-4)" }}>
        {MEAT_TYPES.map(meat => (
          <Link
            key={meat}
            href={`/pitmaster/meat/${encodeURIComponent(meat.replace(/ /g, "-"))}`}
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.75rem",
              padding: "5px 12px",
              borderRadius: "var(--radius-md)",
              textDecoration: "none",
              border: meat === meatType ? "1px solid #C9973A" : "1px solid rgba(201,151,58,0.2)",
              color: meat === meatType ? "#C9973A" : "var(--color-text-muted)",
              background: meat === meatType ? "rgba(201,151,58,0.08)" : "transparent",
            }}
          >
            {capitalize(meat)}
          </Link>
        ))}
      </div>

      {/* Premium gate */}
      {!isPitmaster && (
        <div style={{ ...cardStyle, textAlign: "center", padding: "var(--space-6)" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: "var(--space-2)" }}>🔒</div>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", color: "#F5E6C8", margin: "0 0 var(--space-2)" }}>
            Pitmaster Tier Required
          </h2>
          <p style={{ ...mutedStyle, marginBottom: "var(--space-4)" }}>
            Unlock Pitmaster Tier to view your personalized meat profiles.
          </p>
          <Link href="/premium" style={{
            background: "#C9973A", color: "var(--color-bg)",
            fontFamily: "var(--font-ui)", fontSize: "0.85rem",
            padding: "10px 24px", borderRadius: "var(--radius-md)", textDecoration: "none",
          }}>
            Upgrade to Pitmaster
          </Link>
        </div>
      )}

      {/* Error state */}
      {isPitmaster && error && (
        <div style={cardStyle}>
          <p style={{ ...mutedStyle, fontStyle: "italic", margin: 0 }}>{error}</p>
          <p style={{ ...mutedStyle, margin: "var(--space-2) 0 0" }}>
            Complete the Cook Tracker after your next {meatType} cook to build your profile.
          </p>
        </div>
      )}

      {/* Profile content */}
      {isPitmaster && profile && (
        <>
          {/* Overview card */}
          <div style={{ ...cardStyle, borderLeft: "3px solid #C9973A" }}>
            <div style={labelStyle}>Overall Average</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
              <span style={{
                fontFamily: "var(--font-heading)", fontSize: "3rem", lineHeight: 1,
                color: profile.outcomeAverages.overall >= 4 ? "#2D6A4F" : profile.outcomeAverages.overall >= 3 ? "#C9973A" : "#8B1A1A",
              }}>
                {profile.outcomeAverages.overall > 0 ? profile.outcomeAverages.overall : "—"}
              </span>
              {profile.outcomeAverages.overall > 0 && (
                <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.9rem", color: "var(--color-text-muted)", paddingBottom: "6px" }}>/5</span>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--space-3)" }}>
              <div>
                <RatingBar label="Tenderness" value={profile.outcomeAverages.tenderness} />
                <RatingBar label="Bark" value={profile.outcomeAverages.bark} />
                <RatingBar label="Moisture" value={profile.outcomeAverages.moisture} />
              </div>
              <div>
                <RatingBar label="Smoke" value={profile.outcomeAverages.smoke} />
                <RatingBar label="Flavor" value={profile.outcomeAverages.flavor} />
              </div>
            </div>
          </div>

          {/* Timing */}
          <div style={cardStyle}>
            <div style={labelStyle}>Timing Profile</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "var(--space-3)" }}>
              {[
                { label: "Avg Cook Time", value: minutesToDisplay(profile.timingProfile.averageCookTime) },
                { label: "Avg Stall", value: minutesToDisplay(profile.timingProfile.averageStallTime) },
                { label: "Avg Rest", value: minutesToDisplay(profile.timingProfile.averageRestTime) },
                { label: "Typical Wrap", value: profile.timingProfile.averageWrapTime ?? "—" },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.65rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>
                    {label}
                  </p>
                  <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.3rem", color: "#F5E6C8", margin: 0 }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Two-column grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "var(--space-4)" }}>
            <div style={{ ...cardStyle, borderColor: "rgba(45,106,79,0.3)", marginBottom: 0 }}>
              <div style={{ ...labelStyle, color: "#2D6A4F" }}>Strengths</div>
              <BulletList items={profile.strengths} bullet="↑" color="#2D6A4F" />
            </div>
            <div style={{ ...cardStyle, borderColor: "rgba(201,151,58,0.35)", marginBottom: 0 }}>
              <div style={labelStyle}>Weaknesses</div>
              <BulletList items={profile.weaknesses} bullet="—" />
            </div>
          </div>

          <div style={{ height: "var(--space-4)" }} />

          {/* Tendencies */}
          <div style={cardStyle}>
            <div style={labelStyle}>Your Tendencies</div>
            <BulletList items={profile.tendencies} bullet="◆" />
          </div>

          {/* Pit Behavior */}
          <div style={cardStyle}>
            <div style={labelStyle}>Pit Behavior</div>
            <BulletList items={profile.pitBehavior} bullet="◆" />
          </div>

          {/* Recommended Strategy */}
          <div style={{ ...cardStyle, borderLeft: "3px solid #C9973A" }}>
            <div style={labelStyle}>Recommended Strategy</div>
            <p style={{ ...mutedStyle, marginBottom: "var(--space-2)" }}>For your next {meatType}:</p>
            <BulletList items={profile.recommendedStrategy} bullet="→" color="#2D6A4F" />
          </div>
        </>
      )}
    </div>
  );
}
