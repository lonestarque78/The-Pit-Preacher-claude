"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function Nav() {
  const [user, setUser] = useState<User | null>(null);
  const [tier, setTier] = useState<string>("free");
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

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

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const isPitmaster = tier === "pitmaster";
  const isBackyardPlus = tier === "backyard" || tier === "pitmaster";
  const isBasicPlus = tier === "basic" || tier === "backyard" || tier === "pitmaster";

  const linkStyle = {
    fontFamily: "var(--font-ui)",
    fontSize: "0.875rem",
    color: "var(--color-text)" as const,
    textDecoration: "none" as const,
    whiteSpace: "nowrap" as const,
  };

  const accentLinkStyle = {
    ...linkStyle,
    color: "#C9973A" as const,
  };

  return (
    <>
      <style>{`
        .nav-desktop-links {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }
        .nav-hamburger {
          display: none;
        }
        @media (max-width: 768px) {
          .nav-desktop-links {
            display: none;
          }
          .nav-hamburger {
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
        .slide-menu-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(10, 8, 6, 0.7);
          z-index: 90;
          animation: fadeIn 0.2s ease;
        }
        .slide-menu-panel {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: min(320px, 85vw);
          background: var(--color-bg-alt);
          border-left: 1px solid rgba(201,151,58,0.2);
          z-index: 91;
          display: flex;
          flex-direction: column;
          padding: var(--space-4);
          animation: slideIn 0.25s ease;
          overflow-y: auto;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .slide-menu-link {
          font-family: var(--font-ui);
          font-size: 1rem;
          color: var(--color-text);
          text-decoration: none;
          padding: var(--space-2) 0;
          border-bottom: 1px solid rgba(201,151,58,0.08);
          display: block;
          letter-spacing: 0.03em;
        }
        .slide-menu-link:last-of-type {
          border-bottom: none;
        }
        .slide-menu-link.accent {
          color: #C9973A;
        }
        .slide-menu-label {
          font-family: var(--font-ui);
          font-size: 0.65rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin: var(--space-3) 0 var(--space-1);
        }
      `}</style>

      {/* ── MAIN NAV ── */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "var(--space-3) var(--space-4)",
        background: "var(--color-bg-alt)",
        borderBottom: "1px solid rgba(201,151,58,0.15)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <Link href="/" style={{
            fontFamily: "var(--font-ui)",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "var(--color-accent)",
            textDecoration: "none",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
            Pit Preacher
          </Link>

          {/* Desktop logged-in left links */}
          {!loading && user && (
            <div className="nav-desktop-links">
              <Link href="/" style={linkStyle}>Start a Cook</Link>
              <Link href="/playbook" style={linkStyle}>Playbook</Link>
              {isBackyardPlus && (
                <Link href="/fix" style={accentLinkStyle}>Pit Rescue</Link>
              )}
            </div>
          )}
        </div>

        {/* Right — desktop */}
        <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
          {loading ? null : user ? (
            <>
              <div className="nav-desktop-links">
                <Link href="/dashboard" style={linkStyle}>Dashboard</Link>
                {isBasicPlus && <Link href="/lab" style={linkStyle}>Wood Lab</Link>}
                <Link href="/logs" style={linkStyle}>History</Link>
                {isPitmaster && (
                  <Link href="/pitmaster/trends" style={accentLinkStyle}>Pitmaster</Link>
                )}
                <Link href="/about" style={linkStyle}>About</Link>
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
                    whiteSpace: "nowrap",
                  }}
                >
                  Log Out
                </button>
              </div>
            </>
          ) : (
            <div className="nav-desktop-links">
              <Link href="/how-it-works" style={linkStyle}>How It Works</Link>
              <Link href="/features" style={linkStyle}>Features</Link>
              <Link href="/about" style={linkStyle}>About</Link>
              <Link href="/auth/login" style={linkStyle}>Log In</Link>
            </div>
          )}

          {/* Hamburger — mobile only */}
          {!loading && (
            <button
              className="nav-hamburger"
              onClick={() => setMenuOpen(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                flexDirection: "column",
                gap: "5px",
              }}
              aria-label="Open menu"
            >
              <span style={{ display: "block", width: "22px", height: "2px", background: "#C9973A", borderRadius: "1px" }} />
              <span style={{ display: "block", width: "22px", height: "2px", background: "#C9973A", borderRadius: "1px" }} />
              <span style={{ display: "block", width: "16px", height: "2px", background: "#C9973A", borderRadius: "1px" }} />
            </button>
          )}
        </div>
      </nav>

      {/* ── SLIDE-IN MENU ── */}
      {menuOpen && (
        <>
          <div className="slide-menu-backdrop" onClick={() => setMenuOpen(false)} />
          <div className="slide-menu-panel">

            {/* Close button */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
              <span style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.7rem",
                color: "#C9973A",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}>
                Menu
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-text-muted)",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  padding: "4px",
                  lineHeight: 1,
                }}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            {user ? (
              <>
                {/* Cook */}
                <div className="slide-menu-label">Cook</div>
                <Link href="/" className="slide-menu-link">Start a Cook</Link>
                <Link href="/dashboard" className="slide-menu-link">Dashboard</Link>
                <Link href="/logs" className="slide-menu-link">History</Link>
                <Link href="/playbook" className="slide-menu-link">Playbook</Link>

                {/* Tools */}
                {(isBackyardPlus || isBasicPlus) && (
                  <>
                    <div className="slide-menu-label">Tools</div>
                    {isBackyardPlus && (
                      <Link href="/fix" className="slide-menu-link accent">Pit Rescue</Link>
                    )}
                    {isBasicPlus && (
                      <Link href="/lab" className="slide-menu-link">Wood Lab</Link>
                    )}
                  </>
                )}

                {/* Pitmaster */}
                {isPitmaster && (
                  <>
                    <div className="slide-menu-label">Pitmaster</div>
                    <Link href="/pitmaster/trends" className="slide-menu-link accent">Trend Analysis</Link>
                    <Link href="/pitmaster/meat/brisket" className="slide-menu-link accent">Meat Profiles</Link>
                    <Link href="/pitmaster/pit/pellet" className="slide-menu-link accent">Pit Profiles</Link>
                  </>
                )}

                {/* Account */}
                <div className="slide-menu-label">Account</div>
                <Link href="/premium" className="slide-menu-link">Plans & Pricing</Link>
                <Link href="/how-it-works" className="slide-menu-link">How It Works</Link>
                <Link href="/features" className="slide-menu-link">Features</Link>
                <Link href="/about" className="slide-menu-link">About</Link>
                <button
                  onClick={handleLogout}
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: "1rem",
                    color: "var(--color-text-muted)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "var(--space-2) 0",
                    textAlign: "left",
                    width: "100%",
                    borderBottom: "1px solid rgba(201,151,58,0.08)",
                  }}
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <div className="slide-menu-label">Get Started</div>
                <Link href="/auth/login" className="slide-menu-link">Log In</Link>
                <Link href="/how-it-works" className="slide-menu-link">How It Works</Link>
                <Link href="/features" className="slide-menu-link">Features</Link>
                <Link href="/about" className="slide-menu-link">About</Link>
                <Link href="/premium" className="slide-menu-link">Plans & Pricing</Link>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
