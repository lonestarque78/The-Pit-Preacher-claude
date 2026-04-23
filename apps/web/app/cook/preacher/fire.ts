export function fireTip({ pit, temp, phase }) {
  pit = pit.toLowerCase();

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
    "Drums run hot, stay ahead of the spike",
    "Let the vortex work for you",
    "Don't suffocate the fire",
    "Keep the lid closed unless you mean it",
  ];

  const general = [
    "Stay steady",
    "Let the fire breathe",
    "Small adjustments beat big swings",
    "Trust the pit",
  ];

  let pool = [...general];

  if (pit.includes("offset")) pool.push(...offset);
  if (pit.includes("pellet")) pool.push(...pellet);
  if (pit.includes("kamado")) pool.push(...kamado);
  if (pit.includes("drum")) pool.push(...drum);

  // Phase-aware additions
  if (phase.includes("Spritz")) {
    pool.push("Spritz quick and close the lid");
  }

  if (phase.includes("Wrap")) {
    pool.push("Hold steady until the bark earns it");
  }

  if (phase.includes("Rest")) {
    pool.push("Let the pit settle, the work is done");
  }

  // Temp-aware additions
  if (temp !== null) {
    const t = parseInt(temp);

    if (t < 150) pool.push("Let the heat climb slow and honest");
    if (t >= 150 && t < 170) pool.push("Hold steady through the climb");
    if (t >= 170 && t < 200) pool.push("Don't rush the finish");
    if (t >= 200) pool.push("Ease off the fire, you're close");
  }

  return pool[Math.floor(Math.random() * pool.length)];
}
