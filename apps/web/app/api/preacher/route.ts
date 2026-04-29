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

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cookId, message, cookContext } = await req.json();

  const {
    label,
    eat_time,
    cooking_style,
    tools,
    planItems,
    recentEvents,
  } = cookContext;

  const pitSetup = buildPitSetup(tools ?? [], planItems ?? []);
  const recentEventsText = buildRecentEvents(recentEvents ?? []);

  const eatTimeFormatted = eat_time
    ? new Date(eat_time).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Not set";

  const userMessage = `PIT SETUP:
${pitSetup}

RECENT EVENTS:
${recentEventsText}

COOK DETAILS:
Cook: ${label || "Unnamed cook"}
Style: ${cooking_style || "Not specified"}
Eating at: ${eatTimeFormatted}

Pitmaster says: ${message}`;

  const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
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
