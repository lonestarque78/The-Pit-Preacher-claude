"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import CookLogPanel from "./_panels/CookLogPanel";
import WoodLabPanel from "./_panels/WoodLabPanel";
import FixPanel from "./_panels/FixPanel";

type PanelKey = "logs" | "lab" | "fix" | null;

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 100,
  background: "var(--color-bg)",
  overflowY: "auto",
};

function DashboardToolsInner() {
  const searchParams = useSearchParams();
  const initial = (["logs", "lab", "fix"] as const).find(k => searchParams.get(k) === "1") ?? null;
  const [openPanel, setOpenPanel] = useState<PanelKey>(initial);

  return (
    <>
      <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", padding: "0 var(--space-4) var(--space-3)" }}>
        <button onClick={() => setOpenPanel("logs")} className="dashboard-tool-btn">Cook Log & History</button>
        <button onClick={() => setOpenPanel("lab")} className="dashboard-tool-btn">Wood Flavor Lab</button>
        <button onClick={() => setOpenPanel("fix")} className="dashboard-tool-btn">Fix My Cook</button>
      </div>
      <style>{`
        .dashboard-tool-btn {
          background: transparent;
          border: 1px solid rgba(201,151,58,0.3);
          color: var(--color-text-muted);
          font-family: var(--font-ui);
          font-size: 0.8rem;
          padding: 8px 16px;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: border-color 0.12s, color 0.12s;
        }
        .dashboard-tool-btn:hover { border-color: #C9973A; color: #C9973A; }
      `}</style>

      {openPanel === "logs" && (
        <div style={overlayStyle}><CookLogPanel onClose={() => setOpenPanel(null)} /></div>
      )}
      {openPanel === "lab" && (
        <div style={overlayStyle}><WoodLabPanel onClose={() => setOpenPanel(null)} /></div>
      )}
      {openPanel === "fix" && (
        <div style={overlayStyle}><FixPanel onClose={() => setOpenPanel(null)} /></div>
      )}
    </>
  );
}

export default function DashboardTools() {
  return (
    <Suspense fallback={null}>
      <DashboardToolsInner />
    </Suspense>
  );
}
