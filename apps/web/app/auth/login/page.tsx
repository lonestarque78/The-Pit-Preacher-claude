"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase";
import { getRandomVerse } from "@/lib/verses";
import Button from "@/components/Button";
import Input from "@/components/Input";

type Mode = "login" | "signup";
type Smoker = { name: string; wood: string };

const COOKING_STYLES = [
  { key: "texas",       label: "Texas BBQ",          desc: "Beef-forward. Salt and pepper. Post oak smoke. No sauce required." },
  { key: "kansas_city", label: "Kansas City",         desc: "Everything smokes here. Sweet, thick sauce. Famous for burnt ends." },
  { key: "memphis",     label: "Memphis",             desc: "Pork rules. Dry rubs or wet — you choose. Complex spice blends." },
  { key: "carolina",    label: "Carolina",            desc: "Whole hog tradition. Vinegar-based sauces. Regional pride runs deep." },
  { key: "backyard",    label: "Backyard Classic",    desc: "No rules. Just good fire, good company, and good food." },
  { key: "competition", label: "Competition Style",   desc: "Every detail matters. Tight bark, clean slice, perfect turn-in box." },
];

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-ui)",
  fontSize: "0.85rem",
  color: "var(--color-text-muted)",
  marginBottom: "4px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const backBtnStyle: React.CSSProperties = {
  flex: 1,
  background: "none",
  border: "1px solid #2a2a2a",
  color: "var(--color-text-muted)",
  borderRadius: "var(--radius-md)",
  fontFamily: "var(--font-ui)",
  fontSize: "0.9rem",
  padding: "10px",
  cursor: "pointer",
};

