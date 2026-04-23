"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Button from "@/components/Button";
import Input from "@/components/Input";

export default function PitSetupPage() {
  const [name, setName] = useState("");

  const addPit = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in");
      return;
    }

    await supabase.from("pits").insert({
      user_id: user.id,
      name,
    });

    window.location.href = "/setup";
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)" }}>Add Your Pit</h1>

      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Offset, Pellet, Kamado..."
      />

      <Button onClick={addPit}>Save Pit</Button>
    </div>
  );
}
