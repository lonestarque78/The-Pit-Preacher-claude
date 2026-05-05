// components/gospel/DailyVerse.tsx
// Drop this component into the dashboard page wherever you want the verse to appear.
// It picks a verse based on the day of the year so it changes daily but is consistent all day.

"use client";

import { VERSES } from "@/lib/verses";

function getDailyVerse() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return VERSES[dayOfYear % VERSES.length] ?? VERSES[0]!;
}

export default function DailyVerse() {
  const verse = getDailyVerse();

  return (
    <div style={{
      borderLeft: "3px solid rgba(201,151,58,0.5)",
      paddingLeft: "var(--space-3)",
      marginBottom: "var(--space-4)",
    }}>
      <p style={{
        fontFamily: "var(--font-body)",
        fontStyle: "italic",
        fontSize: "0.95rem",
        color: "#D9C9A8",
        margin: "0 0 6px",
        lineHeight: 1.65,
      }}>
        &ldquo;{verse.text}&rdquo;
      </p>
      <p style={{
        fontFamily: "var(--font-ui)",
        fontSize: "0.65rem",
        color: "#C9973A",
        textTransform: "uppercase",
        letterSpacing: "0.15em",
        margin: 0,
      }}>
        {verse.chapter}
      </p>
    </div>
  );
}
