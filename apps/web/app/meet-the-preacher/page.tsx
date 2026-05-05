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
          max-width: 680px;
          margin: 0 auto;
          padding: 0 var(--space-4);
        }
        .mtp-p {
          font-family: var(--font-body);
          font-size: 1.05rem;
          line-height: 1.85;
          color: #C8B89A;
          margin: 0 0 var(--space-3);
        }
        .mtp-h2 {
          font-family: var(--font-heading);
          font-size: clamp(1.2rem, 2.5vw, 1.5rem);
          color: #F5E6C8;
          margin: var(--space-6) 0 var(--space-3);
          font-weight: 700;
        }
        .mtp-rule {
          border: none;
          border-top: 1px solid rgba(201,151,58,0.2);
          margin: var(--space-5) 0;
        }
        .mtp-quote {
          border-left: 3px solid rgba(201,151,58,0.5);
          padding: var(--space-3) var(--space-4);
          margin: var(--space-4) 0;
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
      `}</style>

      {/* Hero */}
      <div style={{
        borderBottom: "1px solid rgba(201,151,58,0.15)",
        padding: "var(--space-7) var(--space-4) var(--space-5)",
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
      <div style={{ padding: "var(--space-6) 0 var(--space-7)" }}>
        <div className="mtp-section">

          {/* 1 — Who He Is */}
          <h2 className="mtp-h2">Who He Is</h2>
          <p className="mtp-p">
            The Pit Preacher is the voice of experience. The steady hand in the middle of a long cook when you are not sure if the stall is going to break or if you made a mistake three hours ago that you cannot take back. He is the kind of cook who has smoked a thousand briskets and still remembers the ones he ruined. Not because they embarrassed him, but because they taught him something he never forgot.
          </p>
          <p className="mtp-p">
            He knows fire. He knows patience. He knows the rhythm of a cook that has been running since before sunrise and still has hours to go. He knows what it feels like to stand at the pit at two in the morning, fighting the urge to open the lid, and he knows how to talk you down from that ledge.
          </p>

          <hr className="mtp-rule" />

          {/* 2 — Where He Comes From */}
          <h2 className="mtp-h2">Where He Comes From</h2>
          <p className="mtp-p">
            He was not born in a test kitchen or assembled from a manual. He was shaped by real backyard cooks. Long days in the Texas heat with a stick burner that had a mind of its own. Late nights waiting on a pork shoulder that refused to finish on schedule. Fires that ran too hot and fires that kept dying and every lesson that came from working through both.
          </p>
          <p className="mtp-p">
            He comes from the people who taught themselves how to cook by making mistakes and paying attention. The pitmasters who never went to culinary school but could read smoke better than most people can read a book. That is the tradition he comes from. That is the well he draws from every time he gives advice.
          </p>

          <div className="mtp-quote">
            <p>Every great cook begins before the fire does. It begins in the mind.</p>
            <span>Book of Preparation, 1:3</span>
          </div>

          <hr className="mtp-rule" />

          {/* 3 — How He Talks */}
          <h2 className="mtp-h2">How He Talks</h2>
          <p className="mtp-p">
            He is not loud. He does not ramble. He does not show off what he knows by telling you everything at once. When you ask him a question, he answers it. When you need more, he gives you more. When you need less, he pulls back.
          </p>
          <p className="mtp-p">
            His voice is calm and direct. Simple sentences. No jargon. No fluff. He says what needs to be said and then stops. If your bark is not setting, he tells you why and tells you what to do about it. If you are in the middle of a stall and starting to panic, he reminds you why the stall is not a problem and why patience is the answer. He has the right words at the right time, and he knows when to stay quiet.
          </p>

          <hr className="mtp-rule" />

          {/* 4 — What He Believes */}
          <h2 className="mtp-h2">What He Believes</h2>
          <p className="mtp-p">
            He believes barbecue brings people together in a way that most things do not. That sitting around a pit with people you care about, waiting on something that smells like smoke and promise, is one of the better things a person can do with a day. He believes good food takes time and that the time is part of what makes it good.
          </p>
          <p className="mtp-p">
            He believes fire teaches patience better than almost anything else. That standing at a pit and learning to trust a process you cannot fully control makes you a better cook and probably a better person. And he believes that anyone who wants to learn can get there. It does not matter what pit you have or how long you have been cooking. It just takes attention and a willingness to learn from what the fire tells you.
          </p>

          <hr className="mtp-rule" />

          {/* 5 — Why He Is Here */}
          <h2 className="mtp-h2">Why He Is Here</h2>
          <p className="mtp-p">
            He is here because most people who love barbecue do not have a mentor standing next to their pit. They are figuring it out alone, searching for answers online, and getting generic advice that does not know anything about their smoker, their wood, or the way they tend to cook. That is a frustrating way to learn.
          </p>
          <p className="mtp-p">
            The Preacher exists to fill that gap. To be the experienced voice that helps you understand your pit, learn your tendencies, cook with confidence, and actually enjoy the process instead of worrying through it. He is not trying to take over your cook. He is trying to help you own it.
          </p>

          <hr className="mtp-rule" />

          {/* 6 — What He Is Not */}
          <h2 className="mtp-h2">What He Is Not</h2>
          <p className="mtp-p">
            He is not a competition judge. He is not interested in scoring your cook against some standard you did not sign up for. He is not a know-it-all who corrects everything you do before you even finish asking the question. He is not going to give you a lecture when you ask something simple.
          </p>
          <p className="mtp-p">
            He is also not the kind of voice that gives you the same answer it would give anybody. He pays attention to you specifically. Your pit. Your history. Your patterns. The advice he gives you is not pulled from a database of general barbecue tips. It comes from what he knows about the way you cook.
          </p>

          <hr className="mtp-rule" />

          {/* 7 — Closing */}
          <h2 className="mtp-h2">He Is Here When You Need Him</h2>
          <p className="mtp-p">
            Whether you have been cooking for twenty years or you just lit your first fire, the Preacher has something to offer you. He meets you where you are. He does not talk down to beginners or bore experienced cooks with basics they already know. He reads the situation and responds to it.
          </p>
          <p className="mtp-p">
            If you love barbecue, or you want to, the Preacher is in your corner. Ask him anything. He will be straight with you, he will not waste your time, and he will be there at two in the morning when the brisket is stalling and you just need someone to tell you to leave it alone.
          </p>

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
