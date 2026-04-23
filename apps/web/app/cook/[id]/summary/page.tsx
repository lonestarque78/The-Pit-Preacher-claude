// apps/web/app/cook/[id]/summary/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { isPremium } from "@/lib/premium";
import Paywall from "@/components/Paywall";
import Button from "@/components/Button";

import { generateTimeline } from "../timeline/engine";
import { preacherLine } from "../preacher/voice";
import { fireTip } from "../preacher/fire";
import { pitBehavior } from "../preacher/behavior";

export default function SummaryPage({ params }) {
  const cookId = params.id;

  const [premium, setPremium] = useState<boolean | null>(null);

  const [cook, setCook] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);

  const [finalLine, setFinalLine] = useState("");
  const [behavior, setBehavior] = useState("");
  const [fire, setFire] = useState("");

  useEffect(() => {
    loadAll();
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

