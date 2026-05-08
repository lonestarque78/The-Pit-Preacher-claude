"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

export interface UsageData {
  used: number;
  limit: number;
  remaining: number;
  isLimited: boolean;
  isOverLimit: boolean;
}

export function useUsage(feature: string) {
  const [usage, setUsage] = useState<UsageData | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setUsage(null);
        return;
      }

      const res = await fetch(`/api/usage?feature=${feature}`);
      if (!res.ok) {
        setUsage(null);
        return;
      }
      const data = await res.json();
      setUsage(data);
    }

    load();
  }, [feature]);

  return usage;
}
