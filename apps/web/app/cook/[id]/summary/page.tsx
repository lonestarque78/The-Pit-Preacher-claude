import { supabase } from "@/lib/supabase";
import { generateTimeline } from "../timeline/engine";
import { preacherLine } from "../preacher/voice";
import { fireTip } from "../preacher/fire";
import { pitBehavior } from "../preacher/behavior";
import Button from "@/components/Button";

export default async function SummaryPage({ params }) {
  const cookId = params.id;

  const { data: cook } = await supabase
    .from("cooks")
    .select("*")
    .eq("id", cookId)
    .single();

  const { data: events } = await supabase
    .from("cook_events")
    .select("*")
    .eq("cook_id", cookId)
    .order("created_at", { ascending: true });

  const timeline = generateTimeline(cook, events || []);

  const finalLine = preacherLine({
    meat: cook.meat.toLowerCase(),
    pit: cook.pit.toLowerCase(),
    event: "summary",
    stall: false,
    temp: null,
    action: "summary",
  });

  const behavior = pitBehavior(events || []);

  const tempLogs = events
    .filter((e) => e.type === "temp_log")
    .map((e) => parseInt(e.note || "0"));

  const avgTemp =
    tempLogs.length > 0
      ? Math.floor(tempLogs.reduce((a, b) => a + b, 0) / tempLogs.length)
      : null;

  const fire = fireTip({
    pit: cook.pit,
    temp: avgTemp,
    phase: "summary",
  });

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-4)" }}>
        Cook Summary
      </h1>

      <p style={{ marginBottom: "var(--space-5)", fontStyle: "italic", opacity: 0.9 }}>
        {finalLine}
      </p>

      <div
        style={{
          background: "var(--color-bg-alt)",
          padding: "var(--space-4)",
          borderRadius: "var(--radius-lg)",
          marginBottom: "var(--space-5)",
        }}
      >
        <p><strong>Meat:</strong> {cook.meat}</p>
        <p><strong>Pit:</strong> {cook.pit}</p>
        <p><strong>Status:</strong> {cook.status}</p>
        <p><strong>Started:</strong> {new Date(cook.started_at).toLocaleString()}</p>
      </div>

      <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
        Pit Behavior
      </h2>

      <div
        style={{
          background: "var(--color-bg-alt)",
          padding: "var(--space-3)",
          borderRadius: "var(--radius-md)",
          marginBottom: "var(--space-5)",
        }}
      >
        <p>{behavior}</p>
      </div>

      <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
        Fire Management
      </h2>

      <div
        style={{
          background: "var(--color-bg-alt)",
          padding: "var(--space-3)",
          borderRadius: "var(--radius-md)",
          marginBottom: "var(--space-5)",
        }}
      >
        <p>{fire}</p>
      </div>

      <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
        Timeline Recap
      </h2>

      {timeline.map((step, index) => (
        <div
          key={index}
          style={{
            background: "var(--color-bg-alt)",
            padding: "var(--space-3)",
            borderRadius: "var(--radius-md)",
            marginBottom: "var(--space-3)",
            borderLeft: "4px solid var(--color-accent)",
          }}
        >
          <h3 style={{ fontFamily: "var(--font-ui)" }}>{step.label}</h3>
          <p>{step.detail}</p>
          <p style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
            {step.time.toLocaleString()}
          </p>
        </div>
      ))}

      <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
        Event Recap
      </h2>

      {events.map((event) => (
        <div
          key={event.id}
          style={{
            background: "var(--color-bg-alt)",
            padding: "var(--space-3)",
            borderRadius: "var(--radius-md)",
            marginBottom: "var(--space-3)",
            borderLeft: "4px solid var(--color-accent)",
          }}
        >
          <p><strong>{event.type}</strong></p>
          {event.note && <p>{event.note}</p>}
          <p style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
            {new Date(event.created_at).toLocaleString()}
          </p>
        </div>
      ))}

      <div style={{ height: "20px" }}></div>

      <Button
        onClick={() => {
          window.location.href = `/cook/${cookId}`;
        }}
      >
        Back to Cook
      </Button>
    </div>
  );
}
