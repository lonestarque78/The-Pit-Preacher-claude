"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

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
    <div style={{ padding: 40 }}>
      <h1>Add Your Pit</h1>

      <input
        placeholder="Offset, Pellet, Kamado..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: 8, marginRight: 8 }}
      />

      <button onClick={addPit}>Save Pit</button>
    </div>
  );
}
