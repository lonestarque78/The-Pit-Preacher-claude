export type Phase = {
  id: string;
  name: string;
  icon: string;
  trigger: string;
  triggerType: "time" | "temp" | "visual" | "feel" | "probe";
  tempRange: { min: number; max: number } | null;
  duration: string;
  science: string;
  watchFor: string[];
  commonMistakes: string;
  preacherNote: string;
  completionPrompt: string;
  requiresTempEntry: boolean;
  isAlwaysPresent: boolean;
  applicableMeats: string[];
};

const LOW_AND_SLOW_KEYWORDS = [
  "brisket",
  "pork butt",
  "pork shoulder",
  "beef rib",
  "pork belly",
  "spare rib",
  "spareribs",
  "baby back",
  "st louis",
];

function meatString(items: any[]): string {
  return items.map(i => (i.name || "").toLowerCase()).join(" ");
}

function isLowAndSlow(items: any[]): boolean {
  const m = meatString(items);
  return LOW_AND_SLOW_KEYWORDS.some(k => m.includes(k));
}

type SmokerKind = "offset" | "pellet" | "kamado" | "generic";

function detectSmoker(cook: any): SmokerKind {
  const tools: any[] = cook?.plan?.tools ?? [];
  const toolNames = tools.map((t: any) => (t.name || "").toLowerCase()).join(" ");
  const raw = `${(cook.smoker_type || "").toLowerCase()} ${toolNames}`;
  if (raw.includes("offset") || raw.includes("stick") || raw.includes("lang") || raw.includes("ole hickory")) return "offset";
  if (raw.includes("pellet") || raw.includes("traeger") || raw.includes("smokefire") || raw.includes("recteq") || raw.includes("pit boss") || raw.includes("camp chef")) return "pellet";
  if (raw.includes("kamado") || raw.includes("big green egg") || raw.includes("bge") || raw.includes("akorn") || raw.includes("primo")) return "kamado";
  return "generic";
}

