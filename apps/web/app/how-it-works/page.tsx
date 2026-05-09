// app/how-it-works/page.tsx

import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--color-bg)",
      color: "var(--color-text)",
    }}>
      <style>{`
        .hiw-section {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 var(--space-4);
        }
        .hiw-p {
          font-family: var(--font-body);
          font-size: 1.05rem;
          line-height: 1.85;
          color: #C8B89A;
          margin: 0;
        }
        .hiw-h2 {
          font-family: var(--font-heading);
          font-size: clamp(1.2rem, 2.5vw, 1.5rem);
          color: #F5E6C8;
          margin: 0 0 var(--space-1);
          font-weight: 700;
        }
        .hiw-rule {
          border: none;
          border-top: 1px solid rgba(201,151,58,0.2);
          margin: var(--space-3) 0;
        }
        .hiw-number {
          font-family: var(--font-ui);
          font-size: 0.65rem;
          color: #C9973A;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          display: block;
          margin-bottom: 6px;
        }
        .hiw-row {
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 0 var(--space-4);
          align-items: start;
        }
        @media (max-width: 560px) {
          .hiw-row { display: block; }
          .hiw-h2 { margin-top: var(--space-2); }
        }
      `}</style>

      {/* Hero */}
      <div style={{
        borderBottom: "1px solid rgba(201,151,58,0.15)",
        padding: "calc(var(--space-7) * 0.6) var(--space-4) calc(var(--space-5) * 0.6)",
        textAlign: "center",
        background: "radial-gradient(ellipse at 50% 0%, rgba(201,151,58,0.07) 0%, transparent 70%)",
      }}>
        <p style={{
          fontFamily: "var(--font-ui)",
          fontSize: "0.75rem",
          color: "#C9973A",
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          margin: "0 0 var(--space-2)",
        }}>
          The Pit Preacher
        </p>
        <h1 style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(2rem, 5vw, 3rem)",
          color: "#F5E6C8",
          margin: "0 0 var(--space-3)",
          lineHeight: 1.1,
          fontWeight: 900,
        }}>
          How It Works
        </h1>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "1rem",
          color: "var(--color-text-muted)",
          maxWidth: "480px",
          margin: "0 auto",
          lineHeight: 1.65,
          fontStyle: "italic",
        }}>
          No manuals. No complicated setup. Just you, your pit, and a coach who has been there.
        </p>
      </div>

      {/* Body */}
      <div style={{ padding: "var(--space-4) 0 var(--space-5)" }}>
        <div className="hiw-section">

          {/* 1 */}
          <div className="hiw-row">
            <div>
              <span className="hiw-number">01</span>
              <h2 className="hiw-h2">Plan Your Cook</h2>
            </div>
            <p className="hiw-p">
              You tell it what you are smoking, how much it weighs, what pit you are using, and when you need to eat. From there it works backward and gives you a timeline — when to light the fire, when to expect the stall, when to wrap, and when to pull. It is a real plan built around your specific cook.
            </p>
          </div>

          <hr className="hiw-rule" />

          {/* 2 */}
          <div className="hiw-row">
            <div>
              <span className="hiw-number">02</span>
              <h2 className="hiw-h2">Cook With Confidence</h2>
            </div>
            <p className="hiw-p">
              Once the fire is going, your dashboard keeps everything in one place — your plan, your timeline, and the Preacher if you have a question. It will give you a straight answer based on what is actually on your pit right now, not a generic response that could apply to anybody.
            </p>
          </div>

          <hr className="hiw-rule" />

          {/* 3 */}
          <div className="hiw-row">
            <div>
              <span className="hiw-number">03</span>
              <h2 className="hiw-h2">Track What Matters</h2>
            </div>
            <p className="hiw-p">
              When the cook is done, the app walks you through a quick reflection. You log what actually happened — how long it took, where the pit ran hot or cold, when the stall hit, how it turned out. Every time you log a cook, you are building a record of how you cook.
            </p>
          </div>

          <hr className="hiw-rule" />

          {/* 4 */}
          <div className="hiw-row">
            <div>
              <span className="hiw-number">04</span>
              <h2 className="hiw-h2">Get a Real Summary</h2>
            </div>
            <p className="hiw-p">
              After you log the cook, the app puts together a summary — planned versus actual, how the pit behaved, what you would do differently. The Preacher also adds its own read on the cook, a short reflection on what it saw in your data.
            </p>
          </div>

          <hr className="hiw-rule" />

          {/* 5 */}
          <div className="hiw-row">
            <div>
              <span className="hiw-number">05</span>
              <h2 className="hiw-h2">Learn From Your Patterns</h2>
            </div>
            <p className="hiw-p">
              After a handful of tracked cooks, the app starts to surface your patterns. Your ribs dry out when your pit runs above a certain temperature. Your rest times have been short and your tenderness scores show it. These are patterns, and patterns are fixable once you can see them.
            </p>
          </div>

          <hr className="hiw-rule" />

          {/* 6 */}
          <div className="hiw-row">
            <div>
              <span className="hiw-number">06</span>
              <h2 className="hiw-h2">Get a Strategy for Your Next Cook</h2>
            </div>
            <p className="hiw-p">
              Before your next cook starts, the app puts together a strategy based on everything it knows about you — your pit, your tendencies, what has worked and what has not. It is the kind of advice you would get from someone who has watched you cook a dozen times.
            </p>
          </div>

          <hr className="hiw-rule" />

          {/* 7 */}
          <div className="hiw-row">
            <div>
              <span className="hiw-number">07</span>
              <h2 className="hiw-h2">Grow as a Pitmaster</h2>
            </div>
            <p className="hiw-p">
              The goal of all of this is not to make you dependent on the app. Every piece of feedback is pointed at something you can actually change, and over time the things that used to trip you up stop tripping you up.
            </p>
          </div>

          <hr className="hiw-rule" />

          {/* 8 */}
          <div className="hiw-row">
            <div>
              <span className="hiw-number">08</span>
              <h2 className="hiw-h2">Built for Real Backyard Cooks</h2>
            </div>
            <p className="hiw-p">
              This app was not built for competition teams or professional pitmasters. It was built for people who cook in their backyard on weekends because they love it and want to get better. Start with a free account, plan your next cook, and see how it feels.
            </p>
          </div>

          {/* CTA */}
          <div style={{
            marginTop: "var(--space-5)",
            padding: "var(--space-5) var(--space-4)",
            background: "rgba(201,151,58,0.06)",
            border: "1px solid rgba(201,151,58,0.2)",
            borderRadius: "var(--radius-lg)",
            textAlign: "center",
          }}>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "1rem",
              color: "#D9C9A8",
              margin: "0 0 var(--space-4)",
              lineHeight: 1.65,
            }}>
              Free to start. No credit card. Just fire up the app and ask the Preacher anything.
            </p>
            <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/auth/login?tab=signup" style={{
                display: "inline-block",
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
                Get Started
              </Link>
              <Link href="/about" style={{
                display: "inline-block",
                background: "transparent",
                border: "1px solid rgba(201,151,58,0.35)",
                color: "#C9973A",
                fontFamily: "var(--font-ui)",
                fontSize: "0.85rem",
                padding: "12px 28px",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}>
                About
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
