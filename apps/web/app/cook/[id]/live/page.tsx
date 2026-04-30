"use client";

import { use, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

type Message = {
  role: "user" | "preacher";
  content: string;
  timestamp: Date;
};

type PlanTool = { id: string; name: string; wood: string };
type PlanItem = {
  name: string;
  category?: string;
  quantity?: number;
  weight?: string | number | null;
  notes?: string;
  smokerId?: string | null;
};

function capitalize(str: string): string {
  return str.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: "short", month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function extractJSON(text: string): string {
  return text.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "").trim();
}

function buildCookContext(
  cookData: any,
  sessionData: any,
  convHistory?: Message[]
): Record<string, any> {
  const plan = cookData?.plan as any;
  const planTools: PlanTool[] = plan?.tools ?? [];
  const planItems: PlanItem[] = plan?.items ?? [];

  const ctx: Record<string, any> = {
    label: cookData?.label ?? "",
    eat_time: cookData?.eat_time ?? "",
    cooking_style: cookData?.cooking_style ?? "",
    tools: planTools,
    planItems,
    recentEvents: [],
    flavor_smoke: sessionData?.flavor_smoke ?? null,
    flavor_bark: sessionData?.flavor_bark ?? null,
    flavor_tenderness: sessionData?.flavor_tenderness ?? null,
  };

  if (convHistory && convHistory.length > 0) {
    ctx.conversationHistory = convHistory.slice(-10).map(m => ({
      role: m.role,
      content: m.content,
    }));
  }

  return ctx;
}

export default function LiveModePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: cookId } = use(params);
  const supabase = createClient();

  const [cook, setCook] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [userTier, setUserTier] = useState<string>("free");
  const [inputDisabled, setInputDisabled] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadData();
  }, [cookId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/auth/login";
      return;
    }

    const { data: subData } = await supabase.from("subscriptions").select("tier").eq("user_id", user.id).single();
    const fetchedTier = subData?.tier ?? "free";
    setUserTier(fetchedTier);

    const { data: cookData } = await supabase
      .from("cooks")
      .select("*")
      .eq("id", cookId)
      .eq("user_id", user.id)
      .single();

    if (!cookData) {
      setLoading(false);
      return;
    }

    setCook(cookData);

    let sessionData: any = null;
    if (cookData.prep_session_id) {
      const { data } = await supabase
        .from("meal_prep_sessions")
        .select("*")
        .eq("id", cookData.prep_session_id)
        .single();
      sessionData = data;
    }
    if (sessionData) setSession(sessionData);

    const { data: eventsData } = await supabase
      .from("cook_events")
      .select("*")
      .eq("cook_id", cookId)
      .eq("event_type", "preacher_chat")
      .order("created_at", { ascending: true });

    const rebuiltMessages: Message[] = [];
    for (const event of eventsData || []) {
      try {
        const parsed = JSON.parse(event.message);
        if (parsed.userMessage && parsed.preacherResponse) {
          rebuiltMessages.push({
            role: "user",
            content: parsed.userMessage,
            timestamp: new Date(event.created_at),
          });
          rebuiltMessages.push({
            role: "preacher",
            content: parsed.preacherResponse,
            timestamp: new Date(event.created_at),
          });
        }
      } catch {
        // skip malformed events
      }
    }

    setMessages(rebuiltMessages);
    setLoading(false);

    if (rebuiltMessages.length === 0) {
      if (fetchedTier === "free") {
        setMessages([{
          role: "preacher",
          content: "The pit is lit. Ask me anything about this cook. Free plan includes 5 messages — upgrade anytime for unlimited coaching.",
          timestamp: new Date(),
        }]);
      } else {
        fetchOpeningMessage(cookData, sessionData);
      }
    }
  };

  const fetchOpeningMessage = async (cookData: any, sessionData: any) => {
    setIsThinking(true);
    const cookContext = buildCookContext(cookData, sessionData);

    try {
      const res = await fetch("/api/preacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cookId: cookData.id,
          message: `OPENING_MESSAGE: Generate a opening message for this cook and 4 suggested prompts. Return as JSON: { "opening": string, "prompts": string[] }. The opening should be 2-3 sentences specific to what is on the pit, the smoker, and the wood. Ask one specific question to engage the pitmaster. The prompts should be natural responses or questions a pitmaster would have at the start of this cook.`,
          cookContext,
        }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      const parsed = JSON.parse(extractJSON(data.reply));
      const opening: string = parsed.opening ?? "The fire is lit. What do you need?";
      const prompts: string[] = Array.isArray(parsed.prompts) ? parsed.prompts : [];

      setMessages([{
        role: "preacher",
        content: opening,
        timestamp: new Date(),
      }]);
      setSuggestedPrompts(prompts);
    } catch (err) {
      console.error("Opening message failed:", err);
      setMessages([{
        role: "preacher",
        content: "The pit is lit. What do you need to know?",
        timestamp: new Date(),
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isThinking || !cook) return;

    const userMessage = text.trim();
    const userMsg: Message = { role: "user", content: userMessage, timestamp: new Date() };
    const historyForContext = messages;

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setSuggestedPrompts([]);
    setIsThinking(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const cookContext = buildCookContext(cook, session, historyForContext);

      const res = await fetch("/api/preacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cookId: cook.id, message: userMessage, cookContext }),
      });

      if (res.status === 403) {
        const errData = await res.json();
        if (errData.error === "MESSAGE_LIMIT_REACHED") {
          setMessages(prev => [...prev, {
            role: "preacher" as const,
            content: "You have reached the free plan limit for this cook. Upgrade to keep the conversation going.",
            timestamp: new Date(),
          }]);
          setInputDisabled(true);
          return;
        }
      }
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      const preacherResponse: string = data.reply ?? "The Preacher is silent. Try again.";

      const preacherMsg: Message = { role: "preacher", content: preacherResponse, timestamp: new Date() };
      setMessages(prev => [...prev, preacherMsg]);

      await supabase.from("cook_events").insert({
        cook_id: cook.id,
        event_type: "preacher_chat",
        message: JSON.stringify({ userMessage, preacherResponse }),
      });

      const historyWithBoth = [...historyForContext, userMsg, preacherMsg];

      try {
        const promptsRes = await fetch("/api/preacher", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cookId: cook.id,
            message: `SUGGEST_PROMPTS: Based on this conversation, suggest 4 short follow-up prompts the pitmaster might want to ask next. Return as JSON array of 4 strings only.`,
            cookContext: buildCookContext(cook, session, historyWithBoth),
          }),
        });

        if (promptsRes.ok) {
          const promptsData = await promptsRes.json();
          const promptsParsed = JSON.parse(extractJSON(promptsData.reply));
          if (Array.isArray(promptsParsed)) {
            setSuggestedPrompts(promptsParsed.slice(0, 4));
          }
        }
      } catch {
        // no prompts is fine
      }
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

  if (!cook) {
    return (
      <div style={{ padding: "var(--space-4)" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", marginBottom: "var(--space-3)" }}>Cook Not Found</h1>
        <Link href="/" style={{ color: "var(--color-accent)", fontFamily: "var(--font-body)" }}>
          Back to Home
        </Link>
      </div>
    );
  }

  const plan = cook?.plan as any;
  const planTools: PlanTool[] = plan?.tools ?? [];

  const smokerSubtitle = [
    planTools.map((t: PlanTool) => t.name).filter(Boolean).join(", ") || cook?.smoker_type || null,
    planTools.map((t: PlanTool) => t.wood).filter(Boolean).join(", ") || cook?.wood_type || null,
    cook?.eat_time ? formatDateTime(cook.eat_time) : null,
  ].filter(Boolean).join(" · ");

  const flavorSmoke = session?.flavor_smoke;
  const flavorBark = session?.flavor_bark;
  const flavorTenderness = session?.flavor_tenderness;
  const hasFlavorData = flavorSmoke != null || flavorBark != null || flavorTenderness != null;
  const statusIsCompleted = cook?.status === "completed";

  const NAV_LINKS = [
    { label: "Live Mode", href: `/cook/${cookId}/live`, active: true },
    { label: "Timeline",  href: `/cook/${cookId}/timeline` },
    { label: "Fire",      href: `/cook/${cookId}/fire` },
    { label: "Rubs",      href: `/cook/${cookId}/rubs` },
    { label: "Events",    href: `/cook/${cookId}/events` },
    { label: "Summary",   href: `/cook/${cookId}/summary` },
  ];

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
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
        .cook-nav-btn {
          background: transparent;
          border: 1px solid rgba(201,151,58,0.3);
          color: var(--color-text-muted);
          font-family: var(--font-ui);
          font-size: 0.8rem;
          padding: 6px 14px;
          border-radius: var(--radius-md);
          cursor: pointer;
          text-decoration: none;
          transition: border-color 0.12s, color 0.12s;
          display: inline-block;
          white-space: nowrap;
        }
        .cook-nav-btn:hover {
          border-color: #C9973A;
          color: #C9973A;
        }
        .cook-nav-btn-active {
          border-color: #C9973A !important;
          color: #C9973A !important;
        }
        .prompt-pill {
          border: 1px solid rgba(201,151,58,0.4);
          background: transparent;
          color: #C9973A;
          font-family: var(--font-body);
          font-size: 0.85rem;
          padding: 6px 14px;
          border-radius: 20px;
          white-space: nowrap;
          cursor: pointer;
          transition: background 0.12s;
          flex-shrink: 0;
        }
        .prompt-pill:hover {
          background: rgba(201,151,58,0.08);
        }
        .live-textarea:focus {
          outline: none;
          border-color: rgba(201,151,58,0.5);
        }
      `}</style>

      {/* ── MISSION CARD ── */}
      <div style={{
        background: "var(--color-bg-alt)",
        borderBottom: "1px solid rgba(201,151,58,0.2)",
        padding: "var(--space-3) var(--space-4)",
        flexShrink: 0,
      }}>
        <h1 style={{
          fontFamily: "var(--font-heading)",
          fontSize: "clamp(1.4rem, 3vw, 2rem)",
          color: "#F5E6C8",
          margin: "0 0 var(--space-1)",
          lineHeight: 1.1,
        }}>
          {cook.label}
        </h1>

        {smokerSubtitle && (
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            color: "var(--color-text-muted)",
            margin: "0 0 var(--space-2)",
          }}>
            {smokerSubtitle}
          </p>
        )}

        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <span style={{
            fontFamily: "var(--font-ui)",
            fontSize: "0.78rem",
            padding: "3px 10px",
            borderRadius: "var(--radius-md)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            background: statusIsCompleted ? "rgba(45,106,79,0.2)" : "rgba(201,151,58,0.2)",
            color: statusIsCompleted ? "#2D6A4F" : "#C9973A",
          }}>
            {cook.status ? capitalize(cook.status) : "In Progress"}
          </span>

          {cook.cooking_style && (
            <span style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.78rem",
              padding: "3px 10px",
              borderRadius: "var(--radius-md)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              background: "rgba(201,151,58,0.12)",
              color: "var(--color-text-muted)",
            }}>
              {capitalize(cook.cooking_style)}
            </span>
          )}

          {hasFlavorData && (
            <span style={{
              fontFamily: "var(--font-ui)",
              fontSize: "0.78rem",
              padding: "3px 10px",
              borderRadius: "var(--radius-md)",
              background: "rgba(201,151,58,0.08)",
              color: "var(--color-text-muted)",
            }}>
              Smoke {flavorSmoke ?? "—"} · Bark {flavorBark ?? "—"} · Tenderness {flavorTenderness ?? "—"}
            </span>
          )}
        </div>
      </div>

      {/* ── CHAT WRAPPER ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        overflow: "hidden",
        paddingBottom: "52px",
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

        {/* Suggested prompts */}
        {!isThinking && suggestedPrompts.length > 0 && userTier !== "free" && (
          <div style={{
            display: "flex",
            gap: "var(--space-2)",
            padding: "var(--space-2) var(--space-4)",
            overflowX: "auto",
            flexShrink: 0,
            scrollbarWidth: "none",
          }}>
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                className="prompt-pill"
                onClick={() => sendMessage(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {inputDisabled && (
          <div style={{ flexShrink: 0, padding: "var(--space-2) var(--space-4)", textAlign: "center", borderTop: "1px solid rgba(201,151,58,0.1)" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0 0 var(--space-1)" }}>
              Free plan limit reached for this cook.
            </p>
            <Link href="/premium" style={{ fontFamily: "var(--font-ui)", fontSize: "0.85rem", color: "#C9973A", textDecoration: "none" }}>
              Upgrade to keep talking →
            </Link>
          </div>
        )}

        {/* Input area */}
        <div style={{
          flexShrink: 0,
          background: "var(--color-bg-alt)",
          borderTop: "1px solid rgba(201,151,58,0.2)",
          padding: "var(--space-2) var(--space-4)",
          display: "flex",
          gap: "var(--space-2)",
          alignItems: "flex-end",
        }}>
          <textarea
            ref={textareaRef}
            className="live-textarea"
            rows={1}
            value={inputValue}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={isThinking || inputDisabled}
            placeholder="What's happening at the pit?"
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
            disabled={isThinking || inputDisabled || !inputValue.trim()}
            style={{
              background: isThinking || inputDisabled || !inputValue.trim() ? "rgba(201,151,58,0.3)" : "#C9973A",
              color: isThinking || inputDisabled || !inputValue.trim() ? "rgba(201,151,58,0.5)" : "var(--color-bg)",
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

      {/* ── STICKY BOTTOM BAR ── */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: "var(--color-bg-alt)",
        borderTop: "1px solid rgba(201,151,58,0.2)",
        padding: "var(--space-2) var(--space-4)",
        display: "flex",
        justifyContent: "center",
        gap: "var(--space-3)",
        flexWrap: "wrap",
      }}>
        {NAV_LINKS.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`cook-nav-btn${link.active ? " cook-nav-btn-active" : ""}`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
