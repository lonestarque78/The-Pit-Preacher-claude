import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import Button from "@/components/Button";
import Link from "next/link";

type PlanTool = { id: string; name: string; wood: string };
type PlanItem = {
  name: string;
  category: string;
  quantity: number;
  weight: string | number | null;
  notes: string;
  smokerId: string | null;
};

export default async function CookDashboardPage({ params }: { params: { id: string } }) {
  const supabase = await createServerClient();
  const cookId = params.id;

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: cook, error: cookError } = await supabase
    .from("cooks")
    .select("*")
    .eq("id", cookId)
    .eq("user_id", user.id)
    .single();

  if (cookError || !cook) {
    return (
      <div style={{ padding: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>Cook Not Found</h1>
        <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-4)" }}>
          We couldn&apos;t find this cook.
        </p>
        <Link href="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const { data: cookItems } = await supabase
    .from("cook_items")
    .select("*")
    .eq("cook_id", cookId);

  const { data: cookSteps } = await supabase
    .from("cook_steps")
    .select("*")
    .eq("cook_id", cookId)
    .order("step_number", { ascending: true });

  const plan = cook.plan as { tools?: PlanTool[]; items?: PlanItem[] } | null;
  const planTools: PlanTool[] = plan?.tools ?? [];
  const planItems: PlanItem[] = plan?.items ?? [];
  const hasPlan = planTools.length > 0;

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-4)" }}>
        {cook.label}
      </h1>

      {/* Cook meta */}
      <div style={{
        background: "var(--color-bg-alt)",
        padding: "var(--space-4)",
        borderRadius: "var(--radius-lg)",
        marginBottom: "var(--space-4)",
      }}>
        <p style={{ marginBottom: "var(--space-2)" }}>
          <strong>Smoker:</strong> {cook.smoker_type || "Not specified"}
        </p>
        <p style={{ marginBottom: "var(--space-2)" }}>
          <strong>Wood:</strong> {cook.wood_type || "Not specified"}
        </p>
        <p style={{ marginBottom: "var(--space-2)" }}>
          <strong>Status:</strong> {cook.status}
        </p>
        {cook.eat_time && (
          <p style={{ marginBottom: "var(--space-2)" }}>
            <strong>Eating Time:</strong>{" "}
            {new Date(cook.eat_time).toLocaleString(undefined, {
              weekday: "short", month: "short", day: "numeric",
              hour: "numeric", minute: "2-digit",
            })}
          </p>
        )}
        {cook.started_at && (
          <p style={{ marginBottom: "var(--space-2)" }}>
            <strong>Started:</strong> {new Date(cook.started_at).toLocaleString()}
          </p>
        )}
      </div>

      {/* Items — grouped by smoker if plan exists, flat fallback otherwise */}
      {hasPlan ? (
        <div style={{
          background: "var(--color-bg-alt)",
          padding: "var(--space-4)",
          borderRadius: "var(--radius-lg)",
          marginBottom: "var(--space-4)",
        }}>
          <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
            Pit Breakdown
          </h2>

          {planTools.map((tool, idx) => {
            const assigned = planItems.filter(
              i => i.smokerId !== null && String(i.smokerId) === String(tool.id)
            );
            return (
              <div
                key={tool.id}
                style={{
                  marginBottom: idx < planTools.length - 1 ? "var(--space-4)" : 0,
                  paddingBottom: idx < planTools.length - 1 ? "var(--space-3)" : 0,
                  borderBottom: idx < planTools.length - 1 ? "1px solid var(--color-border)" : "none",
                }}
              >
                <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.05rem", marginBottom: "2px" }}>
                  Smoker {idx + 1}{tool.name ? ` — ${tool.name}` : ""}
                </div>
                {tool.wood && (
                  <div style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.85rem",
                    color: "var(--color-text-muted)",
                    marginBottom: "var(--space-2)",
                  }}>
                    {tool.wood}
                  </div>
                )}
                {assigned.length === 0 ? (
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", margin: 0 }}>
                    No items
                  </p>
                ) : (
                  <ul style={{
                    margin: 0,
                    paddingLeft: "var(--space-4)",
                    fontFamily: "var(--font-body)",
                    lineHeight: 1.8,
                    fontSize: "0.9rem",
                  }}>
                    {assigned.map(item => (
                      <li key={item.name}>
                        {item.name}
                        {item.quantity > 1 ? ` ×${item.quantity}` : ""}
                        {item.weight ? ` (${item.weight} lbs)` : ""}
                        {item.notes ? ` — ${item.notes}` : ""}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}

          {planItems.some(i => i.smokerId === null) && (
            <div style={{
              marginTop: "var(--space-4)",
              paddingTop: "var(--space-3)",
              borderTop: "1px solid var(--color-border)",
            }}>
              <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.05rem", marginBottom: "var(--space-2)" }}>
                Unassigned
              </div>
              <ul style={{
                margin: 0,
                paddingLeft: "var(--space-4)",
                fontFamily: "var(--font-body)",
                lineHeight: 1.8,
                fontSize: "0.9rem",
              }}>
                {planItems.filter(i => i.smokerId === null).map(item => (
                  <li key={item.name}>{item.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : cookItems && cookItems.length > 0 ? (
        <div style={{
          background: "var(--color-bg-alt)",
          padding: "var(--space-4)",
          borderRadius: "var(--radius-lg)",
          marginBottom: "var(--space-4)",
        }}>
          <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
            Cook Items
          </h2>
          <ul style={{ paddingLeft: "var(--space-4)" }}>
            {cookItems.map(item => (
              <li key={item.id} style={{ marginBottom: "var(--space-1)" }}>
                {item.name}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {cookSteps && cookSteps.length > 0 && (
        <div style={{
          background: "var(--color-bg-alt)",
          padding: "var(--space-4)",
          borderRadius: "var(--radius-lg)",
          marginBottom: "var(--space-4)",
        }}>
          <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
            Steps ({cookSteps.length})
          </h2>
          <p style={{ color: "var(--color-text-muted)" }}>
            View the timeline or events pages for step details.
          </p>
        </div>
      )}

      <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
        <Link href={`/cook/${cookId}/live`}>
          <Button>Live Mode</Button>
        </Link>
        <Link href={`/cook/${cookId}/plan`}>
          <Button>Cook Plan</Button>
        </Link>
        <Link href={`/cook/${cookId}/timeline`}>
          <Button>Timeline</Button>
        </Link>
        <Link href={`/cook/${cookId}/fire`}>
          <Button>Fire</Button>
        </Link>
        <Link href={`/cook/${cookId}/rubs`}>
          <Button>Rubs</Button>
        </Link>
        <Link href={`/cook/${cookId}/events`}>
          <Button>Events</Button>
        </Link>
      </div>
    </div>
  );
}
