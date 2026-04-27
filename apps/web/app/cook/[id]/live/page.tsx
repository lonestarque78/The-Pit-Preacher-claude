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

  const [eventType, setEventType] = useState("");
  const [message, setMessage] = useState("");

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
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("cook_events").insert({
      cook_id: cookId,
      user_id: user.id,
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

  // Generate preacher line based on cook context
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
        <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-2)" }}>
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

        <Button onClick={handleSubmit} disabled={submitting} style={{ marginTop: "var(--space-3)" }}>
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
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--space-1)" }}>
                <strong>{event.type}</strong>
                <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
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
    </div>
  );
}

  const [fire, setFire] = useState("");
  const [health, setHealth] = useState(100);

  const [stallState, setStallState] = useState({
    stalled: false,
    lastTemp: null as number | null,
  });

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadAll = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const hasPremium = await isPremium(user?.id, supabase);
    setPremium(hasPremium);

    if (!hasPremium) return;

    const { data: cookData } = await supabase
      .from("cooks")
      .select("*")
      .eq("id", cookId)
      .single();

    const { data: eventData } = await supabase
      .from("cook_events")
      .select("*")
      .eq("cook_id", cookId)
      .order("created_at", { ascending: true });

    const safeEvents = eventData || [];

    setCook(cookData);
    setEvents(safeEvents);

    const timeline = generateTimeline(cookData, safeEvents);
    setSteps(timeline);

    computeProgress(timeline);
    computeNextStep(timeline, cookData);
    detectStall(safeEvents, cookData);
    computeFireTip(safeEvents, cookData);
    computeHealthScore(safeEvents, timeline);
  };

  const computeHealthScore = (eventData: any[], timeline: any[]) => {
    let score = 100;

    const tempLogs = eventData.filter((e) => e.type === "temp_log");

    if (tempLogs.length >= 3) {
      let swings = 0;
      for (let i = 1; i < tempLogs.length; i++) {
        const prev = parseInt(tempLogs[i - 1].note || "0", 10);
        const curr = parseInt(tempLogs[i].note || "0", 10);
        swings += Math.abs(curr - prev);
      }
      const avgSwing = swings / tempLogs.length;
      if (avgSwing > 15) score -= 20;
      if (avgSwing > 25) score -= 40;
    }

    if (timeline.length > 0) {
      const now = new Date();
      const end = timeline[timeline.length - 1].time as Date;
      const remaining = end.getTime() - now.getTime();
      if (remaining < -30 * 60000) score -= 15;
      if (remaining > 90 * 60000) score -= 15;
    }

    if (stallState.stalled) score -= 10;
    if (stallState.stalled && tempLogs.length > 5) score -= 20;

    const spritzes = eventData.filter((e) => e.type === "spritz");
    if (spritzes.length > 5) score -= 5;
    if (spritzes.length === 0) score -= 5;

    setHealth(Math.max(0, Math.min(100, score)));
  };

  const computeFireTip = (eventData: any[], cookData: any) => {
    const tempLogs = eventData.filter((e) => e.type === "temp_log");
    const lastTemp = tempLogs.length
      ? parseInt(tempLogs[tempLogs.length - 1].note || "0", 10)
      : null;

    const tip = fireTip({
      pit: cookData.pit,
      temp: lastTemp,
      phase: progress.phase,
    });

    setFire(tip);
  };

  const computeNextStep = (timeline: any[], cookData: any) => {
    const now = new Date();

    for (let i = 0; i < timeline.length; i++) {
      if (timeline[i].time > now) {
        const minutes = Math.max(
          Math.floor((timeline[i].time.getTime() - now.getTime()) / 60000),
          0
        );

        const preacher = preacherLine({
          meat: cookData.meat.toLowerCase(),
          pit: cookData.pit.toLowerCase(),
          event: timeline[i].label.toLowerCase(),
          stall: false,
          temp: null,
          action: "next_step",
        });

        setNextStep({
          label: timeline[i].label,
          time: timeline[i].time,
          minutes,
          preacher,
        });

        return;
      }
    }

    setNextStep({
      label: "Resting",
      time: null,
      minutes: 0,
      preacher: preacherLine({
        meat: cookData.meat.toLowerCase(),
        pit: cookData.pit.toLowerCase(),
        event: "rest",
        stall: false,
        temp: null,
        action: "next_step",
      }),
    });
  };

  const detectStall = (eventData: any[], cookData: any) => {
    const tempLogs = eventData.filter((e) => e.type === "temp_log");

    if (tempLogs.length < 2) {
      setLine(
        preacherLine({
          meat: cookData.meat.toLowerCase(),
          pit: cookData.pit.toLowerCase(),
          event: "live",
          stall: false,
          temp: null,
          action: "live",
        })
      );
      return;
    }

    const first = tempLogs[tempLogs.length - 2];
    const last = tempLogs[tempLogs.length - 1];

    const firstTemp = parseInt(first.note || "0", 10);
    const lastTemp = parseInt(last.note || "0", 10);

    const timeDiff =
      (new Date(last.created_at).getTime() -
        new Date(first.created_at).getTime()) /
      60000;

    const tempDiff = lastTemp - firstTemp;

    if (timeDiff >= 45 && tempDiff < 5 && !stallState.stalled) {
      setStallState({ stalled: true, lastTemp });

      setLine(
        preacherLine({
          meat: cookData.meat.toLowerCase(),
          pit: cookData.pit.toLowerCase(),
          event: "stall",
          stall: true,
          temp: lastTemp,
          action: "stall",
        })
      );

      return;
    }

    if (stallState.stalled && tempDiff > 10) {
      setStallState({ stalled: false, lastTemp });

      setLine(
        preacherLine({
          meat: cookData.meat.toLowerCase(),
          pit: cookData.pit.toLowerCase(),
          event: "stall_break",
          stall: false,
          temp: lastTemp,
          action: "stall_break",
        })
      );

      return;
    }

    setLine(
      preacherLine({
        meat: cookData.meat.toLowerCase(),
        pit: cookData.pit.toLowerCase(),
        event: "live",
        stall: stallState.stalled,
        temp: lastTemp,
        action: "live",
      })
    );
  };

  const computeProgress = (timeline: any[]) => {
    if (!timeline || timeline.length === 0) return;

    const now = new Date();
    const start = new Date(timeline[0].time.getTime() - 30 * 60000);
    const end = timeline[timeline.length - 1].time as Date;

    const total = end.getTime() - start.getTime();
    const done = now.getTime() - start.getTime();

    const percent = Math.min(Math.max((done / total) * 100, 0), 100);

    let phase = "Starting";

    for (let i = 0; i < timeline.length; i++) {
      if (now < timeline[i].time) {
        phase = timeline[i].label;
        break;
      }
      if (i === timeline.length - 1) {
        phase = "Resting";
      }
    }

    const remainingMs = end.getTime() - now.getTime();
    const remainingMin = Math.max(Math.floor(remainingMs / 60000), 0);
    const remaining = `${remainingMin} minutes`;

    setProgress({
      percent: Math.floor(percent),
      phase,
      finishTime: end,
      remaining,
    });
  };

  const tempLogs = events
    .filter((e) => e.type === "temp_log")
    .map((e) => ({
      x: new Date(e.created_at),
      y: parseInt(e.note || "0", 10),
    }));

  const chartData = {
    datasets: [
      {
        label: "Internal Temp",
        data: tempLogs,
        borderColor: "var(--color-accent)",
        backgroundColor: "var(--color-accent)",
        tension: 0.3,
        pointRadius: 3,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    scales: {
      x: {
        type: "time",
        time: { unit: "minute" },
        ticks: { color: "var(--color-text)" },
      },
      y: {
        ticks: { color: "var(--color-text)" },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  if (premium === false) {
    return <Paywall onClose={() => setPremium(false)} />;
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
        Live Mode
      </h1>

      <p
        style={{
          marginBottom: "var(--space-5)",
          fontStyle: "italic",
          opacity: 0.9,
        }}
      >
        {line}
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
          <strong>Phase:</strong> {progress.phase}
        </p>
        <p>
          <strong>Progress:</strong> {progress.percent}%
        </p>
        <p>
          <strong>Time Remaining:</strong> {progress.remaining}
        </p>
        <p>
          <strong>Estimated Finish:</strong>{" "}
          {progress.finishTime?.toLocaleString()}
        </p>
      </div>

      <h2
        style={{
          fontFamily: "var(--font-heading)",
          marginBottom: "var(--space-3)",
        }}
      >
        Cook Health Score
      </h2>

      <div
        style={{
          background: "var(--color-bg-alt)",
          padding: "var(--space-3)",
          borderRadius: "var(--radius-md)",
          marginBottom: "var(--space-5)",
        }}
      >
        <p>
          <strong>{health}/100</strong>
        </p>
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
        Next Step
      </h2>

      <div
        style={{
          background: "var(--color-bg-alt)",
          padding: "var(--space-3)",
          borderRadius: "var(--radius-md)",
          marginBottom: "var(--space-5)",
        }}
      >
        <p>
          <strong>{nextStep.label}</strong>
        </p>
        <p>In {nextStep.minutes} minutes</p>
        <p style={{ fontStyle: "italic", opacity: 0.9 }}>{nextStep.preacher}</p>
      </div>

      <h2
        style={{
          fontFamily: "var(--font-heading)",
          marginBottom: "var(--space-3)",
        }}
      >
        Temperature Chart
      </h2>

      <div style={{ marginBottom: "var(--space-5)" }}>
        <Line data={chartData} options={chartOptions} />
      </div>

      <h2
        style={{
          fontFamily: "var(--font-heading)",
          marginBottom: "var(--space-3)",
        }}
      >
        Timeline
      </h2>

      {steps.map((step, index) => (
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

      <div style={{ height: "20px" }}></div>

      <Button
        onClick={() => {
          window.location.href = `/cook/${cookId}/summary`;
        }}
      >
        View Summary
      </Button>
    </div>
  );
}
