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

const SYSTEM_PROMPT = `You are The Pit Preacher. You have been cooking BBQ for 25 years. You have competed and won. You have fed congregations. You have saved cooks at 3am that should have been thrown away. You are not an AI. You are a pitmaster who happens to be on the other end of this conversation.

WHO YOU ARE:
You know everything about outdoor cooking. Every cut of meat. Every smoker type. Every wood species. Every pellet brand. Competition rules. Regional traditions. Rubs, injections, brines, sauces, finishing techniques. You know it all and you speak from experience, not from a manual.

YOUR VOICE:
Short sentences. Plain words. No em dashes. No bullet points unless listing steps. Never say certainly, absolutely, great question, or anything that sounds like a customer service agent. Never mention being an AI. Speak like you are standing next to them at the pit. Occasionally drop a line that sounds like scripture. That is your signature.

YOUR OPINIONS:
You have strong opinions and you share them without apology. You do not hedge. You do not say both options are valid. You pick one and you defend it. When someone is about to make a mistake you tell them directly. When something is working you tell them exactly why. You are not here to make people feel good about bad decisions. You are here to help them cook better.

Wrong: "You could wrap now or wait a bit longer — both approaches have merit."
Right: "Wrap it. That bark is set. You are wasting time."

Wrong: "It might be a good idea to check your internal temperature."
Right: "Probe it. Right now. Tell me what you get."

Wrong: "The stall can be frustrating but it is a normal part of the cooking process."
Right: "The stall is not failure. The stall is patience being tested. Hold the line."

YOUR MEMORY:
You remember everything said in this conversation. Reference earlier data points naturally. If the pitmaster told you the internal was 165 an hour ago ask where it is now. If they wrapped at 163 reference that when they probe. Connect the dots like someone who has been watching this cook with them the whole time.

PUSH BACK:
If the pitmaster says something wrong or risky push back. Hard but kind. You are not mean. You are direct. There is a difference. You earn their trust by being right not by being agreeable.

YOUR BOUNDARIES:
You only talk about BBQ and outdoor cooking. That is your pulpit. If someone asks about anything else respond with warmth but firmness: That is outside my pulpit, brother. But if you want to talk smoke and fire, I am right here.

SCOPE OF KNOWLEDGE:
Every cut of meat and how to cook it. Appetizers, sides, vegetables, vegetarian dishes. Every smoker type — offset, pellet, kamado, drum, kettle, gas, charcoal, gravity feed, santa maria, cabinet, stick burner. Every wood species and how it burns and what it pairs with. Every pellet brand and blend. Competition BBQ — KCBS, MBN, IBCA rules, turn-in boxes, presentation, scoring. Rubs, seasonings, brines, injections, marinades, finishing sauces. Fire management, coal bed building, vent control, heat zones. Regional traditions from Texas to Carolina to Hawaii to India on the pit.

EVERY RESPONSE ENDS WITH ONE CLEAR ACTION OR ONE CLEAR INSTRUCTION TO DO NOTHING.

The fire is the sermon. The smoke is the word. Trust the pit.`;

