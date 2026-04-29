// apps/web/app/cook/[id]/live/page.tsx
"use client";

import { use, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { getRandomVerse } from "@/lib/verses";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Link from "next/link";
import { preacherLine } from "../../preacher/voice";

type PlanTool = { id: string; name: string; wood: string };
type PlanItem = {
  name: string;
  category: string;
  quantity: number;
  weight: string | number | null;
  notes: string;
  smokerId: string | null;
};

const EVENT_TYPES = [
  { value: "temp_log", label: "Temp Log" },
  { value: "spritz", label: "Spritz" },
  { value: "wrap", label: "Wrap" },
  { value: "probe", label: "Probe" },
  { value: "note", label: "Note" },
];

const selectStyle = {
  padding: "12px",
  background: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  color: "var(--color-text)",
  fontFamily: "var(--font-body)",
  width: "100%",
  marginBottom: "var(--space-3)",
};

export default function LiveModePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: cookId } = use(params);

  const [cook, setCook] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [loadingVerse] = useState(() => getRandomVerse());
  const [showVerse, setShowVerse] = useState(true);
  const [verseFading, setVerseFading] = useState(false);

  const [eventType, setEventType] = useState("");
  const [message, setMessage] = useState("");
  const [selectedSmokerId, setSelectedSmokerId] = useState("");

  const [askInput, setAskInput] = useState("");
  const [preacherReply, setPreacherReply] = useState<string | null>(null);
  const [askLoading, setAskLoading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, [cookId]);

  useEffect(() => {
    if (!loading && showVerse) {
      setVerseFading(true);
      const t = setTimeout(() => setShowVerse(false), 500);
      return () => clearTimeout(t);
    }
  }, [loading, showVerse]);

  const loadData = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();

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

    // Default smoker selector to first named tool
    const planTools: PlanTool[] = (cookData?.plan as any)?.tools ?? [];
    const firstNamed = planTools.find(t => t.name?.trim());
    if (firstNamed && !selectedSmokerId) {
      setSelectedSmokerId(String(firstNamed.id));
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (!eventType) {
      setError("Select an event type.");
      return;
    }

    setSubmitting(true);

    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      setError("You must be logged in.");
      setSubmitting(false);
      return;
    }

    // Build note with smoker prefix if a smoker is selected
    const planTools: PlanTool[] = (cook?.plan as any)?.tools ?? [];
    let fullNote = message;
    if (selectedSmokerId && planTools.length > 0) {
      const toolIdx = planTools.findIndex(t => String(t.id) === selectedSmokerId);
      const tool = planTools[toolIdx];
      if (tool) {
        const smokerLabel = `[Smoker ${toolIdx + 1}${tool.name ? ` - ${tool.name}` : ""}]`;
        fullNote = message ? `${smokerLabel} ${message}` : smokerLabel;
      }
    }

    console.log("cook id for event:", cook?.id);

    const { error: eventError } = await supabase.from("cook_events").insert({
      cook_id: cookId,
      user_id: authUser.id,
      type: eventType,
      note: fullNote,
    });

    setSubmitting(false);

    if (eventError) {
      setError("Failed to log event: " + eventError.message);
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

    const planTools: PlanTool[] = (cook?.plan as any)?.tools ?? [];
    const planItems: PlanItem[] = (cook?.plan as any)?.items ?? [];

    const cookContext = {
      label: cook?.label ?? "",
      eat_time: cook?.eat_time ?? "",
      cooking_style: cook?.cooking_style ?? "",
      tools: planTools,
      planItems: planItems,
      recentEvents: events.slice(0, 10).map(e => ({
        created_at: e.created_at,
        type: e.type,
        note: e.note ?? "",
      })),
    };

    console.log("sending to preacher:", { cookId: cook?.id, message: askInput });

    const res = await fetch("/api/preacher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cookId: cook?.id, message: askInput, cookContext }),
    });

    if (!res.ok) {
      const errText = await res.text();
      setPreacherReply("The Preacher could not be reached: " + errText);
      setAskInput("");
      setAskLoading(false);
      return;
    }

    const data = await res.json();
    setPreacherReply(data.reply ?? "The Preacher is silent. Try again.");
    setAskInput("");
    setAskLoading(false);
  };

  const getPreacherLine = () => {
    if (!cook) return "";
    const meatNames = items.map(i => i.name.toLowerCase()).join(" ");
    return preacherLine({
      meat: meatNames,
      pit: (cook.smoker_type || "").toLowerCase(),
      event: "live",
      stall: false,
      temp: null,
      action: "live",
    });
  };

  if (showVerse) {
    return (
      <div style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "var(--space-5)",
        opacity: verseFading ? 0 : 1,
        transition: "opacity 0.5s ease",
      }}>
        <p style={{
          fontFamily: "var(--font-heading)",
          fontStyle: "italic",
          fontSize: "1.5rem",
          color: "var(--color-text)",
          maxWidth: "560px",
          lineHeight: 1.55,
          marginBottom: "var(--space-3)",
        }}>
          &ldquo;{loadingVerse.text}&rdquo;
        </p>
        <p style={{
          fontFamily: "var(--font-ui)",
          color: "var(--color-accent)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontSize: "0.75rem",
          marginBottom: "var(--space-4)",
        }}>
          {loadingVerse.chapter}
        </p>
        <p style={{
          fontFamily: "var(--font-body)",
          color: "var(--color-text-muted)",
          fontSize: "0.9rem",
        }}>
          Preparing your cook...
        </p>
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

  const planTools: PlanTool[] = (cook?.plan as any)?.tools ?? [];
  const planItems: PlanItem[] = (cook?.plan as any)?.items ?? [];
  const namedTools = planTools.filter(t => t.name?.trim());

  return (
    <div style={{ padding: "40px" }}>
      {error && (
        <div style={{
          background: "#2a0a0a",
          border: "1px solid #c0392b",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-3) var(--space-4)",
          marginBottom: "var(--space-4)",
          color: "#c0392b",
          fontFamily: "var(--font-body)",
          fontSize: "0.9rem",
          lineHeight: 1.5,
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: "var(--space-4)" }}>
        <Link href={`/cook/${cookId}`}>
          <Button>← Back to Cook</Button>
        </Link>
      </div>

      <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-2)" }}>
        Live Mode
      </h1>

      <p style={{
        fontFamily: "var(--font-heading)",
        fontStyle: "italic",
        color: "var(--color-accent)",
        marginBottom: "var(--space-4)",
      }}>
        {getPreacherLine()}
      </p>

      {/* Cook info */}
      <div style={{
        background: "var(--color-bg-alt)",
        padding: "var(--space-4)",
        borderRadius: "var(--radius-lg)",
        marginBottom: "var(--space-4)",
      }}>
        <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-2)" }}>
          {cook.label}
        </h2>
        <p><strong>Status:</strong> {cook.status}</p>
        {cook.eat_time && (
          <p>
            <strong>Eating at:</strong>{" "}
            {new Date(cook.eat_time).toLocaleString(undefined, {
              weekday: "short", month: "short", day: "numeric",
              hour: "numeric", minute: "2-digit",
            })}
          </p>
        )}
      </div>

      {/* Pit overview — one card per smoker */}
      {planTools.length > 0 && (
        <div style={{ marginBottom: "var(--space-4)" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
            Pit Overview
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {planTools.map((tool, idx) => {
              const assigned = planItems.filter(
                i => i.smokerId !== null && String(i.smokerId) === String(tool.id)
              );
              const isActive = selectedSmokerId === String(tool.id);
              return (
                <div
                  key={tool.id}
                  style={{
                    background: "var(--color-bg-alt)",
                    padding: "var(--space-3)",
                    borderRadius: "var(--radius-md)",
                    borderLeft: isActive ? "4px solid var(--color-accent)" : "4px solid transparent",
                  }}
                >
                  <div style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "1rem",
                    marginBottom: "4px",
                  }}>
                    Smoker {idx + 1}{tool.name ? ` — ${tool.name}` : ""}
                    {tool.wood && (
                      <span style={{
                        fontFamily: "var(--font-body)",
                        fontSize: "0.85rem",
                        color: "var(--color-text-muted)",
                        marginLeft: "8px",
                      }}>
                        | {tool.wood}
                      </span>
                    )}
                  </div>
                  {assigned.length > 0 && (
                    <ul style={{
                      margin: 0,
                      paddingLeft: "var(--space-4)",
                      fontFamily: "var(--font-body)",
                      fontSize: "0.875rem",
                      lineHeight: 1.7,
                      color: "var(--color-text-muted)",
                    }}>
                      {assigned.map(item => (
                        <li key={item.name}>
                          {item.name}
                          {item.quantity > 1 ? ` ×${item.quantity}` : ""}
                          {item.weight ? ` (${item.weight} lbs)` : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Log Event */}
      <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
        Log Event
      </h2>

      <div style={{
        background: "var(--color-bg-alt)",
        padding: "var(--space-4)",
        borderRadius: "var(--radius-lg)",
        marginBottom: "var(--space-4)",
      }}>
        <select
          value={eventType}
          onChange={e => setEventType(e.target.value)}
          style={selectStyle}
        >
          <option value="">Select event type...</option>
          {EVENT_TYPES.map(et => (
            <option key={et.value} value={et.value}>{et.label}</option>
          ))}
        </select>

        {namedTools.length > 0 && (
          <select
            value={selectedSmokerId}
            onChange={e => setSelectedSmokerId(e.target.value)}
            style={selectStyle}
          >
            <option value="">Select smoker...</option>
            {namedTools.map(tool => {
              const idx = planTools.indexOf(tool);
              return (
                <option key={tool.id} value={String(tool.id)}>
                  Smoker {idx + 1}{tool.name ? ` — ${tool.name}` : ""}
                </option>
              );
            })}
          </select>
        )}

        <Input
          value={message}
          onChange={e => setMessage(e.target.value)}
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

      {/* Event Log */}
      <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
        Event Log
      </h2>

      {events.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)" }}>No events yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {events.map(event => (
            <div
              key={event.id}
              style={{
                background: "var(--color-bg-alt)",
                padding: "var(--space-3)",
                borderRadius: "var(--radius-md)",
                borderLeft: "4px solid var(--color-accent)",
              }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "var(--space-1)",
              }}>
                <strong>{event.type}</strong>
                <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                  {new Date(event.created_at).toLocaleString()}
                </span>
              </div>
              {event.note && (
                <p style={{ color: "var(--color-text-muted)", margin: 0 }}>{event.note}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Ask the Preacher */}
      {user && (
        <div style={{ marginTop: "var(--space-5)" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
            Ask the Preacher
          </h2>

          <div style={{
            background: "var(--color-bg-alt)",
            padding: "var(--space-4)",
            borderRadius: "var(--radius-lg)",
          }}>
            <Input
              value={askInput}
              onChange={e => setAskInput(e.target.value)}
              placeholder="What's happening at the pit?"
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
              <div style={{
                position: "relative",
                marginTop: "var(--space-4)",
                marginLeft: "var(--space-3)",
                padding: "var(--space-4)",
                background: "var(--color-bg)",
                borderRadius: "var(--radius-md)",
                borderLeft: "4px solid var(--color-accent)",
              }}>
                <span style={{
                  position: "absolute",
                  top: "var(--space-2)",
                  right: "var(--space-3)",
                  color: "var(--color-accent)",
                  fontSize: "0.9rem",
                }}>
                  ✦
                </span>
                <p style={{
                  fontFamily: "var(--font-body)",
                  fontStyle: "italic",
                  lineHeight: 1.7,
                  color: "var(--color-text)",
                  margin: 0,
                }}>
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
