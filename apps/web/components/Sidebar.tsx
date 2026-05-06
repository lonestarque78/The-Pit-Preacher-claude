"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
}

export function Sidebar({ isOpen, onClose, user, onLogout }: SidebarProps) {
  return (
    <>

      <div
        className={`sidebar-backdrop ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      <div className={`sidebar-panel ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Menu</h2>
          <button
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <div className="sidebar-content">
          {user ? (
            <>
              <div className="sidebar-section">
                <h3 className="sidebar-section-title">Cook</h3>
                <Link href="/prep" className="sidebar-link">
                  Start a Cook
                </Link>
                <Link href="/dashboard" className="sidebar-link">
                  Dashboard
                </Link>
                <Link href="/logs" className="sidebar-link">
                  History
                </Link>
                <Link href="/playbook" className="sidebar-link">
                  Playbook
                </Link>
              </div>

              <div className="sidebar-section">
                <h3 className="sidebar-section-title">Tools</h3>
                <Link href="/fix" className="sidebar-link">
                  Pit Rescue
                </Link>
                <Link href="/lab" className="sidebar-link">
                  Wood Lab
                </Link>
              </div>

              <div className="sidebar-section">
                <h3 className="sidebar-section-title">Pitmaster</h3>
                <Link href="/pitmaster/trends" className="sidebar-link">
                  Trend Analysis
                </Link>
                <Link href="/pitmaster/meat" className="sidebar-link">
                  Meat Profiles
                </Link>
                <Link href="/pitmaster/pit" className="sidebar-link">
                  Pit Profiles
                </Link>
              </div>

              <div className="sidebar-section">
                <h3 className="sidebar-section-title">Account</h3>
                <Link href="/account" className="sidebar-link">
                  Account
                </Link>
                <Link href="/plans" className="sidebar-link">
                  Plans & Pricing
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="sidebar-section">
                <h3 className="sidebar-section-title">Explore</h3>
                <Link href="/how-it-works" className="sidebar-link">
                  How It Works
                </Link>
                <Link href="/features" className="sidebar-link">
                  Features
                </Link>
                <Link href="/meet-the-preacher" className="sidebar-link">
                  Meet the Preacher
                </Link>
                <Link href="/about" className="sidebar-link">
                  About
                </Link>
                <Link href="/plans" className="sidebar-link">
                  Plans & Pricing
                </Link>
              </div>

              <div className="sidebar-section">
                <h3 className="sidebar-section-title">Get Started</h3>
                <Link href="/auth/login" className="sidebar-link">
                  Sign In
                </Link>
              </div>
            </>
          )}
        </div>

        {user && (
          <div className="sidebar-footer">
            <button
              onClick={onLogout}
              className="sidebar-logout"
              aria-label="Log out"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </>
  );
}
