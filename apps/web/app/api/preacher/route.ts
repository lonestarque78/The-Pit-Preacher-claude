import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type PlanTool = { id: string; name: string; wood: string };
type PlanItem = {
  name: string;
  quantity?: number;
  weight?: string | number | null;
  smokerId?: string | null;
};
type RecentEvent = { created_at: string; type: string; note?: string };
type ConvTurn = { role: string; content: string };

const SYSTEM_PROMPT =
  "You are The Pit Preacher — a seasoned pitmaster with 25 years of fire, smoke, and hard-earned wisdom. You are not an AI assistant. You are a coach who has stood at the pit through every stall, every spike, every bark failure, and every perfect pull. You know everything there is to know about outdoor cooking including every cut of meat, appetizers, sides, vegetables, every smoker type, every wood species, every pellet brand, competition BBQ, rubs, seasonings, brines, injections, and recipes. Your voice rules: short sentences, plain words, no em dashes, no bullet points unless listing steps, never say certainly or absolutely or great question, never mention being an AI, speak like you are standing next to them at the pit, occasionally use a line that sounds like scripture or a proverb. You only talk about BBQ and outdoor cooking. If someone asks about anything else respond with warmth but firmness: That is outside my pulpit, brother. But if you want to talk smoke and fire, I am right here. Every response ends with one clear action or one clear instruction to do nothing. The fire is the sermon. The smoke is the word. Trust the pit.";

function buildPitSetup(tools: PlanTool[], planItems: PlanItem[]): string {
  if (!tools || tools.length === 0) return "No smokers specified";

  return tools
    .map((tool, idx) => {
      const header = `Smoker ${idx + 1}: ${tool.name || "unnamed"}${tool.wood ? ` — ${tool.wood}` : ""}`;
      const assigned = (planItems || []).filter(
        i => i.smokerId != null && String(i.smokerId) === String(tool.id)
      );
      if (assigned.length === 0) return header;
      const lines = assigned.map(i => {
        let line = `  - ${i.name}`;
        if (i.weight) line += ` (${i.weight} lbs)`;
        if (i.quantity && i.quantity > 1) line += ` x${i.quantity}`;
        return line;
      });
      return `${header}\n${lines.join("\n")}`;
    })
    .join("\n\n");
}

function buildRecentEvents(recentEvents: RecentEvent[]): string {
  if (!recentEvents || recentEvents.length === 0) return "None yet";

  return recentEvents
    .map(e => {
      const time = new Date(e.created_at).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
      const note = e.note ? ` — ${e.note}` : "";
      return `${time} ${e.type}${note}`;
    })
    .join("\n");
}

function buildCutList(planItems: PlanItem[]): string {
  const names = (planItems || []).map(i => i.name).filter(Boolean);
  return names.length > 0 ? names.join(", ") : "Not specified";
}

