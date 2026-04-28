// apps/web/app/cook/[id]/live/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Link from "next/link";
import { preacherLine } from "../preacher/voice";

const EVENT_TYPES = [
  { value: "temp_log", label: "Temp Log" },
  { value: "spritz", label: "Spritz" },
  { value: "wrap", label: "Wrap" },
  { value: "probe", label: "Probe" },
  { value: "note", label: "Note" },
];

export default function LiveModePage({ params }: { params: { id: string } }) {
  const cookId = params.id;

  const [cook, setCook] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [eventType, setEventType] = useState("");
  const [message, setMessage] = useState("");

  const [askInput, setAskInput] = useState("");
  const [preacherReply, setPreacherReply] = useState<string | null>(null);
  const [askLoading, setAskLoading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, [cookId]);

  const loadData = async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      setLoading(false);
      return;
    }

    setUser(authUser);

    const { data: cookData } = await supabase
      .from("cooks")
      .select("*")
      .eq("id", cookId)
      .single();

    const { data: itemsData } = await supabase
      .from("cook_items")
      .select("*")
      .eq("cook_id", cookId);

    const { data: eventsData } = await supabase
      .from("cook_events")
      .select("*")
      .eq("cook_id", cookId)
      .order("created_at", { ascending: false });

    setCook(cookData);
    setItems(itemsData || []);
    setEvents(eventsData || []);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!eventType) {
      alert("Select an event type");
      return;
    }

    setSubmitting(true);

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      alert("You must be logged in");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("cook_events").insert({
      cook_id: cookId,
      user_id: authUser.id,
      type: eventType,
      note: message,
    });

    setSubmitting(false);

    if (error) {
      console.error(error);
      alert("Error adding event");
      return;
    }

    setEventType("");
    setMessage("");
    loadData();
  };

  const handleAsk = async () => {
    if (!askInput.trim()) return;

    setAskLoading(true);
    setPreacherReply(null);

    const cookContext = {
      label: cook?.label ?? "",
      smoker_type: cook?.smoker_type ?? "",
      wood_type: cook?.wood_type ?? "",
      eat_time: cook?.eat_time ?? "",
      items: items.map((i) => i.name),
      recentEvents: events.slice(0, 10).map((e) => ({
        created_at: e.created_at,
        type: e.type,
        note: e.note ?? "",
      })),
    };

    const res = await fetch("/api/preacher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cookId, message: askInput, cookContext }),
    });

    const data = await res.json();
    setPreacherReply(data.reply ?? "The Preacher is silent. Try again.");
    setAskInput("");
    setAskLoading(false);
  };

  const getPreacherLine = () => {
    if (!cook) return "";
    const meatNames = items.map((i) => i.name.toLowerCase()).join(" ");
    return preacherLine({
      meat: meatNames,
      pit: (cook.smoker_type || "").toLowerCase(),
      event: "live",
      stall: false,
      temp: null,
      action: "live",
    });
  };

  if (loading) {
    return (
      <div style={{ padding: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Loading...</h1>
      </div>
    );
  }

  if (!cook) {
    return (
      <div style={{ padding: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Cook Not Found</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ marginBottom: "var(--space-4)" }}>
        <Link href={`/cook/${cookId}`}>
          <Button>← Back to Cook</Button>
        </Link>
      </div>

      <h1
        style={{
          fontFamily: "var(--font-heading)",
          marginBottom: "var(--space-2)",
        }}
      >
        Live Mode
      </h1>

      <p
        style={{
          fontFamily: "var(--font-heading)",
          fontStyle: "italic",
          color: "var(--color-accent)",
          marginBottom: "var(--space-4)",
        }}
      >
        {getPreacherLine()}
      </p>

      <div
        style={{
          background: "var(--color-bg-alt)",
          padding: "var(--space-4)",
          borderRadius: "var(--radius-lg)",
          marginBottom: "var(--space-4)",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            marginBottom: "var(--space-2)",
          }}
        >
          {cook.label}
        </h2>
        <p>
          <strong>Smoker:</strong> {cook.smoker_type || "Not specified"}
        </p>
        <p>
          <strong>Wood:</strong> {cook.wood_type || "Not specified"}
        </p>
        <p>
          <strong>Status:</strong> {cook.status}
        </p>
      </div>

      <h2
        style={{
          fontFamily: "var(--font-heading)",
          marginBottom: "var(--space-3)",
        }}
      >
        Log Event
      </h2>

      <div
        style={{
          background: "var(--color-bg-alt)",
          padding: "var(--space-4)",
          borderRadius: "var(--radius-lg)",
          marginBottom: "var(--space-4)",
        }}
      >
        <select
          value={eventType}
          onChange={(e) => setEventType(e.target.value)}
          style={{
            padding: "12px",
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text)",
            fontFamily: "var(--font-body)",
            width: "100%",
            marginBottom: "var(--space-3)",
          }}
        >
          <option value="">Select event type...</option>
          {EVENT_TYPES.map((et) => (
            <option key={et.value} value={et.value}>
              {et.label}
            </option>
          ))}
        </select>

        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message or note..."
        />

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          style={{ marginTop: "var(--space-3)" }}
        >
          {submitting ? "Submitting..." : "Log Event"}
        </Button>
      </div>

      <h2
        style={{
          fontFamily: "var(--font-heading)",
          marginBottom: "var(--space-3)",
        }}
      >
        Event Log
      </h2>

      {events.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)" }}>No events yet.</p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
          }}
        >
          {events.map((event) => (
            <div
              key={event.id}
              style={{
                background: "var(--color-bg-alt)",
                padding: "var(--space-3)",
                borderRadius: "var(--radius-md)",
                borderLeft: "4px solid var(--color-accent)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "var(--space-1)",
                }}
              >
                <strong>{event.type}</strong>
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {new Date(event.created_at).toLocaleString()}
                </span>
              </div>
              {event.note && (
                <p style={{ color: "var(--color-text-muted)" }}>{event.note}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {user && (
        <div style={{ marginTop: "var(--space-5)" }}>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              marginBottom: "var(--space-3)",
            }}
          >
            Ask the Preacher
          </h2>

          <div
            style={{
              background: "var(--color-bg-alt)",
              padding: "var(--space-4)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <Input
              value={askInput}
              onChange={(e) => setAskInput(e.target.value)}
              placeholder="Ask the Preacher anything about your cook..."
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === "Enter" && !askLoading) handleAsk();
              }}
            />

            <Button
              onClick={handleAsk}
              disabled={askLoading || !askInput.trim()}
              style={{ marginTop: "var(--space-3)" }}
            >
              {askLoading ? "The Preacher is thinking..." : "Ask"}
            </Button>

            {preacherReply && (
              <div
                style={{
                  marginTop: "var(--space-4)",
                  marginLeft: "var(--space-3)",
                  padding: "var(--space-4)",
                  background: "var(--color-bg)",
                  borderRadius: "var(--radius-md)",
                  borderLeft: "4px solid var(--color-accent)",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontStyle: "italic",
                    lineHeight: 1.7,
                    color: "var(--color-text)",
                    margin: 0,
                  }}
                >
                  {preacherReply}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