export function generatePhases(cook: any, items: any[], session?: any): Phase[] {
  const m = meatString(items);
  const slow = isLowAndSlow(items);
  const pit = detectSmoker(cook);
  const flavorBark: number | null = session?.flavor_bark ?? null;
  const flavorTenderness: number | null = session?.flavor_tenderness ?? null;

  const phases: Phase[] = [];

  // ── PHASE 1: FIRE & STABILIZE ──────────────────────────────────
  const fireTempRange =
    pit === "pellet" ? { min: 250, max: 275 } :
    pit === "kamado" ? { min: 225, max: 260 } :
    { min: 225, max: 275 };

  const fireNote =
    pit === "pellet"
      ? "Let the auger work. The pit knows what it needs."
      : pit === "offset"
      ? "Build your coal bed. One split at a time. The fire will tell you when it's ready."
      : pit === "kamado"
      ? "Light the lump and wait. Patience before the meat earns patience during the cook."
      : "Give the pit time to settle. A stable fire before the meat makes the difference.";

  phases.push({
    id: "fire",
    name: "Fire & Stabilize",
    icon: "▲",
    trigger: "Pit stable at target temp with thin blue smoke",
    triggerType: "temp",
    tempRange: fireTempRange,
    duration: "45–60 min",
    science:
      "Your fire needs time to transition from combustion to clean smoke production. White billowy smoke means incomplete combustion — it will make your meat bitter. Thin blue smoke means the fire is burning clean and hot.",
    watchFor: [
      "Smoke has thinned to a faint blue haze",
      "Pit temp has stabilized — not climbing or falling",
      "No white or gray smoke visible",
      "Fire is self-sustaining without constant attention",
    ],
    commonMistakes:
      "Loading meat before the pit has stabilized — white smoke baked into meat in the first hour is the most common cause of bitter BBQ.",
    preacherNote: fireNote,
    completionPrompt:
      "Fire is clean and pit is stable. Time to load the pit. Get your meat on and close that lid. The cook has begun.",
    requiresTempEntry: true,
    isAlwaysPresent: true,
    applicableMeats: [],
  });

  // ── PHASE 2: ON THE PIT ─────────────────────────────────────────
  const onPitDuration =
    m.includes("brisket") || m.includes("pork butt") || m.includes("pork shoulder")
      ? "2–3 hrs"
      : m.includes("rib")
      ? "1.5–2 hrs"
      : m.includes("chicken") || m.includes("burger")
      ? "30–45 min"
      : "1–2 hrs";

  const onPitScience = slow
    ? "The first hours are about smoke absorption and moisture loss. The surface of the meat is drying out — this is what builds bark. The smoke is penetrating the outer layer. Do not open the lid unnecessarily."
    : "The heat is working fast. The surface will set quickly. Resist the urge to check constantly. Every time you lift the lid you add 15 minutes.";

  const onPitWatchFor = slow
    ? [
        "Color is beginning to develop — mahogany tones appearing",
        "A light crust is forming on the surface",
        "Smoke is rolling through the chamber cleanly",
        "Pit temp is holding steady in range",
      ]
    : [
        "Surface color is developing — no need to flip yet",
        "Pit temp is holding in range",
        "Juices are beginning to pool on the surface",
        "No flare-ups or uncontrolled temperature spikes",
      ];

  phases.push({
    id: "on_pit",
    name: "On the Pit",
    icon: "◉",
    trigger: "Meat is loaded and lid is closed",
    triggerType: "time",
    tempRange: null,
    duration: onPitDuration,
    science: onPitScience,
    watchFor: onPitWatchFor,
    commonMistakes: "Lifting the lid too early or too often. The cook needs to stabilize with meat in it. Let it run.",
    preacherNote: slow
      ? "Close that lid and walk away. The smoke is doing its work."
      : "Watch it, don't hover it. High heat forgives curiosity less than low and slow does.",
    completionPrompt: slow
      ? "Bark is starting to form. Time to start watching the color. The surface will tell you when to move to the next phase."
      : "Color is developing. Keep that heat steady and start checking for your target temp.",
    requiresTempEntry: false,
    isAlwaysPresent: true,
    applicableMeats: [],
  });

  // ── PHASES 3–5: LOW-AND-SLOW ONLY ──────────────────────────────
  if (slow) {
    phases.push({
      id: "bark",
      name: "Bark Development",
      icon: "▣",
      trigger: "Color has developed — visual check required",
      triggerType: "visual",
      tempRange: null,
      duration: "Ongoing — check at hour 2–3",
      science:
        "Bark forms through the Maillard reaction and moisture evaporation. The proteins and sugars on the surface are caramelizing. A good bark is dark mahogany, firm to the touch, and does not transfer color to your finger.",
      watchFor: [
        "Surface is dark mahogany — not black, not reddish-brown",
        "Bark is firm and bounces back when pressed gently",
        "Color does not transfer to your glove when touched",
        "Surface looks dry and leathery — not wet or tacky",
      ],
      commonMistakes:
        "Wrapping too early before bark has fully set. A soft or tacky bark will steam inside the wrap and turn mushy.",
      preacherNote:
        "When the bark bounces back under your finger and looks like dark leather — that is your sign. Not the clock. The bark tells you.",
      completionPrompt:
        "Bark is set. Time to make the call — wrap or no wrap. Check your internal temp and look at that surface one more time before you decide.",
      requiresTempEntry: false,
      isAlwaysPresent: false,
      applicableMeats: ["brisket", "pork butt", "pork shoulder", "beef ribs", "spare ribs", "baby back ribs", "st louis ribs"],
    });

    let decisionNote = "The bark has done its job. Now decide how you want to finish it.";
    if (flavorBark !== null && flavorBark >= 8) {
      decisionNote =
        "That bark is earned. If you wrap now wrap in butcher paper — let it breathe. Foil will soften what you just built.";
    } else if (flavorTenderness !== null && flavorTenderness >= 8) {
      decisionNote = "Go foil. Lock in that moisture. The bark has done its job.";
    }

    phases.push({
      id: "decision",
      name: "The Decision",
      icon: "⊕",
      trigger: "Bark is set and internal temp is in stall range",
      triggerType: "temp",
      tempRange: { min: 150, max: 170 },
      duration: "Judgment call",
      science:
        "The stall happens because evaporative cooling on the meat's surface exactly offsets the heat entering the meat. It can last 30 minutes or 3 hours. The decision to wrap or not affects bark texture, moisture, and cook time.",
      watchFor: [
        "Internal temp has plateaued or is moving slowly",
        "Bark is fully set and dark",
        "Color is mahogany throughout",
        "Probe meets resistance — not tender yet",
      ],
      commonMistakes:
        "Wrapping in foil when bark is not fully set — foil traps moisture and turns soft bark into mush.",
      preacherNote: decisionNote,
      completionPrompt:
        "Decision made. The meat is wrapped or running naked. Either way — hold the line. The stall is next.",
      requiresTempEntry: true,
      isAlwaysPresent: false,
      applicableMeats: ["brisket", "pork butt", "pork shoulder", "beef ribs", "spare ribs", "baby back ribs", "st louis ribs"],
    });

    phases.push({
      id: "stall",
      name: "The Stall",
      icon: "~",
      trigger: "Internal temp stops moving",
      triggerType: "temp",
      tempRange: { min: 150, max: 175 },
      duration: "30 min – 3 hrs",
      science:
        "The stall is not a malfunction. It is evaporative cooling. The moisture leaving the surface of the meat is cooling it at exactly the rate the fire is heating it. It will break. It always breaks.",
      watchFor: [
        "Temp has not moved more than 2 degrees in 30+ minutes",
        "This is normal — do not increase heat",
        "Do not open the lid to check — every peek adds time",
        "Trust the process",
      ],
      commonMistakes:
        "Panicking and increasing pit temp. This ruins bark and can dry out the outer layer before the center catches up.",
      preacherNote:
        "The stall is where pitmasters are made and impatient men are broken. Hold the line. The meat will come through. It always does.",
      completionPrompt:
        "The stall has broken. Temp is climbing again. You are in the home stretch now. Start watching your internal temp — probe tender is coming.",
      requiresTempEntry: true,
      isAlwaysPresent: false,
      applicableMeats: ["brisket", "pork butt", "pork shoulder", "beef ribs", "spare ribs", "baby back ribs", "st louis ribs"],
    });
  }

  // ── PHASE 6: PROBE CHECK ────────────────────────────────────────
  const probeTempRange =
    m.includes("brisket") ? { min: 195, max: 210 } :
    m.includes("pork butt") || m.includes("pork shoulder") ? { min: 195, max: 205 } :
    m.includes("rib") ? { min: 185, max: 200 } :
    m.includes("chicken") ? { min: 160, max: 170 } :
    m.includes("burger") ? { min: 155, max: 165 } :
    { min: 160, max: 175 };

  phases.push({
    id: "probe",
    name: "Probe Check",
    icon: "⊙",
    trigger: "Internal temp in target range — probe for tenderness",
    triggerType: "probe",
    tempRange: probeTempRange,
    duration: "Until ready",
    science:
      "Temperature is a guide. Probe tenderness is the truth. The probe should slide into the thickest part of the meat with no resistance — like inserting it into warm butter. If you feel any tension, the meat needs more time.",
    watchFor: [
      "Probe slides in with zero resistance",
      "Internal temp is in the target range",
      "Juices run clear when probed",
      "Meat has slight jiggle when the rack is shaken (for brisket)",
    ],
    commonMistakes:
      "Pulling at a specific temp without probe testing. A 203 brisket that still resists the probe needs more time. A 195 brisket that slides like butter is done.",
    preacherNote:
      "The thermometer tells you where you are. The probe tells you when you are done. Do not confuse the two.",
    completionPrompt:
      "Probe tender. Pull it now. Get it wrapped and off the heat before it goes a minute further. The rest starts now.",
    requiresTempEntry: true,
    isAlwaysPresent: true,
    applicableMeats: [],
  });

  // ── PHASE 7: THE REST ───────────────────────────────────────────
  const restDuration =
    m.includes("brisket") ? "60–120 min" :
    m.includes("pork butt") || m.includes("pork shoulder") ? "45–60 min" :
    m.includes("rib") ? "15–20 min" :
    m.includes("chicken") ? "10–15 min" :
    m.includes("burger") ? "5 min" :
    "20–30 min";

  const restScience =
    m.includes("brisket")
      ? "During the rest the internal temp continues to rise (carryover cooking) and then begins to fall. More importantly the muscle fibers relax and reabsorb the juices that were pushed to the center during cooking. Cutting too early means those juices end up on your cutting board instead of in the meat."
      : m.includes("pork butt") || m.includes("pork shoulder")
      ? "The rest allows carryover cooking to finish and the muscle fibers to relax. For pork butt this is also when the collagen fully converts and the meat becomes pull-ready. Rush it and you will fight the bone."
      : m.includes("rib")
      ? "Ribs rest quick but they still need it. The juices will redistribute and the surface will firm back up after coming off the heat. Slice too soon and the meat will tear instead of cut cleanly between the bones."
      : m.includes("chicken")
      ? "Even chicken needs a brief rest. The juices are running hot and will escape immediately if you cut. Let the breast or thigh settle for 10 minutes and the result is a noticeably juicier bird."
      : m.includes("burger")
      ? "A brief rest lets the patty firm up and keeps the juices in the meat instead of soaking the bun."
      : "During the rest the muscle fibers relax and reabsorb the juices displaced by heat. Cutting too early loses moisture that should stay in the meat.";

  phases.push({
    id: "rest",
    name: "The Rest",
    icon: "⊛",
    trigger: "Probe tender — pull from heat immediately",
    triggerType: "time",
    tempRange: null,
    duration: restDuration,
    science: restScience,
    watchFor: [
      "Meat is wrapped in butcher paper or foil if not already",
      "Placed in a cooler or warm oven (170°F) to hold temp",
      "Minimum rest time has elapsed",
      "Internal temp has begun to fall below 160°F before serving",
    ],
    commonMistakes:
      "Cutting too soon because guests are waiting. A rushed rest is a broken promise to the meat and to everyone at the table.",
    preacherNote:
      "The rest is not optional. It is half the cook. The meat needs time to remember what it is before you ask it to give itself to the table.",
    completionPrompt:
      "Rest is done. Time to slice or pull. Get your board and your knife ready. This is what all of it was for.",
    requiresTempEntry: false,
    isAlwaysPresent: true,
    applicableMeats: [],
  });

  // ── PHASE 8: THE TABLE ──────────────────────────────────────────
  const tableScience =
    m.includes("brisket")
      ? "Slice against the grain. The flat slices thin. The point can go thicker for burnt ends or chunky slices. If the flat is shredding instead of slicing you waited too long or cooked too hot."
      : m.includes("pork butt") || m.includes("pork shoulder")
      ? "Pull with your hands or bear claws — no forks. Mix in the juices from the wrap. The money muscle pulls differently — slice that separately if you want to show it off."
      : m.includes("rib")
      ? "Slice between the bones. One bone per slice. The meat should pull away from the bone with slight resistance — not falling off. Fall-off-the-bone is overcooked."
      : m.includes("chicken")
      ? "Let the skin rest firm before cutting. Slice the breast across the grain. Pull the thighs apart at the joint — they come free easily when done right."
      : "Handle the meat with intention at the board. Identify the grain and slice against it. The knife should meet almost no resistance if the rest was honored.";

  phases.push({
    id: "table",
    name: "The Table",
    icon: "✦",
    trigger: "Rest complete — time to slice or pull",
    triggerType: "time",
    tempRange: null,
    duration: "Until served",
    science: tableScience,
    watchFor: [
      "Board is set up and knife is sharp",
      "Juices from the wrap or pan are ready to mix in",
      "Serving dishes or plates are ready",
      "Everyone is at the table — serve immediately",
    ],
    commonMistakes:
      "Slicing with the grain instead of against it — this makes the meat feel tough even when it's perfectly cooked.",
    preacherNote:
      "This is what all of it was for. Every hour of patience, every split of wood, every moment of doubt — it all ends here. Serve it with pride.",
    completionPrompt:
      "Cook complete. The congregation has been fed. Mark this cook as done and write your summary before the details fade.",
    requiresTempEntry: false,
    isAlwaysPresent: true,
    applicableMeats: [],
  });

  return phases;
}
