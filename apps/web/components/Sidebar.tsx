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
      <style>{`
        .sidebar-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(10, 8, 6, 0.7);
          z-index: 9998;
          animation: fadeIn 0.2s ease;
          display: none;
        }

        .sidebar-backdrop.open {
          display: block;
        }

        .sidebar-panel {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 280px;
          background: var(--color-bg-alt);
          border-right: 1px solid rgba(201, 151, 58, 0.12);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          padding: var(--space-4);
          animation: slideInLeft 0.3s ease;
          overflow-y: auto;
        }

        .sidebar-panel.closed {
          display: none;
        }

        .sidebar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-4);
          padding-bottom: var(--space-3);
          border-bottom: 1px solid rgba(201, 151, 58, 0.12);
        }

        .sidebar-title {
          font-family: var(--font-heading);
          font-size: 0.9rem;
          color: var(--color-accent);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin: 0;
        }

        .sidebar-close {
          background: none;
          border: none;
          color: var(--color-text-muted);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .sidebar-close:hover {
          color: var(--color-accent);
        }

        .sidebar-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .sidebar-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .sidebar-section-title {
          font-family: var(--font-ui);
          font-size: 0.65rem;
          color: var(--color-accent);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin: 0 0 var(--space-2) 0;
          padding-bottom: var(--space-2);
          border-bottom: 1px solid rgba(201, 151, 58, 0.08);
        }

        .sidebar-link {
          font-family: var(--font-ui);
          font-size: 0.875rem;
          color: var(--color-text);
          text-decoration: none;
          padding: var(--space-2) var(--space-2);
          border-radius: var(--radius-md);
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          display: block;
        }

        .sidebar-link:hover {
          background: rgba(201, 151, 58, 0.1);
          color: var(--color-accent);
        }

        .sidebar-button {
          font-family: var(--font-ui);
          font-size: 0.875rem;
          color: var(--color-text);
          background: none;
          border: none;
          cursor: pointer;
          padding: var(--space-2) var(--space-2);
          border-radius: var(--radius-md);
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          text-align: left;
          width: 100%;
        }

        .sidebar-button:hover {
          background: rgba(201, 151, 58, 0.1);
          color: var(--color-accent);
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: var(--space-3);
          border-top: 1px solid rgba(201, 151, 58, 0.12);
        }

        .sidebar-logout {
          font-family: var(--font-ui);
          font-size: 0.875rem;
          color: var(--color-danger);
          background: none;
          border: none;
          cursor: pointer;
          padding: var(--space-2) var(--space-2);
          border-radius: var(--radius-md);
          transition: all 0.2s;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          text-align: left;
          width: 100%;
        }

        .sidebar-logout:hover {
          background: rgba(255, 59, 48, 0.1);
          color: var(--color-accent);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @media (min-width: 769px) {
          .sidebar-backdrop,
          .sidebar-panel {
            display: none !important;
          }
        }
      `}</style>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`sidebar-panel ${!isOpen ? 'closed' : ''}`}>
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
              {/* COOK */}
              <div className="sidebar-section">
                <h3 className="sidebar-section-title">Cook</h3>
                <Link href="/prep" className="sidebar-link">Start a Cook</Link>
                <Link href="/dashboard" className="sidebar-link">Dashboard</Link>
                <Link href="/logs" className="sidebar-link">History</Link>
                <Link href="/playbook" className="sidebar-link">Playbook</Link>
              </div>

              {/* TOOLS */}
              <div className="sidebar-section">
                <h3 className="sidebar-section-title">Tools</h3>
                <Link href="/fix" className="sidebar-link">Pit Rescue</Link>
                <Link href="/lab" className="sidebar-link">Wood Lab</Link>
              </div>

              {/* PITMASTER */}
              <div className="sidebar-section">
                <h3 className="sidebar-section-title">Pitmaster</h3>
                <Link href="/pitmaster/trends" className="sidebar-link">Trend Analysis</Link>
                <Link href="/pitmaster/meat" className="sidebar-link">Meat Profiles</Link>
                <Link href="/pitmaster/pit" className="sidebar-link">Pit Profiles</Link>
              </div>

              {/* ACCOUNT */}
              <div className="sidebar-section">
                <h3 className="sidebar-section-title">Account</h3>
                <Link href="/account" className="sidebar-link">Account</Link>
                <Link href="/plans" className="sidebar-link">Plans & Pricing</Link>
              </div>
            </>
          ) : (
            <>
              {/* MARKETING */}
              <div className="sidebar-section">
                <h3 className="sidebar-section-title">Explore</h3>
                <Link href="/how-it-works" className="sidebar-link">How It Works</Link>
                <Link href="/features" className="sidebar-link">Features</Link>
                <Link href="/meet-the-preacher" className="sidebar-link">Meet the Preacher</Link>
                <Link href="/about" className="sidebar-link">About</Link>
                <Link href="/plans" className="sidebar-link">Plans & Pricing</Link>
              </div>

              {/* AUTH */}
              <div className="sidebar-section">
                <h3 className="sidebar-section-title">Get Started</h3>
                <Link href="/auth/login" className="sidebar-link">Sign In</Link>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
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
