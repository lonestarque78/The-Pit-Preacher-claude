"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import Button from "@/components/Button";
import Input from "@/components/Input";

const PIT_TYPES = ["offset", "pellet", "kamado", "drum", "kettle", "other"];
const WOOD_TYPES = ["hickory", "mesquite", "apple", "cherry", "oak", "pecan", "maple", "other"];

const selectStyle: React.CSSProperties = {
  padding: "12px",
  background: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
  fontSize: "1rem",
  width: "100%",
};

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
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

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
    <div style={{ padding: "40px", maxWidth: "560px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-2)" }}>
        Add Your Pit
      </h1>
      <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)", marginBottom: "var(--space-4)" }}>
        Tell the Preacher what you're cooking on.
      </p>

      <div
        style={{
          background: "var(--color-bg-alt)",
          padding: "var(--space-4)",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <div style={{ marginBottom: "var(--space-3)" }}>
          <label style={{
            display: "block",
            fontFamily: "var(--font-ui)",
            fontSize: "0.85rem",
            color: "var(--color-text-muted)",
            marginBottom: "var(--space-1)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>
            Pit Name
          </label>
          <Input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="My Offset Smoker"
            style={{ marginBottom: 0 }}
          />
        </div>

        <div style={{ marginBottom: "var(--space-3)" }}>
          <label style={{
            display: "block",
            fontFamily: "var(--font-ui)",
            fontSize: "0.85rem",
            color: "var(--color-text-muted)",
            marginBottom: "var(--space-1)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>
            Pit Type
          </label>
          <select value={type} onChange={e => setType(e.target.value)} style={selectStyle}>
            <option value="">Select type...</option>
            {PIT_TYPES.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "var(--space-4)" }}>
          <label style={{
            display: "block",
            fontFamily: "var(--font-ui)",
            fontSize: "0.85rem",
            color: "var(--color-text-muted)",
            marginBottom: "var(--space-1)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>
            Default Wood
          </label>
          <select value={defaultWood} onChange={e => setDefaultWood(e.target.value)} style={selectStyle}>
            <option value="">Select wood...</option>
            {WOOD_TYPES.map(w => (
              <option key={w} value={w}>{w.charAt(0).toUpperCase() + w.slice(1)}</option>
            ))}
          </select>
        </div>

        <Button onClick={addPit} disabled={loading}>
          {loading ? "Saving..." : "Save Pit"}
        </Button>
      </div>
    </div>
  );
}