export default function LoginPage() {
  const [verse] = useState(() => getRandomVerse());
  const [mode, setMode] = useState<Mode>("login");

  // Login
  const [loginEmail, setLoginEmail]       = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading]   = useState(false);
  const [loginError, setLoginError]       = useState("");
  const [showForgot, setShowForgot]       = useState(false);

  // Signup
  const [step, setStep]                     = useState(1);
  const [displayName, setDisplayName]       = useState("");
  const [signupEmail, setSignupEmail]       = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [smokers, setSmokers]               = useState<Smoker[]>([{ name: "", wood: "" }]);
  const [cookingStyle, setCookingStyle]     = useState("");
  const [signupLoading, setSignupLoading]   = useState(false);
  const [signupError, setSignupError]       = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const switchMode = (m: Mode) => {
    setMode(m);
    setStep(1);
    setLoginError("");
    setSignupError("");
  };

  const errEl = (msg: string) =>
    msg ? (
      <p style={{ color: "#c0392b", fontFamily: "var(--font-body)", fontSize: "0.85rem", margin: "4px 0 0" }}>
        {msg}
      </p>
    ) : null;

  // ── Login handler ────────────────────────────────────────────────────────────

  const handleLogin = async () => {
    setLoginError("");
    if (!loginEmail.trim() || !loginPassword) {
      setLoginError("Please enter your email and password.");
      return;
    }
    setLoginLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });
    setLoginLoading(false);
    if (error) { setLoginError(error.message); return; }
    window.location.href = "/dashboard";
  };

  // ── Signup step handlers ─────────────────────────────────────────────────────

  const handleStep1Next = () => {
    setSignupError("");
    if (!displayName.trim())          { setSignupError("Please enter your display name."); return; }
    if (!signupEmail.trim())          { setSignupError("Please enter your email."); return; }
    if (signupPassword.length < 8)   { setSignupError("Password must be at least 8 characters."); return; }
    if (signupPassword !== confirmPassword) { setSignupError("Passwords do not match."); return; }
    setStep(2);
  };

  const handleStep2Next = () => {
    setSignupError("");
    if (!smokers.some(s => s.name.trim())) {
      setSignupError("Please add at least one smoker.");
      return;
    }
    setStep(3);
  };

  const updateSmoker = (idx: number, field: keyof Smoker, value: string) =>
    setSmokers(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } as Smoker : s));

  const handleSignupSubmit = async () => {
    setSignupError("");
    setSignupLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: signupEmail.trim(),
      password: signupPassword,
      options: { data: { display_name: displayName.trim() }, emailRedirectTo: undefined },
    });

    if (error || !data.user) {
      setSignupError(error?.message ?? "Signup failed. Please try again.");
      setSignupLoading(false);
      return;
    }

    const userId = data.user.id;

    await supabase.from("profiles").insert({
      id: userId,
      display_name: displayName.trim(),
      home_region: cookingStyle || null,
      profile_complete: false,
    });

    await supabase.from("subscriptions").insert({
      user_id: userId,
      tier: "free",
      status: "inactive",
    });

    for (const smoker of smokers) {
      if (smoker.name.trim()) {
        await supabase.from("pits").insert({
          user_id: userId,
          name: smoker.name.trim(),
          type: "other",
          default_wood: smoker.wood.trim() || null,
        });
      }
    }

    await supabase.from("user_preferences").insert({ user_id: userId });

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: signupEmail.trim(),
      password: signupPassword,
    });

    setSignupLoading(false);

    if (signInError) {
      setMode("login");
      setLoginEmail(signupEmail.trim());
      setSignupError("");
      return;
    }

    window.location.href = "/dashboard";
  };

  // ── Render ───────────────────────────────────────────────────────────────────

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
      <div style={{ width: "100%", maxWidth: "480px" }}>

        {/* Verse */}
        <div style={{ textAlign: "center", marginBottom: "var(--space-4)" }}>
          <p style={{
            fontFamily: "var(--font-body)",
            fontStyle: "italic",
            color: "var(--color-text-muted)",
            fontSize: "0.9rem",
            lineHeight: 1.6,
            margin: "0 0 4px",
          }}>
            &ldquo;{verse.text}&rdquo;
          </p>
          <p style={{
            fontFamily: "var(--font-ui)",
            fontSize: "0.7rem",
            color: "var(--color-accent)",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            margin: 0,
          }}>
            {verse.chapter}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--color-bg-alt)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-5)",
        }}>

          {/* Mode tabs — hidden after successful signup */}
          {!successMessage && (
            <div style={{
              display: "flex",
              marginBottom: "var(--space-4)",
              borderBottom: "1px solid #2a2a2a",
            }}>
              {(["login", "signup"] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  style={{
                    flex: 1,
                    padding: "var(--space-2) 0",
                    background: "none",
                    border: "none",
                    borderBottom: mode === m ? "2px solid var(--color-accent)" : "2px solid transparent",
                    color: mode === m ? "var(--color-accent)" : "var(--color-text-muted)",
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.9rem",
                    textTransform: "uppercase" as const,
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                    marginBottom: "-1px",
                  }}
                >
                  {m === "login" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>
          )}

          {/* ── SUCCESS ── */}
          {successMessage ? (
            <div style={{ textAlign: "center", padding: "var(--space-4) 0" }}>
              <p style={{
                fontFamily: "var(--font-heading)",
                fontStyle: "italic",
                fontSize: "1.1rem",
                color: "var(--color-accent)",
                lineHeight: 1.6,
                margin: 0,
              }}>
                {successMessage}
              </p>
            </div>

          ) : mode === "login" ? (
            /* ── LOGIN MODE ── */
            <div>
              <div style={{ marginBottom: "var(--space-3)" }}>
                <label style={labelStyle}>Email</label>
                <Input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ marginBottom: 0 }}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter") handleLogin(); }}
                />
              </div>

              <div style={{ marginBottom: "var(--space-3)" }}>
                <label style={labelStyle}>Password</label>
                <Input
                  type="password"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ marginBottom: 0 }}
                  onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter") handleLogin(); }}
                />
              </div>

              {errEl(loginError)}

              <Button
                onClick={handleLogin}
                disabled={loginLoading}
                style={{ width: "100%", marginTop: "var(--space-3)", marginBottom: "var(--space-3)" }}
              >
                {loginLoading ? "Signing in..." : "Sign In"}
              </Button>

              <div style={{ textAlign: "center" }}>
                <button
                  onClick={() => setShowForgot(f => !f)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-text-muted)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                  }}
                >
                  Forgot password?
                </button>
                {showForgot && (
                  <p style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "0.85rem",
                    color: "var(--color-text-muted)",
                    marginTop: "var(--space-1)",
                    marginBottom: 0,
                  }}>
                    Contact support to reset your password.
                  </p>
                )}
              </div>
            </div>

          ) : (
            /* ── SIGNUP MODE ── */
            <div>
              {/* Step indicator */}
              <p style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.75rem",
                color: "var(--color-accent)",
                textTransform: "uppercase" as const,
                letterSpacing: "0.15em",
                margin: "0 0 var(--space-4)",
                textAlign: "center" as const,
              }}>
                Step {step} of 3
              </p>

              {/* ── STEP 1: Account Details ── */}
              {step === 1 && (
                <div>
                  <div style={{ marginBottom: "var(--space-3)" }}>
                    <label style={labelStyle}>Display Name</label>
                    <Input
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="What do they call you at the pit?"
                      style={{ marginBottom: 0 }}
                    />
                  </div>

                  <div style={{ marginBottom: "var(--space-3)" }}>
                    <label style={labelStyle}>Email</label>
                    <Input
                      type="email"
                      value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      placeholder="you@example.com"
                      style={{ marginBottom: 0 }}
                    />
                  </div>

                  <div style={{ marginBottom: "var(--space-3)" }}>
                    <label style={labelStyle}>Password</label>
                    <Input
                      type="password"
                      value={signupPassword}
                      onChange={e => setSignupPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      style={{ marginBottom: 0 }}
                    />
                  </div>

                  <div style={{ marginBottom: "var(--space-3)" }}>
                    <label style={labelStyle}>Confirm Password</label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{ marginBottom: 0 }}
                      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter") handleStep1Next(); }}
                    />
                  </div>

                  {errEl(signupError)}

                  <Button
                    onClick={handleStep1Next}
                    style={{ width: "100%", marginTop: "var(--space-3)" }}
                  >
                    Next
                  </Button>
                </div>
              )}

              {/* ── STEP 2: Pit Setup ── */}
              {step === 2 && (
                <div>
                  <p style={{
                    fontFamily: "var(--font-body)",
                    fontStyle: "italic",
                    color: "var(--color-text-muted)",
                    fontSize: "0.9rem",
                    margin: "0 0 var(--space-3)",
                  }}>
                    Tell the Preacher what you&rsquo;re cooking on.
                  </p>

                  {smokers.map((smoker, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "var(--color-bg)",
                        border: "1px solid #2a2a2a",
                        borderRadius: "var(--radius-md)",
                        padding: "var(--space-3)",
                        marginBottom: "var(--space-3)",
                      }}
                    >
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "var(--space-2)",
                      }}>
                        <span style={{ fontFamily: "var(--font-heading)", fontSize: "0.95rem" }}>
                          Smoker {idx + 1}
                        </span>
                        {idx > 0 && (
                          <button
                            onClick={() => setSmokers(prev => prev.filter((_, i) => i !== idx))}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--color-text-muted)",
                              cursor: "pointer",
                              fontSize: "1.2rem",
                              lineHeight: 1,
                              padding: 0,
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                      <Input
                        value={smoker.name}
                        onChange={e => updateSmoker(idx, "name", e.target.value)}
                        placeholder="Weber Smokefire EX6, offset, kamado..."
                        style={{ marginBottom: "var(--space-2)" }}
                      />
                      <Input
                        value={smoker.wood}
                        onChange={e => updateSmoker(idx, "wood", e.target.value)}
                        placeholder="Post oak, hickory, competition blend..."
                        style={{ marginBottom: 0 }}
                      />
                    </div>
                  ))}

                  {smokers.length < 3 && (
                    <button
                      onClick={() => setSmokers(prev => [...prev, { name: "", wood: "" }])}
                      style={{
                        background: "none",
                        border: "1px solid var(--color-accent)",
                        color: "var(--color-accent)",
                        borderRadius: "var(--radius-md)",
                        fontFamily: "var(--font-ui)",
                        fontSize: "0.85rem",
                        padding: "8px 16px",
                        cursor: "pointer",
                        marginBottom: "var(--space-3)",
                        display: "block",
                      }}
                    >
                      + Add Another Smoker
                    </button>
                  )}

                  {errEl(signupError)}

                  <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
                    <button onClick={() => setStep(1)} style={backBtnStyle}>Back</button>
                    <div style={{ flex: 2 }}>
                      <Button onClick={handleStep2Next} style={{ width: "100%" }}>Next</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 3: Cooking Style ── */}
              {step === 3 && (
                <div>
                  <p style={{
                    fontFamily: "var(--font-body)",
                    fontStyle: "italic",
                    color: "var(--color-text-muted)",
                    fontSize: "0.9rem",
                    margin: "0 0 var(--space-3)",
                  }}>
                    How do you cook?
                  </p>

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "var(--space-2)",
                    marginBottom: "var(--space-4)",
                  }}>
                    {COOKING_STYLES.map(cs => (
                      <div
                        key={cs.key}
                        onClick={() => setCookingStyle(cookingStyle === cs.key ? "" : cs.key)}
                        style={{
                          padding: "var(--space-3)",
                          background: cookingStyle === cs.key ? "var(--color-bg)" : "transparent",
                          border: cookingStyle === cs.key
                            ? "2px solid var(--color-accent)"
                            : "2px solid #2a2a2a",
                          borderRadius: "var(--radius-md)",
                          cursor: "pointer",
                          transition: "border-color 0.12s",
                        }}
                      >
                        <div style={{ fontFamily: "var(--font-heading)", fontSize: "0.9rem", marginBottom: "4px" }}>
                          {cs.label}
                        </div>
                        <div style={{
                          fontFamily: "var(--font-body)",
                          fontSize: "0.78rem",
                          color: "var(--color-text-muted)",
                          lineHeight: 1.4,
                        }}>
                          {cs.desc}
                        </div>
                      </div>
                    ))}
                  </div>

                  {errEl(signupError)}

                  <div style={{ display: "flex", gap: "var(--space-2)" }}>
                    <button onClick={() => setStep(2)} style={backBtnStyle}>Back</button>
                    <div style={{ flex: 2 }}>
                      <Button
                        onClick={handleSignupSubmit}
                        disabled={signupLoading}
                        style={{ width: "100%" }}
                      >
                        {signupLoading ? "Creating account..." : "Create My Account"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
