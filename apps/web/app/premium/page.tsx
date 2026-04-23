// apps/web/app/premium/page.tsx
"use client";

export default function PremiumPage() {
  async function startCheckout() {
    const res = await fetch("/api/checkout", {
      method: "POST",
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          marginBottom: "20px",
        }}
      >
        Pit Preacher Premium
      </h1>

      <p style={{ marginBottom: "20px", lineHeight: 1.6 }}>
        Premium unlocks the full intelligence layer. Real coaching, real
        insight, and a real pitmaster voice over every cook.
      </p>

      <ul
        style={{
          marginBottom: "24px",
          lineHeight: 1.8,
          paddingLeft: "20px",
        }}
      >
        <li>Live Mode intelligence</li>
        <li>Next step prediction</li>
        <li>Fire management coaching</li>
        <li>Cook health score</li>
        <li>Pit behavior tracking</li>
        <li>End-of-cook summary</li>
      </ul>

      <button
        onClick={startCheckout}
        style={{
          padding: "12px 20px",
          background: "var(--color-accent)",
          color: "white",
          borderRadius: "var(--radius-md)",
        }}
      >
        Upgrade Now
      </button>
    </div>
  );
}
