"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Below Average",
  3: "Solid",
  4: "Great",
  5: "Perfect",
};

function RatingSelector({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ marginBottom: "var(--space-3)" }}>
      <div style={{
        fontFamily: "var(--font-ui)",
        fontSize: "0.75rem",
        color: "var(--color-text-muted)",
        textTransform: "uppercase" as const,
        letterSpacing: "0.08em",
        marginBottom: "6px",
      }}>
        {label}
      </div>
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.6rem",
              cursor: "pointer",
              padding: "0 2px",
              color: star <= (hovered || value) ? "#C9973A" : "rgba(201,151,58,0.25)",
              transition: "color 0.1s",
            }}
          >
            {star <= (hovered || value) ? "★" : "☆"}
          </button>
        ))}
        {(hovered || value) > 0 && (
          <span style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.85rem",
            color: "#C9973A",
            marginLeft: "6px",
          }}>
            {RATING_LABELS[hovered || value]}
          </span>
        )}
      </div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "var(--font-ui)",
      fontSize: "0.75rem",
      color: "var(--color-text-muted)",
      textTransform: "uppercase" as const,
      letterSpacing: "0.08em",
      marginBottom: "6px",
    }}>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "var(--color-bg)",
  border: "1px solid rgba(201,151,58,0.3)",
  borderRadius: "var(--radius-md)",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
  fontSize: "0.9rem",
  boxSizing: "border-box",
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical" as const,
  minHeight: "80px",
};

const cardStyle: React.CSSProperties = {
  background: "var(--color-bg-alt)",
  border: "1px solid rgba(201,151,58,0.15)",
  borderRadius: "var(--radius-lg)",
  padding: "var(--space-4)",
  marginBottom: "var(--space-3)",
};

