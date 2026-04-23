// apps/web/components/Paywall.tsx
"use client";

type PaywallProps = {
  onClose?: () => void;
};

export default function Paywall({ onClose }: PaywallProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "var(--color-bg)",
          padding: "32px",
          borderRadius: "var(--radius-lg)",
          width: "420px",
          maxWidth: "90vw",
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-heading)",
            marginBottom: "16px",
          }}
        >
          Unlock Pit Preacher Premium
        </h2>

        <p style={{ marginBottom: "16px", lineHeight: 1.6 }}>
          Premium unlocks live coaching, fire management, cook health score,
          next step prediction, pit behavior tracking, and the full end‑of‑cook
          intelligence layer.
        </p>

        <ul style={{ marginBottom: "20px", lineHeight: 1.6, paddingLeft: "20px" }}>
          <li>Live Mode intelligence</li>
          <li>Next step prediction</li>
          <li>Fire management coaching</li>
          <li>Cook health score</li>
          <li>Pit behavior tracking</li>
          <li>End‑of‑cook summary</li>
        </ul>

        <button
          onClick={() => {
            window.location.href = "/premium";
          }}
          style={{
            width: "100%",
            padding: "12px",
            background: "var(--color-accent)",
            color: "white",
            borderRadius: "var(--radius-md)",
            marginBottom: "10px",
          }}
        >
          Upgrade
        </button>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            padding: "12px",
            background: "var(--color-bg-alt)",
            borderRadius: "var(--radius-md)",
          }}
        >
          Not now
        </button>
      </div>
    </div>
  );
}
