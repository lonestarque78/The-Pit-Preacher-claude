export function actionTip({ phase, pit, stall, nextStep, temp }) {
  pit = pit.toLowerCase();
  phase = phase.toLowerCase();

  // Stall actions
  if (stall) {
    return "Hold steady through the stall";
  }

  // Phase-specific actions
  if (phase.includes("fire")) return "Let the pit settle";
  if (phase.includes("meat on")) return "Close the lid and trust the heat";
  if (phase.includes("spritz")) return "Spritz quick and keep the lid closed";
  if (phase.includes("wrap")) return "Check the bark and commit to the wrap";
  if (phase.includes("rest")) return "Let the meat rest undisturbed";

  // Pit-specific actions
  if (pit.includes("offset")) return "Feed the fire small and steady";
  if (pit.includes("pellet")) return "Let the auger work";
  if (pit.includes("kamado")) return "Ease the vents";
  if (pit.includes("drum")) return "Stay ahead of the heat";

  // Next step fallback
  if (nextStep) return `Get ready for ${nextStep}`;

  return "Stay steady";
}
