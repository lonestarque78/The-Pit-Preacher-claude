"use client";

import Link from "next/link";

const footerLinks = [
  { label: "Meet the Preacher", href: "/meet-the-preacher" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Features", href: "/features" },
  { label: "About", href: "/about" },
  { label: "Plans & Pricing", href: "/premium" },
  { label: "Privacy Policy", href: "/privacy" },
];

export default function Footer() {
  return (
    <>
      <style>{`
        .footer {
          background: var(--color-bg-alt);
          border-top: 1px solid rgba(201, 151, 58, 0.12);
          padding: var(--space-6) var(--space-4) var(--space-5);
          margin-top: var(--space-6);
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .footer-brand {
          text-align: center;
          padding-bottom: var(--space-4);
          border-bottom: 1px solid rgba(201, 151, 58, 0.12);
        }

        .footer-tagline {
          font-family: var(--font-heading);
          font-size: 1rem;
          color: var(--color-accent);
          margin: 0 0 var(--space-1) 0;
          letter-spacing: 0.04em;
        }

        .footer-description {
          font-family: var(--font-body);
          font-size: 0.875rem;
          color: var(--color-text-muted);
          margin: 0;
          font-style: italic;
        }

        .footer-nav {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: var(--space-3) var(--space-5);
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .footer-nav a {
          font-family: var(--font-ui);
          font-size: 0.8rem;
          color: var(--color-text-muted);
          text-decoration: none;
          letter-spacing: 0.02em;
          transition: all 0.2s;
          text-transform: uppercase;
        }

        .footer-nav a:hover {
          color: var(--color-accent);
        }

        .footer-copyright {
          text-align: center;
          padding-top: var(--space-4);
          border-top: 1px solid rgba(201, 151, 58, 0.12);
        }

        .footer-copyright-text {
          font-family: var(--font-ui);
          font-size: 0.7rem;
          color: rgba(201, 151, 58, 0.3);
          margin: 0;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        @media (max-width: 640px) {
          .footer {
            padding: var(--space-5) var(--space-3) var(--space-4);
          }

          .footer-nav {
            gap: var(--space-2) var(--space-3);
          }
        }
      `}</style>

      <footer className="footer" role="contentinfo">
        <div className="footer-container">
          {/* Brand */}
          <div className="footer-brand">
            <h2 className="footer-tagline">PIT PREACHER</h2>
            <p className="footer-description">Your Pitmaster in Your Pocket</p>
          </div>

          {/* Links */}
          <nav aria-label="Footer navigation">
            <ul className="footer-nav">
              {footerLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Copyright */}
          <div className="footer-copyright">
            <p className="footer-copyright-text">
              &copy; {new Date().getFullYear()} The Pit Preacher &mdash; Frisco, Texas
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
