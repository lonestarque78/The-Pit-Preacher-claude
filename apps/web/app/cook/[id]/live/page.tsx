"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { generateTimeline } from "../timeline/engine";
import { preacherLine } from "../preacher/voice";
import { fireTip } from "../preacher/fire";
import Button from "@/components/Button";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";

ChartJS.register(LineElement, PointElement, LinearScale, TimeScale, Tooltip, Legend);

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

  const [nextStep, setNextStep] = useState({
    label: "",
    time: null,
    minutes: 0,
    preacher: "",
  });

  const [fire, setFire] = useState("");

  const [health, setHealth] = useState(100);

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
    computeNextStep(timeline, cookData);
    detectStall(eventData || [], cookData);
    computeFireTip(eventData || [], cookData);
    computeHealthScore(eventData || [], timeline);
  };

  const computeHealthScore = (eventData, timeline) => {
    let score = 100;

    const tempLogs = eventData.filter((e) => e.type === "temp_log");

    // Temperature stability (40 pts)
    if (tempLogs.length >= 3) {
      let swings = 0;
      for (let i = 1; i < tempLogs.length; i++) {
        const prev = parseInt(tempLogs[i - 1].note || "0");
        const curr = parseInt(tempLogs[i].note || "0");
        swings += Math.abs(curr - prev);
      }
      const avgSwing = swings / tempLogs.length;
      if (avgSwing > 15) score -= 20;
      if (avgSwing > 25) score -= 40;
    }

    // Timeline accuracy (30 pts)
    const now = new Date();
    const end = timeline[timeline.length - 1].time;
    const remaining = end.getTime() - now.getTime();
    if (remaining < -30 * 60000) score -= 15; // behind
    if (remaining > 90 * 60000) score -= 15; // ahead

    // Stall behavior (20 pts)
    if (stallState.stalled) score -= 10;
    if (stallState.stalled && tempLogs.length > 5) score -= 20;

    // Event quality (10 pts)
    const spritzes = eventData.filter((e) => e.type === "spritz");
    if (spritzes.length > 5) score -= 5;
    if (spritzes.length === 0) score -= 5;

    setHealth(Math.max(0, Math.min(100, score)));
  };

  const computeFireTip = (eventData, cookData) => {
    const tempLogs = eventData.filter((e) => e.type === "temp_log");
    const lastTemp = tempLogs.length ? tempLogs[tempLogs.length - 1].note : null;

    const tip = fireTip({
      pit: cookData.pit,
      temp: lastTemp,
      phase: progress.phase,
    });

    setFire(tip);
  };

  const computeNextStep = (timeline, cookData) => {
    const now = new Date();

    for (let i = 0; i < timeline.length; i++) {
      if (timeline[i].time > now) {
        const minutes = Math.max(
          Math.floor((timeline[i].time - now) / 60000),
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

  const tempLogs = events
    .filter((e) => e.type === "temp_log")
    .map((e) => ({
      x: new Date(e.created_at),
      y: parseInt(e.note || "0"),
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

  const chartOptions = {
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

  if (!cook) {
    return (
      <div style={{ padding: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Loading...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-4)" }}>
        Live Mode
      </h1>

      <p style={{ marginBottom: "var(--space-5)", fontStyle: "italic", opacity: 0.9 }}>
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

      <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
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
        <p><strong>{health}/100</strong></p>
      </div>

      <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
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

      <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
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
        <p><strong>{nextStep.label}</strong></p>
        <p>In {nextStep.minutes} minutes</p>
        <p style={{ fontStyle: "italic", opacity: 0.9 }}>{nextStep.preacher}</p>
      </div>

      <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
        Temperature Chart
      </h2>

      <div style={{ marginBottom: "var(--space-5)" }}>
        <Line data={chartData} options={chartOptions} />
      </div>

      <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
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
