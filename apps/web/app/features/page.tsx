// app/features/page.tsx

import Link from "next/link";

export default function FeaturesPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--color-bg)",
      color: "var(--color-text)",
    }}>
      <style>{`
        .feat-section {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 var(--space-4);
        }
        .feat-p {
          font-family: var(--font-body);
          font-size: 1.05rem;
          line-height: 1.85;
          color: #C8B89A;
          margin: 0 0 var(--space-3);
        }
        .feat-h2 {
          font-family: var(--font-heading);
          font-size: clamp(1.2rem, 2.5vw, 1.5rem);
          color: #F5E6C8;
          margin: var(--space-6) 0 var(--space-3);
          font-weight: 700;
        }
        .feat-rule {
          border: none;
          border-top: 1px solid rgba(201,151,58,0.2);
          margin: var(--space-5) 0;
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
      <div style={{ padding: "var(--space-6) 0 var(--space-7)" }}>
        <div className="feat-section">

          {/* 1 — Cook Planner */}
          <span className="feat-tag">Cook Planner</span>
          <h2 className="feat-h2">Start With a Real Plan</h2>
          <p className="feat-p">
            Before the fire goes on, you tell the app what you are cooking. The meat. The weight. Your pit. What wood you are using. When you need to eat. The app takes all of that and builds you a timeline that works backward from your eating time. It tells you when to light, when to expect the stall, when to think about wrapping, and when to pull. It is a plan built around your specific cook, not a guess pulled from a recipe website.
          </p>
          <p className="feat-p">
            If you have cooked this meat before, the app already knows your tendencies and factors them in before you ask. Your plan starts personalized from the first screen.
          </p>

          <hr className="feat-rule" />

          {/* 2 — Cook Dashboard */}
          <span className="feat-tag">Cook Dashboard</span>
          <h2 className="feat-h2">Stay Organized While You Cook</h2>
          <p className="feat-p">
            Once the cook is running, your dashboard keeps everything in front of you without overwhelming you. Your plan is there. Your timeline is there. Your conversation with the Preacher is right there if you need to ask something. You are not digging through menus or trying to remember what you said an hour ago. It is all in one place.
          </p>
          <p className="feat-p">
            The dashboard is simple on purpose. When you are managing a fire, you do not want to fight your phone. You want to glance at it and know exactly where you stand.
          </p>

          <hr className="feat-rule" />

          {/* 3 — Cook Tracker */}
          <span className="feat-tag">Cook Tracker</span>
          <h2 className="feat-h2">Log What Actually Happened</h2>
          <p className="feat-p">
            After the cook is done, the app walks you through a short reflection. You log the real numbers. How long it actually took. Where the pit ran hot or cold. When the stall hit. How long you rested the meat. How it turned out across tenderness, bark, moisture, smoke, and flavor. The whole thing takes about five minutes.
          </p>
          <p className="feat-p">
            That data is what makes the app useful over time. Every cook you log builds a picture of how you cook. Not how someone else cooks. You. That is the foundation everything else is built on.
          </p>

          <hr className="feat-rule" />

          {/* 4 — Summary Report */}
          <span className="feat-tag">Summary Report</span>
          <h2 className="feat-h2">Understand What Happened</h2>
          <p className="feat-p">
            When a cook is sealed, the app puts together a full summary. Planned versus actual. How the pit behaved. How the outcome rated across every category. Your own notes on what to do differently. The Preacher adds its own reflection on the cook based on everything it saw in your data.
          </p>
          <p className="feat-p">
            You also get a Cook Confidence Score that breaks down how well the cook went across four areas: pit stability, plan adherence, outcome quality, and how smoothly you managed the fire. It is not a grade. It is a mirror that shows you where things went well and where they did not.
          </p>

          <hr className="feat-rule" />

          {/* 5 — Pitmaster Insights */}
          <span className="feat-tag">Pitmaster Insights</span>
          <h2 className="feat-h2">Get Guidance That Fits You</h2>
          <p className="feat-p">
            After each cook, the app generates insights based on what it saw. Pattern insights that look at how this cook compared to your history. Pit-specific insights based on how your smoker behaved. Next-time recommendations that are pointed at the actual things that affected your outcome. None of it is generic. All of it comes from your data.
          </p>
          <p className="feat-p">
            Pitmaster tier users also get access to deep insights that explain the reasoning behind each observation. Where the signal came from. What the data actually shows. It reads like a debrief from someone who has been watching your cooks closely.
          </p>

          <hr className="feat-rule" />

          {/* 6 — Meat Profiles */}
          <span className="feat-tag">Meat Profiles</span>
          <h2 className="feat-h2">Know How You Cook Each Cut</h2>
          <p className="feat-p">
            The more briskets you cook, the more the app learns about how you cook brisket specifically. Same with ribs, pork shoulder, chicken, and turkey. Over time the app builds a profile for each meat that shows your strengths with that cut, your weaknesses, your tendencies, your typical timing, how your pit behaves with it, and what strategy tends to work best for you.
          </p>
          <p className="feat-p">
            It is like having notes from every cook you have ever done with that meat, organized in a way that is actually useful. When you are about to put another pork shoulder on, the app knows what your last five looked like and can tell you exactly where to focus.
          </p>

          <hr className="feat-rule" />

          {/* 7 — Pit Profiles */}
          <span className="feat-tag">Pit Profiles</span>
          <h2 className="feat-h2">Know Your Smoker</h2>
          <p className="feat-p">
            Every pit has a personality. Some run hot early. Some dip during the stall. Some are sensitive to wind. Some produce longer stalls on pork than on beef. The app pays attention to all of that across your cooks and builds a profile of how your specific smoker behaves.
          </p>
          <p className="feat-p">
            Your pit profile shows you how stable your temperatures have been, what quirks show up regularly, how your smoker handles different meats, and what fire strategy tends to work best on it. It is the kind of knowledge that used to take years of cooking to accumulate. Now it shows up after a handful of tracked cooks.
          </p>

          <hr className="feat-rule" />

          {/* 8 — Next Cook Strategy */}
          <span className="feat-tag">Next Cook Strategy</span>
          <h2 className="feat-h2">Go In With a Game Plan</h2>
          <p className="feat-p">
            Before your next cook starts, the app puts together a strategy. It pulls from your meat profile, your pit profile, your recent patterns, and your confidence scores and combines them into a focused plan. Not a long report. A clear game plan that tells you what to focus on, what to watch for, how to manage your fire, and what timing to expect.
          </p>
          <p className="feat-p">
            If your bark has been soft across your last few cooks, the strategy will tell you to wrap later. If your pit dips in the second hour, it will remind you to watch for it. It is the kind of specific, actionable advice that makes a real difference on cook day.
          </p>

          <hr className="feat-rule" />

          {/* 9 — Trend Analysis */}
          <span className="feat-tag">Trend Analysis</span>
          <h2 className="feat-h2">See How You Are Improving</h2>
          <p className="feat-p">
            Over time the app shows you the bigger picture. Are your tenderness scores going up? Are your cooks finishing more consistently? Is your pit getting more stable? Are there weaknesses that keep showing up no matter what you cook? Trend analysis looks across your full history and surfaces the things that matter.
          </p>
          <p className="feat-p">
            You also get a Cook Variability Index that measures how consistent your cooks are becoming across timing, pit behavior, and outcomes. High consistency means you have found a repeatable process. High variance means there are still variables you have not locked down. Both are useful to know.
          </p>

          <hr className="feat-rule" />

          {/* 10 — Preacher Chat */}
          <span className="feat-tag">The Pit Preacher</span>
          <h2 className="feat-h2">Ask Anything, Get a Real Answer</h2>
          <p className="feat-p">
            The Preacher is the heart of the app. You can ask it anything about your cook and it will give you a direct, specific answer based on what is actually on your pit right now. Not a textbook response. Not something copied from a forum. An answer that accounts for your meat, your smoker, your wood, your timing, and where you are in the cook.
          </p>
          <p className="feat-p">
            Is your bark not setting? Ask the Preacher. Stall hitting earlier than expected? Ask the Preacher. Not sure if the smoke color looks right? Ask the Preacher. It is like having a pitmaster in your pocket who has been watching your cook since the fire went on.
          </p>

          <hr className="feat-rule" />

          {/* 11 — Built for Real Backyard Cooks */}
          <span className="feat-tag">Who It Is For</span>
          <h2 className="feat-h2">Built for Real Backyard Cooks</h2>
          <p className="feat-p">
            None of this was built for competition teams or people trying to win trophies. It was built for people who cook in their backyard because they love it. People who want to get better, want to repeat the cooks that went great, and want to stop making the same mistakes over and over.
          </p>
          <p className="feat-p">
            You do not need to be technical. You do not need to know anything about how the app works under the hood. You just need to show up, cook, and log what happened. The app takes it from there. The more you use it, the more useful it gets. That is the whole idea.
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
