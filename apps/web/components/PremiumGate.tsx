"use client";

import { ReactNode } from "react";
import { useBilling } from "@/hooks/useBilling";

type PremiumGateProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export function PremiumGate({ children, fallback }: PremiumGateProps) {
  const { isPremium } = useBilling();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <>{fallback ?? <div>Upgrade to premium to access this feature.</div>}</>
  );
}
