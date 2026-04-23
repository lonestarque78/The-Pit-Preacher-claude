export function generateTimeline(cook) {
  const start = new Date(cook.started_at);

  // Normalize names
  const pit = cook.pit.toLowerCase();
  const meat = cook.meat.toLowerCase();

  // Base durations (minutes)
  let fireUp = 30;
  let spritzInterval = 90;
  let wrapTime = 300;
  let restTime = 60;
  let spritzRounds = 3;
  let wrapEnabled = true;

  // -------------------------
  // PIT-SPECIFIC LOGIC
  // -------------------------
  if (pit.includes("offset")) {
    fireUp = 45;
    spritzInterval = 60;
    wrapTime = 360;
  }

  if (pit.includes("pellet")) {
    fireUp = 15;
    spritzInterval = 120;
    wrapTime = 240;
  }

  if (pit.includes("kamado")) {
    fireUp = 40;
    spritzInterval = 120;
    wrapTime = 330;
  }

  if (pit.includes("drum")) {
    fireUp = 20;
    spritzInterval = 45;
    wrapTime = 210;
  }

  // -------------------------
  // MEAT-SPECIFIC LOGIC
  // -------------------------
  if (meat.includes("brisket")) {
    spritzRounds = 4;
    wrapTime += 60; // bark takes longer
    restTime = 120;
  }

  if (meat.includes("pork")) {
    spritzRounds = 3;
    wrapTime -= 30; // wrap earlier
    restTime = 90;
  }

  if (meat.includes("rib")) {
    spritzRounds = 2;
    wrapTime = 180; // ribs wrap early
    restTime = 20;
  }

  if (meat.includes("chicken")) {
    spritzRounds = 0; // no spritz
    wrapEnabled = false; // no wrap
    wrapTime = 0;
    restTime = 10;
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

  // 3. Spritz cycles
  for (let i = 1; i <= spritzRounds; i++) {
    steps.push({
      label: `Spritz #${i}`,
      detail: "Spritz the meat to keep the bark moist.",
      time: addMinutes(meatOnTime, spritzInterval * i),
    });
  }

  // 4. Wrap
  if (wrapEnabled) {
    steps.push({
      label: "Wrap",
      detail: "Wrap when bark is set.",
      time: addMinutes(meatOnTime, wrapTime),
    });
  }

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
