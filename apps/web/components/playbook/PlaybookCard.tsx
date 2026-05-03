// components/playbook/PlaybookCard.tsx

import Link from "next/link";

interface PlaybookCardProps {
  title: string;
  description: string;
  href: string;
  locked: boolean;
  requiredTier?: string; // e.g. "Basic", "Backyard"
  pitmaster?: boolean; // shows Pitmaster badge
}

export default function PlaybookCard({
  title,
  description,
  href,
  locked,
  requiredTier,
  pitmaster,
}: PlaybookCardProps) {
  if (locked) {
    return (
      <div className="relative border border-[#2a2218] rounded-sm bg-[#161310] p-6 opacity-60 cursor-not-allowed select-none">
        {/* Lock badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#1e1a14] border border-[#3a2e1e] rounded-sm px-2 py-1">
          <svg className="w-3 h-3 text-[#7a6a55]" width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#7a6a55]">
            {requiredTier}+
          </span>
        </div>

        <div className="mb-2">
          <span className="text-xs font-mono tracking-widest uppercase text-[#4a3f30]">
            Module
          </span>
        </div>
        <h3 className="text-lg font-semibold text-[#5a4f3f] mb-2">{title}</h3>
        <p className="text-sm text-[#3a3025] leading-relaxed">{description}</p>
      </div>
    );
  }

  return (
    <Link href={href} className="group block">
      <div className="relative border border-[#3a2e1e] rounded-sm bg-[#161310] p-6 transition-all duration-200 hover:border-[#c9a96e] hover:bg-[#1a1610]">
        {/* Pitmaster badge */}
        {pitmaster && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-[#2a1e0a] border border-[#c9a96e] rounded-sm px-2 py-1">
            <span className="text-[10px] font-mono tracking-widest uppercase text-[#c9a96e]">
              Pitmaster
            </span>
          </div>
        )}

        <div className="mb-2">
          <span className="text-xs font-mono tracking-widest uppercase text-[#7a6a55]">
            Module
          </span>
        </div>
        <h3 className="text-lg font-semibold text-[#e8dcc8] mb-2 group-hover:text-[#c9a96e] transition-colors">
          {title}
        </h3>
        <p className="text-sm text-[#9a8a75] leading-relaxed">{description}</p>

        {/* Arrow */}
        <div className="mt-4 flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-[#7a6a55] group-hover:text-[#c9a96e] transition-colors">
          Read
          <svg
            className="w-3 h-3 translate-x-0 group-hover:translate-x-1 transition-transform"
            width="12"
            height="12"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
