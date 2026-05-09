import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pitType: string }>;
}): Promise<Metadata> {
  const { pitType: raw } = await params;
  const pitType = decodeURIComponent(raw).replace(/-/g, " ");
  const capitalized = pitType.charAt(0).toUpperCase() + pitType.slice(1);
  return {
    title: `${capitalized} Smoker Guide | The Pit Preacher`,
    description: `How to manage fire, wood, and temp on a ${pitType}. Real guidance from 25 years at the pit.`,
  };
}

export default function PitTypeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
