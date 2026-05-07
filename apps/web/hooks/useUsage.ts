import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export function useUsage(feature: string) {
  const supabase = createClientComponentClient();
  const [usage, setUsage] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const res = await fetch(`/api/usage?feature=${feature}`);
      const data = await res.json();
      setUsage(data);
    }

    load();
  }, [feature]);

  return usage;
}
