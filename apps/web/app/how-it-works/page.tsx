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
          max-width: 680px;
          margin: 0 auto;
          padding: 0 var(--space-4);
        }
        .hiw-p {
          font-family: var(--font-body);
          font-size: 1.05rem;
          line-height: 1.85;
          color: #C8B89A;
          margin: 0 0 var(--space-3);
        }
        .hiw-h2 {
          font-family: var(--font-heading);
          font-size: clamp(1.2rem, 2.5vw, 1.5rem);
          color: #F5E6C8;
          margin: var(--space-6) 0 var(--space-3);
          font-weight: 700;
        }
        .hiw-rule {
          border: none;
          border-top: 1px solid rgba(201,151,58,0.2);
          margin: var(--space-5) 0;
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
      `}</style>

      {/* Hero */}
      <div style={{
        borderBottom: "1px solid rgba(201,151,58,0.15)",
        padding: "var(--space-7) var(--space-4) var(--space-5)",
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
      <div style={{ padding: "var(--space-6) 0 var(--space-7)" }}>
        <div className="hiw-section">

          {/* 1 */}
          <span className="hiw-number">01</span>
          <h2 className="hiw-h2">Plan Your Cook</h2>
          <p className="hiw-p">
            Before anything goes on the pit, the app helps you think through the cook. You tell it what you're smoking, how much it weighs, what pit you're using, and when you need to eat. From there it works backward and gives you a timeline that tells you exactly when to light the fire, when to expect the stall, when to wrap, and when to pull. It is not a recipe. It is a real plan built around your specific cook.
          </p>
          <p className="hiw-p">
            If you have cooked this meat before, the app already knows things about how your cooks tend to go. It will factor that in and adjust the plan before you even ask.
          </p>

          <hr className="hiw-rule" />

          {/* 2 */}
          <span className="hiw-number">02</span>
          <h2 className="hiw-h2">Cook With Confidence</h2>
          <p className="hiw-p">
            Once the fire is going, you have a dashboard that keeps everything in one place. Your plan is right there. Your timeline is right there. And the Preacher is right there if you have a question. You can ask anything, and it will give you a straight answer based on what is actually on your pit right now, not a generic response that could apply to anybody.
          </p>
          <p className="hiw-p">
            The dashboard is not complicated. It does not throw a wall of information at you. It just keeps you organized so you can focus on the cook instead of trying to remember everything in your head.
          </p>

          <hr className="hiw-rule" />

          {/* 3 */}
          <span className="hiw-number">03</span>
          <h2 className="hiw-h2">Track What Matters</h2>
          <p className="hiw-p">
            When the cook is done, the app walks you through a quick reflection. You log what actually happened. How long did it really take. Where did the pit run hot or cold. When did the stall hit. How long did you rest it. How did it turn out.
          </p>
          <p className="hiw-p">
            This part takes about five minutes and it is the whole reason the app gets better the more you use it. Every time you log a cook, you are building a record of how you cook. Not how some pitmaster on the internet cooks. How you cook. That distinction matters more than most people realize.
          </p>

          <hr className="hiw-rule" />

          {/* 4 */}
          <span className="hiw-number">04</span>
          <h2 className="hiw-h2">Get a Real Summary</h2>
          <p className="hiw-p">
            After you log the cook, the app puts together a summary that shows you what happened. Planned versus actual. How the pit behaved. How the meat turned out. What you would do differently. It is all in one place, and it reads like a debrief, not a spreadsheet.
          </p>
          <p className="hiw-p">
            The Preacher also adds its own read on the cook. A short reflection on what it saw in your data. Sometimes that reflection will confirm what you already know. Sometimes it will point out something you missed.
          </p>

          <hr className="hiw-rule" />

          {/* 5 */}
          <span className="hiw-number">05</span>
          <h2 className="hiw-h2">Learn From Your Patterns</h2>
          <p className="hiw-p">
            Most people cook the same way every time without realizing it. They wrap too early or too late. Their pit spikes in the first hour. Their briskets always finish behind schedule. These are patterns, and patterns are fixable once you can see them.
          </p>
          <p className="hiw-p">
            After a handful of tracked cooks, the app starts to surface those patterns for you. It looks across your history and tells you what it notices. Not in a lecture. Just a straight observation. Your ribs dry out when your pit runs above this temperature. Your pork shoulders stall longer than most. Your rest times have been short and your tenderness scores show it. That kind of thing.
          </p>

          <hr className="hiw-rule" />

          {/* 6 */}
          <span className="hiw-number">06</span>
          <h2 className="hiw-h2">Get a Strategy for Your Next Cook</h2>
          <p className="hiw-p">
            Before your next cook starts, the app puts together a strategy based on everything it knows about you. Your pit. Your tendencies. What has worked. What has not. It gives you a specific game plan for that cook, not a general one copied from a barbecue forum.
          </p>
          <p className="hiw-p">
            If your bark has been soft across your last few cooks, it will tell you to wrap later. If your pit dips during the stall, it will remind you to watch for it and tell you what to do when it happens. It is the kind of advice you would get from someone who has watched you cook a dozen times.
          </p>

          <hr className="hiw-rule" />

          {/* 7 */}
          <span className="hiw-number">07</span>
          <h2 className="hiw-h2">Grow as a Pitmaster</h2>
          <p className="hiw-p">
            The goal of all of this is not to make you dependent on the app. It is to make you a better cook. Every piece of feedback is pointed at something you can actually change. Every insight is connected to your real data. Over time, the things that used to trip you up stop tripping you up because you understand why they were happening.
          </p>
          <p className="hiw-p">
            That is how good pitmasters are made. Not by reading more forums. By cooking, paying attention, and learning from what the pit tells you. The app just helps you hear it more clearly.
          </p>

          <hr className="hiw-rule" />

          {/* 8 */}
          <span className="hiw-number">08</span>
          <h2 className="hiw-h2">Built for Real Backyard Cooks</h2>
          <p className="hiw-p">
            This app was not built for competition teams or professional pitmasters. It was built for people who cook in their backyard on weekends because they love it. People who want to get better, want to repeat their best cooks, and want to stop making the same mistakes.
          </p>
          <p className="hiw-p">
            If that is you, you are in the right place. Start with a free account, plan your next cook, and see how it feels. The Preacher will be there when you need it.
          </p>

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
