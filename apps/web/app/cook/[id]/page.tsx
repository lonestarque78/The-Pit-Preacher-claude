// PATCH ONLY — replace the handleComplete function and showCompleteConfirm block
// in apps/web/app/cook/[id]/page.tsx
// Do NOT replace the entire file — only these two sections change.

// ─────────────────────────────────────────────
// 1. ADD this state variable near the other useState declarations:
//
//   const [trackChoice, setTrackChoice] = useState<"track" | "skip" | null>(null);
//
// ─────────────────────────────────────────────
// 2. REPLACE handleComplete with this:

const handleComplete = async () => {
  await supabase
    .from("cooks")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", cook.id);
  setShowCompleteConfirm(true); // reuse existing state to show the modal
};

// ─────────────────────────────────────────────
// 3. REPLACE the showCompleteConfirm block in the JSX with this:

{showCompleteConfirm && (
  <div style={{
    position: "fixed",
    inset: 0,
    background: "rgba(10,8,6,0.85)",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "var(--space-4)",
  }}>
    <div style={{
      background: "var(--color-bg-alt)",
      border: "1px solid rgba(201,151,58,0.3)",
      borderRadius: "var(--radius-lg)",
      padding: "var(--space-5)",
      maxWidth: "420px",
      width: "100%",
      textAlign: "center",
    }}>
      <h2 style={{
        fontFamily: "var(--font-heading)",
        fontSize: "1.5rem",
        color: "#F5E6C8",
        margin: "0 0 var(--space-2)",
      }}>
        How did this cook go?
      </h2>
      <p style={{
        fontFamily: "var(--font-body)",
        fontSize: "0.9rem",
        color: "var(--color-text-muted)",
        margin: "0 0 var(--space-4)",
        lineHeight: 1.6,
      }}>
        Track what actually happened to improve your next cook.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <button
          onClick={() => {
            setShowCompleteConfirm(false);
            window.location.href = `/cook/${cookId}/tracker`;
          }}
          style={{
            background: "#C9973A",
            border: "none",
            color: "var(--color-bg)",
            fontFamily: "var(--font-ui)",
            fontSize: "0.9rem",
            padding: "12px",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            letterSpacing: "0.03em",
          }}
        >
          Track This Cook
        </button>
        <button
          onClick={() => {
            setShowCompleteConfirm(false);
            window.location.href = `/cook/${cookId}/summary`;
          }}
          style={{
            background: "transparent",
            border: "1px solid rgba(201,151,58,0.3)",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-ui)",
            fontSize: "0.85rem",
            padding: "10px",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
          }}
        >
          Skip
        </button>
      </div>
    </div>
  </div>
)}