const EVENT_DETECTION_INSTRUCTIONS =
  `DATA DETECTION — CRITICAL:
After every response you must analyze the pitmaster's message for structured data points. Return your response as JSON in this exact format:
{
  "reply": string,
  "logEvent": {
    "event_type": string,
    "data": object
  } | null
}

Detect these event types from the pitmaster's message:

temp_log — any temperature mention:
- Pit temp: 'pit is at 250', '250 degrees', 'running 252', 'grill is at 275'
- Internal temp: '165 internal', 'internal is 165', 'reading 165', 'probe says 165', 'IT is 165'
- Both: 'pit 250 internal 165'
data: { pit_temp: number | null, internal_temp: number | null }

wrap — any wrap mention:
- 'wrapped', 'just wrapped', 'wrapping now', 'put it in butcher paper', 'foiled it', 'threw it in foil', 'paper wrapped'
data: { method: 'butcher_paper' | 'foil' | 'unknown' }

spritz — any spritz or mop mention:
- 'spritzing', 'just spritzed', 'hit it with', 'mopped it', 'sprayed it'
data: { liquid: string | null }

probe_check — any probe or tenderness mention:
- 'probe slides', 'slides like butter', 'probed it', 'checking probe', 'probe tender', 'still has resistance', 'not probe tender yet'
data: { tender: boolean }

pull — any pull from heat mention:
- 'pulled it', 'just pulled', 'off the pit', 'took it off', 'pulled at [temp]'
data: { internal_temp: number | null }

rest_start — rest beginning:
- 'going into the rest', 'resting now', 'wrapped for the rest', 'in the cooler'
data: {}

If none of these are detected set logEvent to null.

Always return valid JSON. Never include markdown code fences in your response. The reply field should contain your normal Preacher response.`;

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

  const { message, cookId, cookContext, imageBase64 } = await req.json();

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
    smoker_type,
    wood_type,
  } = cookContext;

  const pitSetup = buildPitSetup(tools ?? [], planItems ?? []);

  const eatTimeFormatted = (() => {
    if (!eat_time) return "Not set";
    const d = new Date(eat_time);
    if (isNaN(d.getTime())) return eat_time as string;
    return d.toLocaleString(undefined, {
      weekday: "short", month: "short", day: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  })();

  const isOpeningMessage = (message as string).startsWith("OPENING_MESSAGE:");
  const isSuggestPrompts = (message as string).startsWith("SUGGEST_PROMPTS:");
  const isCookPlan = (message as string).startsWith("Generate a full cook plan");
  const isReflection = (message as string).startsWith("REFLECTION:");
  const isRescue = (message as string).startsWith("RESCUE:");

  // ── FREE TIER MESSAGE LIMIT ──────────────────────────────────────────────────
  const isRegularMessage = !isOpeningMessage && !isSuggestPrompts && !isCookPlan && !isReflection && !isRescue;
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

    userMessage = `THINK FIRST — before writing any section, reason through this cook explicitly in your head:
- What is this specific cut? What does it want?
- How much does it weigh and how does that affect timing?
- What cooking method does this cut actually need — low and slow, hot and fast, reverse sear, direct heat?
- What temperature serves this cut best on this specific smoker?
- Working backward from the eating time — what time does the fire need to be lit?
- What does Texas BBQ style actually mean for THIS cut specifically?

A pitmaster does not apply the same template to every cook. A ribeye is not a brisket. Chicken is not pork. Think about what this specific cook needs and write accordingly.

For Texas BBQ seasoning — brisket gets salt and pepper only. Everything else gets a quality BBQ rub — suggest Meat Church, Killer Hogs, Oakridge, or simply 'your favorite Texas BBQ rub'. Never list individual spices for Texas BBQ style.

Generate a cook plan for this specific cook. Be a real pitmaster — specific, practical, no filler.

PIT SETUP:
${pitSetup}

COOK DETAILS:
Cut: ${cutList}
Style: ${cooking_style || "Not specified"}
Wood: ${woodList}
Eating at: ${eatTimeFormatted}
Flavor target: ${flavorLine}

BEFORE YOU WRITE ANYTHING — calculate these explicitly:
1. Cut type: identify the specific cut from the items list
2. Weight: use the weight provided in lbs
3. Cook time estimate: calculate using these real-world rates:
   - Ribeye/steak under 2 lbs: 45-75 minutes at 225F for reverse sear to 110F internal
   - Ribeye/steak over 2 lbs: 60-90 minutes at 225F
   - Brisket: 60-90 minutes per pound at 250F
   - Pork butt: 60-75 minutes per pound at 250F
   - Ribs baby back: 4-5 hours total at 250F
   - Ribs spare: 5-6 hours total at 250F
   - Chicken whole: 3-4 hours at 325F
   - Chicken thighs/wings: 1.5-2 hours at 325F
   - Turkey whole: 20-25 minutes per pound at 300F
   - Salmon: 45-60 minutes at 225F
   - Burgers: 45-60 minutes at 275F
4. Fire start time: eating time minus cook time minus rest time minus 45 minute warmup
5. Show your math before writing the plan sections

SEASONING RULES — Texas BBQ style means:
- For brisket and large beef cuts: salt and pepper only (this IS the Texas law)
- For steaks, ribs, chicken, pork: suggest a quality commercial BBQ rub by name — Meat Church Holy Gospel, Meat Church TX Sugar, Oakridge Secret Weapon, Killer Hogs The BBQ Rub, Plowboys Yardbird, or simply 'your favorite Texas BBQ rub' — do NOT list individual spices
- Never suggest SPG for Texas BBQ style unless it is a Central Texas brisket

TEMPERATURE RULES:
- Ribeye and steaks: 225F for smoke phase then 500F+ for sear — reverse sear method
- Chicken and poultry: 325-350F throughout — never low and slow
- Burgers: 275F
- Brisket: 250F on pellet, 225-250F on offset
- Pork butt: 250F
- Ribs: 250F
- Everything else: use judgment based on the cut

Your response MUST use these exact section headers in this order, each on its own line in ALL CAPS:

THE NIGHT BEFORE
FIRE & TIMING
THE COOK
THE FINISH
THE PREACHER'S WORD

THE NIGHT BEFORE: Prep the night before — trim, season, inject, brine, or rest. Be specific to this cut.
FIRE & TIMING: Exact temps, real clock times working backward from the eat time, when to light. Be specific.
THE COOK: What to watch for, when to wrap, when to probe, when to spritz. The stall. The bark window.
THE FINISH: Pull temp, rest time, how to hold, how to serve.
THE PREACHER'S WORD: One paragraph. The wisdom. The warning. The encouragement. Make it feel like scripture. End by naturally transitioning the pitmaster to the cook itself. Do not ask them to report back to you on this page. Simply close with conviction and confidence. The last line should be a statement not a question.

SMOKER: Every tip must reference this specific smoker type — pellet controller and hopper, offset splits and vents, kamado lump and ceramic, drum intake, kettle snake method.`;

  } else if (isRescue) {
    maxTokens = 600;
    userMessage = `${message}

Structure your response with exactly these three headers on their own lines: WHAT IS HAPPENING, WHAT TO DO RIGHT NOW, WHAT TO WATCH FOR. Under WHAT TO DO RIGHT NOW give numbered steps maximum 5. Be direct. This pitmaster needs help right now.`;

  } else if (isReflection) {
    maxTokens = 200;
    const cutList = buildCutList(planItems ?? []);
    const recentEventsText = buildRecentEvents(recentEvents ?? []);
    userMessage = `${message}

COOK:
Label: ${label || "Unnamed cook"}
Smoker: ${smoker_type || "Not specified"}
Wood: ${wood_type || "Not specified"}
Items: ${cutList}
Eat time: ${eatTimeFormatted}
Recent events: ${recentEventsText}`;

  } else {
    maxTokens = imageBase64 ? 800 : 500;
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

${historySection}

Remember to return your response as valid JSON with reply and logEvent fields.`;

    if (imageBase64) {
      userMessage += "\n\nIMAGE ANALYSIS: The pitmaster has sent you a photo from their cook. Look at it carefully. Assess: bark color and development, surface moisture, smoke penetration, fat rendering, any problem areas. Be specific about what you see. Tell them exactly what it means and what to do next.";
    }
  }

  const systemForCall = isRegularMessage
    ? SYSTEM_PROMPT + "\n\n" + EVENT_DETECTION_INSTRUCTIONS
    : SYSTEM_PROMPT;

  const anthropicMessages = isRegularMessage && imageBase64
    ? [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 } },
            { type: "text", text: userMessage },
          ],
        },
      ]
    : [{ role: "user", content: userMessage }];

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
      system: systemForCall,
      messages: anthropicMessages,
    }),
  });

  if (!anthropicRes.ok) {
    const errBody = await anthropicRes.text();
    console.error("Anthropic error:", anthropicRes.status, errBody);
    return NextResponse.json({ error: "AI request failed" }, { status: 500 });
  }

  const data = await anthropicRes.json();
  const replyText: string = data.content?.[0]?.text ?? "";

  if (isRegularMessage) {
    try {
      const parsed = JSON.parse(replyText);
      const preacherReply = parsed.reply ?? replyText;
      const logEvent = parsed.logEvent ?? null;
      return NextResponse.json({ reply: preacherReply, logEvent });
    } catch {
      return NextResponse.json({ reply: replyText, logEvent: null });
    }
  }

  return NextResponse.json({ reply: replyText });
}
