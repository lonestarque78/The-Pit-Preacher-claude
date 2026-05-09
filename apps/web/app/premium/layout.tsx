import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plans | The Pit Preacher BBQ App",
  description: "Free to start. Upgrade for full cook history, live fire coaching, and unlimited cook plans.",
};

export default function PremiumLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
