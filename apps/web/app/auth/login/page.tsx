"use client";

import { supabase } from "@/lib/supabase";
import Button from "@/components/Button";

export default function LoginPage() {
  const handleLogin = async () => {
    const email = prompt("Enter your email");

    if (!email) return;

    await supabase.auth.signInWithOtp({ email });
    alert("Magic link sent!");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1 style={{ fontFamily: "var(--font-heading)" }}>Login</h1>
      <Button onClick={handleLogin}>Send Magic Link</Button>
    </div>
  );
}
