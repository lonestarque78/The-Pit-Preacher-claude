"use client";

import { use, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import PreacherOrnament from "@/components/gospel/PreacherOrnament";
import Link from "next/link";

type Message = {
  role: "user" | "preacher";
  content: string;
  timestamp: Date;
  imagePreview?: string;
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

type CannedQuestion = string | { label: string; action: () => void };

type CookRow = {
  id: string;
  label: string;
  status: string;
  eat_time: string | null;
  smoker_type: string | null;
  wood_type: string | null;
  cooking_style: string | null;
  prep_session_id: string | null;
  plan: Record<string, unknown> | null;
};
type SessionRow = {
  id: string;
  flavor_smoke: number | null;
  flavor_bark: number | null;
  flavor_tenderness: number | null;
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

function buildEventMessage(logEvent: { event_type: string; data: any }): string {
  const { event_type, data } = logEvent;
  switch (event_type) {
    case "temp_log": {
      const parts: string[] = [];
      if (data.pit_temp) parts.push(`Pit: ${data.pit_temp}°F`);
      if (data.internal_temp) parts.push(`Internal: ${data.internal_temp}°F`);
      return parts.join(" · ") || "Temperature logged";
    }
    case "wrap":
      return `Wrapped — ${data.method === "butcher_paper" ? "Butcher paper" : data.method === "foil" ? "Foil" : "Method not specified"}`;
    case "spritz":
      return `Spritzed${data.liquid ? ` with ${data.liquid}` : ""}`;
    case "probe_check":
      return data.tender ? "Probe tender — slides like butter" : "Probe check — still has resistance";
    case "pull":
      return `Pulled from heat${data.internal_temp ? ` at ${data.internal_temp}°F` : ""}`;
    case "rest_start":
      return "Into the rest";
    default:
      return event_type;
  }
}

const TOPIC_PILLS = ["▲ Fire", "⊙ Temps", "◉ Timing", "⊕ Seasoning", "⚠ Troubleshoot", "✦ Finishing"];

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()
    img.onload = () => {
      const maxSize = 1200
      let width = img.width
      let height = img.height
      if (width > height && width > maxSize) {
        height = (height * maxSize) / width
        width = maxSize
      } else if (height > maxSize) {
        width = (width * maxSize) / height
        height = maxSize
      }
      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)
      const compressed = canvas.toDataURL('image/jpeg', 0.7)
      resolve(compressed.split(',')[1] ?? '')
    }
    img.src = URL.createObjectURL(file)
  })
}

