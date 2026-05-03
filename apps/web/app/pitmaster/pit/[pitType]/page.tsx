"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

interface PitProfile {
  pitType: string;
  stability: string[];
  quirks: string[];
  heatProfile: {
    averageLow: number;
    averageHigh: number;
    spikeFrequency: number;
    dipFrequency: number;
    stabilizationTime: number;
  };
  behaviorByMeat: Record<string, string[]>;
  weatherSensitivity: string[];
  adjustmentPatterns: string[];
  strengths: string[];
  weaknesses: string[];
  recommendedFireStrategy: string[];
  cookCount: number;
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
  if (items.length === 0) return (
    <p style={{ ...mutedStyle, fontStyle: "italic", margin: 0 }}>Not enough data yet.</p>
  );
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

const PIT_TYPES = ["offset", "pellet", "kamado", "kettle", "drum", "cabinet", "electric"];

export default function PitProfilePage({ params }: { params: Promise<{ pitType: string }> }) {
  const { pitType: rawPitType } = use(params);
  const pitType = decodeURIComponent(rawPitType).replace(/-/g, " ");
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<PitProfile | null>(null);
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
        const res = await fetch(`/api/pit-profile?pitType=${encodeURIComponent(pitType)}`);
        if (res.status === 404) {
          setError(`No tracked cooks found on a ${pitType} yet.`);
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
  }, [pitType]);

  if (loading) {
    return (
      <div style={{ padding: "40px", fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
        Loading pit profile...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "var(--space-5) var(--space-4)" }}>

      {/* Back nav */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <Link href="/pitmaster/trends" style={{ fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "var(--color-text-muted)", textDecoration: "none" }}>
          ← Trends
        </Link>
      </div>

      {/* Header */}
      <div style={{ marginBottom: "var(--space-5)" }}>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 6px" }}>
          Pitmaster · Pit Profile
        </p>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "#F5E6C8", margin: "0 0 var(--space-2)", lineHeight: 1.1 }}>
          {capitalize(pitType)}
        </h1>
        {profile && (
          <p style={mutedStyle}>
            Based on {profile.cookCount} tracked cook{profile.cookCount !== 1 ? "s" : ""} on this pit.
          </p>
        )}
      </div>

      {/* Pit type nav */}
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginBottom: "var(--space-4)" }}>
        {PIT_TYPES.map(pit => (
          <Link
            key={pit}
            href={`/pitmaster/pit/${encodeURIComponent(pit)}`}
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.75rem",
              padding: "5px 12px",
              borderRadius: "var(--radius-md)",
              textDecoration: "none",
              border: pit === pitType ? "1px solid #C9973A" : "1px solid rgba(201,151,58,0.2)",
              color: pit === pitType ? "#C9973A" : "var(--color-text-muted)",
              background: pit === pitType ? "rgba(201,151,58,0.08)" : "transparent",
            }}
          >
            {capitalize(pit)}
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
            Unlock Pitmaster Tier to view your personalized pit profiles.
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
            Complete the Cook Tracker after your next cook on this pit to build your profile.
          </p>
        </div>
      )}

      {/* Profile content */}
      {isPitmaster && profile && (
        <>
          {/* Heat Profile card */}
          <div style={{ ...cardStyle, borderLeft: "3px solid #C9973A" }}>
            <div style={labelStyle}>Heat Profile</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "var(--space-3)" }}>
              {[
                { label: "Avg Low", value: profile.heatProfile.averageLow > 0 ? `${profile.heatProfile.averageLow}°F` : "—" },
                { label: "Avg High", value: profile.heatProfile.averageHigh > 0 ? `${profile.heatProfile.averageHigh}°F` : "—" },
                { label: "Spikes / Cook", value: profile.heatProfile.spikeFrequency > 0 ? String(profile.heatProfile.spikeFrequency) : "0" },
                { label: "Dips / Cook", value: profile.heatProfile.dipFrequency > 0 ? String(profile.heatProfile.dipFrequency) : "0" },
                { label: "Stabilization", value: `${profile.heatProfile.stabilizationTime} min` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.65rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 4px" }}>
                    {label}
                  </p>
                  <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", color: "#F5E6C8", margin: 0 }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Two-column: Strengths + Weaknesses */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "var(--space-4)" }}>
            <div style={{ ...cardStyle, borderColor: "rgba(45,106,79,0.3)", marginBottom: 0 }}>
              <div style={{ ...labelStyle, color: "#2D6A4F" }}>Strengths</div>
              <BulletList items={profile.strengths} bullet="↑" color="#2D6A4F" />
            </div>
            <div style={{ ...cardStyle, marginBottom: 0 }}>
              <div style={labelStyle}>Weaknesses</div>
              <BulletList items={profile.weaknesses} />
            </div>
          </div>

          <div style={{ height: "var(--space-4)" }} />

          {/* Stability */}
          <div style={cardStyle}>
            <div style={labelStyle}>Stability</div>
            <BulletList items={profile.stability} bullet="◆" />
          </div>

          {/* Quirks */}
          <div style={cardStyle}>
            <div style={labelStyle}>Pit Quirks</div>
            <BulletList items={profile.quirks} bullet="◆" />
          </div>

          {/* Behavior by Meat */}
          {Object.keys(profile.behaviorByMeat).length > 0 && (
            <div style={cardStyle}>
              <div style={labelStyle}>Behavior by Meat</div>
              {Object.entries(profile.behaviorByMeat).map(([meat, insights]) => (
                <div key={meat} style={{ marginBottom: "var(--space-3)" }}>
                  <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "#C9973A", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 var(--space-1)" }}>
                    {capitalize(meat)}
                  </p>
                  <BulletList items={insights} bullet="—" />
                </div>
              ))}
            </div>
          )}

          {/* Weather Sensitivity */}
          <div style={cardStyle}>
            <div style={labelStyle}>Weather Sensitivity</div>
            <BulletList items={profile.weatherSensitivity} bullet="◆" />
          </div>

          {/* Adjustment Patterns */}
          <div style={cardStyle}>
            <div style={labelStyle}>Adjustment Patterns</div>
            <BulletList items={profile.adjustmentPatterns} bullet="◆" />
          </div>

          {/* Recommended Fire Strategy */}
          <div style={{ ...cardStyle, borderLeft: "3px solid #C9973A" }}>
            <div style={labelStyle}>Recommended Fire Strategy</div>
            <p style={{ ...mutedStyle, marginBottom: "var(--space-2)" }}>For your {pitType}:</p>
            <BulletList items={profile.recommendedFireStrategy} bullet="→" color="#2D6A4F" />
          </div>
        </>
      )}
    </div>
  );
}
