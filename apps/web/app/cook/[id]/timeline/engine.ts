export function generateTimeline(cook) {
  const start = new Date(cook.started_at);

  // Basic durations (we will expand later)
  const durations = {
    fireUp: 30, // minutes
    meatOn: 0,
    spritzInterval: 90,
    wrap: 300,
    rest: 60,
  };

  const steps = [];

  // 1. Fire up
  steps.push({
    label: "Fire Up",
    detail: "Light your pit and stabilize temp.",
    time: addMinutes(start, durations.fireUp),
  });

  // 2. Meat on
  const meatOnTime = addMinutes(start, durations.fireUp + durations.meatOn);
  steps.push({
    label: "Meat On",
    detail: "Place meat on the smoker.",
    time: meatOnTime,
  });

  // 3. Spritz cycles
  for (let i = 1; i <= 3; i++) {
    steps.push({
      label: `Spritz #${i}`,
      detail: "Spritz the meat to keep the bark moist.",
      time: addMinutes(meatOnTime, durations.spritzInterval * i),
    });
  }

  // 4. Wrap
  steps.push({
    label: "Wrap",
    detail: "Wrap when bark is set.",
    time: addMinutes(meatOnTime, durations.wrap),
  });

  // 5. Rest
  steps.push({
    label: "Rest",
    detail: "Rest in a cooler or oven.",
    time: addMinutes(meatOnTime, durations.wrap + durations.rest),
  });

  return steps;
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}
