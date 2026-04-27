import { createServerClient } from "@/lib/supabase-server";
import { generateTimeline } from "./engine";
import Link from "next/link";
import Button from "@/components/Button";

export default async function TimelinePage({ params }) {
  const supabase = await createServerClient();
  const cookId = params.id;

  // Load cook
  const { data: cook, error: cookError } = await supabase
    .from("cooks")
    .select("*")
    .eq("id", cookId)
    .single();

  if (cookError || !cook) {
    return (
      <div style={{ padding: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Cook Not Found</h1>
      </div>
    );
  }

  // Load cook_items
  const { data: cookItems } = await supabase
    .from("cook_items")
    .select("*")
    .eq("cook_id", cookId);

  // Load cook_events
  const { data: cookEvents } = await supabase
    .from("cook_events")
    .select("*")
    .eq("cook_id", cookId)
    .order("created_at", { ascending: true });

  const items = cookItems || [];
  const events = cookEvents || [];
  const steps = generateTimeline(cook, items, events);

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ marginBottom: "var(--space-4)" }}>
        <Link href={`/cook/${cookId}`}>
          <Button>← Back to Cook</Button>
        </Link>
      </div>

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
        <p><strong>Cook:</strong> {cook.label}</p>
        <p><strong>Smoker:</strong> {cook.smoker_type || "Not specified"}</p>
        <p><strong>Wood:</strong> {cook.wood_type || "Not specified"}</p>
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

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        {steps.map((step, index) => (
          <div
            key={index}
            style={{
              background: "var(--color-bg-alt)",
              padding: "var(--space-3)",
              borderRadius: "var(--radius-md)",
              borderLeft: "4px solid var(--color-accent)",
            }}
          >
            <h3 style={{ fontFamily: "var(--font-ui)", marginBottom: "var(--space-1)" }}>
              {step.label}
            </h3>
            <p style={{ marginBottom: "var(--space-2)", color: "var(--color-text-muted)" }}>
              {step.detail}
            </p>
            <p style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
              {step.time.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
