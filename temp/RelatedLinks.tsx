// components/playbook/RelatedLinks.tsx

import Link from "next/link";

interface RelatedLink {
  label: string;
  href: string;
}

interface RelatedLinksProps {
  links: RelatedLink[];
}

export default function RelatedLinks({ links }: RelatedLinksProps) {
  return (
    <div className="pt-4 border-t border-[#2a2218]">
      <h2 className="text-xs font-mono tracking-widest uppercase text-[#7a6a55] mb-4">
        Read Next
      </h2>
      <div className="space-y-2">
        {links.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 text-sm text-[#7a6a55] hover:text-[#c9a96e] transition-colors group"
          >
            <svg
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              className="group-hover:translate-x-1 transition-transform"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
