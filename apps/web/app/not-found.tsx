// app/not-found.tsx

import Link from "next/link";
import { VERSES } from "@/lib/verses";

const verse = VERSES[4]!; // "A pitmaster who rushes the rest is a pitmaster who serves regret."

export default function NotFound() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--color-bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--space-5)",
      textAlign: "center",
    }}>
      <p style={{
        fontFamily: "var(--font-ui)",
        fontSize: "0.75rem",
        color: "#C9973A",
        textTransform: "uppercase",
        letterSpacing: "0.2em",
        margin: "0 0 var(--space-3)",
      }}>
        404
      </p>

      <h1 style={{
        fontFamily: "var(--font-heading)",
        fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
        color: "#F5E6C8",
        margin: "0 0 var(--space-4)",
        lineHeight: 1.15,
        maxWidth: "560px",
      }}>
        You have wandered from the pit.
      </h1>

      <p style={{
        fontFamily: "var(--font-body)",
        fontSize: "1rem",
        color: "var(--color-text-muted)",
        margin: "0 0 var(--space-5)",
        lineHeight: 1.6,
        maxWidth: "420px",
      }}>
        This page does not exist. The smoke has cleared and there is nothing here. Return to the congregation.
      </p>

      <div style={{
        borderLeft: "3px solid #C9973A",
        paddingLeft: "var(--space-4)",
        marginBottom: "var(--space-5)",
        textAlign: "left",
        maxWidth: "420px",
      }}>
        <p style={{
          fontFamily: "var(--font-body)",
          fontStyle: "italic",
          fontSize: "1rem",
          color: "#D9C9A8",
          margin: "0 0 6px",
          lineHeight: 1.6,
        }}>
          &ldquo;{verse.text}&rdquo;
        </p>
        <p style={{
          fontFamily: "var(--font-ui)",
          fontSize: "0.7rem",
          color: "#C9973A",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          margin: 0,
        }}>
          {verse.chapter}
        </p>
      </div>

      <Link href="/" style={{
        background: "#C9973A",
        color: "#111",
        fontFamily: "var(--font-ui)",
        fontSize: "0.85rem",
        padding: "12px 28px",
        borderRadius: "var(--radius-md)",
        textDecoration: "none",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}>
        Return to the Pit
      </Link>
    </div>
  );
}
