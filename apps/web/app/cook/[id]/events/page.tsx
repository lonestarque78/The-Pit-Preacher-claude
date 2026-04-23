"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { preacherLine } from "../../preacher/voice";

export default function CookEventsPage({ params }) {
  const cookId = params.id;

  const [events, setEvents] = useState([]);
  const [type, setType] = useState("");
  const [note, setNote] = useState("");
  const [cook, setCook] = useState(null);

  useEffect(() => {
    loadCook();
    loadEvents();
  }, []);

  const loadCook = async () => {
    const { data } = await supabase
      .from("cooks")
      .select("*")
      .eq("id", cookId)
      .single();

    setCook(data);
  };

  const loadEvents = async () => {
    const { data } = await supabase
      .from("cook_events")
      .select("*")
      .eq("cook_id", cookId)
      .order("created_at", { ascending: false });

    setEvents(data || []);
  };

  const addEvent = async () => {
    if (!type) {
      alert("Choose an event type");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in");
      return;
    }

    // Insert event
    await supabase.from("cook_events").insert({
      cook_id: cookId,
      user_id: user.id,
      type,
      note,
      created_at: new Date().toISOString(),
    });

    setType("");
    setNote("");

    // Reload events
    loadEvents();
  };

  if (!cook) {
    return (
      <div style={{ padding: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Loading...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          marginBottom: "var(--space-4)",
        }}
      >
        Cook Events
      </h1>

      <h2
        style={{
          fontFamily: "var(--font-heading)",
          marginBottom: "var(--space-3)",
        }}
      >
        Add Event
      </h2>

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
          marginBottom: "var(--space-3)",
        }}
      >
        <option value="">Select event type...</option>
        <option value="spritz">Spritz</option>
        <option value="wrap">Wrap</option>
        <option value="probe">Probe</option>
        <option value="temp_log">Temp Log</option>
        <option value="note">Note</option>
      </select>

      <Input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional note..."
      />

      <Button onClick={addEvent} style={{ marginBottom: "var(--space-5)" }}>
        Add Event
      </Button>

      <h2
        style={{
          fontFamily: "var(--font-heading)",
          marginBottom: "var(--space-3)",
        }}
      >
        Event History
      </h2>

      {events.length === 0 && <p>No events yet.</p>}

      {events.map((event) => {
        const line = preacherLine({
          meat: cook.meat.toLowerCase(),
          pit: cook.pit.toLowerCase(),
          event: event.type.toLowerCase(),
          stall: false,
          temp: event.type === "temp_log" ? event.note : null,
          action: event.type.toLowerCase(),
        });

        return (
          <div
            key={event.id}
            style={{
              background: "var(--color-bg-alt)",
              padding: "var(--space-3)",
              borderRadius: "var(--radius-md)",
              marginBottom: "var(--space-3)",
              borderLeft: "4px solid var(--color-accent)",
            }}
          >
            <p style={{ marginBottom: "var(--space-1)" }}>
              <strong>Type:</strong> {event.type}
            </p>

            {event.note && (
              <p style={{ marginBottom: "var(--space-1)" }}>
                <strong>Note:</strong> {event.note}
              </p>
            )}

            <p
              style={{
                marginBottom: "var(--space-2)",
                fontStyle: "italic",
                opacity: 0.9,
              }}
            >
              {line}
            </p>

            <p style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
              {new Date(event.created_at).toLocaleString()}
            </p>
          </div>
        );
      })}
    </div>
  );
}
