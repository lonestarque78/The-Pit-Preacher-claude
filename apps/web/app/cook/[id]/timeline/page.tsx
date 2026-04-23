import { supabase } from "@/lib/supabase";

export default async function TimelinePage({ params }) {
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

  // Placeholder timeline steps (we will replace this with the real engine)
  const steps = [
    { time: "Fire Up", detail: "Light your pit and stabilize temp." },
    { time: "Meat On", detail: "Place meat on the smoker." },
    { time: "Spritz", detail: "Spritz every 60–90 minutes." },
    { time: "Wrap", detail: "Wrap when bark is set." },
    { time: "Rest", detail: "Rest in a cooler or oven." },
  ];

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
        <p style={{ marginBottom: "var(--space-2)" }}>
          <strong>Meat:</strong> {cook.meat}
        </p>

        <p style={{ marginBottom: "var(--space-2)" }}>
          <strong>Pit:</strong> {cook.pit}
        </p>

        <p style={{ marginBottom: "var(--space-2)" }}>
          <strong>Status:</strong> {cook.status}
        </p>
      </div>

      <h2
        style={{
          fontFamily: "var(--font-heading)",
          marginBottom: "var(--space-3)",
        }}
      >
        Steps
      </h2>

      <div>
        {steps.map((step, index) => (
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
            <h3
              style={{
                fontFamily: "var(--font-ui)",
                marginBottom: "var(--space-1)",
              }}
            >
              {step.time}
            </h3>
            <p>{step.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
