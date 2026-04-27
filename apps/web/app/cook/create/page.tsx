"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Button from "@/components/Button";
import Link from "next/link";

export default function CreateCookPage() {
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("You must be logged in");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("meal_prep_session")
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
    if (!session) {
      alert("No session data");
      return;
    }

    setCreating(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in");
      setCreating(false);
      return;
    }

    // Generate label from selected items
    const label = session.selected_items.join(" + ");

    // Create cook record
    const { data: cook, error: cookError } = await supabase
      .from("cooks")
      .insert({
        user_id: user.id,
        prep_session_id: session.id,
        label,
        cooking_style: "",
        smoker_type: session.smoker_type,
        wood_type: session.wood_type,
        eat_time: session.eating_time,
        status: "in_progress",
      })
      .select()
      .single();

    if (cookError) {
      console.error(cookError);
      alert("Error creating cook");
      setCreating(false);
      return;
    }

    // Insert cook_items for each selected item
    const cookItems = session.selected_items.map((item: string) => ({
      cook_id: cook.id,
      name: item,
    }));

    const { error: itemsError } = await supabase
      .from("cook_items")
      .insert(cookItems);

    if (itemsError) {
      console.error(itemsError);
      // Non-fatal, continue anyway
    }

    setCreating(false);
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
          No session found. <Link href="/prep" style={{ color: "var(--color-accent)" }}>Start from Prep</Link>
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-4)" }}>
        Start Your Cook
      </h1>

      <div
        style={{
          background: "var(--color-bg-alt)",
          padding: "var(--space-4)",
          borderRadius: "var(--radius-lg)",
          marginBottom: "var(--space-4)",
        }}
      >
        <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
          Summary
        </h2>

        <p style={{ marginBottom: "var(--space-2)" }}>
          <strong>Items:</strong> {session.selected_items.join(", ")}
        </p>

        <p style={{ marginBottom: "var(--space-2)" }}>
          <strong>Smoker Type:</strong> {session.smoker_type || "Not specified"}
        </p>

        <p style={{ marginBottom: "var(--space-2)" }}>
          <strong>Wood:</strong> {session.wood_type || "Not specified"}
        </p>

        {session.eating_time && (
          <p style={{ marginBottom: "var(--space-2)" }}>
            <strong>Eating Time:</strong> {session.eating_time}
          </p>
        )}
      </div>

      <Button onClick={createCook} disabled={creating}>
        {creating ? "Starting Cook..." : "Start Cook"}
      </Button>
    </div>
  );
}
