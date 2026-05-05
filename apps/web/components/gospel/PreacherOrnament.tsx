// components/gospel/PreacherOrnament.tsx
// Add this below the AI reply content on any Preacher response card.
// It shows a subtle verse footer on every Preacher message.

"use client";

import { getRandomVerse } from "@/lib/verses";
import { useMemo } from "react";

export default function PreacherOrnament() {
  const verse = useMemo(() => getRandomVerse(), []);

  return (
    <div style={{
      marginTop: "var(--space-3)",
      paddingTop: "var(--space-2)",
      borderTop: "1px solid rgba(201,151,58,0.12)",
      display: "flex",
      alignItems: "flex-start",
      gap: "var(--space-2)",
    }}>
      <span style={{ color: "rgba(201,151,58,0.4)", fontSize: "0.8rem", flexShrink: 0, marginTop: "1px" }}>✦</span>
      <p style={{
        fontFamily: "var(--font-body)",
        fontStyle: "italic",
        fontSize: "0.78rem",
        color: "rgba(201,151,58,0.6)",
        margin: 0,
        lineHeight: 1.55,
      }}>
        {verse.text} <span style={{ display: "inline-block", marginLeft: "6px", fontFamily: "var(--font-ui)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(201,151,58,0.4)" }}>— {verse.chapter}</span>
      </p>
    </div>
  );
}
