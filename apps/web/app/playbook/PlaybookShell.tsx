"use client";

import { Suspense, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import PlaybookLayout from "@/components/playbook/PlaybookLayout";
import PlaybookCard from "@/components/playbook/PlaybookCard";

type Module = { slug: string; title: string; description: string };

function PlaybookShellInner({
  modules,
  sections,
  userIsPitmaster,
}: {
  modules: Module[];
  sections: Record<string, ReactNode>;
  userIsPitmaster: boolean;
}) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab");
  const [activeSlug, setActiveSlug] = useState<string | null>(
    initialTab && modules.some(m => m.slug === initialTab) ? initialTab : null
  );

  const activeModule = modules.find(m => m.slug === activeSlug);

  if (activeModule) {
    return (
      <PlaybookLayout breadcrumb={[{ label: activeModule.title }]}>
        <button
          onClick={() => setActiveSlug(null)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: "1.5rem" }}
          className="text-xs font-mono tracking-widest uppercase text-[#7a6a55] hover:text-[#e8dcc8] transition-colors"
        >
          ← All Modules
        </button>
        {sections[activeModule.slug]}
      </PlaybookLayout>
    );
  }

  return (
    <PlaybookLayout>
      {/* Page header */}
      <div className="mb-12">
        <p className="text-xs font-mono tracking-widest uppercase text-[#7a6a55] mb-3">
          Reference Guide
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[#e8dcc8] mb-4 leading-tight">
          The Pitmaster&apos;s Playbook
        </h1>
        <p className="text-[#9a8a75] text-base max-w-xl leading-relaxed">
          Everything you need to understand what&apos;s happening on the pit. Not recipes. The knowledge behind the cook.
        </p>
      </div>

      {/* Module grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {modules.map((module) => (
          <PlaybookCard
            key={module.slug}
            title={module.title}
            description={module.description}
            href={`/playbook?tab=${module.slug}`}
            locked={false}
            pitmaster={userIsPitmaster}
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              setActiveSlug(module.slug);
            }}
          />
        ))}
      </div>
    </PlaybookLayout>
  );
}

export default function PlaybookShell(props: {
  modules: Module[];
  sections: Record<string, ReactNode>;
  userIsPitmaster: boolean;
}) {
  return (
    <Suspense fallback={null}>
      <PlaybookShellInner {...props} />
    </Suspense>
  );
}
