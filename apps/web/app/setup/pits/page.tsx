"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Button from "@/components/Button";
import Input from "@/components/Input";

const PIT_TYPES = ["offset", "pellet", "kamado", "drum", "kettle", "other"];
const WOOD_TYPES = ["hickory", "mesquite", "apple", "cherry", "oak", "pecan", "maple", "cherry", "other"];

export default function PitSetupPage() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [defaultWood, setDefaultWood] = useState("");
  const [loading, setLoading] = useState(false);

  const addPit = async () => {
    if (!name || !type || !defaultWood) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("pits").insert({
      user_id: user.id,
      name,
      type,
      default_wood: defaultWood,
    });

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Error saving pit");
      return;
    }

    window.location.href = "/setup";
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-4)" }}>
        Add Your Pit
      </h1>

      <div style={{ marginBottom: "var(--space-3)" }}>
        <label
          style={{
            display: "block",
            marginBottom: "var(--space-1)",
            fontFamily: "var(--font-body)",
            color: "var(--color-text)",
          }}
        >
          Pit Name
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Offset Smoker"
        />
      </div>

      <div style={{ marginBottom: "var(--space-3)" }}>
        <label
          style={{
            display: "block",
            marginBottom: "var(--space-1)",
            fontFamily: "var(--font-body)",
            color: "var(--color-text)",
          }}
        >
          Pit Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{
            padding: "12px",
            background: "var(--color-bg-alt)",
            border: "1px solid var(--color-text-muted)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text)",
            fontFamily: "var(--font-body)",
            width: "100%",
          }}
        >
          <option value="">Select type...</option>
          {PIT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "var(--space-4)" }}>
        <label
          style={{
            display: "block",
            marginBottom: "var(--space-1)",
            fontFamily: "var(--font-body)",
            color: "var(--color-text)",
          }}
        >
          Default Wood
        </label>
        <select
          value={defaultWood}
          onChange={(e) => setDefaultWood(e.target.value)}
          style={{
            padding: "12px",
            background: "var(--color-bg-alt)",
            border: "1px solid var(--color-text-muted)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text)",
            fontFamily: "var(--font-body)",
            width: "100%",
          }}
        >
          <option value="">Select wood...</option>
          {WOOD_TYPES.map((w) => (
            <option key={w} value={w}>
              {w.charAt(0).toUpperCase() + w.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <Button onClick={addPit} disabled={loading}>
        {loading ? "Saving..." : "Save Pit"}
      </Button>
    </div>
  );
}
