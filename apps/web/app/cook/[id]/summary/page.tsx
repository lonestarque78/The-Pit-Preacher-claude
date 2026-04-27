// apps/web/app/cook/[id]/summary/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Link from "next/link";

export default function SummaryPage({ params }: { params: { id: string } }) {
  const cookId = params.id;

  const [cook, setCook] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [cookLog, setCookLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [summary, setSummary] = useState("");
  const [lessons, setLessons] = useState("");
  const [rating, setRating] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, [cookId]);

  const loadData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Load cook
    const { data: cookData } = await supabase
      .from("cooks")
      .select("*")
      .eq("id", cookId)
      .single();

    // Load cook_items
    const { data: itemsData } = await supabase
      .from("cook_items")
      .select("*")
      .eq("cook_id", cookId);

    // Load cook_events
    const { data: eventsData } = await supabase
      .from("cook_events")
      .select("*")
      .eq("cook_id", cookId)
      .order("created_at", { ascending: false });

    // Load cook_logs
    const { data: logData } = await supabase
      .from("cook_logs")
      .select("*")
      .eq("cook_id", cookId)
      .maybeSingle();

    setCook(cookData);
    setItems(itemsData || []);
    setEvents(eventsData || []);
    setCookLog(logData);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!summary.trim()) {
      alert("Please add a summary");
      return;
    }

    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in");
      setSubmitting(false);
      return;
    }

    // Insert cook_log
    const { error: logError } = await supabase.from("cook_logs").insert({
      cook_id: cookId,
      user_id: user.id,
      summary,
      lessons,
      rating,
    });

    if (logError) {
      console.error(logError);
      alert("Error saving summary");
      setSubmitting(false);
      return;
    }

    // Update cook status to completed
    const { error: cookError } = await supabase
      .from("cooks")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", cookId);

    if (cookError) {
      console.error(cookError);
    }

    setSubmitting(false);
    loadData();
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
          marginBottom: "var(--space-4)",
        }}
      >
        Cook Summary
      </h1>

      <div
        style={{
          background: "var(--color-bg-alt)",
          padding: "var(--space-4)",
          borderRadius: "var(--radius-lg)",
          marginBottom: "var(--space-4)",
        }}
      >
        <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-2)" }}>
          {cook.label}
        </h2>
        <p>
          <strong>Status:</strong> {cook.status}
        </p>
        <p>
          <strong>Smoker:</strong> {cook.smoker_type || "Not specified"}
        </p>
        <p>
          <strong>Wood:</strong> {cook.wood_type || "Not specified"}
        </p>
        {cook.completed_at && (
          <p>
            <strong>Completed:</strong> {new Date(cook.completed_at).toLocaleString()}
          </p>
        )}
      </div>

      {items.length > 0 && (
        <div
          style={{
            background: "var(--color-bg-alt)",
            padding: "var(--space-4)",
            borderRadius: "var(--radius-lg)",
            marginBottom: "var(--space-4)",
          }}
        >
          <h3 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-2)" }}>
            Items Cooked
          </h3>
          <ul style={{ paddingLeft: "var(--space-4)" }}>
            {items.map((item) => (
              <li key={item.id}>{item.name}</li>
            ))}
          </ul>
        </div>
      )}

      {events.length > 0 && (
        <div
          style={{
            background: "var(--color-bg-alt)",
            padding: "var(--space-4)",
            borderRadius: "var(--radius-lg)",
            marginBottom: "var(--space-4)",
          }}
        >
          <h3 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-2)" }}>
            Event Count
          </h3>
          <p>{events.length} events logged</p>
        </div>
      )}

      {cookLog ? (
        <div
          style={{
            background: "var(--color-bg-alt)",
            padding: "var(--space-4)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              marginBottom: "var(--space-3)",
            }}
          >
            Your Summary
          </h2>

          <div style={{ marginBottom: "var(--space-3)" }}>
            <strong>Rating:</strong>{" "}
            {"★".repeat(cookLog.rating)}
            {"☆".repeat(5 - cookLog.rating)}
          </div>

          <div style={{ marginBottom: "var(--space-3)" }}>
            <strong>Summary:</strong>
            <p style={{ color: "var(--color-text-muted)" }}>{cookLog.summary}</p>
          </div>

          {cookLog.lessons && (
            <div>
              <strong>Lessons Learned:</strong>
              <p style={{ color: "var(--color-text-muted)" }}>{cookLog.lessons}</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              marginBottom: "var(--space-3)",
            }}
          >
            Create Summary
          </h2>

          <div
            style={{
              background: "var(--color-bg-alt)",
              padding: "var(--space-4)",
              borderRadius: "var(--radius-lg)",
              marginBottom: "var(--space-4)",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "var(--space-1)",
                fontFamily: "var(--font-body)",
              }}
            >
              Rating
            </label>
            <div style={{ marginBottom: "var(--space-3)" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    color: star <= rating ? "var(--color-accent)" : "var(--color-text-muted)",
                  }}
                >
                  {star <= rating ? "★" : "☆"}
                </button>
              ))}
            </div>

            <label
              style={{
                display: "block",
                marginBottom: "var(--space-1)",
                fontFamily: "var(--font-body)",
              }}
            >
              Summary
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="How did the cook go? What did you make?"
              rows={4}
              style={{
                width: "100%",
                padding: "12px",
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text)",
                fontFamily: "var(--font-body)",
                marginBottom: "var(--space-3)",
              }}
            />

            <label
              style={{
                display: "block",
                marginBottom: "var(--space-1)",
                fontFamily: "var(--font-body)",
              }}
            >
              Lessons Learned (optional)
            </label>
            <textarea
              value={lessons}
              onChange={(e) => setLessons(e.target.value)}
              placeholder="What would you do differently next time?"
              rows={3}
              style={{
                width: "100%",
                padding: "12px",
                background: "var(--color-bg)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                color: "var(--color-text)",
                fontFamily: "var(--font-body)",
                marginBottom: "var(--space-3)",
              }}
            />

            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : "Save Summary & Complete Cook"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
      .eq("cook_id", cookId)
      .order("created_at", { ascending: true });

    const safeEvents = eventData || [];

    setCook(cookData);
    setEvents(safeEvents);

    const tl = generateTimeline(cookData, safeEvents);
    setTimeline(tl);

    const summaryLine = preacherLine({
      meat: cookData.meat.toLowerCase(),
      pit: cookData.pit.toLowerCase(),
      event: "summary",
      stall: false,
      temp: null,
      action: "summary",
    });
    setFinalLine(summaryLine);

    const behaviorLine = pitBehavior(safeEvents);
    setBehavior(behaviorLine);

    const tempLogs = safeEvents.filter((e) => e.type === "temp_log");
    const temps = tempLogs.map((e) => parseInt(e.note || "0", 10));
    const avgTemp =
      temps.length > 0
        ? Math.floor(temps.reduce((a, b) => a + b, 0) / temps.length)
        : null;

    const fireLine = fireTip({
      pit: cookData.pit,
      temp: avgTemp,
      phase: "summary",
    });
    setFire(fireLine);
  };

  if (premium === false) {
    return (
      <Paywall
        onClose={() => {
          window.location.href = `/cook/${cookId}`;
        }}
      />
    );
  }

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
        Cook Summary
      </h1>

      <p
        style={{
          marginBottom: "var(--space-5)",
          fontStyle: "italic",
          opacity: 0.9,
        }}
      >
        {finalLine}
      </p>

      <div
        style={{
          background: "var(--color-bg-alt)",
          padding: "var(--space-4)",
          borderRadius: "var(--radius-lg)",
          marginBottom: "var(--space-5)",
        }}
      >
        <p>
          <strong>Meat:</strong> {cook.meat}
        </p>
        <p>
          <strong>Pit:</strong> {cook.pit}
        </p>
        <p>
          <strong>Status:</strong> {cook.status}
        </p>
        {cook.started_at && (
          <p>
            <strong>Started:</strong>{" "}
            {new Date(cook.started_at).toLocaleString()}
          </p>
        )}
      </div>

      <h2
        style={{
          fontFamily: "var(--font-heading)",
          marginBottom: "var(--space-3)",
        }}
      >
        Pit Behavior
      </h2>

      <div
        style={{
          background: "var(--color-bg-alt)",
          padding: "var(--space-3)",
          borderRadius: "var(--radius-md)",
          marginBottom: "var(--space-5)",
        }}
      >
        <p>{behavior}</p>
      </div>

      <h2
        style={{
          fontFamily: "var(--font-heading)",
          marginBottom: "var(--space-3)",
        }}
      >
        Fire Management
      </h2>

      <div
        style={{
          background: "var(--color-bg-alt)",
          padding: "var(--space-3)",
          borderRadius: "var(--radius-md)",
          marginBottom: "var(--space-5)",
        }}
      >
        <p>{fire}</p>
      </div>

      <h2
        style={{
          fontFamily: "var(--font-heading)",
          marginBottom: "var(--space-3)",
        }}
      >
        Timeline Recap
      </h2>

      {timeline.map((step, index) => (
        <div
          key={index}
          style={{
            background: "var(--color-bg-alt)",
            padding: "var(--space-3)",
            borderRadius: "var(--radius-md)",
            marginBottom: "var(--space-3)",
            borderLeft: "4px solid var(--color-accent)",
          }}
        >
          <h3 style={{ fontFamily: "var(--font-ui)" }}>{step.label}</h3>
          <p>{step.detail}</p>
          <p
            style={{
              fontSize: "14px",
              color: "var(--color-text-muted)",
            }}
          >
            {step.time.toLocaleString()}
          </p>
        </div>
      ))}

      <h2
        style={{
          fontFamily: "var(--font-heading)",
          marginBottom: "var(--space-3)",
        }}
      >
        Event Recap
      </h2>

      {events.map((event) => (
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
          <p>
            <strong>{event.type}</strong>
          </p>
          {event.note && <p>{event.note}</p>}
          <p
            style={{
              fontSize: "14px",
              color: "var(--color-text-muted)",
            }}
          >
            {new Date(event.created_at).toLocaleString()}
          </p>
        </div>
      ))}

      <div style={{ height: "20px" }}></div>

      <Button
        onClick={() => {
          window.location.href = `/cook/${cookId}`;
        }}
      >
        Back to Cook
      </Button>
    </div>
  );
}

