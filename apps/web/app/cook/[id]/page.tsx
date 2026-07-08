"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Overview from "./_sections/Overview";
import Plan from "./_sections/Plan";
import Tracker from "./_sections/Tracker";
import Live from "./_sections/Live";
import Timeline from "./_sections/Timeline";
import Journal from "./_sections/Journal";
import Summary from "./_sections/Summary";
import Guide from "./_sections/Guide";
import Share from "./_sections/Share";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "plan", label: "Plan" },
  { key: "tracker", label: "Tracker" },
  { key: "live", label: "Live Mode" },
  { key: "timeline", label: "Timeline" },
  { key: "journal", label: "Journal" },
  { key: "summary", label: "Summary" },
] as const;

type TabKey = typeof TABS[number]["key"];

// Single consolidated cook view. Previously 10 separate routes
// (page, events, fire, guide, live, plan, rubs, share, summary, timeline, tracker) —
// now one route with in-page tabs. Guide/Rubs are a reference overlay, Share is a modal.
function CookPageInner({ params }: { params: Promise<{ id: string }> }) {
  const searchParams = useSearchParams();
  const initialTab = TABS.find(t => t.key === searchParams.get("tab"))?.key ?? "overview";
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [showGuide, setShowGuide] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const onNavigate = (tab: string) => {
    if (TABS.some(t => t.key === tab)) setActiveTab(tab as TabKey);
  };

  return (
    <div>
      <style>{`
        .cook-nav-btn {
          background: transparent;
          border: 1px solid rgba(201,151,58,0.3);
          color: var(--color-text-muted);
          font-family: var(--font-ui);
          font-size: 0.8rem;
          padding: 6px 14px;
          border-radius: var(--radius-md);
          cursor: pointer;
          text-decoration: none;
          transition: border-color 0.12s, color 0.12s;
          display: inline-block;
          white-space: nowrap;
        }
        .cook-nav-btn:hover { border-color: #C9973A; color: #C9973A; }
        .cook-nav-btn-active { border-color: #C9973A !important; color: #C9973A !important; }
        .cook-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: var(--color-bg);
          overflow-y: auto;
        }
      `}</style>

      <div style={{ paddingBottom: "72px" }}>
        {activeTab === "overview" && <Overview params={params} onNavigate={onNavigate} />}
        {activeTab === "plan" && <Plan params={params} onNavigate={onNavigate} />}
        {activeTab === "tracker" && <Tracker params={params} onNavigate={onNavigate} />}
        {activeTab === "live" && <Live params={params} onNavigate={onNavigate} />}
        {activeTab === "timeline" && <Timeline params={params} onNavigate={onNavigate} />}
        {activeTab === "journal" && <Journal params={params} onNavigate={onNavigate} />}
        {activeTab === "summary" && (
          <Summary params={params} onNavigate={onNavigate} onShare={() => setShowShare(true)} />
        )}
      </div>

      {/* ── STICKY TAB BAR ── */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "var(--color-bg-alt)",
        borderTop: "1px solid rgba(201,151,58,0.2)",
        padding: "var(--space-2) var(--space-4)",
        display: "flex",
        justifyContent: "center",
        gap: "var(--space-3)",
        flexWrap: "wrap",
      }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`cook-nav-btn${activeTab === tab.key ? " cook-nav-btn-active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
        <button className="cook-nav-btn" onClick={() => setShowGuide(true)}>
          📖 Guide
        </button>
      </div>

      {showGuide && (
        <div className="cook-overlay">
          <Guide params={params} onClose={() => setShowGuide(false)} />
        </div>
      )}
      {showShare && (
        <div className="cook-overlay">
          <Share params={params} onClose={() => setShowShare(false)} />
        </div>
      )}
    </div>
  );
}

export default function CookPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div style={{ padding: "40px" }}><h1 style={{ fontFamily: "var(--font-heading)" }}>Loading...</h1></div>}>
      <CookPageInner params={params} />
    </Suspense>
  );
}
