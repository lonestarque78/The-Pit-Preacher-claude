import { getRandomVerse } from "@/lib/verses";
import Link from "next/link";

export default function NotFound() {
  const verse = getRandomVerse();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-5)",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-heading)",
          fontStyle: "italic",
          fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
          color: "var(--color-text)",
          maxWidth: "600px",
          lineHeight: 1.55,
          marginBottom: "var(--space-3)",
        }}
      >
        &ldquo;{verse.text}&rdquo;
      </p>

      <p
        style={{
          fontFamily: "var(--font-ui)",
          color: "var(--color-accent)",
          fontSize: "0.75rem",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          marginBottom: "var(--space-5)",
        }}
      >
        ✦ Even the best pitmaster has wandered from the pit ✦
      </p>

      <Link
        href="/"
        style={{
          display: "inline-block",
          padding: "var(--space-3) var(--space-5)",
          background: "var(--color-accent)",
          color: "#fff",
          borderRadius: "var(--radius-md)",
          fontFamily: "var(--font-ui)",
          fontSize: "1rem",
          textDecoration: "none",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Find Your Way Back
      </Link>
    </div>
  );
}
