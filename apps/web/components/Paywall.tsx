// apps/web/components/Paywall.tsx
"use client";

import { useEffect, useState, ReactNode } from "react";
import { createClient } from "@/lib/supabase";
import { getTier } from "@/lib/premium";
import Link from "next/link";

type PaywallProps = {
  requiredTier: "basic" | "pitmaster";
  children: ReactNode;
};

const TIER_ORDER = ["free", "basic", "pitmaster"];

export default function Paywall({ requiredTier, children }: PaywallProps) {
  const [userTier, setUserTier] = useState<string>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        getTier(data.user.id, supabase).then((tier) => {
          setUserTier(tier || "free");
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });
  }, []);

  if (loading) {
    return null;
  }

  const userTierLevel = TIER_ORDER.indexOf(userTier);
  const requiredTierLevel = TIER_ORDER.indexOf(requiredTier);

  if (userTierLevel >= requiredTierLevel) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        padding: "var(--space-5)",
        textAlign: "center",
        background: "var(--color-bg-alt)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
      }}
    >
      <h3
        style={{
          fontFamily: "var(--font-heading)",
          marginBottom: "var(--space-2)",
        }}
      >
        🔒 Premium Feature
      </h3>
      <p
        style={{
          marginBottom: "var(--space-4)",
          color: "var(--color-text-muted)",
        }}
      >
        This feature requires a {requiredTier} subscription or higher.
      </p>
      <Link
        href="/premium"
        style={{
          display: "inline-block",
          padding: "var(--space-2) var(--space-4)",
          background: "var(--color-accent)",
          color: "white",
          borderRadius: "var(--radius-md)",
          textDecoration: "none",
          fontFamily: "var(--font-ui)",
        }}
      >
        Upgrade to Unlock
      </Link>
    </div>
  );
}
      </div>
    </div>
  );
}
