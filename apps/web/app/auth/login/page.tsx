"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import Button from "@/components/Button";
import Input from "@/components/Input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOtp({ email: email.trim() });
    setSent(true);
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-5)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "2rem",
            marginBottom: "var(--space-2)",
            textAlign: "center",
          }}
        >
          Welcome Back
        </h1>

        <p
          style={{
            fontFamily: "var(--font-body)",
            color: "var(--color-text-muted)",
            textAlign: "center",
            marginBottom: "var(--space-5)",
            fontSize: "0.95rem",
          }}
        >
          Enter your email to receive a magic link.
        </p>

        <div
          style={{
            background: "var(--color-bg-alt)",
            padding: "var(--space-4)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.15rem",
                  color: "var(--color-accent)",
                  marginBottom: "var(--space-2)",
                }}
              >
                Check your inbox.
              </p>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text-muted)",
                  fontSize: "0.9rem",
                }}
              >
                Magic link sent to {email}
              </p>
            </div>
          ) : (
            <>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.85rem",
                  color: "var(--color-text-muted)",
                  marginBottom: "var(--space-1)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === "Enter" && !loading) handleLogin();
                }}
                style={{ marginBottom: "var(--space-3)" }}
              />
              <Button
                onClick={handleLogin}
                disabled={loading || !email.trim()}
                style={{ width: "100%" }}
              >
                {loading ? "Sending..." : "Send Magic Link"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
