"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Button from "@/components/Button";

export default function CreateCookPage() {
  const [meat, setMeat] = useState("");
  const [pit, setPit] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read meat + pit from URL params
    const params = new URLSearchParams(window.location.search);
    const m = params.get("meat");
    const p = params.get("pit");

    if (m) setMeat(m);
    if (p) setPit(p);

    setLoading(false);
  }, []);

  const createCook = async () => {
    if (!meat || !pit) {
      alert("Missing meat or pit");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in");
      return;
    }

    // Create cook record
    const { data, error } = await supabase
      .from("cooks")
      .insert({
        user_id: user.id,
        meat,
        pit,
        status: "active",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Error creating cook");
      return;
    }

    // Redirect to cook dashboard (to be built next)
    window.location.href = `/cook/${data.id}`;
  };

  if (loading) {
    return (
      <div style={{ padding: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Loading...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-4)" }}>
        Create Cook
      </h1>

      <p style={{ marginBottom: "var(--space-3)" }}>
        <strong>Meat:</strong> {meat}
      </p>

      <p style={{ marginBottom: "var(--space-5)" }}>
        <strong>Pit:</strong> {pit}
      </p>

      <Button onClick={createCook}>Start Cook</Button>
    </div>
  );
}
