"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Button from "@/components/Button";
import Link from "next/link";

type SessionItem = {
  name: string;
  category: string;
  quantity: number;
  weight: string | number | null;
  notes: string;
  smokerId: string | null;
};

type SessionSmoker = {
  id: string;
  name: string;
  wood: string;
};

export default function CreateCookPage() {
  const supabase = createClient();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session");

    if (!sessionId) {
      setLoading(false);
      return;
    }

    const fetchSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert("You must be logged in");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("meal_prep_sessions")
        .select("*")
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        console.error(error);
        alert("Session not found");
        setLoading(false);
        return;
      }

      setSession(data);
      setLoading(false);
    };

    fetchSession();
  }, []);

  const createCook = async () => {
    if (!session) return;
    setCreating(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in");
      setCreating(false);
      return;
    }

    const items: SessionItem[] = session.selected_items || [];
    const tools: SessionSmoker[] = session.tools || [];

    const label = items.map(i => i.name).join(" + ") || "Cook";
    const smokerType = tools.map(t => t.name).filter(Boolean).join(", ");
    const woodType = tools.map(t => t.wood).filter(Boolean).join(", ");

    const { data: cook, error: cookError } = await supabase
      .from("cooks")
      .insert({
        user_id: user.id,
        prep_session_id: session.id,
        label,
        cooking_style: session.cooking_style || "",
        smoker_type: smokerType,
        wood_type: woodType,
        eat_time: session.eating_time,
        status: "in_progress",
        plan: { tools, items },
      })
      .select()
      .single();

    if (cookError) {
      console.error(cookError);
      alert("Error creating cook");
      setCreating(false);
      return;
    }

    // Insert cook_items
    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from("cook_items")
        .insert(items.map(item => ({
          cook_id: cook.id,
          name: item.name,
          notes: item.notes || "",
        })));

      if (itemsError) console.error(itemsError);
    }

    // Insert cook_pits — one per smoker with a generated pit_id
    if (tools.length > 0) {
      const { error: pitsError } = await supabase
        .from("cook_pits")
        .insert(tools.map(() => ({
          cook_id: cook.id,
          pit_id: crypto.randomUUID(),
        })));

      if (pitsError) console.error(pitsError);
    }

    window.location.href = `/cook/${cook.id}`;
  };

  if (loading) {
    return (
      <div style={{ padding: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Loading...</h1>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ padding: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-4)" }}>
          Create Cook
        </h1>
        <p style={{ color: "var(--color-text-muted)" }}>
          No session found.{" "}
          <Link href="/prep" style={{ color: "var(--color-accent)" }}>Start from Prep</Link>
        </p>
      </div>
    );
  }

  const items: SessionItem[] = session.selected_items || [];
  const tools: SessionSmoker[] = session.tools || [];
  const label = items.map(i => i.name).join(" + ") || "Cook";

  return (
    <div style={{ padding: "40px", maxWidth: "760px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-2)" }}>
        Start Your Cook
      </h1>
      <p style={{
        fontFamily: "var(--font-heading)",
        fontStyle: "italic",
        color: "var(--color-accent)",
        marginBottom: "var(--space-4)",
        fontSize: "1.1rem",
      }}>
        {label}
      </p>

      {/* Pit breakdown */}
      <div style={{
        background: "var(--color-bg-alt)",
        padding: "var(--space-4)",
        borderRadius: "var(--radius-lg)",
        marginBottom: "var(--space-4)",
      }}>
        <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
          Your Pit Breakdown
        </h2>

        {tools.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
            No smokers defined.
          </p>
        ) : (
          tools.map((tool, idx) => {
            const assigned = items.filter(
              i => i.smokerId !== null && String(i.smokerId) === String(tool.id)
            );
            return (
              <div
                key={tool.id}
                style={{
                  marginBottom: idx < tools.length - 1 ? "var(--space-4)" : 0,
                  paddingBottom: idx < tools.length - 1 ? "var(--space-4)" : 0,
                  borderBottom: idx < tools.length - 1 ? "1px solid var(--color-border)" : "none",
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
                  <p style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-muted)",
                    fontSize: "0.875rem",
                    margin: 0,
                  }}>
                    No items assigned
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
          })
        )}

        {items.some(i => i.smokerId === null) && (
          <div style={{
            marginTop: tools.length > 0 ? "var(--space-4)" : 0,
            paddingTop: tools.length > 0 ? "var(--space-4)" : 0,
            borderTop: tools.length > 0 ? "1px solid var(--color-border)" : "none",
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
              {items.filter(i => i.smokerId === null).map(item => (
                <li key={item.name}>{item.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Cook details */}
      <div style={{
        background: "var(--color-bg-alt)",
        padding: "var(--space-4)",
        borderRadius: "var(--radius-lg)",
        marginBottom: "var(--space-4)",
      }}>
        {session.cooking_style && (
          <p style={{ fontFamily: "var(--font-body)", marginBottom: "var(--space-2)" }}>
            <strong>Style:</strong> {session.cooking_style}
          </p>
        )}
        {session.eating_time && (
          <p style={{ fontFamily: "var(--font-body)", marginBottom: "var(--space-2)" }}>
            <strong>Eating Time:</strong>{" "}
            {new Date(session.eating_time).toLocaleString(undefined, {
              weekday: "short", month: "short", day: "numeric",
              hour: "numeric", minute: "2-digit",
            })}
          </p>
        )}
        <p style={{ fontFamily: "var(--font-body)", marginBottom: 0 }}>
          <strong>Flavor:</strong> Smoke {session.flavor_smoke} · Bark {session.flavor_bark} · Tenderness {session.flavor_tenderness}
        </p>
      </div>

      <Button onClick={createCook} disabled={creating}>
        {creating ? "Starting Cook..." : "Start Cook"}
      </Button>
    </div>
  );
}
