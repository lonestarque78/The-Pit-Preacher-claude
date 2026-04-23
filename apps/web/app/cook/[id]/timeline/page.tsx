import { supabase } from "@/lib/supabase";
import { generateTimeline } from "./engine";
import { preacherLine } from "../../preacher/voice";

export default async function TimelinePage({ params }) {
  const cookId = params.id;

  // Load cook
  const { data: cook } = await supabase
    .from("cooks")
    .select("*")
    .eq("id", cookId)
    .single();

  // Load events
  const { data: events } = await supabase
    .from("cook_events")
    .select("*")
    .eq("cook_id", cookId)
    .order("created_at", { ascending: true });

  const steps = generateTimeline(cook, events || []);

  return (
    <div style={{ padding: "40px" }}>
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          marginBottom: "var(--space-4)",
        }}
      >
        Timeline
      </h1>

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
      </div>

      <h2
        style={{
          fontFamily: "var(--font-heading)",
          marginBottom: "var(--space-3)",
        }}
      >
        Steps
      </h2>

      {steps.map((step, index) => {
        const line = preacherLine({
          meat: cook.meat.toLowerCase(),
          pit: cook.pit.toLowerCase(),
          event: step.label.toLowerCase(),
          stall: false,
          temp: null,
          action: step.label.toLowerCase(),
        });

        return (
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
            <p style={{ marginBottom: "var(--space-1)" }}>{step.detail}</p>

            <p
              style={{
                marginBottom: "var(--space-2)",
                fontStyle: "italic",
                opacity: 0.9,
              }}
            >
              {line}
            </p>

            <p style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
              {step.time.toLocaleString()}
            </p>
          </div>
        );
      })}
    </div>
  );
}
