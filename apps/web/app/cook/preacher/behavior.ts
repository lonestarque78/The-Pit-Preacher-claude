export function pitBehavior(events) {
  const tempLogs = events.filter((e) => e.type === "temp_log");

  if (tempLogs.length < 3) return "Pit behavior looks steady";

  let spikes = 0;
  let drops = 0;

  for (let i = 1; i < tempLogs.length; i++) {
    const prev = parseInt(tempLogs[i - 1].note || "0");
    const curr = parseInt(tempLogs[i].note || "0");
    const diff = curr - prev;

    if (diff > 20) spikes++;
    if (diff < -20) drops++;
  }

  if (spikes >= 2) return "Pit is running hot";
  if (drops >= 2) return "Pit is cooling too fast";
  if (spikes === 1) return "Small heat spike detected";
  if (drops === 1) return "Small heat dip detected";

  return "Pit is holding steady";
}