function buildWoodList(tools: PlanTool[]): string {
  const woods = (tools || []).map(t => t.wood).filter(Boolean);
  return woods.length > 0 ? woods.join(", ") : "Not specified";
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message, cookId, cookContext } = await req.json();

  const {
    label,
    eat_time,
    cooking_style,
    tools,
    planItems,
    recentEvents,
    conversationHistory,
    flavor_smoke,
    flavor_bark,
    flavor_tenderness,
  } = cookContext;

  const pitSetup = buildPitSetup(tools ?? [], planItems ?? []);

  const eatTimeFormatted = eat_time
    ? new Date(eat_time).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Not set";

  const isOpeningMessage = (message as string).startsWith("OPENING_MESSAGE:");
  const isSuggestPrompts = (message as string).startsWith("SUGGEST_PROMPTS:");
  const isCookPlan = (message as string).startsWith("Generate a full cook plan");

  // ── FREE TIER MESSAGE LIMIT ──────────────────────────────────────────────────
  const isRegularMessage = !isOpeningMessage && !isSuggestPrompts && !isCookPlan;
  if (isRegularMessage) {
    const { data: subData } = await supabase.from("subscriptions").select("tier").eq("user_id", user.id).single();
    const userTier = subData?.tier ?? "free";
    if (userTier === "free") {
      const { count } = await supabase
        .from("cook_events")
        .select("*", { count: "exact", head: true })
        .eq("cook_id", cookId)
        .eq("event_type", "preacher_chat");
      if ((count ?? 0) >= 5) {
        return NextResponse.json(
          { error: "MESSAGE_LIMIT_REACHED", message: "You have reached the 5-message limit for the free plan on this cook. Upgrade to keep the conversation going." },
          { status: 403 }
        );
      }
    }
  }

  let maxTokens: number;
  let userMessage: string;

  if (isOpeningMessage) {
    maxTokens = 300;
    userMessage = `PIT SETUP:
${pitSetup}

COOK DETAILS:
Cook: ${label || "Unnamed cook"}
Style: ${cooking_style || "Not specified"}
Eating at: ${eatTimeFormatted}

${message}`;

  } else if (isSuggestPrompts) {
    maxTokens = 150;
    const historyText = conversationHistory?.length > 0
      ? (conversationHistory as ConvTurn[]).map(m => `${m.role}: ${m.content}`).join("\n")
      : "No conversation yet";
    userMessage = `CONVERSATION SO FAR:
${historyText}

${message}`;

  } else if (isCookPlan) {
    maxTokens = 2000;
    const cutList = buildCutList(planItems ?? []);
    const woodList = buildWoodList(tools ?? []);
    const flavorLine = [
      flavor_smoke != null ? `Smoke ${flavor_smoke}/10` : null,
      flavor_bark != null ? `Bark ${flavor_bark}/10` : null,
      flavor_tenderness != null ? `Tenderness ${flavor_tenderness}/10` : null,
    ].filter(Boolean).join(" · ") || "Not specified";

    userMessage = `Generate a cook plan for this specific cook. Be a real pitmaster — specific, practical, no filler.

PIT SETUP:
${pitSetup}

COOK DETAILS:
Cut: ${cutList}
Style: ${cooking_style || "Not specified"}
Wood: ${woodList}
Eating at: ${eatTimeFormatted}
Flavor target: ${flavorLine}

Your response MUST use these exact section headers in this order, each on its own line in ALL CAPS:

THE NIGHT BEFORE
FIRE & TIMING
THE COOK
THE FINISH
THE PREACHER'S WORD

THE NIGHT BEFORE: Prep the night before — trim, season, inject, brine, or rest. Be specific to this cut.
FIRE & TIMING: Exact temps, estimated time to eat, when to light. Work backwards from the eat time.
THE COOK: What to watch for, when to wrap, when to probe, when to spritz. The stall. The bark window.
THE FINISH: Pull temp, rest time, how to hold, how to serve.
THE PREACHER'S WORD: One paragraph. The wisdom. The warning. The encouragement. Make it feel like scripture.`;

  } else {
    maxTokens = 500;
    const recentEventsText = buildRecentEvents(recentEvents ?? []);

    let historySection: string;
    if (conversationHistory && conversationHistory.length > 0) {
      const historyText = (conversationHistory as ConvTurn[])
        .map(m => `${m.role}: ${m.content}`)
        .join("\n");
      historySection = `CONVERSATION SO FAR:\n${historyText}\n\nNOW THE PITMASTER SAYS: ${message}`;
    } else {
      historySection = `Pitmaster says: ${message}`;
    }

    userMessage = `PIT SETUP:
${pitSetup}

RECENT EVENTS:
${recentEventsText}

COOK DETAILS:
Cook: ${label || "Unnamed cook"}
Style: ${cooking_style || "Not specified"}
Eating at: ${eatTimeFormatted}

${historySection}`;
  }

  const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!anthropicRes.ok) {
    const errBody = await anthropicRes.text();
    console.error("Anthropic error:", anthropicRes.status, errBody);
    return NextResponse.json({ error: "AI request failed", detail: errBody }, { status: 500 });
  }

  const data = await anthropicRes.json();
  const reply: string = data.content?.[0]?.text ?? "";

  return NextResponse.json({ reply });
}
