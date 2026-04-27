import { createServerClient } from "@/lib/supabase-server";
import Button from "@/components/Button";
import Link from "next/link";

export default async function CookDashboardPage({ params }) {
  const supabase = await createServerClient();
  const cookId = params.id;

  // Load cook record
  const { data: cook, error: cookError } = await supabase
    .from("cooks")
    .select("*")
    .eq("id", cookId)
    .single();

  if (cookError || !cook) {
    return (
      <div style={{ padding: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Cook Not Found</h1>
        <p>We couldn't find this cook.</p>
      </div>
    );
  }

  // Load cook_items for this cook
  const { data: cookItems } = await supabase
    .from("cook_items")
    .select("*")
    .eq("cook_id", cookId);

  // Load cook_steps for this cook
  const { data: cookSteps } = await supabase
    .from("cook_steps")
    .select("*")
    .eq("cook_id", cookId)
    .order("step_number", { ascending: true });

  return (
    <div style={{ padding: "40px" }}>
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          marginBottom: "var(--space-4)",
        }}
      >
        {cook.label}
      </h1>

      <div
        style={{
          background: "var(--color-bg-alt)",
          padding: "var(--space-4)",
          borderRadius: "var(--radius-lg)",
          marginBottom: "var(--space-4)",
        }}
      >
        <p style={{ marginBottom: "var(--space-2)" }}>
          <strong>Smoker Type:</strong> {cook.smoker_type || "Not specified"}
        </p>

        <p style={{ marginBottom: "var(--space-2)" }}>
          <strong>Wood:</strong> {cook.wood_type || "Not specified"}
        </p>

        <p style={{ marginBottom: "var(--space-2)" }}>
          <strong>Status:</strong> {cook.status}
        </p>

        {cook.eat_time && (
          <p style={{ marginBottom: "var(--space-2)" }}>
            <strong>Eating Time:</strong> {cook.eat_time}
          </p>
        )}

        {cook.started_at && (
          <p style={{ marginBottom: "var(--space-2)" }}>
            <strong>Started:</strong>{" "}
            {new Date(cook.started_at).toLocaleString()}
          </p>
        )}
      </div>

      {cookItems && cookItems.length > 0 && (
        <div
          style={{
            background: "var(--color-bg-alt)",
            padding: "var(--space-4)",
            borderRadius: "var(--radius-lg)",
            marginBottom: "var(--space-4)",
          }}
        >
          <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
            Cook Items
          </h2>
          <ul style={{ paddingLeft: "var(--space-4)" }}>
            {cookItems.map((item) => (
              <li key={item.id} style={{ marginBottom: "var(--space-1)" }}>
                {item.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {cookSteps && cookSteps.length > 0 && (
        <div
          style={{
            background: "var(--color-bg-alt)",
            padding: "var(--space-4)",
            borderRadius: "var(--radius-lg)",
            marginBottom: "var(--space-4)",
          }}
        >
          <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
            Steps ({cookSteps.length})
          </h2>
          <p style={{ color: "var(--color-text-muted)" }}>
            View the timeline or events pages for step details.
          </p>
        </div>
      )}

      <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
        <Link href={`/cook/${cookId}/timeline`}>
          <Button>Timeline</Button>
        </Link>

        <Link href={`/cook/${cookId}/events`}>
          <Button>Events</Button>
        </Link>
      </div>
    </div>
  );
}
