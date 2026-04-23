// apps/web/app/premium/cancel.tsx

export default function PremiumCancel() {
  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "20px" }}>
        Upgrade Canceled
      </h1>

      <p style={{ marginBottom: "20px" }}>
        Your upgrade was canceled. You can try again anytime.
      </p>

      <button
        onClick={() => {
          window.location.href = "/premium";
        }}
        style={{
          padding: "12px 20px",
          background: "var(--color-accent)",
          color: "white",
          borderRadius: "var(--radius-md)",
        }}
      >
        Try Again
      </button>
    </div>
  );
}
