"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { User } from "@supabase/supabase-js";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogout: () => void;
}

export function Sidebar({ isOpen, onClose, user, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const linkClass = (href: string) => `sidebar-link${pathname === href ? " active" : ""}`;

  const sidebarRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  // Handle focus management on open/close
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      // Focus the first focusable element
      const focusable = sidebarRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focusable && focusable.length > 0) {
        (focusable[0] as HTMLElement).focus();
      }
    } else {
      if (previousFocusRef.current) {
        (previousFocusRef.current as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  // Handle Escape key to close sidebar
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !sidebarRef.current) return;
    const focusable = sidebarRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    sidebarRef.current.addEventListener('keydown', handleKeyDown);
    return () => {
      if (sidebarRef.current) {
        sidebarRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [isOpen]);

  return (
    <>

      <div
        className={`sidebar-backdrop ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      <div className={`sidebar-panel ${isOpen ? "open" : ""}`} ref={sidebarRef}>
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
                <Link href="/prep" className={linkClass("/prep")}>Start a Cook</Link>
                <Link href="/dashboard" className={linkClass("/dashboard")}>Dashboard</Link>
                <Link href="/logs" className={linkClass("/logs")}>History</Link>
                <Link href="/playbook" className={linkClass("/playbook")}>Playbook</Link>
              </div>

              <div className="sidebar-section">
                <h3 className="sidebar-section-title">Tools</h3>
                <Link href="/fix" className={linkClass("/fix")}>Pit Rescue</Link>
                <Link href="/lab" className={linkClass("/lab")}>Wood Lab</Link>
              </div>

              <div className="sidebar-section">
                <h3 className="sidebar-section-title">Pitmaster</h3>
                <Link href="/pitmaster/trends" className={linkClass("/pitmaster/trends")}>Trend Analysis</Link>
                <Link href="/pitmaster/meat" className={linkClass("/pitmaster/meat")}>Meat Profiles</Link>
                <Link href="/pitmaster/pit" className={linkClass("/pitmaster/pit")}>Pit Profiles</Link>
              </div>

              <div className="sidebar-section">
                <h3 className="sidebar-section-title">Account</h3>
                <Link href="/account" className={linkClass("/account")}>Account</Link>
                <Link href="/plans" className={linkClass("/plans")}>Plans & Pricing</Link>
              </div>
            </>
          ) : (
            <>
              <div className="sidebar-section">
                <h3 className="sidebar-section-title">Explore</h3>
                <Link href="/how-it-works" className={linkClass("/how-it-works")}>How It Works</Link>
                <Link href="/features" className={linkClass("/features")}>Features</Link>
                <Link href="/meet-the-preacher" className={linkClass("/meet-the-preacher")}>Meet the Preacher</Link>
                <Link href="/about" className={linkClass("/about")}>About</Link>
                <Link href="/plans" className={linkClass("/plans")}>Plans & Pricing</Link>
              </div>

              <div className="sidebar-section">
                <h3 className="sidebar-section-title">Get Started</h3>
                <Link href="/auth/login" className={linkClass("/auth/login")}>Sign In</Link>
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