export default function CookTrackerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: cookId } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [screen, setScreen] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Screen 1 — Actual Times
  const [startTimeActual, setStartTimeActual] = useState("");
  const [finishTimeActual, setFinishTimeActual] = useState("");
  const [restTimeMinutes, setRestTimeMinutes] = useState("");

  // Screen 2 — Pit Behavior
  const [pitTempLow, setPitTempLow] = useState("");
  const [pitTempHigh, setPitTempHigh] = useState("");
  const [fireIssues, setFireIssues] = useState("");
  const [woodUsed, setWoodUsed] = useState("");
  const [weatherImpact, setWeatherImpact] = useState("");
  const [stallTimeMinutes, setStallTimeMinutes] = useState("");
  const [wrapTime, setWrapTime] = useState("");
  const [finalInternalTemp, setFinalInternalTemp] = useState("");
  const [adjustmentsMade, setAdjustmentsMade] = useState("");

  // Screen 3 — Outcome Ratings
  const [tenderness, setTenderness] = useState(0);
  const [barkQuality, setBarkQuality] = useState(0);
  const [moistureLevel, setMoistureLevel] = useState(0);
  const [smokeProfile, setSmokeProfile] = useState(0);
  const [flavorBalance, setFlavorBalance] = useState(0);
  const [overallSuccess, setOverallSuccess] = useState(0);

  // Screen 4 — Next-Time Notes
  const [note1, setNote1] = useState("");
  const [note2, setNote2] = useState("");
  const [note3, setNote3] = useState("");
  const [note4, setNote4] = useState("");
  const [note5, setNote5] = useState("");

  const handleSubmit = async () => {
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }

    const { error: outcomeError } = await supabase.from("cook_outcomes").insert({
      cook_id: cookId,
      user_id: user.id,
      start_time_actual: startTimeActual || null,
      finish_time_actual: finishTimeActual || null,
      rest_time_minutes: restTimeMinutes ? parseInt(restTimeMinutes) : null,
      pit_temp_low: pitTempLow ? parseInt(pitTempLow) : null,
      pit_temp_high: pitTempHigh ? parseInt(pitTempHigh) : null,
      fire_issues: fireIssues || null,
      wood_used: woodUsed || null,
      weather_impact: weatherImpact || null,
      stall_time_minutes: stallTimeMinutes ? parseInt(stallTimeMinutes) : null,
      wrap_time: wrapTime || null,
      final_internal_temp: finalInternalTemp ? parseInt(finalInternalTemp) : null,
      adjustments_made: adjustmentsMade || null,
      tenderness: tenderness || null,
      bark_quality: barkQuality || null,
      moisture_level: moistureLevel || null,
      smoke_profile: smokeProfile || null,
      flavor_balance: flavorBalance || null,
      overall_success: overallSuccess || null,
    });

    if (outcomeError) {
      console.error("Outcome insert error:", outcomeError);
      setSubmitting(false);
      return;
    }

    const { error: notesError } = await supabase.from("cook_tracker_notes").insert({
      cook_id: cookId,
      user_id: user.id,
      note_1: note1 || null,
      note_2: note2 || null,
      note_3: note3 || null,
      note_4: note4 || null,
      note_5: note5 || null,
      generated_suggestions: null,
    });

    if (notesError) {
      console.error("Notes insert error:", notesError);
      setSubmitting(false);
      return;
    }

    router.push(`/cook/${cookId}/summary`);
  };

  const SCREEN_TITLES = [
    "Actual Times",
    "Pit Behavior",
    "How Did It Turn Out",
    "Next Time",
  ];

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "var(--space-4)" }}>

      {/* Header */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <p style={{
          fontFamily: "var(--font-ui)",
          fontSize: "0.75rem",
          color: "#C9973A",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          margin: "0 0 6px",
        }}>
          Cook Tracker — {screen} of 4
        </p>
        <h1 style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(1.4rem, 3vw, 2rem)",
          color: "#F5E6C8",
          margin: 0,
          lineHeight: 1.1,
        }}>
          {SCREEN_TITLES[screen - 1]}
        </h1>

        {/* Progress bar */}
        <div style={{
          marginTop: "var(--space-2)",
          height: "3px",
          background: "rgba(201,151,58,0.15)",
          borderRadius: "2px",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${(screen / 4) * 100}%`,
            background: "#C9973A",
            borderRadius: "2px",
            transition: "width 0.3s ease",
          }} />
        </div>
      </div>

      {/* Screen 1 — Actual Times */}
      {screen === 1 && (
        <div style={cardStyle}>
          <div style={{ marginBottom: "var(--space-3)" }}>
            <FieldLabel>Actual Start Time</FieldLabel>
            <input
              type="datetime-local"
              value={startTimeActual}
              onChange={e => setStartTimeActual(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: "var(--space-3)" }}>
            <FieldLabel>Actual Finish Time</FieldLabel>
            <input
              type="datetime-local"
              value={finishTimeActual}
              onChange={e => setFinishTimeActual(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <FieldLabel>Rest Time (minutes)</FieldLabel>
            <input
              type="number"
              value={restTimeMinutes}
              onChange={e => setRestTimeMinutes(e.target.value)}
              placeholder="e.g. 60"
              style={inputStyle}
            />
          </div>
        </div>
      )}

      {/* Screen 2 — Pit Behavior */}
      {screen === 2 && (
        <div style={cardStyle}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
            <div>
              <FieldLabel>Pit Temp Low (°F)</FieldLabel>
              <input
                type="number"
                value={pitTempLow}
                onChange={e => setPitTempLow(e.target.value)}
                placeholder="225"
                style={inputStyle}
              />
            </div>
            <div>
              <FieldLabel>Pit Temp High (°F)</FieldLabel>
              <input
                type="number"
                value={pitTempHigh}
                onChange={e => setPitTempHigh(e.target.value)}
                placeholder="275"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
            <div>
              <FieldLabel>Stall Time (minutes)</FieldLabel>
              <input
                type="number"
                value={stallTimeMinutes}
                onChange={e => setStallTimeMinutes(e.target.value)}
                placeholder="e.g. 90"
                style={inputStyle}
              />
            </div>
            <div>
              <FieldLabel>Final Internal Temp (°F)</FieldLabel>
              <input
                type="number"
                value={finalInternalTemp}
                onChange={e => setFinalInternalTemp(e.target.value)}
                placeholder="203"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginBottom: "var(--space-3)" }}>
            <FieldLabel>Wood Used</FieldLabel>
            <input
              type="text"
              value={woodUsed}
              onChange={e => setWoodUsed(e.target.value)}
              placeholder="e.g. oak, hickory, cherry"
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "var(--space-3)" }}>
            <FieldLabel>Wrap Time</FieldLabel>
            <input
              type="datetime-local"
              value={wrapTime}
              onChange={e => setWrapTime(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: "var(--space-3)" }}>
            <FieldLabel>Fire Issues</FieldLabel>
            <textarea
              value={fireIssues}
              onChange={e => setFireIssues(e.target.value)}
              placeholder="Temp spikes, stall issues, dirty smoke..."
              style={textareaStyle}
            />
          </div>

          <div style={{ marginBottom: "var(--space-3)" }}>
            <FieldLabel>Weather Impact</FieldLabel>
            <input
              type="text"
              value={weatherImpact}
              onChange={e => setWeatherImpact(e.target.value)}
              placeholder="e.g. cold wind, rain, humid"
              style={inputStyle}
            />
          </div>

          <div>
            <FieldLabel>Adjustments Made</FieldLabel>
            <textarea
              value={adjustmentsMade}
              onChange={e => setAdjustmentsMade(e.target.value)}
              placeholder="What did you change mid-cook and why..."
              style={textareaStyle}
            />
          </div>
        </div>
      )}

      {/* Screen 3 — Outcome Ratings */}
      {screen === 3 && (
        <div style={cardStyle}>
          <RatingSelector label="Tenderness" value={tenderness} onChange={setTenderness} />
          <RatingSelector label="Bark Quality" value={barkQuality} onChange={setBarkQuality} />
          <RatingSelector label="Moisture Level" value={moistureLevel} onChange={setMoistureLevel} />
          <RatingSelector label="Smoke Profile" value={smokeProfile} onChange={setSmokeProfile} />
          <RatingSelector label="Flavor Balance" value={flavorBalance} onChange={setFlavorBalance} />
          <RatingSelector label="Overall Success" value={overallSuccess} onChange={setOverallSuccess} />
        </div>
      )}

      {/* Screen 4 — Next-Time Notes */}
      {screen === 4 && (
        <div style={cardStyle}>
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            color: "var(--color-text-muted)",
            fontStyle: "italic",
            marginTop: 0,
            marginBottom: "var(--space-3)",
          }}>
            What would you do differently next time? Be specific.
          </p>
          {[
            { label: "Note 1", value: note1, setter: setNote1 },
            { label: "Note 2", value: note2, setter: setNote2 },
            { label: "Note 3", value: note3, setter: setNote3 },
            { label: "Note 4 (optional)", value: note4, setter: setNote4 },
            { label: "Note 5 (optional)", value: note5, setter: setNote5 },
          ].map(({ label, value, setter }) => (
            <div key={label} style={{ marginBottom: "var(--space-2)" }}>
              <FieldLabel>{label}</FieldLabel>
              <input
                type="text"
                value={value}
                onChange={e => setter(e.target.value)}
                placeholder="e.g. Start fire 30 minutes earlier"
                style={inputStyle}
              />
            </div>
          ))}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "space-between" }}>
        {screen > 1 ? (
          <button
            onClick={() => setScreen(s => s - 1)}
            style={{
              background: "transparent",
              border: "1px solid rgba(201,151,58,0.3)",
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-ui)",
              fontSize: "0.85rem",
              padding: "10px 20px",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
            }}
          >
            ← Back
          </button>
        ) : (
          <button
            onClick={() => router.push(`/cook/${cookId}/summary`)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-text-muted)",
              fontFamily: "var(--font-ui)",
              fontSize: "0.85rem",
              padding: "10px 0",
              cursor: "pointer",
            }}
          >
            Skip →
          </button>
        )}

        {screen < 4 ? (
          <button
            onClick={() => setScreen(s => s + 1)}
            style={{
              background: "#C9973A",
              border: "none",
              color: "var(--color-bg)",
              fontFamily: "var(--font-ui)",
              fontSize: "0.85rem",
              padding: "10px 24px",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
            }}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              background: "#C9973A",
              border: "none",
              color: "var(--color-bg)",
              fontFamily: "var(--font-ui)",
              fontSize: "0.85rem",
              padding: "10px 24px",
              borderRadius: "var(--radius-md)",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Saving..." : "Save & Finish ✦"}
          </button>
        )}
      </div>
    </div>
  );
}
