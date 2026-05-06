export default function NotFound() {
  return (
    <div style={{ padding: "var(--space-4)", textAlign: "center" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", color: "var(--color-text)" }}>404 - Not Found</h1>
      <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
        The cook you're looking for doesn't exist.
      </p>
    </div>
  );
}