// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateTimeline(cook: any, items: any[] = [], events: any[] = []) {
  const start = new Date(cook.created_at);

  // Normalize names from cook_items
  const pit = (cook.smoker_type || "").toLowerCase();
  const meatNames = items.map((i) => i.name.toLowerCase());
  const meat = meatNames.join(" ");

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
    wrapTime += 60;
    restTime = 120;
  }

  if (meat.includes("pork")) {
    spritzRounds = 3;
    wrapTime -= 30;
    restTime = 90;
  }

  if (meat.includes("rib")) {
    spritzRounds = 2;
    wrapTime = 180;
    restTime = 20;
  }

  if (meat.includes("chicken")) {
    spritzRounds = 0;
    wrapEnabled = false;
    wrapTime = 0;
    restTime = 10;
  }

  // -------------------------
  // STALL DETECTION
  // -------------------------
  const tempLogs = events.filter((e) => e.type === "temp_log");

  if (tempLogs.length >= 2) {
    const first = tempLogs[0]!;
    const last = tempLogs[tempLogs.length - 1]!;

    const firstTemp = parseInt(first.note || "0");
    const lastTemp = parseInt(last.note || "0");

    const timeDiff =
      (new Date(last.created_at).getTime() -
        new Date(first.created_at).getTime()) /
      60000;

    const tempDiff = lastTemp - firstTemp;

    // Stall detected: temp hasn't moved in 45+ minutes
    if (timeDiff >= 45 && tempDiff < 5) {
      wrapTime -= 30; // wrap earlier
      restTime += 30; // rest longer
      spritzInterval += 30; // spritz less often
    }

    // Cook is running hot: temp rising too fast
    if (timeDiff <= 30 && tempDiff > 20) {
      wrapTime += 30; // wrap later
      restTime -= 20; // rest shorter
    }
  }

  // -------------------------
  // EVENT-DRIVEN ADJUSTMENTS
  // -------------------------

  // If user already wrapped, remove future spritzes
  const wrapped = events.find((e) => e.type === "wrap");
  if (wrapped) {
    spritzRounds = 0;
  }

  // If user probed, extend rest
  const probed = events.find((e) => e.type === "probe");
  if (probed) {
    restTime += 30;
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

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}
