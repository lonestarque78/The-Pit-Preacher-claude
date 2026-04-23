"use client";

import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const handleLogin = async () => {
    const email = prompt("Enter your email");

    if (!email) return;

    await supabase.auth.signInWithOtp({ email });
    alert("Magic link sent!");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Login</h1>
      <button onClick={handleLogin}>Send Magic Link</button>
    </div>
  );
}
