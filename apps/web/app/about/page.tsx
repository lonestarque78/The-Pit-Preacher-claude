// app/about/page.tsx

import Link from "next/link";

export default function AboutPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--color-bg)",
      color: "var(--color-text)",
    }}>
      <style>{`
        .about-section {
          max-width: 680px;
          margin: 0 auto;
          padding: 0 var(--space-4);
        }
        .about-p {
          font-family: var(--font-body);
          font-size: 1.05rem;
          line-height: 1.85;
          color: #C8B89A;
          margin: 0 0 var(--space-3);
        }
        .about-h2 {
          font-family: var(--font-heading);
          font-size: clamp(1.3rem, 2.5vw, 1.6rem);
          color: #F5E6C8;
          margin: var(--space-6) 0 var(--space-3);
          font-weight: 700;
        }
        .about-rule {
          border: none;
          border-top: 1px solid rgba(201,151,58,0.2);
          margin: var(--space-5) 0;
        }
        .about-dedication {
          border-left: 3px solid #C9973A;
          padding: var(--space-3) var(--space-4);
          background: rgba(201,151,58,0.05);
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
          margin: var(--space-4) 0;
        }
        .about-dedication p {
          font-family: var(--font-body);
          font-size: 1rem;
          font-style: italic;
          line-height: 1.85;
          color: #D9C9A8;
          margin: 0 0 var(--space-2);
        }
        .about-dedication p:last-child {
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
      `}</style>

      {/* Hero */}
      <div style={{
        borderBottom: "1px solid rgba(201,151,58,0.15)",
        padding: "var(--space-7) var(--space-4) var(--space-5)",
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
      <div style={{ padding: "var(--space-6) 0 var(--space-7)" }}>
        <div className="about-section">

          {/* Origin */}
          <p className="about-p">
            I grew up in the Dallas area and fell in love with barbecue in my early twenties. My first smoker was an ugly drum I welded together in the driveway. It wasn't pretty, but it taught me everything I needed to know about fire, patience, and how stubborn a piece of meat can be when it wants to be.
          </p>
          <p className="about-p">
            After that came a used offset stick burner that I cooked on until the firebox rusted through. That pit taught me how to read smoke instead of staring at a thermometer. These days I use a pellet cooker because life gets busy, but I'll always have a soft spot for a stick burner and the honest smoke it produces.
          </p>
          <p className="about-p">
            I'm not a competition cook. I'm a backyard pitmaster who likes feeding people. Pork butt is my favorite thing to smoke because it's forgiving, flavorful, and fun to experiment with. Every Sunday night I throw a ribeye on for date night with my wife. She says she prefers my cooking over restaurants. I choose to believe her.
          </p>
          <p className="about-p">
            Barbecue has always been my quiet place. It slows me down. It gives me something to focus on that isn't work or stress or noise. It's where I find peace.
          </p>

          <hr className="about-rule" />

          {/* Why */}
          <h2 className="about-h2">Why I Built This</h2>
          <p className="about-p">
            I got tired of generic barbecue advice. Search engines repeat the same answers. Chatbots give you textbook responses that don't know your smoker, your wood, your habits, or your style.
          </p>
          <p className="about-p">
            I wanted something that actually understood me as a cook. Something that could look at my setup, my past cooks, my tendencies, and give me advice that mattered. Not just "run your pit at this temperature," but why. Not just "wrap at this point," but how that choice interacts with your smoker and your meat.
          </p>
          <p className="about-p">
            I also needed a place to keep track of my cooks. When you nail a pork butt or a brisket, you want to be able to repeat it. I wanted a journal that captured the whole story, not just a recipe.
          </p>
          <p className="about-p">
            So I built it.
          </p>

          <hr className="about-rule" />

          {/* What it is */}
          <h2 className="about-h2">What The Pit Preacher Is</h2>
          <p className="about-p">
            The Pit Preacher is a pitmaster in your pocket. It learns your rig, your wood, your style, and gives you advice that fits the way you cook. You can ask it anything. Why your brisket is stalling. How to build better bark. What wood pairs best with ribs. What bourbon belongs next to your plate.
          </p>
          <p className="about-p">
            You can log your cooks, track your temps, timing, notes, and photos, and get personalized insights before and after each smoke. When you nail a cook, you can save it, repeat it, or share it.
          </p>
          <p className="about-p">
            This app is built for real people who love barbecue. Not for competitions. Not for clout. Just for the joy of cooking good food for people you care about.
          </p>

          <hr className="about-rule" />

          {/* Built in Texas */}
          <h2 className="about-h2">Built in Texas</h2>
          <p className="about-p">
            The Pit Preacher is built and run by Lone Star Que, LLC. It was designed, coded, and launched by one guy with a full time job, a family, and a smoker in the backyard.
          </p>

          <hr className="about-rule" />

          {/* Dedication */}
          <h2 className="about-h2">Dedicated To a Good Man</h2>
          <div className="about-dedication">
            <p>
              This project is dedicated to my father in law. He loved good food, good company, and the kind of meals that bring people together. He ran a barbecue ministry at his church and fed more people than I can count. He preached the Word with the same heart he put into his cooks.
            </p>
            <p>
              Building this app gave me something steady to hold onto during a hard season. Finishing it became a way to honor him. Every cook someone logs, every brisket saved at two in the morning, every person who joins the congregation — it is all in his honor.
            </p>
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
