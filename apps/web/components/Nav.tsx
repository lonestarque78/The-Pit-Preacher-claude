"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function Nav() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "var(--space-3) var(--space-5)",
        background: "var(--color-bg-alt)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: "1.25rem",
          fontWeight: 500,
          color: "var(--color-accent)",
          textDecoration: "none",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        Pit Preacher
      </Link>

      <div style={{ display: "flex", gap: "var(--space-3)" }}>
        {loading ? null : user ? (
          <>
            <Link
              href="/dashboard"
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.875rem",
                color: "var(--color-text)",
                textDecoration: "none",
              }}
            >
              Dashboard
            </Link>
            <Link
              href="/logs"
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.875rem",
                color: "var(--color-text)",
                textDecoration: "none",
              }}
            >
              History
            </Link>
            <button
              onClick={handleLogout}
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.875rem",
                color: "var(--color-text-muted)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Log Out
            </button>
          </>
        ) : (
          <Link
            href="/auth/login"
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.875rem",
              color: "var(--color-text)",
              textDecoration: "none",
            }}
          >
            Log In
          </Link>
        )}
      </div>
    </nav>
  );
}