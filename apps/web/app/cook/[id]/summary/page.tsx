// PATCH — add to apps/web/app/cook/[id]/summary/page.tsx
// This adds tracker data detection and display. Do NOT remove existing content.

// ─────────────────────────────────────────────
// 1. ADD these state variables near the other useState declarations:
//
//   const [outcome, setOutcome] = useState<any>(null);
//   const [trackerNotes, setTrackerNotes] = useState<any>(null);
//
// ─────────────────────────────────────────────
// 2. ADD these queries inside loadData(), after the existing queries:

const [outcomeResult, trackerNotesResult] = await Promise.all([
  supabase.from("cook_outcomes").select("*").eq("cook_id", cookId).maybeSingle(),
  supabase.from("cook_tracker_notes").select("*").eq("cook_id", cookId).maybeSingle(),
]);
setOutcome(outcomeResult.data);
setTrackerNotes(trackerNotesResult.data);

// ─────────────────────────────────────────────
// 3. ADD this section in the LEFT COLUMN, after the Preacher Reflection card:

{(outcome || trackerNotes) && (
  <div style={{ marginTop: "var(--space-3)" }}>

    {/* Tracker header */}
    <div style={{
      fontFamily: "var(--font-ui)",
      fontSize: "0.75rem",
      color: "#C9973A",
      textTransform: "uppercase",
      letterSpacing: "0.15em",
      marginBottom: "var(--space-3)",
    }}>
      Cook Tracker
    </div>

    {/* Actual Times */}
    {outcome && (outcome.start_time_actual || outcome.finish_time_actual || outcome.rest_time_minutes) && (
      <div style={{ ...cardStyle, marginBottom: "var(--space-3)" }}>
        <div style={{
          fontFamily: "var(--font-ui)",
          fontSize: "0.7rem",
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: "var(--space-2)",
        }}>
          Actual Times
        </div>
        {[
          { label: "Start", value: outcome.start_time_actual ? new Date(outcome.start_time_actual).toLocaleString() : null },
          { label: "Finish", value: outcome.finish_time_actual ? new Date(outcome.finish_time_actual).toLocaleString() : null },
          { label: "Rest", value: outcome.rest_time_minutes ? `${outcome.rest_time_minutes} min` : null },
        ].filter(r => r.value).map(({ label, value }) => (
          <div key={label} style={{
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "1px solid rgba(201,151,58,0.08)",
            padding: "var(--space-1) 0",
          }}>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>{label}</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text)" }}>{value}</span>
          </div>
        ))}
      </div>
    )}

    {/* Pit Behavior */}
    {outcome && (outcome.pit_temp_low || outcome.pit_temp_high || outcome.wood_used || outcome.fire_issues || outcome.weather_impact || outcome.stall_time_minutes || outcome.final_internal_temp || outcome.adjustments_made) && (
      <div style={{ ...cardStyle, marginBottom: "var(--space-3)" }}>
        <div style={{
          fontFamily: "var(--font-ui)",
          fontSize: "0.7rem",
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: "var(--space-2)",
        }}>
          Pit Behavior
        </div>
        {[
          { label: "Temp Range", value: outcome.pit_temp_low && outcome.pit_temp_high ? `${outcome.pit_temp_low}°F – ${outcome.pit_temp_high}°F` : null },
          { label: "Wood", value: outcome.wood_used },
          { label: "Stall", value: outcome.stall_time_minutes ? `${outcome.stall_time_minutes} min` : null },
          { label: "Final Temp", value: outcome.final_internal_temp ? `${outcome.final_internal_temp}°F` : null },
          { label: "Weather", value: outcome.weather_impact },
          { label: "Fire Issues", value: outcome.fire_issues },
          { label: "Adjustments", value: outcome.adjustments_made },
        ].filter(r => r.value).map(({ label, value }) => (
          <div key={label} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "var(--space-2)",
            borderBottom: "1px solid rgba(201,151,58,0.08)",
            padding: "var(--space-1) 0",
          }}>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase", flexShrink: 0 }}>{label}</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text)", textAlign: "right" }}>{value}</span>
          </div>
        ))}
      </div>
    )}

    {/* Outcome Ratings */}
    {outcome && (outcome.tenderness || outcome.bark_quality || outcome.moisture_level || outcome.smoke_profile || outcome.flavor_balance || outcome.overall_success) && (
      <div style={{ ...cardStyle, marginBottom: "var(--space-3)" }}>
        <div style={{
          fontFamily: "var(--font-ui)",
          fontSize: "0.7rem",
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: "var(--space-2)",
        }}>
          Outcome
        </div>
        {[
          { label: "Tenderness", value: outcome.tenderness },
          { label: "Bark", value: outcome.bark_quality },
          { label: "Moisture", value: outcome.moisture_level },
          { label: "Smoke", value: outcome.smoke_profile },
          { label: "Flavor", value: outcome.flavor_balance },
          { label: "Overall", value: outcome.overall_success },
        ].filter(r => r.value).map(({ label, value }) => (
          <div key={label} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(201,151,58,0.08)",
            padding: "var(--space-1) 0",
          }}>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>{label}</span>
            <span style={{ color: "#C9973A", fontSize: "0.9rem" }}>
              {"★".repeat(value)}{"☆".repeat(5 - value)}
            </span>
          </div>
        ))}
      </div>
    )}

    {/* Next-Time Notes */}
    {trackerNotes && [trackerNotes.note_1, trackerNotes.note_2, trackerNotes.note_3, trackerNotes.note_4, trackerNotes.note_5].some(Boolean) && (
      <div style={cardStyle}>
        <div style={{
          fontFamily: "var(--font-ui)",
          fontSize: "0.7rem",
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: "var(--space-2)",
        }}>
          Next Time
        </div>
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {[trackerNotes.note_1, trackerNotes.note_2, trackerNotes.note_3, trackerNotes.note_4, trackerNotes.note_5]
            .filter(Boolean)
            .map((note: string, i: number) => (
              <li key={i} style={{
                display: "flex",
                gap: "var(--space-2)",
                fontFamily: "var(--font-body)",
                fontSize: "0.875rem",
                color: "var(--color-text)",
                padding: "var(--space-1) 0",
                borderBottom: "1px solid rgba(201,151,58,0.08)",
              }}>
                <span style={{ color: "#C9973A", flexShrink: 0 }}>—</span>
                <span>{note}</span>
              </li>
            ))}
        </ul>
      </div>
    )}
  </div>
)}
