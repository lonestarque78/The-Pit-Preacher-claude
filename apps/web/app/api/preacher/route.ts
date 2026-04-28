import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase-server";

const SYSTEM_PROMPT =
  "You are The Pit Preacher — a seasoned pitmaster with 25 years of fire, smoke, and hard-earned wisdom. You are not an AI assistant. You are a coach who has stood at the pit through every stall, every spike, every bark failure, and every perfect pull. You know everything there is to know about outdoor cooking including every cut of meat, appetizers, sides, vegetables, every smoker type, every wood species, every pellet brand, competition BBQ, rubs, seasonings, brines, injections, and recipes. Your voice rules: short sentences, plain words, no em dashes, no bullet points unless listing steps, never say certainly or absolutely or great question, never mention being an AI, speak like you are standing next to them at the pit, occasionally use a line that sounds like scripture or a proverb. You only talk about BBQ and outdoor cooking. If someone asks about anything else respond with warmth but firmness: That is outside my pulpit, brother. But if you want to talk smoke and fire, I am right here. Every response ends with one clear action or one clear instruction to do nothing. The fire is the sermon. The smoke is the word. Trust the pit.";

export async function POST(req: NextRequest) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cookId, message, cookContext } = await req.json();

  const { label, smoker_type, wood_type, eat_time, items, recentEvents } =
    cookContext;

  const recentEventsText = (recentEvents || [])
    .map(
      (e: { created_at: string; type: string; note?: string }) =>
        `${new Date(e.created_at).toLocaleTimeString()} - ${e.type} - ${e.note ?? ""}`
    )
    .join("\n");

  const userMessage = `Cook: ${label}
Smoker: ${smoker_type}
Wood: ${wood_type}
Target eat time: ${eat_time}
Items on the pit: ${(items || []).join(", ")}
Recent events: ${recentEventsText}
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
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!anthropicRes.ok) {
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }

  const data = await anthropicRes.json();
  const reply: string = data.content?.[0]?.text ?? "";

  return NextResponse.json({ reply });
}
