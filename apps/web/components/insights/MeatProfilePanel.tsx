"use client";

import { useEffect, useState } from "react";

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

export default function MeatProfilePanel({ initialMeatType }: { initialMeatType: string }) {
  const [meatType, setMeatType] = useState(initialMeatType || "brisket");
  const [profile, setProfile] = useState<MeatProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/meat-profile?meatType=${encodeURIComponent(meatType)}`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) {
          setError(`No tracked ${meatType} cooks found yet.`);
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
  }, [meatType]);

  return (
    <div>
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap", marginBottom: "var(--space-4)" }}>
        {MEAT_TYPES.map(meat => (
          <button
            key={meat}
            onClick={() => setMeatType(meat)}
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.75rem",
              padding: "5px 12px",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              border: meat === meatType ? "1px solid #C9973A" : "1px solid rgba(201,151,58,0.2)",
              color: meat === meatType ? "#C9973A" : "var(--color-text-muted)",
              background: meat === meatType ? "rgba(201,151,58,0.08)" : "transparent",
            }}
          >
            {capitalize(meat)}
          </button>
        ))}
      </div>

      {loading && <p style={{ ...mutedStyle, fontStyle: "italic" }}>Loading profile...</p>}

      {!loading && error && (
        <div style={cardStyle}>
          <p style={{ ...mutedStyle, fontStyle: "italic", margin: 0 }}>{error}</p>
          <p style={{ ...mutedStyle, margin: "var(--space-2) 0 0" }}>
            Complete the Cook Tracker after your next {meatType} cook to build your profile.
          </p>
        </div>
      )}

      {!loading && profile && (
        <>
          <p style={{ ...mutedStyle, marginBottom: "var(--space-3)" }}>
            Based on {profile.cookCount} tracked {meatType} cook{profile.cookCount !== 1 ? "s" : ""}.
          </p>

          <div style={{ ...cardStyle, borderLeft: "3px solid #C9973A" }}>
            <div style={labelStyle}>Overall Average</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
              <span style={{
                fontFamily: "var(--font-heading)", fontSize: "2.4rem", lineHeight: 1,
                color: profile.outcomeAverages.overall >= 4 ? "#2D6A4F" : profile.outcomeAverages.overall >= 3 ? "#C9973A" : "#8B1A1A",
              }}>
                {profile.outcomeAverages.overall > 0 ? profile.outcomeAverages.overall : "—"}
              </span>
              {profile.outcomeAverages.overall > 0 && (
                <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.85rem", color: "var(--color-text-muted)", paddingBottom: "4px" }}>/5</span>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "var(--space-3)" }}>
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

          <div style={cardStyle}>
            <div style={labelStyle}>Timing Profile</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: "var(--space-3)" }}>
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
                  <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: "#F5E6C8", margin: 0 }}>
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
            <div style={labelStyle}>Your Tendencies</div>
            <BulletList items={profile.tendencies} bullet="◆" />
          </div>
          <div style={cardStyle}>
            <div style={labelStyle}>Pit Behavior</div>
            <BulletList items={profile.pitBehavior} bullet="◆" />
          </div>
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
