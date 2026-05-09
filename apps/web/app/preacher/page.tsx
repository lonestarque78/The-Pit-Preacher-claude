"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import DailyVerse from "@/components/gospel/DailyVerse";
import PreacherOrnament from "@/components/gospel/PreacherOrnament";
import Link from "next/link";

type Message = {
  role: "user" | "preacher";
  content: string;
  timestamp: Date;
  nudge?: boolean;
};

const TIER_LIMITS: Record<string, number> = {
  free: 3,
  basic: 10,
  backyard: 25,
  pitmaster: 999999,
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function PreacherPage() {
  const supabase = createClient();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [userTier, setUserTier] = useState<string>("free");
  const [userId, setUserId] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (messages.length > 1) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/auth/login";
      return;
    }
    setUserId(user.id);

    const { data: subData } = await supabase
      .from("subscriptions")
      .select("tier")
      .eq("user_id", user.id)
      .single();
    const tier = subData?.tier ?? "free";
    setUserTier(tier);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("usage_events")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("feature", "standalone_preacher")
      .gte("created_at", todayStart.toISOString());

    const usage = count ?? 0;
    const limit = TIER_LIMITS[tier] ?? 3;
    if (usage >= limit) setLimitReached(true);

    setLoading(false);
    setMessages([{
      role: "preacher",
      content: "The pit is open. What do you need to know?",
      timestamp: new Date(),
    }]);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isThinking || !userId) return;

    const userMessage = text.trim();
    const historyForContext = [...messages];

    const userMsg: Message = { role: "user", content: userMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsThinking(true);

    try {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("usage_events")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("feature", "standalone_preacher")
        .gte("created_at", todayStart.toISOString());

      const usage = count ?? 0;
      const limit = TIER_LIMITS[userTier] ?? 3;

      if (usage >= limit) {
        setLimitReached(true);
        setMessages(prev => [...prev, {
          role: "preacher" as const,
          content: "You have reached your daily limit. Upgrade your plan to keep the conversation going.",
          timestamp: new Date(),
          nudge: true,
        }]);
        return;
      }

      await supabase.from("usage_events").insert({
        user_id: userId,
        feature: "standalone_preacher",
      });

      if (usage + 1 >= limit) setLimitReached(true);

      const res = await fetch("/api/preacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          cookId: null,
          cookContext: {
            label: "standalone",
            eat_time: null,
            cooking_style: "",
            tools: [],
            planItems: [],
            recentEvents: [],
            conversationHistory: historyForContext.map(m => ({
              role: m.role,
              content: m.content,
            })),
            flavor_smoke: null,
            flavor_bark: null,
            flavor_tenderness: null,
          },
        }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);

      const data = await res.json();
      const preacherResponse: string = data.reply ?? "The Preacher is silent. Try again.";

      setMessages(prev => [...prev, {
        role: "preacher",
        content: preacherResponse,
        timestamp: new Date(),
      }]);
    } catch (err) {
      console.error("Send message failed:", err);
      setMessages(prev => [...prev, {
        role: "preacher" as const,
        content: "Lost the signal at the pit. Try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 72) + "px";
  };

  if (loading) {
    return (
      <div style={{ padding: "var(--space-4)", fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "calc(100vh - 64px)",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes logoPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .preacher-standalone-textarea:focus {
          outline: none;
          border-color: rgba(201,151,58,0.5);
        }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{
        background: "var(--color-bg-alt)",
        borderBottom: "1px solid rgba(201,151,58,0.2)",
        padding: "var(--space-3) var(--space-4)",
        flexShrink: 0,
      }}>
        <DailyVerse />
        <h1 style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(1.4rem, 3vw, 2rem)",
          color: "#F5E6C8",
          margin: "0 0 var(--space-1)",
          lineHeight: 1.1,
        }}>
          Ask the Preacher
        </h1>
        <p style={{
          fontFamily: "var(--font-body)",
          fontSize: "0.9rem",
          color: "var(--color-text-muted)",
          margin: 0,
        }}>
          Get a direct answer to any BBQ question.
        </p>
      </div>

      {/* ── CHAT WRAPPER ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        overflow: "hidden",
      }}>
        {/* Scrollable messages */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "var(--space-3) var(--space-4)",
        }}>
          <div style={{ maxWidth: "860px", margin: "0 auto" }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row",
                  alignItems: "flex-end",
                  gap: "var(--space-2)",
                  marginBottom: "var(--space-3)",
                }}
              >
                {msg.role === "preacher" && (
                  <img
                    src="/logo.jpeg"
                    alt="The Pit Preacher"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1px solid rgba(201,151,58,0.3)",
                      flexShrink: 0,
                    }}
                  />
                )}

                <div style={{ maxWidth: msg.role === "user" ? "70%" : "75%" }}>
                  <div style={{
                    background: msg.role === "user"
                      ? "rgba(201,151,58,0.15)"
                      : "var(--color-bg-alt)",
                    border: msg.role === "user"
                      ? "1px solid rgba(201,151,58,0.3)"
                      : "1px solid rgba(201,151,58,0.15)",
                    borderRadius: msg.role === "user"
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                    padding: "var(--space-2) var(--space-3)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.95rem",
                    color: "var(--color-text)",
                    lineHeight: 1.6,
                  }}>
                    {msg.content}
                    {msg.nudge && (
                      <div style={{ marginTop: "var(--space-2)" }}>
                        <Link href="/premium" style={{
                          fontFamily: "var(--font-ui)",
                          fontSize: "0.85rem",
                          color: "#C9973A",
                          textDecoration: "none",
                        }}>
                          Upgrade your plan →
                        </Link>
                      </div>
                    )}
                    {msg.role === "preacher" && !msg.nudge && <PreacherOrnament />}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.7rem",
                    color: "var(--color-text-muted)",
                    marginTop: "4px",
                    textAlign: msg.role === "user" ? "right" : "left",
                  }}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {isThinking && (
              <div style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "var(--space-2)",
                marginBottom: "var(--space-3)",
              }}>
                <img
                  src="/logo.jpeg"
                  alt=""
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid rgba(201,151,58,0.3)",
                    flexShrink: 0,
                    animation: "logoPulse 1.2s ease-in-out infinite",
                  }}
                />
                <div style={{ display: "flex", gap: "5px", padding: "10px 14px" }}>
                  {([0, 0.3, 0.6] as number[]).map((delay, i) => (
                    <div
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#C9973A",
                        animation: "dotPulse 1.2s ease-in-out infinite",
                        animationDelay: `${delay}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input area or limit nudge */}
        {limitReached ? (
          <div style={{
            flexShrink: 0,
            padding: "var(--space-3) var(--space-4)",
            textAlign: "center",
            borderTop: "1px solid rgba(201,151,58,0.15)",
            background: "var(--color-bg-alt)",
          }}>
            <p style={{
              fontFamily: "var(--font-body)",
              fontSize: "0.9rem",
              color: "var(--color-text-muted)",
              margin: "0 0 var(--space-1)",
            }}>
              You have reached your daily limit. Upgrade your plan to keep the conversation going.
            </p>
            <Link href="/premium" style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.85rem",
              color: "#C9973A",
              textDecoration: "none",
            }}>
              Upgrade your plan →
            </Link>
          </div>
        ) : (
          <div style={{
            flexShrink: 0,
            background: "var(--color-bg-alt)",
            borderTop: "1px solid rgba(201,151,58,0.2)",
            padding: "var(--space-2) var(--space-4)",
          }}>
            <div style={{
              display: "flex",
              gap: "var(--space-2)",
              alignItems: "flex-end",
              maxWidth: "860px",
              margin: "0 auto",
            }}>
              <textarea
                ref={textareaRef}
                className="preacher-standalone-textarea"
                rows={1}
                value={inputValue}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                disabled={isThinking}
                placeholder="Ask the Preacher anything about BBQ..."
                style={{
                  flex: 1,
                  background: "var(--color-bg)",
                  border: "1px solid rgba(201,151,58,0.25)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--color-text)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.95rem",
                  padding: "10px 14px",
                  resize: "none",
                  lineHeight: 1.5,
                  minHeight: "42px",
                  maxHeight: "72px",
                  overflow: "auto",
                }}
              />
              <button
                onClick={() => sendMessage(inputValue)}
                disabled={isThinking || !inputValue.trim()}
                style={{
                  background: isThinking || !inputValue.trim() ? "rgba(201,151,58,0.3)" : "#C9973A",
                  color: isThinking || !inputValue.trim() ? "rgba(201,151,58,0.5)" : "var(--color-bg)",
                  fontFamily: "var(--font-ui)",
                  fontSize: "0.9rem",
                  padding: "8px 20px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  cursor: isThinking || !inputValue.trim() ? "not-allowed" : "pointer",
                  flexShrink: 0,
                  alignSelf: "flex-end",
                  height: "42px",
                }}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
