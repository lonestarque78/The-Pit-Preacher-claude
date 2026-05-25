import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | The Pit Preacher",
  description: "Privacy policy for The Pit Preacher BBQ cooking companion app, operated by Lone Star Que LLC.",
};

export default function PrivacyPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--color-bg)",
      color: "var(--color-text)",
    }}>
      <style>{`
        .privacy-section {
          max-width: 760px;
          margin: 0 auto;
          padding: 0 var(--space-4);
        }
        .privacy-h2 {
          font-family: var(--font-heading);
          font-size: clamp(1.1rem, 2vw, 1.35rem);
          color: #F5E6C8;
          margin: 0 0 var(--space-2);
          font-weight: 700;
        }
        .privacy-p {
          font-family: var(--font-body);
          font-size: 1rem;
          line-height: 1.85;
          color: #C8B89A;
          margin: 0 0 var(--space-3);
        }
        .privacy-p:last-child {
          margin-bottom: 0;
        }
        .privacy-ul {
          font-family: var(--font-body);
          font-size: 1rem;
          line-height: 1.85;
          color: #C8B89A;
          margin: 0 0 var(--space-3);
          padding-left: var(--space-4);
        }
        .privacy-ul li {
          margin-bottom: var(--space-1);
        }
        .privacy-rule {
          border: none;
          border-top: 1px solid rgba(201,151,58,0.2);
          margin: var(--space-5) 0;
        }
        .privacy-block {
          margin-bottom: var(--space-5);
        }
        .privacy-label {
          font-family: var(--font-ui);
          font-size: 0.7rem;
          color: #C9973A;
          text-transform: uppercase;
          letter-spacing: 0.18em;
          margin: 0 0 var(--space-2);
        }
        .privacy-contact {
          background: rgba(201,151,58,0.06);
          border: 1px solid rgba(201,151,58,0.2);
          border-radius: var(--radius-md);
          padding: var(--space-4);
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
          Lone Star Que LLC
        </p>
        <h1 style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(2rem, 5vw, 3rem)",
          color: "#F5E6C8",
          margin: "0 0 var(--space-3)",
          lineHeight: 1.1,
          fontWeight: 900,
        }}>
          Privacy Policy
        </h1>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.9rem",
          color: "var(--color-text-muted)",
          margin: "0 auto",
          fontStyle: "italic",
        }}>
          Effective May 24, 2026
        </p>
      </div>

      {/* Body */}
      <div style={{ padding: "var(--space-6) 0 var(--space-7)" }}>
        <div className="privacy-section">

          <div className="privacy-block">
            <p className="privacy-p">
              The Pit Preacher is operated by Lone Star Que LLC, a Texas limited liability company based in Frisco, Texas. This privacy policy explains what information we collect, how we use it, and who we share it with when you use our app at thepitpreacher.com.
            </p>
            <p className="privacy-p">
              By using The Pit Preacher, you agree to the practices described in this policy. If you have questions, reach out to us at the contact address at the bottom of this page.
            </p>
          </div>

          <hr className="privacy-rule" />

          <div className="privacy-block">
            <p className="privacy-label">Section 1</p>
            <h2 className="privacy-h2">What We Collect</h2>
            <p className="privacy-p">We collect the following types of information:</p>
            <ul className="privacy-ul">
              <li><strong style={{ color: "#F5E6C8" }}>Account information</strong> — your name and email address when you create an account.</li>
              <li><strong style={{ color: "#F5E6C8" }}>Cook tracking data</strong> — the cooks you log, including meat types, pit types, temperatures, timelines, notes, and any other details you enter while planning or tracking a cook.</li>
              <li><strong style={{ color: "#F5E6C8" }}>Pit and profile data</strong> — information you provide about your smoker setup, cooking style, and preferences.</li>
              <li><strong style={{ color: "#F5E6C8" }}>Usage data</strong> — how you interact with the app, including pages visited and features used, so we can improve the experience.</li>
              <li><strong style={{ color: "#F5E6C8" }}>Payment information</strong> — if you subscribe to a paid plan, your payment is processed by Stripe. We do not store your credit card number.</li>
            </ul>
          </div>

          <hr className="privacy-rule" />

          <div className="privacy-block">
            <p className="privacy-label">Section 2</p>
            <h2 className="privacy-h2">How We Use Your Information</h2>
            <p className="privacy-p">We use your information to:</p>
            <ul className="privacy-ul">
              <li>Create and manage your account</li>
              <li>Provide personalized BBQ coaching and AI-powered guidance based on your cook history and pit setup</li>
              <li>Process subscription payments and manage billing</li>
              <li>Send transactional emails related to your account (password resets, billing receipts)</li>
              <li>Improve the app and understand how people use it</li>
              <li>Respond to your support requests</li>
            </ul>
            <p className="privacy-p">
              We do not sell your personal information. We do not use your data for advertising or share it with data brokers.
            </p>
          </div>

          <hr className="privacy-rule" />

          <div className="privacy-block">
            <p className="privacy-label">Section 3</p>
            <h2 className="privacy-h2">Third-Party Services</h2>
            <p className="privacy-p">
              We use a small number of trusted third-party services to operate The Pit Preacher. Each has its own privacy policy that governs how they handle data.
            </p>
            <ul className="privacy-ul">
              <li>
                <strong style={{ color: "#F5E6C8" }}>Supabase</strong> — handles authentication (sign-in, password management) and stores your account and cook data in a secure database. Supabase is GDPR-compliant and SOC 2 Type II certified.
              </li>
              <li>
                <strong style={{ color: "#F5E6C8" }}>Stripe</strong> — processes subscription payments. When you subscribe, you interact directly with Stripe's secure payment form. We receive a customer ID and subscription status; we never see or store your full payment card details.
              </li>
              <li>
                <strong style={{ color: "#F5E6C8" }}>Anthropic</strong> — powers the AI features of The Pit Preacher, including the Preacher's advice, cook guidance, and insights. Your cook data and questions are sent to Anthropic's API to generate responses. Anthropic does not use your data to train their models by default. See Anthropic's privacy policy for details.
              </li>
            </ul>
          </div>

          <hr className="privacy-rule" />

          <div className="privacy-block">
            <p className="privacy-label">Section 4</p>
            <h2 className="privacy-h2">Data Retention</h2>
            <p className="privacy-p">
              We keep your account and cook data for as long as your account is active. If you delete your account, we delete your personal data and cook history from our database. Some data may remain in backups for up to 30 days after deletion.
            </p>
          </div>

          <hr className="privacy-rule" />

          <div className="privacy-block">
            <p className="privacy-label">Section 5</p>
            <h2 className="privacy-h2">Your Rights</h2>
            <p className="privacy-p">You have the right to:</p>
            <ul className="privacy-ul">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Export your cook data</li>
            </ul>
            <p className="privacy-p">
              You can delete your account at any time from the Account &rarr; Danger Zone section of the app. For other requests, contact us at the address below.
            </p>
          </div>

          <hr className="privacy-rule" />

          <div className="privacy-block">
            <p className="privacy-label">Section 6</p>
            <h2 className="privacy-h2">Security</h2>
            <p className="privacy-p">
              We use industry-standard security practices including encrypted connections (HTTPS), secure authentication via Supabase, and row-level security policies that ensure users can only access their own data. No system is perfectly secure, but we take reasonable precautions to protect your information.
            </p>
          </div>

          <hr className="privacy-rule" />

          <div className="privacy-block">
            <p className="privacy-label">Section 7</p>
            <h2 className="privacy-h2">Children</h2>
            <p className="privacy-p">
              The Pit Preacher is not directed at children under the age of 13 and we do not knowingly collect personal information from anyone under 13. If you believe we have inadvertently collected such information, contact us and we will delete it promptly.
            </p>
          </div>

          <hr className="privacy-rule" />

          <div className="privacy-block">
            <p className="privacy-label">Section 8</p>
            <h2 className="privacy-h2">Changes to This Policy</h2>
            <p className="privacy-p">
              We may update this policy from time to time. When we do, we will update the effective date at the top of this page. If the changes are material, we will notify you by email or by a notice in the app. Continued use of The Pit Preacher after an update constitutes acceptance of the revised policy.
            </p>
          </div>

          <hr className="privacy-rule" />

          <div className="privacy-contact">
            <p className="privacy-label">Contact</p>
            <h2 className="privacy-h2" style={{ marginBottom: "var(--space-3)" }}>Questions?</h2>
            <p className="privacy-p">
              If you have questions about this privacy policy or how we handle your data, you can reach us at:
            </p>
            <p className="privacy-p" style={{ marginBottom: 0 }}>
              <strong style={{ color: "#F5E6C8" }}>Lone Star Que LLC</strong><br />
              Frisco, Texas<br />
              <a href="mailto:developer@lonestarque.com" style={{ color: "#C9973A", textDecoration: "none" }}>
                developer@lonestarque.com
              </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
