import { preacherVoice, getDirectCommand, getScriptureLine } from "@/lib/preacher/voice";

export function preacherLine(context: {
  meat?: string;
  pit?: string;
  event?: string;
  stall?: boolean;
  temp: number | null;
  action?: string;
}) {
  const { meat, pit, event, stall } = context;

  // Core personality - using unified voice
  const base = [
    "Trust your fire",
    "Let the smoke do the preaching",
    "Slow is smooth and smooth is fast",
    "Good bark comes to those who wait",
    "Stay steady",
    "Patience makes legends",
  ];

  // Meat-specific lines - simplified to match voice rules
  const brisket = [
    "Brisket rewards the patient",
    "Let that bark earn its glory",
    "Don't rush a cow's toughest muscle",
  ];

  const pork = [
    "Pork loves a steady hand",
    "Let that fat do the talking",
    "Pork shoulder forgives but it never forgets",
  ];

  const ribs = [
    "Ribs tell you when they're ready",
    "Let the bones loosen on their own time",
    "Ribs need rhythm, not speed",
  ];

  const chicken = [
    "Chicken cooks fast, stay sharp",
    "Crisp skin wins hearts",
    "Don't let that bird dry out",
  ];

  // Pit-specific lines - direct and simple
  const offset = [
    "Feed the fire small and steady",
    "Clean smoke wins",
    "Let the wood catch before you close the door",
    "Ease the intake, not the exhaust",
  ];

  const pellet = [
    "Let the auger work",
    "Pellet pits stay steady if you do",
    "Don't chase the temp",
    "Keep the hopper full and trust the cycle",
  ];

  const kamado = [
    "Ease the vents, not the fire",
    "Ceramic holds heat longer than you think",
    "Small vent changes go a long way",
    "Let the dome do the work",
  ];

  const drum = [
    "Drums run hot, stay ahead of it",
    "Let the vortex work for you",
    "Don't suffocate the fire",
    "Keep the lid closed unless you mean it",
  ];

  // Stall lines - using scripture style
  const stallLines = [
    "The stall is a test of faith",
    "Hold steady through the stall",
    "Every pitmaster earns their stripes in the stall",
  ];

  // Event-specific lines - direct commands
  const spritzLines = [
    "Spritz quick and close the lid",
    "A little spritz goes a long way",
    "Moisture helps the bark shine",
  ];

  const wrapLines = [
    "Wrap tight and keep the heat honest",
    "Foil or paper, just commit",
    "The wrap is where you lock in the win",
  ];

  const probeLines = [
    "Probe for feel, not numbers",
    "Tender tells the truth",
    "Let the meat speak through the probe",
  ];

  const tempLines = [
    "Numbers guide you, but feel decides",
    "Temp is a clue, not a command",
    "Watch the trend, not the moment",
  ];

  // Build the pool
  let pool = [...base];

  if (meat?.includes("brisket")) pool.push(...brisket);
  if (meat?.includes("pork")) pool.push(...pork);
  if (meat?.includes("rib")) pool.push(...ribs);
  if (meat?.includes("chicken")) pool.push(...chicken);

  if (pit?.includes("offset")) pool.push(...offset);
  if (pit?.includes("pellet")) pool.push(...pellet);
  if (pit?.includes("kamado")) pool.push(...kamado);
  if (pit?.includes("drum")) pool.push(...drum);

  if (stall) pool.push(...stallLines);

  if (event === "spritz") pool.push(...spritzLines);
  if (event === "wrap") pool.push(...wrapLines);
  if (event === "probe") pool.push(...probeLines);
  if (event === "temp_log") pool.push(...tempLines);

  // Pick a line
  return pool[Math.floor(Math.random() * pool.length)] ?? "Trust your fire";
}
