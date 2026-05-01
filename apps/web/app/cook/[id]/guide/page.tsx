"use client";

import { use, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

type PlanTool = { id: string; name: string; wood: string };
type PlanItem = {
  name: string;
  category?: string;
  quantity?: number;
  weight?: string | number | null;
  notes?: string;
  smokerId?: string | null;
};
type DisplayItem = {
  key: string;
  name: string;
  category: "beef" | "pork" | "poultry" | "other";
  defaultWeight: string;
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

function detectSmokerType(cook: any): "pellet" | "offset" | "kamado" | "drum" | "kettle" | "other" {
  const sources = [
    cook?.smoker_type ?? "",
    cook?.plan?.tools?.[0]?.name ?? "",
    ...(cook?.plan?.tools ?? []).map((t: any) => t.name ?? ""),
  ].join(" ").toLowerCase();

  if (sources.match(/pellet|traeger|smokefire|smoke fire|recteq|rec tec|pit boss|camp chef|gmg|green mountain|louisiana|weber smokefire/)) return "pellet";
  if (sources.match(/offset|stick burner|stick-burner|lang|ole hickory|yoder|longhorn|brazos|pecos|highland/)) return "offset";
  if (sources.match(/kamado|big green egg|bge|akorn|primo|vision|ceramic/)) return "kamado";
  if (sources.match(/drum|ugly drum|uds/)) return "drum";
  if (sources.match(/kettle|weber kettle|performer/)) return "kettle";
  return "other";
}

function getWoodProfile(wood: string): string {
  const w = (wood || "").toLowerCase().trim();
  if (w.includes("post oak")) return "Clean, medium smoke. The backbone of Texas BBQ.";
  if (w.includes("hickory") && w.includes("oak")) return "Best of both worlds. Bold flavor with clean finish.";
  if (w.includes("competition")) return "Engineered for bark and color. Trust the blend.";
  if (w.includes("hickory")) return "Strong and bold. Pairs with pork and beef. Easy to over-smoke.";
  if (w.includes("mesquite")) return "Intense and fast-burning. Use sparingly. West Texas tradition.";
  if (w.includes("apple")) return "Mild and sweet. Perfect for poultry and pork. Patient wood.";
  if (w.includes("cherry")) return "Fruity and rich. Beautiful color on the bark. Mixes well.";
  if (w.includes("pecan")) return "Nutty and mild. A Texas staple. Forgiving on long cooks.";
  if (w.includes("maple")) return "Subtle sweetness. Great for poultry and ham.";
  return "Know your wood. Every species burns different.";
}

function inferStyleId(cookingStyle: string): string {
  const s = (cookingStyle || "").toLowerCase();
  if (s.includes("texas")) return "texas";
  if (s.includes("kansas") || s.includes("kc")) return "kansas_city";
  if (s.includes("memphis")) return "memphis";
  if (s.includes("carolina")) return "carolina";
  if (s.includes("competition")) return "competition";
  if (s.includes("backyard")) return "backyard";
  return "texas";
}

function inferCategory(name: string, category?: string): "beef" | "pork" | "poultry" | "other" {
  const c = (category || "").toLowerCase();
  if (c === "beef" || c.startsWith("beef")) return "beef";
  if (c === "pork" || c.startsWith("pork")) return "pork";
  if (c === "poultry" || c.startsWith("poultry") || c.includes("chicken") || c.includes("turkey")) return "poultry";
  const n = name.toLowerCase();
  if (/\b(brisket|beef|ribeye|chuck|prime rib|short rib|tri.?tip|wagyu|sirloin|flank|skirt)\b/.test(n)) return "beef";
  if (/\b(pork|butt|shoulder|spare rib|baby back|belly|ham|bacon|sausage|\brib\b)\b/.test(n)) return "pork";
  if (/\b(chicken|turkey|duck|quail|wing|breast|thigh|drumstick|cornish)\b/.test(n)) return "poultry";
  return "other";
}

function shouldShowSeasoningForItem(itemName: string): boolean {
  const name = itemName.toLowerCase();
  if (name.includes("cobbler") || name.includes("brownie") || name.includes("peach") ||
      name.includes("banana") || name.includes("bread pudding") || name.includes("pineapple") ||
      name.includes("grilled pineapple")) return false;
  if (name.includes("mac and cheese") || name.includes("baked beans") || name.includes("cream corn") ||
      name.includes("cornbread") || name.includes("queso") || name.includes("pinquito") ||
      name.includes("collard") || name.includes("brussels") || name.includes("asparagus")) return false;
  return true;
}

function buildDisplayItems(planItems: PlanItem[], cookItems: any[]): DisplayItem[] {
  if (planItems.length > 0) {
    return planItems.map((item, idx) => ({
      key: `${item.name}-${idx}`,
      name: item.name,
      category: inferCategory(item.name, item.category),
      defaultWeight: item.weight != null ? String(item.weight) : "",
    }));
  }
  return cookItems.map((item: any, idx: number) => ({
    key: `${item.name}-${idx}`,
    name: item.name,
    category: inferCategory(item.name),
    defaultWeight: "",
  }));
}

function getTroubleCards(smokerType: string): { title: string; fix: string }[] {
  if (smokerType === "pellet") return [
    { title: "Temperature is running too high", fix: "Lower your set temperature on the controller by 10-15 degrees. Do not open the lid. Give the grill 10 minutes to respond. If it keeps spiking, check for a grease fire in the drip pan — clear it out." },
    { title: "Temperature is running too low", fix: "Check your hopper — you may be running low on pellets. Check that the auger is feeding correctly. If the firepot has gone cold, you may need to run the shutdown cycle and restart." },
    { title: "Dirty or excessive smoke", fix: "Pellet grills rarely produce bad smoke unless the firepot is dirty. Check for excess ash or old pellets in the firepot. Run a startup cycle and let the smoke clear before loading meat." },
    { title: "Temperature keeps spiking and dropping", fix: "This usually means a dirty firepot or low-quality pellets. Clean the firepot between cooks. Switch to a premium pellet brand. Do not keep adjusting the controller — let it find its rhythm." },
  ];
  if (smokerType === "offset") return [
    { title: "Fire running too hot", fix: "Close your intake vent slightly. Do not close the exhaust. Add a smaller split next time. Give the fire 15 minutes to respond before adjusting again." },
    { title: "Fire running too cold", fix: "Open your intake wider. You may need to add a split. Check the exhaust is fully open. If the coal bed is weak, add a fresh split and let it fully catch before closing down." },
    { title: "White or dirty smoke", fix: "Your wood is not combusting cleanly. Open all vents fully and let the fire build heat. Do not load meat until you see thin blue smoke coming from the stack. Thick white smoke will make your meat bitter." },
    { title: "Temperature keeps swinging", fix: "Stop chasing it. Pick a vent position and hold it for 20 minutes. Offset pits take time to stabilize. Add splits before the temperature drops — not after." },
  ];
  if (smokerType === "kamado") return [
    { title: "Temperature is running too high", fix: "Close your bottom vent incrementally — even a quarter inch change matters on a kamado. Give it 10-15 minutes before touching it again. Do not open the dome. Heat trapped in the ceramic walls takes time to bleed off." },
    { title: "Temperature is running too low", fix: "Open your bottom vent slightly. Check that the top vent is open. Make sure you have enough lit charcoal in the basket — a kamado needs a solid coal bed to maintain temperature." },
    { title: "Thick or acrid smoke", fix: "Let the fire establish longer before loading meat. Open both vents fully until the smoke clears and thins. White smoke from a kamado often means the wood was added before the charcoal was fully lit." },
    { title: "Temperature will not stabilize", fix: "You may have adjusted the vents too many times. Close both vents fully for 2-3 minutes to choke the fire down, then reopen to your target setting and wait 15 minutes without touching anything." },
  ];
  if (smokerType === "drum") return [
    { title: "Temperature is running too hot", fix: "Close your intake vents down — a UDS runs hot by nature. Quarter inch of intake is often more than enough. Seal any air leaks around the lid. Do not remove the lid to check — that will spike your temps further." },
    { title: "Temperature is running too low", fix: "Open your intakes slightly. Make sure your lid is seated properly. Check that you have enough lit charcoal in the basket — drum smokers need a good coal bed to hold temperature." },
    { title: "Smoke coming from the lid or seams", fix: "Your lid seal is letting air in, which disrupts your draft. Press the lid down firmly or add a gasket if it is a persistent problem. Control all airflow through the intake vents." },
    { title: "Temperature keeps spiking", fix: "You opened the lid. A drum holds and spikes easily when exposed to fresh air. Next time, resist the urge. If you must check, do it fast and seal it back immediately. Small adjustments only — the drum amplifies every change." },
  ];
  if (smokerType === "kettle") return [
    { title: "Snake is burning too fast", fix: "Close your bottom vent down to about 1/4 open. Make sure your top vent is positioned over the meat, not the coals. The snake should burn slowly from one end — if it is burning across the middle you may have placed the charcoal too close together." },
    { title: "Temperature is dropping too fast", fix: "The snake may have gone out or the briquettes were not fully lit. Check that the end of the snake is actively burning. Add 5-6 pre-lit briquettes from a chimney directly to the burning end to reestablish the fire." },
    { title: "Dirty or thick smoke", fix: "Make sure the briquettes are fully white before closing the lid. Charcoal that is still lighting produces thick dirty smoke. Wait until the snake end is glowing and producing thin smoke before loading meat." },
    { title: "Temperature running hot", fix: "Close the bottom vent further. Reposition your top vent fully over the meat side — this pulls the heat and smoke across the meat and out, rather than circulating back over the coals. A kettle at 250°F needs very little intake air." },
  ];
  return [
    { title: "Fire running too hot", fix: "Close your intake vents in small increments. Do not close the exhaust. Give it 10 minutes before adjusting again. If you have a water pan, add cold water. Do not open the lid — you will feed the fire." },
    { title: "Fire running too cold", fix: "Open your intake vents wider. Check your fuel — you may need to add a split or stoke the coals. Make sure your exhaust is fully open." },
    { title: "Dirty smoke (thick white or gray)", fix: "Your wood is not combusting cleanly. Open the exhaust fully. Add more heat to get the wood burning properly. Do not load meat until you see thin blue smoke. Thick smoke will make your meat bitter." },
    { title: "Temperature keeps spiking and dropping", fix: "Stop adjusting. Pick a vent position and hold it for 20 minutes. Every pit needs time to stabilize — chasing temperature is the most common mistake." },
  ];
}

const FIRE_STEPS: Record<string, string[]> = {
  pellet: [
    "Fill the hopper completely before starting — check the level",
    "Run the startup cycle and allow the grill to reach set temperature",
    "Let it stabilize for 15 minutes at temperature before loading meat",
    "Check hopper level every 3-4 hours on long cooks — running dry mid-cook is unrecoverable",
    "Trust the controller — resist adjusting temperature constantly",
    "Keep the grill area clear of debris for consistent airflow around the firepot",
  ],
  offset: [
    "Build a small starter fire with kindling and one split — establish before adding cook wood",
    "Let the fire breathe fully open until you have a clean coal bed",
    "Target 250°F in the cook chamber before loading any meat",
    "Add one split every 45-60 minutes to maintain temperature",
    "Watch the stack — thin blue smoke is the goal, white smoke means the fire needs more heat",
    "Keep the intake vent 75% open and the exhaust fully open at all times",
  ],
  kamado: [
    "Light a small amount of lump charcoal in the center of the basket",
    "Open top and bottom vents fully until temperature begins to climb",
    "Begin closing vents gradually as you approach your target temperature",
    "Final setting: bottom vent cracked 1/4 inch, top vent barely open",
    "Kamado holds heat exceptionally well — make only small vent adjustments",
    "Add wood chunks (not chips) directly on the coals before loading meat",
  ],
  drum: [
    "Fill the charcoal basket 3/4 full with lump charcoal or briquettes",
    "Light one corner using a chimney starter — do not use lighter fluid",
    "Install the drum with all intakes open until temperature begins climbing",
    "Close intakes to about 1/4 open as you approach 250°F",
    "Add wood chunks on top of the lit coals before loading meat",
    "Drum runs hot — watch your intakes carefully, small adjustments only",
  ],
  kettle: [
    "Use the snake method for low and slow cooks — briquettes in a C shape around the outer edge",
    "Light 10-15 briquettes in a chimney and place at one end of the snake",
    "Add 3-4 wood chunks spaced along the snake for smoke throughout the cook",
    "Set up for indirect cooking — meat away from the coals",
    "Top vent positioned over the meat, half open. Bottom vent quarter open.",
    "The snake gives you 6-8 hours of consistent heat — set it and trust it",
  ],
  other: [
    "Establish your fire fully before loading any meat",
    "Stabilize at your target temperature for at least 20 minutes",
    "Thin blue smoke means clean combustion — wait for it before loading",
    "Add fuel before your temperature drops, not after it already has",
    "Every pit is different — take notes on your first few cooks to learn its behavior",
  ],
};

const RUB_PROFILES: Record<string, Record<string, string>> = {
  texas: {
    beef:    "Salt, coarse black pepper, garlic powder, onion powder, smoked paprika, a pinch of cayenne. Bold but balanced. This is Texas BBQ.",
    pork:    "Brown sugar, paprika, salt, pepper, garlic, onion, cayenne. Built for bark and flavor.",
    poultry: "Paprika, garlic, onion, salt, pepper, a touch of brown sugar for color.",
    other:   "Salt, pepper, paprika, garlic, onion. The Texas all-purpose foundation.",
  },
  kansas_city: {
    beef:    "Brown sugar, paprika, salt, pepper, garlic, onion, cayenne. Sweet and bold.",
    pork:    "Heavy on the brown sugar and paprika. The sauce will finish the flavor story.",
    poultry: "Brown sugar, paprika, garlic, onion, a pinch of cayenne.",
    other:   "KC style welcomes sweetness. Brown sugar and paprika on almost anything.",
  },
  memphis: {
    beef:    "Paprika, salt, pepper, garlic, onion, celery salt, dry mustard.",
    pork:    "The classic Memphis dry rub is the star. Paprika, salt, pepper, garlic, onion, celery salt, dry mustard, cayenne. No sauce.",
    poultry: "Paprika, garlic, onion, celery salt, a touch of cayenne.",
    other:   "Memphis leans on paprika and celery salt. Build from there.",
  },
  carolina: {
    beef:    "Simple salt and pepper with a touch of red pepper flake.",
    pork:    "Whole hog tradition. Vinegar and pepper. The sauce is the seasoning.",
    poultry: "Salt, pepper, garlic, paprika. Keep it light.",
    other:   "Salt, pepper, red pepper. Let the sauce tell the story.",
  },
  backyard: {
    beef:    "Salt, pepper, garlic powder, onion powder, smoked paprika. The all-purpose beef rub.",
    pork:    "Brown sugar, paprika, salt, pepper, garlic, onion, cayenne. Crowd pleaser every time.",
    poultry: "Butter under the skin. Salt, pepper, garlic powder, onion powder on top.",
    other:   "Season with confidence. Salt first, then build flavor.",
  },
  competition: {
    beef:    "Salt, pepper, garlic. Clean and precise. Let the technique win the box.",
    pork:    "Brown sugar base, paprika, salt, pepper, garlic, onion, a hint of cayenne. Built for the judges.",
    poultry: "Butter injection, then salt, pepper, garlic, onion, a touch of brown sugar for color.",
    other:   "Every detail matters. Season evenly and let it set.",
  },
};

function getRubProfile(styleId: string, category: string): string {
  return RUB_PROFILES[styleId]?.[category] ?? RUB_PROFILES["backyard"]?.[category] ?? "";
}

const BINDERS: Record<string, string> = {
  beef:    "Yellow mustard or olive oil. Mustard burns off clean.",
  pork:    "Yellow mustard or hot sauce. Hot sauce adds a subtle layer.",
  poultry: "Olive oil or melted butter. Butter adds richness.",
  other:   "Olive oil works on everything.",
};

const SALT_RATIOS: Record<string, number> = {
  beef:    0.0075,
  pork:    0.005,
  poultry: 0.004,
  other:   0.005,
};

const SALT_RATIO_LABEL: Record<string, string> = {
  beef:    "0.75% of meat weight",
  pork:    "0.5% of meat weight",
  poultry: "0.4% of meat weight",
  other:   "0.5% of meat weight",
};

const TIMING_STEPS = [
  "Apply binder 30 minutes before seasoning",
  "Season the night before for deep bark penetration",
  "Or season 1 hour before if cooking same day",
  "Let the rub sweat in — do not wrap immediately after seasoning",
];

const STYLE_PHILOSOPHY: Record<string, string> = {
  texas:       "Salt and pepper. Let the smoke and the beef tell the story.",
  kansas_city: "Sweet and bold. Brown sugar and paprika build the foundation.",
  memphis:     "Complex spice blends. Dry or wet — the rub is everything.",
  carolina:    "Simple seasoning. The sauce and the smoke carry the weight.",
  backyard:    "No rules. Season with confidence and cook with pride.",
  competition: "Every detail matters. Season evenly and let it penetrate.",
};

const REGIONAL_NOTES: Record<string, string> = {
  texas:       "In Texas the rub is not the star. The beef is the star. Salt and pepper in equal parts by weight — coarse black pepper, kosher salt. That is the law in Central Texas and it is the law for good reason. Let the Post Oak smoke and the quality of the beef do the work. Anything more is an insult to the cow.",
  kansas_city: "Kansas City does not apologize for sweetness. Brown sugar, paprika, garlic, onion, a kiss of cayenne — that is the KC foundation. The rub builds the crust and the sauce finishes the story. Do not skimp on either.",
  memphis:     "Memphis is about complexity in the rub because in Memphis the rub is the sauce. Paprika, salt, pepper, garlic, onion, celery salt, dry mustard, a touch of cayenne. Layers of flavor that build over hours of smoke. When someone says they want it wet — sauce goes on at the end, not before.",
  carolina:    "Carolina keeps it simple because the vinegar does the heavy lifting. A light hand on the seasoning lets the smoke and the sauce speak. East Carolina wants vinegar and pepper. West Carolina adds a little tomato. South Carolina reaches for the mustard. Know your region and honor it.",
  backyard:    "The backyard has no rules and that is its greatest gift. Season with conviction. Taste as you go. Learn what your family loves and cook it better every time. There is no wrong answer when the people you love are eating well.",
  competition: "In competition the rub is a weapon. Every gram of salt, every pinch of sugar is a calculated decision. Season evenly — use your hands and feel for dry spots. Let it penetrate overnight if the rules allow. The judges see the box for 30 seconds. Make every detail count.",
};

const SMOKER_NOTES: Record<string, string> = {
  pellet:  "The Smokefire and pellet grills like it are forgiving but they will lie to you about smoke. That thin blue wisp you want is there — you just cannot see it the way you can on an offset. Trust the controller, trust the holler, and let the wood do its work. Check your hopper every few hours and do not let it run dry mid-cook.",
  offset:  "An offset is a conversation between you and the fire. Every split you add is a word. Learn to read the smoke coming out of that stack — thin and blue means you are speaking the right language. White and billowy means start over with a cleaner fire before that meat absorbs anything ugly.",
  kamado:  "The kamado is the most forgiving pit ever built by human hands. Once it is up to temp it wants to stay there. Small adjustments only — that bottom vent is more powerful than it looks. Give every adjustment 10 minutes to show its effect before you touch it again.",
  drum:    "The drum runs hot and it will humble you if you are not paying attention. Keep that intake cracked — a quarter inch is more than you think. The beauty of the drum is it runs itself once dialed in. Get it to temp and leave it alone.",
  kettle:  "The kettle is the most underestimated pit in the backyard. The snake method gives you 6 to 8 hours of consistent heat from a bag of briquettes. Set it and let it work. Keep that top vent positioned over the meat and the bottom vent barely cracked.",
  other:   "Know your pit before you trust your pit. Every fire burns different and every cooker has its quirks. Take notes on your first few cooks — your own data is worth more than any advice.",
};

const SMOKER_TEMP_RANGES: Record<string, string> = {
  pellet: "225–275°F",
  offset: "225–275°F",
  kamado: "225–275°F",
  drum:   "225–260°F",
  kettle: "225–250°F",
  other:  "225–275°F",
};

const cardStyle: React.CSSProperties = {
  background: "var(--color-bg-alt)",
  border: "1px solid rgba(201,151,58,0.15)",
  borderRadius: "var(--radius-lg)",
  padding: "var(--space-4)",
};

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: "0.75rem",
  color: "#C9973A",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  display: "block",
  marginBottom: "var(--space-2)",
};

const itemLabelStyle: React.CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontSize: "0.78rem",
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  display: "block",
  marginBottom: "var(--space-1)",
};

