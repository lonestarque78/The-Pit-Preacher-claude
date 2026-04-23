import { supabase } from "@/lib/supabase";
import Button from "@/components/Button";
import { preacherLine } from "../preacher/voice";

export default async function CookDashboardPage({ params }) {
  const cookId = params.id;

  // Load cook record
  const { data: cook, error } = await supabase
    .from("cooks")
    .select("*")
    .eq("id", cookId)
    .single();

  if (error || !cook) {
    return (
      <div style={{ padding: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Cook Not Found</h1>
        <p>We couldn't find this cook.</p>
      </div>
    );
  }

  // Generate a preacher line for the dashboard
  const line = preacherLine({
    meat: cook.meat.toLowerCase(),
    pit: cook.pit.toLowerCase(),
    event: "dashboard",
    stall: false,
    temp: null,
    action: "dashboard",
  });

  return (
    <div style={{ padding: "40px" }}>
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          marginBottom: "var(--space-4)",
        }}
      >
        Cook Dashboard
      </h1>

      <p
        style={{
          marginBottom: "var(--space-5)",
          fontStyle: "italic",
          opacity: 0.9,
        }}
      >
        {line}
      </p>

      <div
        style={{
          background: "var(--color-bg-alt)",
          padding: "var(--space-4)",
          borderRadius: "var(--radius-lg)",
          marginBottom: "var(--space-5)",
        }}
      >
        <p style={{ marginBottom: "var(--space-2)" }}>
          <strong>Meat:</strong> {cook.meat}
        </p>

        <p style={{ marginBottom: "var(--space-2)" }}>
          <strong>Pit:</strong> {cook.pit}
        </p>

        <p style={{ marginBottom: "var(--space-2)" }}>
          <strong>Status:</strong> {cook.status}
        </p>

        <p style={{ marginBottom: "var(--space-2)" }}>
          <strong>Started:</strong>{" "}
          {new Date(cook.started_at).toLocaleString()}
        </p>
      </div>

      <Button
        onClick={() => {
          window.location.href = `/cook/${cookId}/timeline`;
        }}
      >
        Open Timeline
      </Button>

      <div style={{ height: "20px" }}></div>

      <Button
        onClick={() => {
          window.location.href = `/cook/${cookId}/events`;
        }}
      >
        View Events
      </Button>
    </div>
  );
}
