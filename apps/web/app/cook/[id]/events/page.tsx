import { createServerClient } from "@/lib/supabase-server";
import Link from "next/link";
import Button from "@/components/Button";

export default async function CookEventsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: cookId } = await params;
  const supabase = await createServerClient();

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

  // Load cook_events ordered by created_at ascending
  const { data: events } = await supabase
    .from("cook_events")
    .select("*")
    .eq("cook_id", cookId)
    .order("created_at", { ascending: true });

  const eventList = events || [];

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
        Events
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
        <p><strong>Status:</strong> {cook.status}</p>
      </div>

      <h2
        style={{
          fontFamily: "var(--font-heading)",
          marginBottom: "var(--space-3)",
        }}
      >
        Event History
      </h2>

      {eventList.length === 0 && (
        <p style={{ color: "var(--color-text-muted)" }}>No events yet.</p>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        {eventList.map((event) => (
          <div
            key={event.id}
            style={{
              background: "var(--color-bg-alt)",
              padding: "var(--space-3)",
              borderRadius: "var(--radius-md)",
              borderLeft: "4px solid var(--color-accent)",
            }}
          >
            <p style={{ marginBottom: "var(--space-1)" }}>
              <strong>Type:</strong> {event.type}
            </p>

            {event.note && (
              <p style={{ marginBottom: "var(--space-2)", color: "var(--color-text-muted)" }}>
                {event.note}
              </p>
            )}

            <p style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
              {new Date(event.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
