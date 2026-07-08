"use client";

import { useEffect, useState } from "react";

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
  background: "rgba(201,151,58,0.04)",
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
        <li key={i} style={{ display: "flex", gap: "10px", padding: "6px 0", borderBottom: "1px solid rgba(201,151,58,0.08)", fontFamily: "var(--font-body)", fontSize: "0.875rem", color: "var(--color-text)", lineHeight: 1.6 }}>
          <span style={{ color, flexShrink: 0 }}>{bullet}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const PIT_TYPES = ["offset", "pellet", "kamado", "kettle", "drum", "cabinet", "electric"];

export default function PitProfilePanel({ initialPitType }: { initialPitType: string }) {
  const [pitType, setPitType] = useState(initialPitType || "offset");
  const [profile, setProfile] = useState<PitProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/pit-profile?pitType=${encodeURIComponent(pitType)}`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) {
          setError(`No tracked cooks found on a ${pitType} yet.`);
          setProfile(null);
        } else if (!res.ok) {
          setError("Could not load profile.");
        } else {
          setProfile(await res.json());
        }
        setLoading(false);
      })
      .catch(() => { if (!cancelled) { setError("Could not load profile."); setLoading(false); } });
    return () => { cancelled = true; };
  }, [pitType]);

  return (
    <div>
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginBottom: "var(--space-4)" }}>
        {PIT_TYPES.map(pit => (
          <button
            key={pit}
            onClick={() => setPitType(pit)}
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.75rem",
              padding: "5px 12px",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              border: pit === pitType ? "1px solid #C9973A" : "1px solid rgba(201,151,58,0.2)",
              color: pit === pitType ? "#C9973A" : "var(--color-text-muted)",
              background: pit === pitType ? "rgba(201,151,58,0.08)" : "transparent",
            }}
          >
            {capitalize(pit)}
          </button>
        ))}
      </div>

      {loading && <p style={{ ...mutedStyle, fontStyle: "italic" }}>Loading pit profile...</p>}

      {!loading && error && (
        <div style={cardStyle}>
          <p style={{ ...mutedStyle, fontStyle: "italic", margin: 0 }}>{error}</p>
          <p style={{ ...mutedStyle, margin: "var(--space-2) 0 0" }}>
            Complete the Cook Tracker after your next cook on this pit to build your profile.
          </p>
        </div>
      )}

      {!loading && profile && (
        <>
          <p style={{ ...mutedStyle, marginBottom: "var(--space-3)" }}>
            Based on {profile.cookCount} tracked cook{profile.cookCount !== 1 ? "s" : ""} on this pit.
          </p>

          <div style={{ ...cardStyle, borderLeft: "3px solid #C9973A" }}>
            <div style={labelStyle}>Heat Profile</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: "var(--space-3)" }}>
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
                  <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.05rem", color: "#F5E6C8", margin: 0 }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...cardStyle, borderColor: "rgba(45,106,79,0.3)" }}>
            <div style={{ ...labelStyle, color: "#2D6A4F" }}>Strengths</div>
            <BulletList items={profile.strengths} bullet="↑" color="#2D6A4F" />
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Weaknesses</div>
            <BulletList items={profile.weaknesses} />
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Stability</div>
            <BulletList items={profile.stability} bullet="◆" />
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Pit Quirks</div>
            <BulletList items={profile.quirks} bullet="◆" />
          </div>

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

          <div style={cardStyle}>
            <div style={labelStyle}>Weather Sensitivity</div>
            <BulletList items={profile.weatherSensitivity} bullet="◆" />
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Adjustment Patterns</div>
            <BulletList items={profile.adjustmentPatterns} bullet="◆" />
          </div>
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
