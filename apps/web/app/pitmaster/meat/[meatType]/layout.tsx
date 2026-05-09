import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ meatType: string }>;
}): Promise<Metadata> {
  const { meatType: raw } = await params;
  const meatType = decodeURIComponent(raw).replace(/-/g, " ");
  const capitalized = meatType.charAt(0).toUpperCase() + meatType.slice(1);
  return {
    title: `${capitalized} BBQ Guide | The Pit Preacher`,
    description: `Cook times, temps, stall behavior, and pit Preacher notes for ${meatType}. Built for backyard pitmasters.`,
  };
}

export default function MeatTypeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
