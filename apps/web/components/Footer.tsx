"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function Footer() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setLoggedIn(!!data?.user);
    });
  }, []);

  return (
    <footer style={{
      background: "var(--color-bg-alt)",
      borderTop: "1px solid rgba(201,151,58,0.12)",
      padding: "var(--space-5) var(--space-4) var(--space-4)",
    }}>
      <div style={{
        maxWidth: "1000px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-4)",
      }}>

        {/* Brand signature */}
        <div style={{ textAlign: "center" }}>
          <p style={{
            fontFamily: "var(--font-ui)",
            fontSize: "0.75rem",
            color: "rgba(201,151,58,0.5)",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            margin: "0 0 4px",
          }}>
            ✦ The Pit Preacher ✦
          </p>
          <p style={{
            fontFamily: "var(--font-body)",
            fontStyle: "italic",
            fontSize: "0.8rem",
            color: "rgba(201,151,58,0.3)",
            margin: 0,
          }}>
            Your Pitmaster in Your Pocket
          </p>
        </div>

        {/* Links */}
        <nav aria-label="Footer navigation">
          {!loggedIn ? (
            <ul style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "var(--space-2) var(--space-4)",
            }}>
              {[
                { label: "Meet the Preacher", href: "/meet-the-preacher" },
                { label: "How It Works", href: "/how-it-works" },
                { label: "Features", href: "/features" },
                { label: "Plans & Pricing", href: "/premium" },
                { label: "Terms", href: "/terms" },
                { label: "Privacy", href: "/privacy" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.78rem",
                    color: "var(--color-text-muted)",
                    textDecoration: "none",
                    letterSpacing: "0.04em",
                  }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <ul style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              justifyContent: "center",
              gap: "var(--space-4)",
            }}>
              {[
                { label: "Terms", href: "/terms" },
                { label: "Privacy", href: "/privacy" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.78rem",
                    color: "var(--color-text-muted)",
                    textDecoration: "none",
                    letterSpacing: "0.04em",
                  }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </nav>

        {/* Copyright */}
        <p style={{
          fontFamily: "var(--font-ui)",
          fontSize: "0.68rem",
          color: "rgba(201,151,58,0.2)",
          textAlign: "center",
          margin: 0,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}>
          &copy; {new Date().getFullYear()} Lone Star Que, LLC &mdash; Frisco, Texas
        </p>

      </div>
    </footer>
  );
}
