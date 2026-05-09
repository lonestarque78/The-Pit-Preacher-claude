// app/meet-the-preacher/page.tsx

import Link from "next/link";

export default function MeetThePreacherPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--color-bg)",
      color: "var(--color-text)",
    }}>
      <style>{`
        .mtp-section {
          max-width: 960px;
          margin: 0 auto;
          padding: 0 var(--space-4);
        }
        .mtp-p {
          font-family: var(--font-body);
          font-size: 1.05rem;
          line-height: 1.85;
          color: #C8B89A;
          margin: 0;
        }
        .mtp-h2 {
          font-family: var(--font-heading);
          font-size: clamp(1.2rem, 2.5vw, 1.5rem);
          color: #F5E6C8;
          margin: 0;
          font-weight: 700;
        }
        .mtp-rule {
          border: none;
          border-top: 1px solid rgba(201,151,58,0.2);
          margin: var(--space-3) 0;
        }
        .mtp-row {
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 0 var(--space-4);
          align-items: start;
        }
        .mtp-quote {
          border-left: 3px solid rgba(201,151,58,0.5);
          padding: var(--space-3) var(--space-4);
          margin: var(--space-3) 0;
        }
        .mtp-quote p {
          font-family: var(--font-body);
          font-style: italic;
          font-size: 1rem;
          color: #D9C9A8;
          margin: 0 0 6px;
          line-height: 1.7;
        }
        .mtp-quote span {
          font-family: var(--font-ui);
          font-size: 0.65rem;
          color: #C9973A;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }
        @media (max-width: 560px) {
          .mtp-row { display: block; }
          .mtp-h2 { margin-bottom: var(--space-2); }
        }
      `}</style>

      {/* Hero */}
      <div style={{
        borderBottom: "1px solid rgba(201,151,58,0.15)",
        padding: "calc(var(--space-7) * 0.6) var(--space-4) calc(var(--space-5) * 0.6)",
        textAlign: "center",
        background: "radial-gradient(ellipse at 50% 0%, rgba(201,151,58,0.08) 0%, transparent 70%)",
      }}>
        <div style={{ marginBottom: "var(--space-4)" }}>
          <img
            src="/logo.jpeg"
            alt="The Pit Preacher"
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid rgba(201,151,58,0.4)",
              margin: "0 auto var(--space-3)",
              display: "block",
            }}
          />
        </div>
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
          Meet the Preacher
        </h1>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "1rem",
          color: "var(--color-text-muted)",
          maxWidth: "460px",
          margin: "0 auto",
          lineHeight: 1.65,
          fontStyle: "italic",
        }}>
          The calm voice at the end of a long cook. The one who has been there before.
        </p>
      </div>

      {/* Body */}
      <div style={{ padding: "var(--space-4) 0 var(--space-5)" }}>
        <div className="mtp-section">

          {/* 1 */}
          <div className="mtp-row">
            <h2 className="mtp-h2">Who He Is</h2>
            <p className="mtp-p">
              The Pit Preacher is the voice of experience — the steady hand in the middle of a long cook when you are not sure if the stall is going to break. He has smoked a thousand briskets and still remembers the ones he ruined, because they taught him something he never forgot.
            </p>
          </div>

          <hr className="mtp-rule" />

          {/* 2 */}
          <div className="mtp-row">
            <h2 className="mtp-h2">Where He Comes From</h2>
            <p className="mtp-p">
              He was shaped by real backyard cooks — long days in the Texas heat with a stick burner that had a mind of its own, late nights waiting on a pork shoulder that refused to finish. He comes from the people who taught themselves to cook by making mistakes and paying attention, and that is the well he draws from every time he gives advice.
            </p>
          </div>

          <div className="mtp-quote">
            <p>Every great cook begins before the fire does. It begins in the mind.</p>
            <span>Book of Preparation, 1:3</span>
          </div>

          <hr className="mtp-rule" />

          {/* 3 */}
          <div className="mtp-row">
            <h2 className="mtp-h2">How He Talks</h2>
            <p className="mtp-p">
              He is not loud. He does not ramble. When you ask him a question, he answers it — calm, direct, simple sentences, no jargon. If your bark is not setting, he tells you why and tells you what to do about it.
            </p>
          </div>

          <hr className="mtp-rule" />

          {/* 4 */}
          <div className="mtp-row">
            <h2 className="mtp-h2">What He Believes</h2>
            <p className="mtp-p">
              He believes barbecue brings people together in a way that most things do not. He believes fire teaches patience better than almost anything else, and that anyone who wants to learn can get there — it does not matter what pit you have or how long you have been cooking.
            </p>
          </div>

          <hr className="mtp-rule" />

          {/* 5 */}
          <div className="mtp-row">
            <h2 className="mtp-h2">Why He Is Here</h2>
            <p className="mtp-p">
              Most people who love barbecue do not have a mentor standing next to their pit — they are figuring it out alone, getting generic advice that does not know their smoker or the way they tend to cook. The Preacher exists to fill that gap, to help you understand your pit, learn your tendencies, and actually enjoy the process instead of worrying through it.
            </p>
          </div>

          <hr className="mtp-rule" />

          {/* 6 */}
          <div className="mtp-row">
            <h2 className="mtp-h2">What He Is Not</h2>
            <p className="mtp-p">
              He is not a competition judge, and he is not a know-it-all who corrects everything you do before you finish asking. He pays attention to you specifically — your pit, your history, your patterns — and the advice he gives you comes from what he knows about the way you cook.
            </p>
          </div>

          <hr className="mtp-rule" />

          {/* 7 */}
          <div className="mtp-row">
            <h2 className="mtp-h2">He Is Here When You Need Him</h2>
            <p className="mtp-p">
              Whether you have been cooking for twenty years or you just lit your first fire, the Preacher meets you where you are. If you love barbecue, ask him anything — he will be straight with you and he will be there at two in the morning when the brisket is stalling.
            </p>
          </div>

          <div className="mtp-quote">
            <p>Do not open the lid and question the pit. Trust what you have built.</p>
            <span>The Letters of Patience, 7:8</span>
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
              Free to start. Ask the Preacher anything.
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
