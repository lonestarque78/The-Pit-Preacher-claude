"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function Nav() {
  const [user, setUser] = useState<any>(null);
  const [tier, setTier] = useState<string>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data?.user || null);
      if (data?.user) {
        const { data: subData } = await supabase
          .from("subscriptions")
          .select("tier")
          .eq("user_id", data.user.id)
          .single();
        setTier(subData?.tier ?? "free");
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const linkStyle = {
    fontFamily: "var(--font-ui)",
    fontSize: "0.875rem",
    color: "var(--color-text)" as const,
    textDecoration: "none" as const,
  };

  return (
    <nav style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "var(--space-3) var(--space-5)",
      background: "var(--color-bg-alt)",
      borderBottom: "1px solid var(--color-border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
        <Link href="/" style={{
          fontFamily: "var(--font-ui)",
          fontSize: "1.25rem",
          fontWeight: 500,
          color: "var(--color-accent)",
          textDecoration: "none",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}>
          Pit Preacher
        </Link>

        {!loading && user && (
          <Link href="/" style={linkStyle}>
            Start a Cook
          </Link>
        )}

        {!loading && user && (tier === "backyard" || tier === "pitmaster") && (
          <Link href="/fix" style={{ ...linkStyle, color: "#C9973A" }}>
            Pit Rescue
          </Link>
        )}
      </div>

      <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
        {loading ? null : user ? (
          <>
            <Link href="/dashboard" style={linkStyle}>
              Dashboard
            </Link>
            <Link href="/logs" style={linkStyle}>
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
          <Link href="/auth/login" style={linkStyle}>
            Log In
          </Link>
        )}
      </div>
    </nav>
  );
}
