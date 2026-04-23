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

  const [stallState, setStallState] = useState({
    stalled: false,
    lastTemp: null,
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
    detectStall(eventData || [], cookData);
  };

  const detectStall = (eventData, cookData) => {
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

    const firstTemp = parseInt(first.note || "0");
    const lastTemp = parseInt(last.note || "0");

    const timeDiff =
      (new Date(last.created_at).getTime() -
        new Date(first.created_at).getTime()) /
      60000;

    const tempDiff = lastTemp - firstTemp;

    // Stall detected
    if (timeDiff >= 45 && tempDiff < 5 && !stallState.stalled) {
      setStallState({ stalled: true, lastTemp: lastTemp });

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

    // Stall broken
    if (stallState.stalled && tempDiff > 10) {
      setStallState({ stalled: false, lastTemp: lastTemp });

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

    // Normal preacher line
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

  const computeProgress = (timeline) => {
    if (!timeline || timeline.length === 0) return;

    const now = new Date();
    const start = new Date(timeline[0].time.getTime() - 30 * 60000);
    const end = timeline[timeline.length - 1].time;

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