export default function LiveModePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: cookId } = use(params);
  const supabase = createClient();

  const [cook, setCook] = useState<CookRow | null>(null);
  const [session, setSession] = useState<SessionRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [userTier, setUserTier] = useState<string>("free");
  const [inputDisabled, setInputDisabled] = useState(false);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [tempInputMode, setTempInputMode] = useState<"pit" | "internal" | "both" | null>(null);
  const [pitTempValue, setPitTempValue] = useState("");
  const [internalTempValue, setInternalTempValue] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, [cookId]);

  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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

    if (cookData.status === 'completed' || cookData.status === 'abandoned') {
      setReadOnly(true);
    } else if (rebuiltMessages.length === 0) {
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
    const currentImage = selectedImage;
    const currentImagePreview = imagePreview;
    const userMsg: Message = {
      role: "user",
      content: userMessage,
      timestamp: new Date(),
      ...(currentImagePreview ? { imagePreview: currentImagePreview } : {}),
    };
    const historyForContext = messages;

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setSuggestedPrompts([]);
    setIsThinking(true);
    setSelectedImage(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const cookContext = buildCookContext(cook, session, historyForContext);

      const res = await fetch("/api/preacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cookId: cook.id,
          message: userMessage,
          cookContext,
          imageBase64: currentImage ?? undefined,
        }),
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
      const logEvent = data.logEvent ?? null;

      const preacherMsg: Message = {
        role: "preacher",
        content: preacherResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, preacherMsg]);

      await supabase.from("cook_events").insert({
        cook_id: cook.id,
        event_type: "preacher_chat",
        message: JSON.stringify({ userMessage, preacherResponse }),
      });

      if (logEvent && logEvent.event_type) {
        const eventMessage = buildEventMessage(logEvent);
        await supabase.from("cook_events").insert({
          cook_id: cook.id,
          event_type: logEvent.event_type,
          message: eventMessage,
        });
      }

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

  const handleDirectLog = async (eventType: string, data: object, displayMessage: string) => {
    if (!cook) return;
    await supabase.from("cook_events").insert({
      cook_id: cook.id,
      event_type: eventType,
      message: displayMessage,
    });
    await sendMessage(displayMessage);
  };

  const CANNED_QUESTIONS: Record<string, CannedQuestion[]> = {
    "▲ Fire": [
      "What temp should my pit be running right now?",
      "My fire is running too hot — what do I do?",
      "My fire keeps dropping — how do I stabilize it?",
      "What does good smoke look like right now?",
    ],
    "⊙ Temps": [
      "What internal temp should I be looking for?",
      "My temp has been stuck for an hour — is this the stall?",
      "How far am I from being done?",
      "Should I be probing yet?",
    ],
    "◉ Timing": [
      "How much time do I have left on this cook?",
      { label: "I just wrapped", action: () => handleDirectLog("wrap", { method: "unknown" }, "Just wrapped it") },
      "When should I start my sides?",
      "What time should I pull this off the pit?",
    ],
    "⊕ Seasoning": [
      "Did I season this right for what I'm cooking?",
      "Should I spritz right now?",
      "What sauce or glaze should I finish with?",
      "Is it too late to add more seasoning?",
    ],
    "⚠ Troubleshoot": [
      "My bark is not setting — what's wrong?",
      "The outside looks done but the inside is not there yet",
      "I opened the lid too many times — did I ruin it?",
      "My temp spiked — what do I do?",
    ],
    "✦ Finishing": [
      "How do I know when this is truly done?",
      "How long should I rest this?",
      { label: "I just pulled it", action: () => handleDirectLog("pull", { internal_temp: null }, "Just pulled it off the pit") },
      { label: "Going into the rest", action: () => handleDirectLog("rest_start", {}, "Going into the rest now") },
    ],
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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    const compressed = await compressImage(file);
    setSelectedImage(compressed);
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
    { label: "Guide",     href: `/cook/${cookId}/guide` },
    { label: "Journal",   href: `/cook/${cookId}/events` },
    { label: "Summary",   href: `/cook/${cookId}/summary` },
  ];

  const tempLogModes: { label: string; mode: "pit" | "internal" | "both" }[] = [
    { label: "Log Pit Temp", mode: "pit" },
    { label: "Log Internal Temp", mode: "internal" },
    { label: "Log Both", mode: "both" },
  ];

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
        .topic-pills-row::-webkit-scrollbar { display: none; }
        .canned-pills-row::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── BACK TO COOK ── */}
      <Link href={`/cook/${cookId}`} style={{
        display: "block",
        padding: "var(--space-2) var(--space-4) 0 var(--space-4)",
        fontFamily: "var(--font-ui)",
        fontSize: "0.8rem",
        color: "#C9973A",
        textDecoration: "none",
        flexShrink: 0,
      }}>
        ← Back to Cook
      </Link>

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

      {/* ── TOPIC SELECTOR ── */}
      {!readOnly && <div
        className="topic-pills-row"
        style={{
          overflowX: "auto",
          scrollbarWidth: "none",
          padding: "var(--space-2) var(--space-4)",
          borderBottom: "1px solid rgba(201,151,58,0.1)",
          display: "flex",
          gap: "var(--space-2)",
          flexWrap: "nowrap",
          flexShrink: 0,
        }}
      >
        {TOPIC_PILLS.map(topic => (
          <button
            key={topic}
            onClick={() => {
              const newTopic = activeTopic === topic ? null : topic;
              setActiveTopic(newTopic);
              if (newTopic !== "⊙ Temps") {
                setTempInputMode(null);
                setPitTempValue("");
                setInternalTempValue("");
              }
            }}
            style={{
              border: activeTopic === topic ? "1px solid #C9973A" : "1px solid rgba(201,151,58,0.3)",
              background: activeTopic === topic ? "rgba(201,151,58,0.15)" : "transparent",
              color: activeTopic === topic ? "#C9973A" : "var(--color-text-muted)",
              fontFamily: "var(--font-ui)",
              fontSize: "0.8rem",
              padding: "5px 14px",
              borderRadius: "20px",
              whiteSpace: "nowrap",
              cursor: "pointer",
            }}
          >
            {topic}
          </button>
        ))}
      </div>}

      {/* ── CANNED QUESTIONS ── */}
      {!readOnly && activeTopic && (
        <div
          className="canned-pills-row"
          style={{
            overflowX: "auto",
            scrollbarWidth: "none",
            padding: "var(--space-2) var(--space-4)",
            borderBottom: "1px solid rgba(201,151,58,0.1)",
            display: "flex",
            gap: "var(--space-2)",
            flexWrap: "nowrap",
            flexShrink: 0,
          }}
        >
          {activeTopic === "⊙ Temps" ? (
            tempLogModes.map(({ label, mode }) => (
              <button
                key={label}
                className="prompt-pill"
                onClick={() => setTempInputMode(tempInputMode === mode ? null : mode)}
                style={tempInputMode === mode ? {
                  background: "rgba(201,151,58,0.15)",
                  border: "1px solid #C9973A",
                  color: "#C9973A",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  flexShrink: 0,
                } : undefined}
              >
                {label}
              </button>
            ))
          ) : (
            (CANNED_QUESTIONS[activeTopic] ?? []).map((q, idx) => (
              <button
                key={idx}
                className="prompt-pill"
                onClick={() => {
                  if (typeof q === "string") sendMessage(q);
                  else q.action();
                }}
              >
                {typeof q === "string" ? q : q.label}
              </button>
            ))
          )}
        </div>
      )}

      {/* ── TEMP INPUT CARD ── */}
      {activeTopic === "⊙ Temps" && tempInputMode && (
        <div
          style={{
            flexShrink: 0,
            background: "var(--color-bg-alt)",
            border: "1px solid rgba(201,151,58,0.3)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-2) var(--space-3)",
            margin: "0 var(--space-4)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            flexWrap: "wrap",
          }}
        >
          {(tempInputMode === "pit" || tempInputMode === "both") && (
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                Pit temp:
              </span>
              <input
                type="number"
                value={pitTempValue}
                onChange={e => setPitTempValue(e.target.value)}
                placeholder="°F"
                style={{
                  background: "var(--color-bg)",
                  border: "1px solid rgba(201,151,58,0.3)",
                  color: "var(--color-text)",
                  fontFamily: "var(--font-body)",
                  padding: "6px 10px",
                  borderRadius: "var(--radius-md)",
                  width: "80px",
                  textAlign: "center",
                  fontSize: "1rem",
                }}
              />
            </div>
          )}

          {(tempInputMode === "internal" || tempInputMode === "both") && (
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)" }}>
              <span style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                Internal temp:
              </span>
              <input
                type="number"
                value={internalTempValue}
                onChange={e => setInternalTempValue(e.target.value)}
                placeholder="°F"
                style={{
                  background: "var(--color-bg)",
                  border: "1px solid rgba(201,151,58,0.3)",
                  color: "var(--color-text)",
                  fontFamily: "var(--font-body)",
                  padding: "6px 10px",
                  borderRadius: "var(--radius-md)",
                  width: "80px",
                  textAlign: "center",
                  fontSize: "1rem",
                }}
              />
            </div>
          )}

          <button
            onClick={() => {
              const message =
                tempInputMode === "both"
                  ? `Pit is at ${pitTempValue}°F, internal is at ${internalTempValue}°F`
                  : tempInputMode === "pit"
                  ? `Pit is at ${pitTempValue}°F`
                  : `Internal temp is ${internalTempValue}°F`;
              sendMessage(message);
              setTempInputMode(null);
              setPitTempValue("");
              setInternalTempValue("");
            }}
            style={{
              background: "#C9973A",
              color: "var(--color-bg)",
              fontFamily: "var(--font-ui)",
              padding: "6px 16px",
              borderRadius: "var(--radius-md)",
              border: "none",
              cursor: "pointer",
            }}
          >
            Log
          </button>
        </div>
      )}

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
            {readOnly && (
              <div style={{
                background: cook.status === 'completed' ? "rgba(45,106,79,0.1)" : "rgba(201,151,58,0.1)",
                border: cook.status === 'completed' ? "1px solid rgba(45,106,79,0.3)" : "1px solid rgba(201,151,58,0.3)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-2) var(--space-3)",
                marginBottom: "var(--space-3)",
                fontFamily: "var(--font-body)",
                fontStyle: "italic",
                color: "var(--color-text-muted)",
                fontSize: "0.85rem",
              }}>
                {cook.status === 'completed'
                  ? "This cook is complete. Your conversation with the Preacher is preserved below."
                  : "This cook was archived. Your conversation with the Preacher is preserved below."}
              </div>
            )}
            {readOnly && messages.length === 0 && (
              <div style={{
                fontFamily: "var(--font-body)",
                fontStyle: "italic",
                color: "var(--color-text-muted)",
                textAlign: "center",
                padding: "var(--space-4)",
              }}>
                No conversations were logged during this cook.
              </div>
            )}
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
                    {msg.role === "user" && msg.imagePreview && (
                      <img
                        src={msg.imagePreview}
                        alt=""
                        style={{
                          display: "block",
                          width: 60,
                          height: 60,
                          objectFit: "cover",
                          borderRadius: "var(--radius-md)",
                          marginBottom: "var(--space-1)",
                        }}
                      />
                    )}
                    {msg.content}

                    {/* ── GOSPEL ORNAMENT ── */}
                    {msg.role === "preacher" && <PreacherOrnament />}
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
        {!isThinking && suggestedPrompts.length > 0 && userTier !== "free" && !activeTopic && !readOnly && (
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

        {!readOnly && inputDisabled && (
          <div style={{ flexShrink: 0, padding: "var(--space-2) var(--space-4)", textAlign: "center", borderTop: "1px solid rgba(201,151,58,0.1)" }}>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "0.85rem", color: "var(--color-text-muted)", margin: "0 0 var(--space-1)" }}>
              Free plan limit reached for this cook.
            </p>
            <Link href="/premium" style={{ fontFamily: "var(--font-ui)", fontSize: "0.85rem", color: "#C9973A", textDecoration: "none" }}>
              Upgrade to keep talking →
            </Link>
          </div>
        )}

        {cook.status === "in_progress" && !inputDisabled && (
          <div style={{ flexShrink: 0, textAlign: "center", padding: "var(--space-1) var(--space-4)" }}>
            <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Ready to wrap up? </span>
            <Link href={`/cook/${cookId}/summary`} style={{ fontFamily: "var(--font-ui)", fontSize: "0.8rem", color: "#C9973A", textDecoration: "none" }}>
              Complete This Cook →
            </Link>
          </div>
        )}

        {/* Input area */}
        {!readOnly && <div style={{
          flexShrink: 0,
          background: "var(--color-bg-alt)",
          borderTop: "1px solid rgba(201,151,58,0.2)",
          padding: "var(--space-2) var(--space-4)",
        }}>
          {(userTier === "backyard" || userTier === "pitmaster") && selectedImage && imagePreview && (
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-2)" }}>
              <img
                src={imagePreview}
                alt=""
                style={{
                  width: 60,
                  height: 60,
                  objectFit: "cover",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid rgba(201,151,58,0.3)",
                  flexShrink: 0,
                }}
              />
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setImagePreview(null);
                  if (imageInputRef.current) imageInputRef.current.value = "";
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--color-text-muted)",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  padding: "0 4px",
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                ×
              </button>
              <span style={{ fontFamily: "var(--font-ui)", fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                Photo ready to send
              </span>
            </div>
          )}
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "flex-end" }}>
            {(userTier === "backyard" || userTier === "pitmaster") && (
              <>
                <button
                  onClick={() => imageInputRef.current?.click()}
                  title="Upload a photo for the Preacher to assess"
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(201,151,58,0.3)",
                    color: "#C9973A",
                    width: 36,
                    height: 36,
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </button>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={imageInputRef}
                  style={{ display: "none" }}
                  onChange={handleImageSelect}
                />
              </>
            )}
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
        </div>}
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