export default function GuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: cookId } = use(params);
  const supabase = createClient();

  const [cook, setCook] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"fire" | "seasoning">("fire");
  const [openTroubleCard, setOpenTroubleCard] = useState<number | null>(null);
  const [weightInputs, setWeightInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/auth/login"; return; }

      const { data: cookData } = await supabase
        .from("cooks").select("*").eq("id", cookId).eq("user_id", user.id).single();
      if (!cookData) { setLoading(false); return; }
      setCook(cookData);

      const { data: itemsData } = await supabase
        .from("cook_items").select("*").eq("cook_id", cookId);
      setItems(itemsData || []);

      if (cookData.prep_session_id) {
        const { data: sessionData } = await supabase
          .from("meal_prep_sessions").select("*").eq("id", cookData.prep_session_id).single();
        if (sessionData) setSession(sessionData);
      }

      setLoading(false);
    };
    load();
  }, [cookId]);

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
        <Link href="/dashboard" style={{ color: "var(--color-accent)", fontFamily: "var(--font-body)" }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const plan = cook.plan as any;
  const planTools: PlanTool[] = plan?.tools ?? [];
  const planItems: PlanItem[] = plan?.items ?? [];

  const activeTool = planTools[0] ?? null;
  const smokerName = activeTool?.name || cook.smoker_type || "Smoker";
  const woodType = activeTool?.wood || cook.wood_type || "";
  const smokerType = detectSmokerType(cook);
  const fireSteps = FIRE_STEPS[smokerType] ?? FIRE_STEPS.other ?? [];
  const woodProfile = woodType ? getWoodProfile(woodType) : "";
  const troubleCards = getTroubleCards(smokerType);

  const styleId = inferStyleId(cook.cooking_style);
  const displayItems = buildDisplayItems(planItems, items);

  const smokerSubtitle = [
    planTools.map((t: PlanTool) => t.name).filter(Boolean).join(", ") || cook.smoker_type || null,
    planTools.map((t: PlanTool) => t.wood).filter(Boolean).join(", ") || cook.wood_type || null,
    cook.eat_time ? formatDateTime(cook.eat_time) : null,
  ].filter(Boolean).join(" · ");

  const flavorSmoke = session?.flavor_smoke;
  const flavorBark = session?.flavor_bark;
  const flavorTenderness = session?.flavor_tenderness;
  const hasFlavorData = flavorSmoke != null || flavorBark != null || flavorTenderness != null;
  const statusIsCompleted = cook?.status === "completed";

  const NAV_LINKS = [
    { label: "Live Mode", href: `/cook/${cookId}/live` },
    { label: "Timeline",  href: `/cook/${cookId}/timeline` },
    { label: "Guide",     href: `/cook/${cookId}/guide`, active: true },
    { label: "Journal",   href: `/cook/${cookId}/events` },
    { label: "Summary",   href: `/cook/${cookId}/summary` },
  ];

  return (
    <div>
      <style>{`
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
        .cook-nav-btn:hover { border-color: #C9973A; color: #C9973A; }
        .cook-nav-btn-active { border-color: #C9973A !important; color: #C9973A !important; }
        @media (max-width: 767px) {
          .cook-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── BACK TO COOK ── */}
      <Link href={`/cook/${cookId}`} style={{
        display: "block",
        padding: "var(--space-2) var(--space-4) 0 var(--space-4)",
        fontFamily: "var(--font-ui)",
        fontSize: "0.8rem",
        color: "#C9973A",
        textDecoration: "none",
      }}>
        ← Back to Cook
      </Link>

      {/* ── MISSION CARD ── */}
      <div style={{
        background: "var(--color-bg-alt)",
        borderBottom: "1px solid rgba(201,151,58,0.2)",
        padding: "var(--space-3) var(--space-4)",
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

      {/* ── TABS ── */}
      <div style={{
        display: "flex",
        borderBottom: "1px solid rgba(201,151,58,0.2)",
        paddingLeft: "var(--space-4)",
      }}>
        {(["fire", "seasoning"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "var(--space-2) var(--space-4)",
              fontFamily: "var(--font-ui)",
              fontSize: "0.85rem",
              cursor: "pointer",
              background: "transparent",
              border: "none",
              borderBottom: activeTab === tab ? "2px solid #C9973A" : "2px solid transparent",
              color: activeTab === tab ? "#C9973A" : "var(--color-text-muted)",
              marginBottom: "-1px",
              transition: "color 0.12s, border-color 0.12s",
            }}
          >
            {tab === "fire" ? "▲ Fire" : "⊕ Seasoning"}
          </button>
        ))}
      </div>

      {/* ── TWO COLUMN LAYOUT ── */}
      <div
        className="cook-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "3fr 2fr",
          gap: "var(--space-4)",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "var(--space-4) var(--space-4) 80px var(--space-4)",
        }}
      >
        {/* ── LEFT COLUMN ── */}
        <div>
          {activeTab === "fire" ? (
            <div style={cardStyle}>
              <div style={{ ...sectionLabelStyle }}>Fire Setup</div>

              <div style={{
                fontFamily: "var(--font-ui)",
                fontSize: "0.7rem",
                color: "#C9973A",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "var(--space-3)",
              }}>
                {smokerType}
              </div>

              {woodType && (
                <div style={{ marginBottom: "var(--space-4)" }}>
                  <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, color: "var(--color-text)", marginBottom: 4 }}>
                    {woodType}
                  </div>
                  {woodProfile && (
                    <div style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                      {woodProfile}
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
                {fireSteps.map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "var(--space-3)",
                      background: "var(--color-bg)",
                      padding: "var(--space-3)",
                      borderRadius: "var(--radius-md)",
                    }}
                  >
                    <span style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: "1.1rem",
                      fontWeight: "bold" as const,
                      color: "#C9973A",
                      flexShrink: 0,
                      minWidth: "20px",
                      lineHeight: 1.4,
                    }}>
                      {idx + 1}
                    </span>
                    <p style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "0.9rem",
                      color: "var(--color-text)",
                      margin: 0,
                      lineHeight: 1.5,
                    }}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ ...sectionLabelStyle }}>When Things Go Wrong</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                {troubleCards.map((card, idx) => {
                  const isOpen = openTroubleCard === idx;
                  return (
                    <div
                      key={idx}
                      style={{
                        background: "var(--color-bg)",
                        borderRadius: "var(--radius-md)",
                        overflow: "hidden",
                      }}
                    >
                      <button
                        onClick={() => setOpenTroubleCard(isOpen ? null : idx)}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          width: "100%",
                          background: "none",
                          border: "none",
                          padding: "var(--space-3)",
                          cursor: "pointer",
                          textAlign: "left" as const,
                        }}
                      >
                        <span style={{
                          fontFamily: "var(--font-ui)",
                          fontSize: "0.9rem",
                          color: isOpen ? "#C9973A" : "var(--color-text)",
                          letterSpacing: "0.02em",
                        }}>
                          {card.title}
                        </span>
                        <span style={{
                          fontFamily: "var(--font-ui)",
                          fontSize: "1.3rem",
                          color: "#C9973A",
                          lineHeight: 1,
                          marginLeft: "var(--space-3)",
                          flexShrink: 0,
                        }}>
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>
                      {isOpen && (
                        <div style={{
                          padding: "0 var(--space-3) var(--space-3)",
                          borderTop: "1px solid rgba(201,151,58,0.15)",
                        }}>
                          <p style={{
                            fontFamily: "var(--font-body)",
                            fontSize: "0.9rem",
                            color: "var(--color-text)",
                            margin: "var(--space-3) 0 0",
                            lineHeight: 1.7,
                          }}>
                            {card.fix}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={cardStyle}>
              <div style={{ ...sectionLabelStyle, marginBottom: "var(--space-2)" }}>Seasoning Guide</div>

              <p style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.85rem",
                color: "var(--color-text-muted)",
                fontStyle: "italic",
                marginTop: 0,
                marginBottom: "var(--space-3)",
              }}>
                Style set during meal prep. Start a new cook to change your regional profile.
              </p>

              {displayItems.length === 0 ? (
                <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)", margin: 0 }}>
                  No items found for this cook.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  {displayItems.map(item => {
                    const needsSeasoning = shouldShowSeasoningForItem(item.name);

                    if (!needsSeasoning) {
                      return (
                        <div
                          key={item.key}
                          style={{
                            background: "var(--color-bg)",
                            borderRadius: "var(--radius-md)",
                            padding: "var(--space-3)",
                          }}
                        >
                          <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, color: "var(--color-text)", marginBottom: "var(--space-1)" }}>
                            {item.name}
                          </div>
                          <p style={{
                            fontFamily: "var(--font-body)",
                            fontStyle: "italic",
                            fontSize: "0.85rem",
                            color: "var(--color-text-muted)",
                            margin: 0,
                          }}>
                            No rub needed — this item cooks best without additional seasoning.
                          </p>
                        </div>
                      );
                    }

                    const profile = getRubProfile(styleId, item.category);
                    const binder = BINDERS[item.category] ?? "";
                    const ratio = SALT_RATIOS[item.category] ?? 0.005;
                    const ratioLabel = SALT_RATIO_LABEL[item.category] ?? "";
                    const rawWeight = weightInputs[item.key] ?? item.defaultWeight;
                    const weightNum = parseFloat(rawWeight);
                    const saltOz = !isNaN(weightNum) && weightNum > 0
                      ? (weightNum * ratio * 16).toFixed(2)
                      : null;

                    return (
                      <div
                        key={item.key}
                        style={{
                          background: "var(--color-bg)",
                          borderRadius: "var(--radius-md)",
                          padding: "var(--space-3)",
                        }}
                      >
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--space-2)",
                          marginBottom: "var(--space-2)",
                        }}>
                          <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, color: "var(--color-text)" }}>
                            {item.name}
                          </div>
                          <span style={{
                            fontFamily: "var(--font-ui)",
                            fontSize: "0.7rem",
                            color: "var(--color-bg)",
                            background: "#C9973A",
                            padding: "2px 8px",
                            borderRadius: "var(--radius-sm)",
                            textTransform: "uppercase" as const,
                            letterSpacing: "0.05em",
                          }}>
                            {item.category}
                          </span>
                        </div>

                        <div style={{ marginBottom: "var(--space-2)" }}>
                          <span style={itemLabelStyle}>Rub</span>
                          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text)", margin: 0, lineHeight: 1.5 }}>
                            {profile}
                          </p>
                        </div>

                        <div style={{ marginBottom: "var(--space-2)" }}>
                          <span style={itemLabelStyle}>Binder</span>
                          <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.5 }}>
                            {binder}
                          </p>
                        </div>

                        <div style={{
                          display: "flex",
                          alignItems: "flex-end",
                          gap: "var(--space-3)",
                          flexWrap: "wrap",
                          paddingTop: "var(--space-2)",
                          borderTop: "1px solid rgba(201,151,58,0.15)",
                        }}>
                          <div style={{ flex: "1 1 140px" }}>
                            <span style={itemLabelStyle}>Salt Ratio</span>
                            <p style={{ fontFamily: "var(--font-ui)", fontSize: "0.9rem", color: "#C9973A", margin: 0, fontWeight: "bold" as const }}>
                              {ratioLabel}
                            </p>
                          </div>

                          <div style={{ flex: "1 1 140px" }}>
                            <span style={itemLabelStyle}>Weight (lbs)</span>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              value={rawWeight}
                              onChange={e => setWeightInputs(prev => ({ ...prev, [item.key]: e.target.value }))}
                              placeholder="e.g. 14"
                              style={{
                                width: "100%",
                                padding: "8px 12px",
                                background: "var(--color-bg-alt)",
                                border: "1px solid rgba(201,151,58,0.25)",
                                borderRadius: "var(--radius-md)",
                                color: "var(--color-text)",
                                fontFamily: "var(--font-body)",
                                fontSize: "0.9rem",
                                boxSizing: "border-box" as const,
                              }}
                            />
                          </div>

                          {saltOz && (
                            <div style={{ flex: "1 1 100%", marginTop: "var(--space-1)" }}>
                              <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text)", margin: 0 }}>
                                Use{" "}
                                <strong style={{ color: "#C9973A", fontFamily: "var(--font-ui)" }}>
                                  {saltOz} oz
                                </strong>{" "}
                                of salt for this cook
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ marginTop: "var(--space-4)" }}>
                <div style={{ ...sectionLabelStyle, marginBottom: "var(--space-2)" }}>When to Season</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                  {TIMING_STEPS.map((step, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "var(--space-3)",
                        background: "var(--color-bg)",
                        padding: "var(--space-3)",
                        borderRadius: "var(--radius-md)",
                      }}
                    >
                      <span style={{
                        fontFamily: "var(--font-ui)",
                        fontWeight: "bold" as const,
                        color: "#C9973A",
                        flexShrink: 0,
                        minWidth: "20px",
                        lineHeight: 1.4,
                      }}>
                        {idx + 1}
                      </span>
                      <p style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text)", margin: 0, lineHeight: 1.5 }}>
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div>
          {activeTab === "fire" ? (
            <div style={cardStyle}>
              <div style={{ ...sectionLabelStyle, marginTop: 0 }}>Your Pit</div>
              <div style={{ marginBottom: "var(--space-4)" }}>
                <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, color: "var(--color-text)", marginBottom: 4 }}>
                  {smokerName}
                </div>
                {woodType && (
                  <div style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text-muted)", marginBottom: "var(--space-1)" }}>
                    {woodType}
                  </div>
                )}
                <div style={{ fontFamily: "var(--font-ui)", fontSize: "0.8rem", color: "#C9973A" }}>
                  Target: {SMOKER_TEMP_RANGES[smokerType] ?? "225–275°F"}
                </div>
              </div>

              <div style={{ ...sectionLabelStyle }}>Preacher&apos;s Fire Note</div>
              <p style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.9rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.7,
                margin: 0,
                fontStyle: "italic",
                borderLeft: "3px solid #C9973A",
                paddingLeft: "var(--space-3)",
              }}>
                {SMOKER_NOTES[smokerType] ?? SMOKER_NOTES.other}
              </p>
            </div>
          ) : (
            <div style={cardStyle}>
              <div style={{ ...sectionLabelStyle, marginTop: 0 }}>Your Style</div>
              <div style={{ marginBottom: "var(--space-4)" }}>
                <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, color: "var(--color-text)", marginBottom: 4 }}>
                  {capitalize(styleId)}
                </div>
                <div style={{ fontFamily: "var(--font-body)", fontSize: "0.9rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                  {STYLE_PHILOSOPHY[styleId] ?? STYLE_PHILOSOPHY.texas}
                </div>
              </div>

              <div style={{ ...sectionLabelStyle }}>Regional Notes</div>
              <p style={{
                fontFamily: "var(--font-body)",
                fontSize: "0.9rem",
                color: "var(--color-text-muted)",
                lineHeight: 1.7,
                margin: 0,
                fontStyle: "italic",
                borderLeft: "3px solid #C9973A",
                paddingLeft: "var(--space-3)",
              }}>
                {REGIONAL_NOTES[styleId] ?? REGIONAL_NOTES.texas}
              </p>
            </div>
          )}
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
