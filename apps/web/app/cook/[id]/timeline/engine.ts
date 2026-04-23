export function generateTimeline(cook) {
  const start = new Date(cook.started_at);

  // Normalize pit name
  const pit = cook.pit.toLowerCase();

  // Default durations (minutes)
  let fireUp = 30;
  let spritzInterval = 90;
  let wrapTime = 300;
  let restTime = 60;

  // Pit-specific adjustments
  if (pit.includes("offset")) {
    fireUp = 45;              // takes longer to stabilize
    spritzInterval = 60;      // dries out faster
    wrapTime = 360;           // bark sets later
  }

  if (pit.includes("pellet")) {
    fireUp = 15;              // fast startup
    spritzInterval = 120;     // moisture stays better
    wrapTime = 240;           // bark sets earlier
  }

  if (pit.includes("kamado")) {
    fireUp = 40;              // charcoal stabilization
    spritzInterval = 120;     // very stable moisture
    wrapTime = 330;           // bark sets slower
  }

  if (pit.includes("drum")) {
    fireUp = 20;              // fast ignition
    spritzInterval = 45;      // runs hot, dries fast
    wrapTime = 210;           // bark sets early
  }

  const steps = [];

  // 1. Fire up
  steps.push({
    label: "Fire Up",
    detail: "Light your pit and stabilize temp.",
    time: addMinutes(start, fireUp),
  });

  // 2. Meat on
  const meatOnTime = addMinutes(start, fireUp);
  steps.push({
    label: "Meat On",
    detail: "Place meat on the smoker.",
    time: meatOnTime,
  });

  // 3. Spritz cycles (3 rounds)
  for (let i = 1; i <= 3; i++) {
    steps.push({
      label: `Spritz #${i}`,
      detail: "Spritz the meat to keep the bark moist.",
      time: addMinutes(meatOnTime, spritzInterval * i),
    });
  }

  // 4. Wrap
  steps.push({
    label: "Wrap",
    detail: "Wrap when bark is set.",
    time: addMinutes(meatOnTime, wrapTime),
  });

  // 5. Rest
  steps.push({
    label: "Rest",
    detail: "Rest in a cooler or oven.",
    time: addMinutes(meatOnTime, wrapTime + restTime),
  });

  return steps;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}
