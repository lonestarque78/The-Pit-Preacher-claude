"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Button from "@/components/Button";
import Input from "@/components/Input";

export default function PrepPage() {
  const [meat, setMeat] = useState("");
  const [pit, setPit] = useState("");
  const [pits, setPits] = useState([]);

  useEffect(() => {
    const loadPits = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("pits")
        .select("*")
        .eq("user_id", user.id);

      setPits(data || []);
    };

    loadPits();
  }, []);

  const startCook = () => {
    if (!meat || !pit) {
      alert("Choose a meat and a pit");
      return;
    }

    // For now, just redirect to dashboard
    // Later this will create a cook record
    window.location.href = "/dashboard";
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-4)" }}>
        Meal Prep
      </h1>

      <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
        Choose Your Meat
      </h2>

      <Input
        value={meat}
        onChange={(e) => setMeat(e.target.value)}
        placeholder="Brisket, Ribs, Pork Butt, Chicken..."
      />

      <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
        Choose Your Pit
      </h2>

      <select
        value={pit}
        onChange={(e) => setPit(e.target.value)}
        style={{
          padding: "12px",
          background: "var(--color-bg-alt)",
          border: "1px solid var(--color-text-muted)",
          borderRadius: "var(--radius-md)",
          color: "var(--color-text)",
          fontFamily: "var(--font-body)",
          width: "100%",
          marginBottom: "var(--space-4)",
        }}
      >
        <option value="">Select a pit...</option>
        {pits.map((p) => (
          <option key={p.id} value={p.name}>
            {p.name}
          </option>
        ))}
      </select>

      <Button onClick={startCook}>Start Cook</Button>
    </div>
  );
}
