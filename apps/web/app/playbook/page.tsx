// app/playbook/page.tsx

import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase-server";
import { isPitmaster } from "@/lib/premium";
import PlaybookShell from "./PlaybookShell";
import MeatScience from "./_sections/MeatScience";
import FireBehavior from "./_sections/FireBehavior";
import HolyTrinity from "./_sections/HolyTrinity";
import PitTypes from "./_sections/PitTypes";
import Troubleshooting from "./_sections/Troubleshooting";
import FinishingMoves from "./_sections/FinishingMoves";
import TimelinePhilosophy from "./_sections/TimelinePhilosophy";

export const metadata: Metadata = {
  title: "The Playbook | BBQ Knowledge from The Pit Preacher",
  description: "Fire behavior, meat science, the holy trinity of BBQ. Everything a serious pitmaster needs to know.",
};

const MODULES = [
  {
    slug: "meat-science",
    title: "Meat Science",
    description: "What's actually happening inside the cut. Collagen, fat render, stall, and why time beats temperature every time.",
  },
  {
    slug: "fire-behavior",
    title: "Fire Behavior",
    description: "How heat moves through your pit. Convection, radiant heat, airflow, and reading your fire before it reads you.",
  },
  {
    slug: "holy-trinity",
    title: "The Holy Trinity",
    description: "Salt, smoke, and heat. The three forces behind every great cook and how to keep them in balance.",
  },
  {
    slug: "pit-types",
    title: "Know Your Pit",
    description: "Offset, pellet, kamado, kettle, drum, cabinet. Every pit has a personality. Learn yours.",
  },
  {
    slug: "troubleshooting",
    title: "Troubleshooting",
    description: "Temp spikes, stalls that won't break, bark that won't set. Diagnose and fix it while the cook is still alive.",
  },
  {
    slug: "finishing-moves",
    title: "Finishing Moves",
    description: "The last hour is where most cooks are won or lost. Rest, wrap, slice, and serve — do it right.",
  },
  {
    slug: "timeline-philosophy",
    title: "Timeline Philosophy",
    description: "BBQ doesn't run on a clock. Here's how to think about time, buffer, and why the meat is always the boss.",
  },
];

// Single consolidated Playbook page. Previously 7 routes
// (index + 6 module pages) — now one route with in-page sections.
export default async function PlaybookIndexPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userIsPitmaster = await isPitmaster(user?.id, supabase);

  const sections = {
    "meat-science": <MeatScience />,
    "fire-behavior": <FireBehavior />,
    "holy-trinity": <HolyTrinity />,
    "pit-types": <PitTypes />,
    "troubleshooting": <Troubleshooting />,
    "finishing-moves": <FinishingMoves />,
    "timeline-philosophy": <TimelinePhilosophy />,
  };

  return (
    <PlaybookShell modules={MODULES} sections={sections} userIsPitmaster={userIsPitmaster} />
  );
}
