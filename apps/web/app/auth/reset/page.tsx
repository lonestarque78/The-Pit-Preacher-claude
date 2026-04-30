"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function ResetPage() {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession]         = useState(false);
  const [newPassword, setNewPassword]       = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState("");
  const [success, setSuccess]               = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
      setSessionChecked(true);
    });
  }, []);

  const handleSubmit = async () => {
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 2000);
  };

  const inputStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    padding: "10px 12px",
    background: "var(--color-bg)",
    border: "1px solid #2a2a2a",
    borderRadius: "var(--radius-md)",
    color: "var(--color-text)",
    fontFamily: "var(--font-body)",
    fontSize: "0.9rem",
    boxSizing: "border-box",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: "var(--font-ui)",
    fontSize: "0.85rem",
    color: "var(--color-text-muted)",
    marginBottom: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--color-bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--space-5) var(--space-3)",
    }}>
      <style>{`
        @keyframes subtlePulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.9; }
        }
      `}</style>

      <div style={{ width: "100%", maxWidth: "480px" }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-4)" }}>
          <p style={{
            fontFamily: "var(--font-ui)",
            color: "#C9973A",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            fontSize: "0.75rem",
            margin: 0,
          }}>
            ✦ The Pit Preacher ✦
          </p>
        </div>

        <div style={{
          background: "var(--color-bg-alt)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-5)",
        }}>
          {!sessionChecked ? (
            <div style={{ textAlign: "center", padding: "var(--space-4) 0" }}>
              <p style={{
                fontFamily: "var(--font-body)",
                fontStyle: "italic",
                color: "var(--color-text-muted)",
                fontSize: "0.95rem",
                margin: 0,
                animation: "subtlePulse 1.8s ease-in-out infinite",
              }}>
                Verifying your reset link...
              </p>
            </div>

          ) : !hasSession ? (
            <div style={{ textAlign: "center", padding: "var(--space-4) 0" }}>
              <p style={{
                fontFamily: "var(--font-body)",
                color: "var(--color-text-muted)",
                fontSize: "0.95rem",
                margin: "0 0 var(--space-3)",
                lineHeight: 1.6,
              }}>
                This reset link has expired or is invalid.
              </p>
              <a href="/auth/login" style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.85rem",
                color: "#C9973A",
                textDecoration: "none",
              }}>
                Back to Sign In
              </a>
            </div>

          ) : success ? (
            <div style={{ textAlign: "center", padding: "var(--space-4) 0" }}>
              <p style={{
                fontFamily: "var(--font-heading)",
                fontStyle: "italic",
                fontSize: "1.1rem",
                color: "var(--color-accent)",
                lineHeight: 1.6,
                margin: 0,
              }}>
                Password updated. Welcome back.
              </p>
            </div>

          ) : (
            <div>
              <h1 style={{
                fontFamily: "var(--font-heading)",
                fontSize: "1.4rem",
                color: "#F5E6C8",
                margin: "0 0 var(--space-4)",
              }}>
                Set Your New Password
              </h1>

              <div style={{ marginBottom: "var(--space-3)" }}>
                <label style={labelStyle}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: "var(--space-3)" }}>
                <label style={labelStyle}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter") handleSubmit(); }}
                />
              </div>

              {error && (
                <p style={{
                  color: "#c0392b",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                  margin: "0 0 var(--space-2)",
                }}>
                  {error}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: loading ? "rgba(201,151,58,0.5)" : "#C9973A",
                  color: "var(--color-bg)",
                  border: "none",
                  borderRadius: "var(--radius-md)",
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  cursor: loading ? "not-allowed" : "pointer",
                  marginTop: "var(--space-1)",
                  transition: "background 0.12s",
                }}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
