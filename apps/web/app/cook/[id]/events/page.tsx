import { createServerClient } from "@/lib/supabase-server";
import Link from "next/link";

const navBtnStyle = {
  background: "transparent",
  border: "1px solid rgba(201,151,58,0.3)",
  color: "var(--color-text-muted)",
  fontFamily: "var(--font-ui)",
  fontSize: "0.8rem",
  padding: "6px 14px",
  borderRadius: "var(--radius-md)",
  cursor: "pointer",
  textDecoration: "none",
  display: "inline-block",
  whiteSpace: "nowrap",
} as const;
const navBtnActiveStyle = {
  ...navBtnStyle,
  borderColor: "#C9973A",
  color: "#C9973A",
} as const;

export default async function CookEventsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: cookId } = await params;
  const supabase = await createServerClient();

  // Load cook
  const { data: cook, error: cookError } = await supabase
    .from("cooks")
    .select("*")
    .eq("id", cookId)
    .single();

  if (cookError || !cook) {
    return (
      <div style={{ padding: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Cook Not Found</h1>
      </div>
    );
  }

  // Load cook_events ordered by created_at ascending
  const { data: events } = await supabase
    .from("cook_events")
    .select("*")
    .eq("cook_id", cookId)
    .order("created_at", { ascending: true });

  const eventList = events || [];

  const NAV_LINKS = [
    { label: "Live Mode", href: `/cook/${cookId}/live` },
    { label: "Timeline",  href: `/cook/${cookId}/timeline` },
    { label: "Guide",     href: `/cook/${cookId}/guide` },
    { label: "Events",    href: `/cook/${cookId}/events`, active: true },
    { label: "Summary",   href: `/cook/${cookId}/summary` },
  ];

  return (
    <div style={{ padding: "40px", paddingBottom: "80px" }}>
      <Link href={`/cook/${cookId}`} style={{
        display: "block",
        padding: "0 0 var(--space-4) 0",
        fontFamily: "var(--font-ui)",
        fontSize: "0.8rem",
        color: "#C9973A",
        textDecoration: "none",
      } as const}>
        ← Back to Cook
      </Link>

      <h1
        style={{
          fontFamily: "var(--font-heading)",
          marginBottom: "var(--space-4)",
        }}
      >
        Events
      </h1>

      <div
        style={{
          background: "var(--color-bg-alt)",
          padding: "var(--space-4)",
          borderRadius: "var(--radius-lg)",
          marginBottom: "var(--space-5)",
        }}
      >
        <p><strong>Cook:</strong> {cook.label}</p>
        <p><strong>Status:</strong> {cook.status}</p>
      </div>

      <h2
        style={{
          fontFamily: "var(--font-heading)",
          marginBottom: "var(--space-3)",
        }}
      >
        Event History
      </h2>

      {eventList.length === 0 && (
        <p style={{ color: "var(--color-text-muted)" }}>No events yet.</p>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        {eventList.map((event) => (
          <div
            key={event.id}
            style={{
              background: "var(--color-bg-alt)",
              padding: "var(--space-3)",
              borderRadius: "var(--radius-md)",
              borderLeft: "4px solid var(--color-accent)",
            }}
          >
            <p style={{ marginBottom: "var(--space-1)" }}>
              <strong>Type:</strong> {event.type}
            </p>

            {event.note && (
              <p style={{ marginBottom: "var(--space-2)", color: "var(--color-text-muted)" }}>
                {event.note}
              </p>
            )}

            <p style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
              {new Date(event.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* ── STICKY BOTTOM BAR ── */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "var(--color-bg-alt)",
        borderTop: "1px solid rgba(201,151,58,0.2)",
        padding: "var(--space-2) var(--space-4)",
        display: "flex",
        justifyContent: "center",
        gap: "var(--space-3)",
        flexWrap: "wrap",
      }}>
        {NAV_LINKS.map(link => (
          <Link key={link.href} href={link.href} style={link.active ? navBtnActiveStyle : navBtnStyle}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
