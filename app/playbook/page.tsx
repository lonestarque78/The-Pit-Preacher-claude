// app/playbook/page.tsx

import PlaybookLayout from "@/components/playbook/PlaybookLayout";
import PlaybookCard from "@/components/playbook/PlaybookCard";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { tierMeetsRequirement } from "@/lib/premium";
import Link from "next/link";

const MODULES = [
  {
    slug: "meat-science",
    title: "Meat Science",
    description: "What's actually happening inside the cut. Collagen, fat render, stall, and why time beats temperature every time.",
    requiredTier: "free",
  },
  {
    slug: "fire-behavior",
    title: "Fire Behavior",
    description: "How heat moves through your pit. Convection, radiant heat, airflow, and reading your fire before it reads you.",
    requiredTier: "basic",
  },
  {
    slug: "holy-trinity",
    title: "The Holy Trinity",
    description: "Salt, smoke, and heat. The three forces behind every great cook and how to keep them in balance.",
    requiredTier: "basic",
  },
  {
    slug: "pit-types",
    title: "Know Your Pit",
    description: "Offset, pellet, kamado, kettle, drum, cabinet. Every pit has a personality. Learn yours.",
    requiredTier: "basic",
    href: "/playbook/pit-types/overview",
  },
  {
    slug: "troubleshooting",
    title: "Troubleshooting",
    description: "Temp spikes, stalls that won't break, bark that won't set. Diagnose and fix it while the cook is still alive.",
    requiredTier: "backyard",
  },
  {
    slug: "finishing-moves",
    title: "Finishing Moves",
    description: "The last hour is where most cooks are won or lost. Rest, wrap, slice, and serve — do it right.",
    requiredTier: "backyard",
  },
  {
    slug: "timeline-philosophy",
    title: "Timeline Philosophy",
    description: "BBQ doesn't run on a clock. Here's how to think about time, buffer, and why the meat is always the boss.",
    requiredTier: "backyard",
  },
];

export default async function PlaybookIndexPage() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userTier = "free";
  if (user) {
    const { data: profile } = await supabase
      .from("public.profiles")
      .select("tier")
      .eq("id", user.id)
      .single();
    if (profile?.tier) userTier = profile.tier;
  }

  const hasLockedModules = MODULES.some(
    (m) => m.requiredTier !== "free" && !tierMeetsRequirement(userTier, m.requiredTier)
  );

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
        {MODULES.map((module) => {
          const isLocked = !tierMeetsRequirement(userTier, module.requiredTier);
          const href = module.href ?? `/playbook/${module.slug}`;
          const isPitmaster = userTier === "pitmaster";

          return (
            <PlaybookCard
              key={module.slug}
              title={module.title}
              description={module.description}
              href={href}
              locked={isLocked}
              requiredTier={
                isLocked
                  ? module.requiredTier.charAt(0).toUpperCase() + module.requiredTier.slice(1)
                  : undefined
              }
              pitmaster={!isLocked && isPitmaster}
            />
          );
        })}
      </div>

      {/* Upgrade CTA — only shown if user has locked modules */}
      {hasLockedModules && (
        <div className="border border-[#2a2218] rounded-sm bg-[#141210] px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#e8dcc8] mb-1">
              Unlock the full Playbook.
            </p>
            <p className="text-xs text-[#7a6a55]">
              Upgrade your tier to access every module.
            </p>
          </div>
          <Link
            href="/premium"
            className="inline-block whitespace-nowrap text-xs font-mono tracking-widest uppercase bg-[#c9a96e] text-[#111] px-5 py-2.5 rounded-sm hover:bg-[#e8c47a] transition-colors"
          >
            View Plans
          </Link>
        </div>
      )}
    </PlaybookLayout>
  );
}
