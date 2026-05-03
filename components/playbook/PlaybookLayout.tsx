// components/playbook/PlaybookLayout.tsx

import Link from "next/link";

interface PlaybookLayoutProps {
  children: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
}

export default function PlaybookLayout({ children, breadcrumb }: PlaybookLayoutProps) {
  return (
    <div className="min-h-screen bg-[#111] text-[#e8dcc8]">
      {/* Top bar */}
      <div className="border-b border-[#2a2218]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2 text-xs text-[#7a6a55] font-mono tracking-widest uppercase">
          <Link href="/dashboard" className="hover:text-[#e8dcc8] transition-colors">
            Home
          </Link>
          <span className="opacity-40">/</span>
          <Link href="/playbook" className="hover:text-[#e8dcc8] transition-colors">
            Playbook
          </Link>
          {breadcrumb?.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="opacity-40">/</span>
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-[#e8dcc8] transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-[#c9a96e]">{crumb.label}</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {children}
      </div>

      {/* Footer */}
      <div className="border-t border-[#2a2218] mt-16">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-xs text-[#4a3f30] font-mono tracking-widest uppercase">
          The Pit Preacher &mdash; Pitmaster&apos;s Playbook
        </div>
      </div>
    </div>
  );
}
