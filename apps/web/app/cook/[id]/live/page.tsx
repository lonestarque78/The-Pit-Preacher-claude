"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { generateTimeline } from "../timeline/engine";
import { preacherLine } from "../preacher/voice";
import Button from "@/components/Button";

export default function LiveModePage({ params }) {
  const cookId = params.id;

  const [cook, setCook] = useState(null);
  const [events, setEvents] = useState([]);
  const [steps, setSteps] = useState([]);
  const [line, setLine] = useState("");

  const [progress, setProgress] = useState({
    percent: 0,
    phase: "",
    finishTime: null,
    remaining: "",
  });

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadAll = async () => {
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

    setCook(cookData);
    setEvents(eventData || []);

    const timeline = generateTimeline(cookData, eventData || []);
    setSteps(timeline);

    computeProgress(timeline);

    const lastEvent = eventData?.[eventData.length - 1];

    const preacher = preacherLine({
      meat: cookData.meat.toLowerCase(),
      pit: cookData.pit.toLowerCase(),
      event: lastEvent ? lastEvent.type : "live",
      stall: false,
      temp: lastEvent?.type === "temp_log" ? lastEvent.note : null,
      action: "live",
    });

    setLine(preacher);
  };

  const computeProgress = (timeline) => {
    if (!timeline || timeline.length === 0) return;

    const now = new Date();
    const start = new Date(timeline[0].time.getTime() - 30 * 60000); // fire-up offset
    const end = timeline[timeline.length - 1].time;

    const total = end.getTime() - start.getTime();
    const done = now.getTime() - start.getTime();

    const percent = Math.min(Math.max((done / total) * 100, 0), 100);

    // Determine current phase
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

    // Time remaining
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
        <p><strong>Phase:</strong> {progress.phase}</p>
        <p><strong>Progress:</strong> {progress.percent}%</p>
        <p><strong>Time Remaining:</strong> {progress.remaining}</p>
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
          <p style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
            {step.time.toLocaleString()}
          </p>
        </div>
      ))}

      <div style={{ height: "20px" }}></div>

      <Button
        onClick={() => {
          window.location.href = `/cook/${cookId}/events`;
        }}
      >
        View Events
      </Button>
    </div>
  );
}

