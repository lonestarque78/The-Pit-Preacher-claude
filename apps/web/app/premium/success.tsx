// apps/web/app/premium/success.tsx
"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function PremiumSuccess() {
  useEffect(() => {
    async function updateProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("profiles")
          .update({ is_premium: true })
          .eq("id", user.id);
      }
    }

    updateProfile();
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "20px" }}>
        Welcome to Premium
      </h1>

      <p style={{ marginBottom: "20px" }}>
        Your account has been upgraded. You now have full access to the Pit
        Preacher intelligence layer.
      </p>

      <button
        onClick={() => {
          window.location.href = "/";
        }}
        style={{
          padding: "12px 20px",
          background: "var(--color-accent)",
          color: "white",
          borderRadius: "var(--radius-md)",
        }}
      >
        Continue
      </button>
    </div>
  );
}
