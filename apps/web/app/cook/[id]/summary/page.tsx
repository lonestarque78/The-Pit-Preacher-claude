"use client";

import { use, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { getRandomVerse } from "@/lib/verses";
import Button from "@/components/Button";
import Link from "next/link";

export default function SummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: cookId } = use(params);

  const [cook, setCook] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [cookLog, setCookLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [summary, setSummary] = useState("");
  const [lessons, setLessons] = useState("");
  const [rating, setRating] = useState(0);

  const [showVerseOverlay, setShowVerseOverlay] = useState(false);
  const [completionVerse] = useState(() => getRandomVerse());

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, [cookId]);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: cookData } = await supabase
      .from("cooks")
      .select("*")
      .eq("id", cookId)
      .single();

    const { data: itemsData } = await supabase
      .from("cook_items")
      .select("*")
      .eq("cook_id", cookId);

    const { data: eventsData } = await supabase
      .from("cook_events")
      .select("*")
      .eq("cook_id", cookId)
      .order("created_at", { ascending: false });

    const { data: logData } = await supabase
      .from("cook_logs")
      .select("*")
      .eq("cook_id", cookId)
      .maybeSingle();

    setCook(cookData);
    setItems(itemsData || []);
    setEvents(eventsData || []);
    setCookLog(logData);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!summary.trim()) {
      alert("Please add a summary");
      return;
    }

    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in");
      setSubmitting(false);
      return;
    }

    const { error: logError } = await supabase.from("cook_logs").insert({
      cook_id: cookId,
      user_id: user.id,
      summary,
      lessons,
      rating,
    });

    if (logError) {
      console.error(logError);
      alert("Error saving summary");
      setSubmitting(false);
      return;
    }

    const { error: cookError } = await supabase
      .from("cooks")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", cookId);

    if (cookError) console.error(cookError);

    setSubmitting(false);
    setShowVerseOverlay(true);
    setTimeout(() => {
      setShowVerseOverlay(false);
      loadData();
    }, 3000);
  };

  if (loading) {
    return (
      <div style={{ padding: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Loading...</h1>
      </div>
    );
  }

  if (!cook) {
    return (
      <div style={{ padding: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-heading)" }}>Cook Not Found</h1>
      </div>
    );
  }

  const textareaStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px",
    background: "var(--color-bg)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-md)",
    color: "var(--color-text)",
    fontFamily: "var(--font-body)",
    fontSize: "1rem",
    marginBottom: "var(--space-3)",
    boxSizing: "border-box",
    resize: "vertical",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "var(--font-ui)",
    fontSize: "0.85rem",
    color: "var(--color-text-muted)",
    marginBottom: "var(--space-1)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const NAV_LINKS = [
    { label: "Live Mode", href: `/cook/${cookId}/live` },
    { label: "Timeline",  href: `/cook/${cookId}/timeline` },
    { label: "Guide",     href: `/cook/${cookId}/guide` },
    { label: "Events",    href: `/cook/${cookId}/events` },
    { label: "Summary",   href: `/cook/${cookId}/summary`, active: true },
  ];

  return (
    <div style={{ padding: "40px", maxWidth: "760px", paddingBottom: "80px" }}>

      {/* ── EARNED VERSE OVERLAY ── */}
      {showVerseOverlay && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "var(--color-bg)",
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-5)",
          textAlign: "center",
        }}>
          <p style={{
            fontFamily: "var(--font-heading)",
            fontStyle: "italic",
            fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
            color: "var(--color-text)",
            maxWidth: "600px",
            lineHeight: 1.55,
            marginBottom: "var(--space-4)",
          }}>
            &ldquo;{completionVerse.text}&rdquo;
          </p>
          <p style={{
            fontFamily: "var(--font-ui)",
            color: "var(--color-accent)",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            fontSize: "0.9rem",
            margin: 0,
          }}>
            ✦ Well done, Pitmaster ✦
          </p>
        </div>
      )}

      <div style={{ marginBottom: "var(--space-4)" }}>
        <Link href={`/cook/${cookId}`}>
          <Button>← Back to Cook</Button>
        </Link>
      </div>

      <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-4)" }}>
        Cook Summary
      </h1>

      {/* Cook info */}
      <div style={{
        background: "var(--color-bg-alt)",
        padding: "var(--space-4)",
        borderRadius: "var(--radius-lg)",
        marginBottom: "var(--space-4)",
      }}>
        <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-2)" }}>
          {cook.label}
        </h2>
        <p style={{ fontFamily: "var(--font-body)", marginBottom: "var(--space-1)" }}>
          <strong>Status:</strong> {cook.status}
        </p>
        <p style={{ fontFamily: "var(--font-body)", marginBottom: "var(--space-1)" }}>
          <strong>Smoker:</strong> {cook.smoker_type || "Not specified"}
        </p>
        <p style={{ fontFamily: "var(--font-body)", marginBottom: 0 }}>
          <strong>Wood:</strong> {cook.wood_type || "Not specified"}
        </p>
        {cook.completed_at && (
          <p style={{ fontFamily: "var(--font-body)", marginTop: "var(--space-1)", marginBottom: 0 }}>
            <strong>Completed:</strong> {new Date(cook.completed_at).toLocaleString()}
          </p>
        )}
      </div>

      {/* Items */}
      {items.length > 0 && (
        <div style={{
          background: "var(--color-bg-alt)",
          padding: "var(--space-4)",
          borderRadius: "var(--radius-lg)",
          marginBottom: "var(--space-4)",
        }}>
          <h3 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-2)" }}>
            Items Cooked
          </h3>
          <ul style={{ paddingLeft: "var(--space-4)", fontFamily: "var(--font-body)", lineHeight: 1.8, margin: 0 }}>
            {items.map(item => <li key={item.id}>{item.name}</li>)}
          </ul>
        </div>
      )}

      {/* Event count */}
      {events.length > 0 && (
        <div style={{
          background: "var(--color-bg-alt)",
          padding: "var(--space-4)",
          borderRadius: "var(--radius-lg)",
          marginBottom: "var(--space-4)",
        }}>
          <h3 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-2)" }}>
            Event Count
          </h3>
          <p style={{ fontFamily: "var(--font-body)", margin: 0 }}>
            {events.length} events logged
          </p>
        </div>
      )}

      {/* Existing log or create form */}
      {cookLog ? (
        <div style={{
          background: "var(--color-bg-alt)",
          padding: "var(--space-4)",
          borderRadius: "var(--radius-lg)",
        }}>
          <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
            Your Summary
          </h2>

          <div style={{ marginBottom: "var(--space-3)" }}>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.85rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Rating</span>
            <div style={{ marginTop: "var(--space-1)", color: "var(--color-accent)", fontSize: "1.3rem" }}>
              {"★".repeat(cookLog.rating)}
              <span style={{ color: "var(--color-text-muted)" }}>{"☆".repeat(5 - cookLog.rating)}</span>
            </div>
          </div>

          <div style={{ marginBottom: cookLog.lessons ? "var(--space-3)" : 0 }}>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.85rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Summary</span>
            <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)", marginTop: "var(--space-1)", marginBottom: 0 }}>{cookLog.summary}</p>
          </div>

          {cookLog.lessons && (
            <div>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.85rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Lessons Learned</span>
              <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)", marginTop: "var(--space-1)", marginBottom: 0 }}>{cookLog.lessons}</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>
            Create Summary
          </h2>

          <div style={{
            background: "var(--color-bg-alt)",
            padding: "var(--space-4)",
            borderRadius: "var(--radius-lg)",
          }}>
            <div style={{ marginBottom: "var(--space-3)" }}>
              <label style={labelStyle}>Rating</label>
              <div>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "1.5rem",
                      cursor: "pointer",
                      color: star <= rating ? "var(--color-accent)" : "var(--color-text-muted)",
                      padding: "0 2px",
                    }}
                  >
                    {star <= rating ? "★" : "☆"}
                  </button>
                ))}
              </div>
            </div>

            <label style={labelStyle}>Summary</label>
            <textarea
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="How did the cook go? What did you make?"
              rows={4}
              style={textareaStyle}
            />

            <label style={labelStyle}>Lessons Learned (optional)</label>
            <textarea
              value={lessons}
              onChange={e => setLessons(e.target.value)}
              placeholder="What would you do differently next time?"
              rows={3}
              style={textareaStyle}
            />

            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Saving..." : "Save Summary & Complete Cook"}
            </Button>
          </div>
        </div>
      )}

      {/* ── STICKY BOTTOM BAR ── */}
      <style>{`
        .cook-nav-btn {
          background: transparent;
          border: 1px solid rgba(201,151,58,0.3);
          color: var(--color-text-muted);
          font-family: var(--font-ui);
          font-size: 0.8rem;
          padding: 6px 14px;
          border-radius: var(--radius-md);
          cursor: pointer;
          text-decoration: none;
          transition: border-color 0.12s, color 0.12s;
          display: inline-block;
          white-space: nowrap;
        }
        .cook-nav-btn:hover { border-color: #C9973A; color: #C9973A; }
        .cook-nav-btn-active { border-color: #C9973A !important; color: #C9973A !important; }
      `}</style>
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
          <Link
            key={link.href}
            href={link.href}
            className={`cook-nav-btn${link.active ? " cook-nav-btn-active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
