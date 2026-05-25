"use client";

import { use, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

type CookPlan = {
  tools?: Array<{ id: string; name: string; wood: string }>;
  items?: Array<{ name: string }>;
  preacherPlan?: string;
  preacherReflection?: string;
};

type Cook = {
  id: string;
  label: string | null;
  status: string;
  created_at: string | null;
  actual_start: string | null;
  completed_at: string | null;
  smoker_type: string | null;
  wood_type: string | null;
  plan: unknown;
};

type CookItem = { id: string; name: string };
type CookLog = { rating: number | null; summary: string | null };

function formatCookTime(start: string, end: string): string {
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  if (diffMs < 0) return "—";
  const hours = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function formatShareDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

function extractPreacherWord(planText: string): string | null {
  const lower = planText.toLowerCase();
  const idx = lower.indexOf("the preacher's word");
  if (idx === -1) return null;
  const after = planText
    .slice(idx + "the preacher's word".length)
    .replace(/\*\*/g, "")
    .trim();
  if (!after) return null;
  const sentences = after.match(/[^.!?]+[.!?]+/g) ?? [];
  return sentences.slice(0, 3).join(" ").trim() || after.slice(0, 280);
}

function truncate(text: string, chars: number): string {
  if (text.length <= chars) return text;
  const cut = text.lastIndexOf(" ", chars);
  return text.slice(0, cut > 0 ? cut : chars) + "…";
}

const FALLBACK_QUOTE =
  "Every great cook starts with fire, patience, and the will to learn from the smoke.";

export default function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: cookId } = use(params);
  const supabase = createClient();

  const [cook, setCook] = useState<Cook | null>(null);
  const [items, setItems] = useState<CookItem[]>([]);
  const [cookLog, setCookLog] = useState<CookLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: cookData } = await supabase
        .from("cooks")
        .select("*")
        .eq("id", cookId)
        .eq("user_id", user.id)
        .single();

      if (!cookData) { setLoading(false); return; }
      setCook(cookData);

      const [{ data: itemsData }, { data: logData }] = await Promise.all([
        supabase.from("cook_items").select("id, name").eq("cook_id", cookId),
        supabase.from("cook_logs").select("rating, summary").eq("cook_id", cookId).maybeSingle(),
      ]);

      setItems(itemsData ?? []);
      setCookLog(logData);
      setLoading(false);
    })();
  }, [cookId]);

  if (loading) {
    return (
      <div style={{ padding: "40px", fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
        Loading...
      </div>
    );
  }

  if (!cook) {
    return (
      <div style={{ padding: "40px", fontFamily: "var(--font-heading)", color: "#F5E6C8" }}>
        Cook not found.
      </div>
    );
  }

  const plan = cook.plan as CookPlan | null;
  const cookStart = cook.actual_start ?? cook.created_at;
  const cookTime = cook.completed_at && cookStart
    ? formatCookTime(cookStart, cook.completed_at)
    : null;
  const cookDate = cook.completed_at ?? cook.created_at;
  const smoker = cook.smoker_type;
  const wood = cook.wood_type ?? plan?.tools?.[0]?.wood ?? null;
  const rating = cookLog?.rating ?? null;
  const cookLabel = cook.label || "The Cook";

  const preacherQuote = plan?.preacherReflection
    ?? (plan?.preacherPlan ? extractPreacherWord(plan.preacherPlan) : null)
    ?? FALLBACK_QUOTE;

  const statsLine = [smoker, wood, cookTime].filter(Boolean).join(" · ");

  return (
    <div className="share-page">
      <style>{`
        .share-page {
          box-sizing: border-box;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 16px 40px;
          background: var(--color-bg);
        }

        .share-header {
          width: 100%;
          max-width: 480px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .share-back-link {
          font-family: var(--font-ui);
          font-size: 0.78rem;
          color: var(--color-text-muted);
          text-decoration: none;
          letter-spacing: 0.04em;
        }

        .share-instruction {
          font-family: var(--font-ui);
          font-size: 0.72rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .share-instruction-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #C9973A;
          flex-shrink: 0;
          animation: share-pulse 2s ease-in-out infinite;
        }

        @keyframes share-pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }

        /* ── CARD ── */
        .share-card-wrap {
          width: 100%;
          max-width: 480px;
        }

        .share-card {
          width: 100%;
          aspect-ratio: 4 / 5;
          background: radial-gradient(ellipse at 50% 15%, rgba(201,151,58,0.07) 0%, transparent 55%), #0e0c0a;
          border: 1px solid rgba(201,151,58,0.35);
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
          box-shadow: 0 0 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(201,151,58,0.15);
        }

        .share-top-bar {
          height: 4px;
          background: linear-gradient(90deg, rgba(201,151,58,0.3) 0%, #C9973A 40%, rgba(201,151,58,0.5) 100%);
          flex-shrink: 0;
        }

        .share-card-inner {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 18px 22px 16px;
          gap: 0;
          overflow: hidden;
        }

        /* Header: logo + brand */
        .share-brand-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 14px;
        }

        .share-brand-logo {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid rgba(201,151,58,0.5);
          flex-shrink: 0;
        }

        .share-brand-name {
          font-family: var(--font-ui);
          font-size: 0.72rem;
          color: #C9973A;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          margin: 0;
          line-height: 1.2;
        }

        .share-brand-sub {
          font-family: var(--font-body);
          font-size: 0.62rem;
          color: var(--color-text-muted);
          margin: 2px 0 0;
          font-style: italic;
          line-height: 1;
        }

        /* Thin rule */
        .share-rule {
          border: none;
          border-top: 1px solid rgba(201,151,58,0.18);
          margin: 0 0 14px;
        }

        /* Cook name */
        .share-cook-name {
          font-family: var(--font-heading);
          font-size: clamp(1.3rem, 5vw, 1.7rem);
          color: #F5E6C8;
          margin: 0 0 5px;
          line-height: 1.15;
          letter-spacing: -0.01em;
        }

        .share-cook-date {
          font-family: var(--font-ui);
          font-size: 0.65rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 0 0 12px;
        }

        /* Items */
        .share-items-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 10px;
        }

        .share-item-pill {
          font-family: var(--font-ui);
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #C9973A;
          background: rgba(201,151,58,0.08);
          border: 1px solid rgba(201,151,58,0.25);
          border-radius: 4px;
          padding: 3px 8px;
          white-space: nowrap;
        }

        /* Stats */
        .share-stats {
          font-family: var(--font-body);
          font-size: 0.72rem;
          color: var(--color-text-muted);
          margin: 0 0 10px;
          line-height: 1.4;
        }

        /* Stars */
        .share-stars {
          font-size: 0.95rem;
          color: #C9973A;
          letter-spacing: 2px;
          margin-bottom: 10px;
        }

        /* Divider */
        .share-divider {
          border: none;
          border-top: 1px solid rgba(201,151,58,0.2);
          margin: 4px 0 12px;
        }

        /* Quote */
        .share-quote-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          overflow: hidden;
        }

        .share-quote-mark {
          font-family: var(--font-heading);
          font-size: 2.5rem;
          color: rgba(201,151,58,0.25);
          line-height: 0.6;
          margin-bottom: 4px;
          display: block;
        }

        .share-quote-text {
          font-family: var(--font-body);
          font-style: italic;
          font-size: clamp(0.72rem, 2.5vw, 0.85rem);
          color: #D9C9A8;
          line-height: 1.65;
          margin: 0 0 6px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 5;
          -webkit-box-orient: vertical;
        }

        .share-quote-attrib {
          font-family: var(--font-ui);
          font-size: 0.6rem;
          color: rgba(201,151,58,0.6);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin: 0;
        }

        /* Watermark footer */
        .share-footer {
          margin-top: auto;
          padding-top: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .share-footer-rule {
          flex: 1;
          height: 1px;
          background: rgba(201,151,58,0.1);
        }

        .share-watermark {
          font-family: var(--font-ui);
          font-size: 0.58rem;
          color: rgba(201,151,58,0.35);
          text-transform: uppercase;
          letter-spacing: 0.2em;
          margin: 0;
          white-space: nowrap;
        }

        /* Bottom note */
        .share-bottom-note {
          font-family: var(--font-body);
          font-size: 0.8rem;
          color: var(--color-text-muted);
          text-align: center;
          margin: 16px 0 0;
          font-style: italic;
          max-width: 320px;
        }

        @media (max-width: 520px) {
          .share-page {
            padding: 12px 12px 32px;
          }
          .share-card-inner {
            padding: 14px 16px 12px;
          }
        }
      `}</style>

      {/* Top navigation / instruction row */}
      <div className="share-header">
        <Link href={`/cook/${cookId}/summary`} className="share-back-link">
          ← Summary
        </Link>
        <div className="share-instruction">
          <span className="share-instruction-dot" />
          Screenshot to share
        </div>
      </div>

      {/* THE CARD */}
      <div className="share-card-wrap">
        <div className="share-card">
          <div className="share-top-bar" />

          <div className="share-card-inner">
            {/* Branding */}
            <div className="share-brand-row">
              <img
                src="/logo.jpeg"
                alt="The Pit Preacher"
                className="share-brand-logo"
              />
              <div>
                <p className="share-brand-name">The Pit Preacher</p>
                <p className="share-brand-sub">Pitmaster AI</p>
              </div>
            </div>

            <hr className="share-rule" />

            {/* Cook identity */}
            <h1 className="share-cook-name">{cookLabel}</h1>
            {cookDate && (
              <p className="share-cook-date">{formatShareDate(cookDate)}</p>
            )}

            {/* Items smoked */}
            {items.length > 0 && (
              <div className="share-items-row">
                {items.slice(0, 6).map((item) => (
                  <span key={item.id} className="share-item-pill">
                    {item.name}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            {statsLine && (
              <p className="share-stats">{statsLine}</p>
            )}

            {/* Rating */}
            {rating != null && rating > 0 && (
              <div className="share-stars">
                {"★".repeat(rating)}
                <span style={{ opacity: 0.25 }}>{"★".repeat(5 - rating)}</span>
              </div>
            )}

            <hr className="share-divider" />

            {/* Preacher quote */}
            <div className="share-quote-section">
              <span className="share-quote-mark">&ldquo;</span>
              <p className="share-quote-text">
                {truncate(preacherQuote, 260)}
              </p>
              <p className="share-quote-attrib">— The Pit Preacher</p>
            </div>

            {/* Watermark */}
            <div className="share-footer">
              <div className="share-footer-rule" />
              <p className="share-watermark">thepitpreacher.com</p>
              <div className="share-footer-rule" />
            </div>
          </div>
        </div>
      </div>

      <p className="share-bottom-note">
        Screenshot the card and share on Instagram, Facebook, or wherever your people are.
      </p>
    </div>
  );
}
