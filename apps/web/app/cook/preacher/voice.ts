export function preacherLine(context) {
  const { meat, pit, event, stall, temp, action } = context;

  // Core personality
  const base = [
    "Trust your fire",
    "Let the smoke do the preaching",
    "Slow is smooth and smooth is fast",
    "Good bark comes to those who wait",
    "Stay steady",
    "Patience makes legends",
  ];

  // Meat-specific lines
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

  // Pit-specific lines
  const offset = [
    "Offset fires need a calm hand",
    "Feed the fire, not your fear",
    "Clean smoke wins championships",
  ];

  const pellet = [
    "Pellet pits stay steady, so should you",
    "Let the auger work while you think",
    "Consistency is your advantage",
  ];

  const kamado = [
    "Kamados reward discipline",
    "Small vents, big flavor",
    "Ceramic patience wins the day",
  ];

  const drum = [
    "Drums run hot, stay ahead of it",
    "Let that vortex work for you",
    "Drum cooking is a dance, not a march",
  ];

  // Stall lines
  const stallLines = [
    "The stall is a test of faith",
    "Hold steady, the breakthrough is coming",
    "Every pitmaster earns their stripes in the stall",
  ];

  // Event-specific lines
  const spritzLines = [
    "Easy on the spritz, you're building bark not soup",
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
  return pool[Math.floor(Math.random() * pool.length)];
}
