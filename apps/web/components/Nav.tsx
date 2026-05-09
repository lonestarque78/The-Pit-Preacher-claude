"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { Sidebar } from "./Sidebar";

export default function Nav() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Close menus on route change
  useEffect(() => {
    setUserMenuOpen(false);
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <>
      <style>{`
        .nav-bar {
          background: var(--color-bg-alt);
          border-bottom: 1px solid rgba(201, 151, 58, 0.12);
          padding: 0 var(--space-4);
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: var(--space-6);
        }

        .nav-logo {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          color: var(--color-accent);
          text-decoration: none;
          font-weight: 600;
          letter-spacing: 0.04em;
        }

        .nav-center {
          display: flex;
          gap: var(--space-5);
          align-items: center;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-center a {
          font-family: var(--font-ui);
          font-size: 0.875rem;
          color: var(--color-text);
          text-decoration: none;
          letter-spacing: 0.02em;
          transition: color 0.2s;
          text-transform: uppercase;
        }

        .nav-center a:hover {
          color: var(--color-accent);
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .user-button {
          background: none;
          border: 1px solid rgba(201, 151, 58, 0.3);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-accent);
          font-family: var(--font-ui);
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .user-button:hover {
          border-color: var(--color-accent);
          background: rgba(201, 151, 58, 0.08);
        }

        .user-menu {
          position: absolute;
          top: 64px;
          right: var(--space-4);
          background: var(--color-bg-alt);
          border: 1px solid rgba(201, 151, 58, 0.2);
          border-radius: var(--radius-lg);
          min-width: 180px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          z-index: 50;
          animation: slideDown 0.2s ease;
        }

        .user-menu ul {
          list-style: none;
          margin: 0;
          padding: var(--space-2) 0;
        }

        .user-menu li {
          margin: 0;
        }

        .user-menu a,
        .user-menu button {
          display: block;
          width: 100%;
          padding: var(--space-2) var(--space-4);
          text-align: left;
          background: none;
          border: none;
          color: var(--color-text);
          font-family: var(--font-ui);
          font-size: 0.875rem;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
        }

        .user-menu a:hover,
        .user-menu button:hover {
          background: rgba(201, 151, 58, 0.1);
          color: var(--color-accent);
        }

        .hamburger-button {
          display: none;
          background: none;
          border: none;
          color: var(--color-text);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .nav-center {
            display: none;
          }

          .hamburger-button {
            display: flex;
          }

          .user-button {
            display: none;
          }

          .user-menu {
            right: calc(var(--space-4) + 48px);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <nav className="nav-bar" role="navigation" aria-label="Main navigation">
        <div className="nav-left">
          <Link href="/" className={`nav-logo${pathname === "/" ? " active" : ""}`}>
            PIT PREACHER
          </Link>
        </div>

        {/* Right side: nav links + user menu or hamburger */}
        <div className="nav-right">
          <ul className="nav-center">
            <li><Link href="/prep" className={pathname === "/prep" ? "active" : undefined}>Start a Cook</Link></li>
            <li><Link href="/playbook" className={pathname === "/playbook" ? "active" : undefined}>Playbook</Link></li>
            <li><Link href="/dashboard" className={pathname === "/dashboard" ? "active" : undefined}>Dashboard</Link></li>
          </ul>
          {!loading && user && (
            <div style={{ position: "relative" }}>
              <button
                className="user-button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="User menu"
              >
                {user.email?.[0]?.toUpperCase() || "U"}
              </button>
              {userMenuOpen && (
                <div className="user-menu">
                  <ul>
                    <li><Link href="/account">Account</Link></li>
                    <li>
                      <button onClick={handleLogout}>Log Out</button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {!loading && !user && (
            <Link
              href="/auth/login"
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.875rem",
                color: "var(--color-accent)",
                textDecoration: "none",
                letterSpacing: "0.02em",
              }}
            >
              Sign In
            </Link>
          )}

          <button
            className="hamburger-button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Menu"
            aria-expanded={sidebarOpen}
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} onLogout={handleLogout} />
    </>
  );
}
