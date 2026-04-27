import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { getTier } from "@/lib/premium";
import Button from "@/components/Button";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createServerClient();

  // Get the logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Load user's profile for display_name
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  // Load user's pits
  const { data: pits } = await supabase
    .from("pits")
    .select("*")
    .eq("user_id", user.id);

  // Load user's recent cooks (limit 5, ordered by created_at desc)
  const { data: cooks } = await supabase
    .from("cooks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Load user's subscription for tier
  const tier = await getTier(user.id, supabase);

  const displayName = profile?.display_name || user.email?.split("@")[0] || "Pit Master";

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-4)" }}>
        Welcome, {displayName}
      </h1>

      {tier && tier !== "free" && (
        <div
          style={{
            display: "inline-block",
            padding: "var(--space-1) var(--space-3)",
            background: "var(--color-accent)",
            borderRadius: "var(--radius-md)",
            marginBottom: "var(--space-4)",
            fontFamily: "var(--font-ui)",
            fontSize: "0.875rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {tier}
        </div>
      )}

      <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
        Recent Cooks
      </h2>

      {cooks && cooks.length > 0 ? (
        <div style={{ marginBottom: "var(--space-5)" }}>
          {cooks.map((cook) => (
            <Link
              key={cook.id}
              href={`/cook/${cook.id}`}
              style={{
                display: "block",
                marginBottom: "var(--space-2)",
                padding: "var(--space-3)",
                background: "var(--color-bg-alt)",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                color: "var(--color-text)",
              }}
            >
              <div style={{ fontFamily: "var(--font-ui)", marginBottom: "var(--space-1)" }}>
                {cook.label}
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                {cook.status} • {new Date(cook.created_at).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p style={{ marginBottom: "var(--space-5)", color: "var(--color-text-muted)" }}>
          No cooks yet. Start your first one!
        </p>
      )}

      <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
        Your Pits
      </h2>

      {pits && pits.length > 0 ? (
        <div style={{ marginBottom: "var(--space-5)" }}>
          {pits.map((pit) => (
            <div
              key={pit.id}
              style={{
                marginBottom: "var(--space-2)",
                padding: "var(--space-2)",
                background: "var(--color-bg-alt)",
                borderRadius: "var(--radius-md)",
              }}
            >
              {pit.name} ({pit.type})
            </div>
          ))}
        </div>
      ) : (
        <div style={{ marginBottom: "var(--space-5)" }}>
          <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-2)" }}>
            You have no pits yet.
          </p>
          <Link
            href="/setup/pits"
            style={{
              fontFamily: "var(--font-ui)",
              color: "var(--color-accent)",
              textDecoration: "underline",
            }}
          >
            Add your first pit →
          </Link>
        </div>
      )}

      <Link href="/prep">
        <Button>Start a New Cook</Button>
      </Link>
    </div>
  );
}
