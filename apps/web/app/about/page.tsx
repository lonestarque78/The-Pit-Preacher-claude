// app/about/page.tsx

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | The Pit Preacher",
  description: "Built by a pitmaster for pitmasters. The Pit Preacher is a BBQ coaching app born from 25 years at the pit.",
};

export default function AboutPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--color-bg)",
      color: "var(--color-text)",
    }}>
      <style>{`
        .about-section {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 var(--space-4);
        }
        .about-p {
          font-family: var(--font-body);
          font-size: 1.05rem;
          line-height: 1.85;
          color: #C8B89A;
          margin: 0;
        }
        .about-h2 {
          font-family: var(--font-heading);
          font-size: clamp(1.3rem, 2.5vw, 1.6rem);
          color: #F5E6C8;
          margin: 0;
          font-weight: 700;
        }
        .about-rule {
          border: none;
          border-top: 1px solid rgba(201,151,58,0.2);
          margin: var(--space-3) 0;
        }
        .about-row {
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 0 var(--space-4);
          align-items: start;
        }
        .about-dedication {
          border-left: 3px solid #C9973A;
          padding: var(--space-3) var(--space-4);
          background: rgba(201,151,58,0.05);
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
        }
        .about-dedication p {
          font-family: var(--font-body);
          font-size: 1rem;
          font-style: italic;
          line-height: 1.85;
          color: #D9C9A8;
          margin: 0;
        }
        .about-cta {
          background: rgba(201,151,58,0.08);
          border: 1px solid rgba(201,151,58,0.25);
          border-radius: var(--radius-lg);
          padding: var(--space-5) var(--space-4);
          text-align: center;
          margin: var(--space-5) 0;
        }
        .about-sig {
          font-family: var(--font-ui);
          font-size: 0.8rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          line-height: 1.8;
          margin-top: var(--space-5);
          padding-top: var(--space-4);
          border-top: 1px solid rgba(201,151,58,0.15);
        }
        @media (max-width: 560px) {
          .about-row { display: block; }
          .about-h2 { margin-bottom: var(--space-2); }
        }
      `}</style>

      {/* Hero */}
      <div style={{
        borderBottom: "1px solid rgba(201,151,58,0.15)",
        padding: "calc(var(--space-7) * 0.6) var(--space-4) calc(var(--space-5) * 0.6)",
        textAlign: "center",
        background: "radial-gradient(ellipse at 50% 0%, rgba(201,151,58,0.08) 0%, transparent 70%)",
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
          About
        </h1>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "1rem",
          color: "var(--color-text-muted)",
          maxWidth: "480px",
          margin: "0 auto",
          lineHeight: 1.6,
          fontStyle: "italic",
        }}>
          Built by a backyard pitmaster who got tired of generic advice.
        </p>
      </div>

      {/* Body */}
      <div style={{ padding: "var(--space-4) 0 var(--space-5)" }}>
        <div className="about-section">

          {/* Origin — no heading, full width */}
          <p className="about-p">
            I grew up in the Dallas area and fell in love with barbecue in my early twenties. My first smoker was an ugly drum I welded together in the driveway — it wasn't pretty, but it taught me everything I needed to know about fire, patience, and how stubborn a piece of meat can be. I'm a backyard pitmaster who likes feeding people, and barbecue has always been my quiet place.
          </p>

          <hr className="about-rule" />

          {/* Why */}
          <div className="about-row">
            <h2 className="about-h2">Why I Built This</h2>
            <p className="about-p">
              I got tired of generic barbecue advice that doesn't know your smoker, your wood, your habits, or your style. I wanted something that could look at my past cooks and my tendencies and give me advice that actually mattered — not just what temperature, but why. So I built it.
            </p>
          </div>

          <hr className="about-rule" />

          {/* What it is */}
          <div className="about-row">
            <h2 className="about-h2">What The Pit Preacher Is</h2>
            <p className="about-p">
              The Pit Preacher is a pitmaster in your pocket — it learns your rig, your wood, your style, and gives you advice that fits the way you cook. You can log your cooks, track your numbers, and get personalized insights before and after each smoke. This app is built for real people who love barbecue, not for competitions or clout.
            </p>
          </div>

          <hr className="about-rule" />

          {/* Built in Texas */}
          <div className="about-row">
            <h2 className="about-h2">Built in Texas</h2>
            <p className="about-p">
              The Pit Preacher is built and run by Lone Star Que, LLC — designed, coded, and launched by one guy with a full time job, a family, and a smoker in the backyard.
            </p>
          </div>

          <hr className="about-rule" />

          {/* Dedication */}
          <div className="about-row">
            <h2 className="about-h2">Dedicated To a Good Man</h2>
            <div className="about-dedication">
              <p>
                This project is dedicated to my father in law. He ran a barbecue ministry at his church, fed more people than I can count, and preached the Word with the same heart he put into his cooks. Finishing this app became a way to honor him — every cook someone logs, every brisket saved at two in the morning, is all in his honor.
              </p>
            </div>
          </div>

          <hr className="about-rule" />

          {/* CTA */}
          <div className="about-cta">
            <p style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.75rem",
              color: "#C9973A",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              margin: "0 0 var(--space-2)",
            }}>
              Join the Congregation
            </p>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "1rem",
              color: "#D9C9A8",
              margin: "0 0 var(--space-4)",
              lineHeight: 1.6,
            }}>
              It's free to start. No credit card. Just fire up the app and ask the Preacher anything.
            </p>
            <Link href="/auth/login" style={{
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
          </div>

          {/* Signature */}
          <div className="about-sig">
            <div>Brian</div>
            <div>Founder, Lone Star Que, LLC</div>
            <div>Frisco, Texas</div>
          </div>

        </div>
      </div>
    </div>
  );
}
