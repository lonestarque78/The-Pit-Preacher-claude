// app/features/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Features | The Pit Preacher BBQ App",
  description: "Smart cook planning, live fire tracking, and a 25-year pitmaster coach in your pocket. Every feature built for serious backyard cooks.",
};

export default function FeaturesPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--color-bg)",
      color: "var(--color-text)",
    }}>
      <style>{`
        .feat-section {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 var(--space-4);
        }
        .feat-p {
          font-family: var(--font-body);
          font-size: 1.05rem;
          line-height: 1.85;
          color: #C8B89A;
          margin: 0;
        }
        .feat-h2 {
          font-family: var(--font-heading);
          font-size: clamp(1.2rem, 2.5vw, 1.5rem);
          color: #F5E6C8;
          margin: 0 0 var(--space-1);
          font-weight: 700;
        }
        .feat-rule {
          border: none;
          border-top: 1px solid rgba(201,151,58,0.2);
          margin: var(--space-3) 0;
        }
        .feat-tag {
          display: inline-block;
          font-family: var(--font-ui);
          font-size: 0.65rem;
          color: #C9973A;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          margin-bottom: 6px;
        }
        .feat-row {
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 0 var(--space-4);
          align-items: start;
        }
        @media (max-width: 560px) {
          .feat-row { display: block; }
          .feat-h2 { margin-top: var(--space-2); }
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
          Features
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
          Everything in the app, explained the way a pitmaster would explain it.
        </p>
      </div>

      {/* Body */}
      <div style={{ padding: "var(--space-4) 0 var(--space-5)" }}>
        <div className="feat-section">

          {/* 1 */}
          <div className="feat-row">
            <div>
              <span className="feat-tag">Cook Planner</span>
              <h2 className="feat-h2">Start With a Real Plan</h2>
            </div>
            <p className="feat-p">
              You tell the app what you are cooking — the meat, the weight, your pit, your wood, when you need to eat — and it builds a timeline that works backward from your eating time. It is a plan built around your specific cook, not a guess pulled from a recipe website.
            </p>
          </div>

          <hr className="feat-rule" />

          {/* 2 */}
          <div className="feat-row">
            <div>
              <span className="feat-tag">Cook Dashboard</span>
              <h2 className="feat-h2">Stay Organized While You Cook</h2>
            </div>
            <p className="feat-p">
              Your dashboard keeps everything in front of you without overwhelming you — your plan, your timeline, your conversation with the Preacher. When you are managing a fire, you want to glance at it and know exactly where you stand.
            </p>
          </div>

          <hr className="feat-rule" />

          {/* 3 */}
          <div className="feat-row">
            <div>
              <span className="feat-tag">Cook Tracker</span>
              <h2 className="feat-h2">Log What Actually Happened</h2>
            </div>
            <p className="feat-p">
              After the cook is done, the app walks you through a short reflection — the real numbers, the timing, how the pit ran, how the meat turned out. The whole thing takes about five minutes and it is the foundation everything else is built on.
            </p>
          </div>

          <hr className="feat-rule" />

          {/* 4 */}
          <div className="feat-row">
            <div>
              <span className="feat-tag">Summary Report</span>
              <h2 className="feat-h2">Understand What Happened</h2>
            </div>
            <p className="feat-p">
              When a cook is sealed, the app puts together a full summary — planned versus actual, how the pit behaved, your ratings across every category. You also get a Cook Confidence Score across pit stability, plan adherence, outcome quality, and fire management.
            </p>
          </div>

          <hr className="feat-rule" />

          {/* 5 */}
          <div className="feat-row">
            <div>
              <span className="feat-tag">Pitmaster Insights</span>
              <h2 className="feat-h2">Get Guidance That Fits You</h2>
            </div>
            <p className="feat-p">
              After each cook, the app generates pattern insights, pit-specific insights, and next-time recommendations based on what it saw. None of it is generic. All of it comes from your data.
            </p>
          </div>

          <hr className="feat-rule" />

          {/* 6 */}
          <div className="feat-row">
            <div>
              <span className="feat-tag">Meat Profiles</span>
              <h2 className="feat-h2">Know How You Cook Each Cut</h2>
            </div>
            <p className="feat-p">
              The more you cook a given meat, the more the app learns how you specifically cook it. Over time it builds a profile for each cut — your strengths, your weaknesses, your tendencies, and what strategy tends to work best for you.
            </p>
          </div>

          <hr className="feat-rule" />

          {/* 7 */}
          <div className="feat-row">
            <div>
              <span className="feat-tag">Pit Profiles</span>
              <h2 className="feat-h2">Know Your Smoker</h2>
            </div>
            <p className="feat-p">
              Every pit has a personality, and the app pays attention to it across your cooks. Your pit profile shows temperature stability, regular quirks, and what fire strategy tends to work best on it.
            </p>
          </div>

          <hr className="feat-rule" />

          {/* 8 */}
          <div className="feat-row">
            <div>
              <span className="feat-tag">Next Cook Strategy</span>
              <h2 className="feat-h2">Go In With a Game Plan</h2>
            </div>
            <p className="feat-p">
              Before your next cook starts, the app pulls from your meat profile, pit profile, and recent patterns and combines them into a focused plan. It tells you what to focus on, what to watch for, how to manage your fire, and what timing to expect.
            </p>
          </div>

          <hr className="feat-rule" />

          {/* 9 */}
          <div className="feat-row">
            <div>
              <span className="feat-tag">Trend Analysis</span>
              <h2 className="feat-h2">See How You Are Improving</h2>
            </div>
            <p className="feat-p">
              Over time the app shows you the bigger picture — whether your tenderness scores are going up, your cooks finishing more consistently, your pit getting more stable. You also get a Cook Variability Index that measures consistency across timing, pit behavior, and outcomes.
            </p>
          </div>

          <hr className="feat-rule" />

          {/* 10 */}
          <div className="feat-row">
            <div>
              <span className="feat-tag">The Pit Preacher</span>
              <h2 className="feat-h2">Ask Anything, Get a Real Answer</h2>
            </div>
            <p className="feat-p">
              The Preacher gives you a direct, specific answer based on what is actually on your pit right now — not a textbook response, not something copied from a forum. Is your bark not setting? Stall hitting earlier than expected? Ask the Preacher.
            </p>
          </div>

          <hr className="feat-rule" />

          {/* 11 */}
          <div className="feat-row">
            <div>
              <span className="feat-tag">Who It Is For</span>
              <h2 className="feat-h2">Built for Real Backyard Cooks</h2>
            </div>
            <p className="feat-p">
              None of this was built for competition teams or people trying to win trophies. It was built for people who cook in their backyard because they love it and want to get better. The more you use it, the more useful it gets.
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
              Free to start. No credit card. Just fire up the app and see what it does.
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
              <Link href="/how-it-works" style={{
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
                How It Works
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
