import { supabase } from "@/lib/supabase";
import Button from "@/components/Button";

export default async function DashboardPage() {
  // Get the logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div style={{ padding: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Not Logged In</h1>
        <p>Please log in to continue.</p>
      </div>
    );
  }

  // Load user's pits
  const { data: pits } = await supabase
    .from("pits")
    .select("*")
    .eq("user_id", user.id);

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-4)" }}>
        Dashboard
      </h1>

      <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
        Your Pits
      </h2>

      {pits && pits.length > 0 ? (
        <ul style={{ marginBottom: "var(--space-5)" }}>
          {pits.map((pit) => (
            <li
              key={pit.id}
              style={{
                marginBottom: "var(--space-2)",
                padding: "var(--space-2)",
                background: "var(--color-bg-alt)",
                borderRadius: "var(--radius-md)",
              }}
            >
              {pit.name}
            </li>
          ))}
        </ul>
      ) : (
        <p>You have no pits yet.</p>
      )}

      <Button
        onClick={() => {
          window.location.href = "/prep";
        }}
      >
        Start a Cook
      </Button>
    </div>
  );
}
