"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Button from "@/components/Button";
import Input from "@/components/Input";

export default function PrepPage() {
  const [meats, setMeats] = useState<string[]>([]);
  const [meatInput, setMeatInput] = useState("");
  const [selectedPit, setSelectedPit] = useState("");
  const [pits, setPits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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

  const addMeat = () => {
    if (meatInput.trim() && !meats.includes(meatInput.trim())) {
      setMeats([...meats, meatInput.trim()]);
      setMeatInput("");
    }
  };

  const removeMeat = (meat: string) => {
    setMeats(meats.filter((m) => m !== meat));
  };

  const startCook = async () => {
    if (meats.length === 0 || !selectedPit) {
      alert("Choose at least one meat and a pit");
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

    const selectedPitData = pits.find((p) => p.name === selectedPit);

    const { data, error } = await supabase
      .from("meal_prep_session")
      .insert({
        user_id: user.id,
        selected_items: meats,
        eating_time: null,
        smoker_type: selectedPitData?.type || "",
        wood_type: selectedPitData?.default_wood || "",
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Error creating prep session");
      return;
    }

    window.location.href = `/cook/create?session=${data.id}`;
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-4)" }}>
        Meal Prep
      </h1>

      <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
        Add Meats
      </h2>

      <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
        <div style={{ flex: 1 }}>
          <Input
            value={meatInput}
            onChange={(e) => setMeatInput(e.target.value)}
            placeholder="Brisket, Ribs, Pork Butt, Chicken..."
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMeat())}
          />
        </div>
        <Button onClick={addMeat}>Add</Button>
      </div>

      {meats.length > 0 && (
        <div style={{ marginBottom: "var(--space-4)" }}>
          {meats.map((meat) => (
            <span
              key={meat}
              style={{
                display: "inline-block",
                padding: "var(--space-1) var(--space-2)",
                marginRight: "var(--space-2)",
                marginBottom: "var(--space-2)",
                background: "var(--color-bg-alt)",
                borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-body)",
              }}
            >
              {meat}
              <button
                onClick={() => removeMeat(meat)}
                style={{
                  marginLeft: "var(--space-1)",
                  background: "none",
                  border: "none",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
        Choose Your Pit
      </h2>

      <select
        value={selectedPit}
        onChange={(e) => setSelectedPit(e.target.value)}
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
            {p.name} ({p.type})
          </option>
        ))}
      </select>

      <Button onClick={startCook} disabled={loading}>
        {loading ? "Creating..." : "Start Cook"}
      </Button>
    </div>
  );
}
