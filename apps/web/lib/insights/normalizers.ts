// lib/insights/normalizers.ts
// Pure client-safe utility functions — no server imports

export const MEAT_KEYWORDS: Record<string, string[]> = {
  brisket: ["brisket"],
  ribs: ["ribs", "spare rib", "baby back", "st. louis", "rib rack"],
  "pork shoulder": ["pork shoulder", "pork butt", "boston butt", "pulled pork"],
  chicken: ["chicken", "spatchcock", "thighs", "drumstick"],
  turkey: ["turkey"],
};

export function normalizeMeatType(label: string): string | null {
  const lower = label.toLowerCase();
  for (const [meat, keywords] of Object.entries(MEAT_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return meat;
  }
  return null;
}

export function normalizePitType(pitType: string): string {
  const lower = pitType.toLowerCase();
  if (lower.includes("offset")) return "offset";
  if (lower.includes("pellet")) return "pellet";
  if (lower.includes("kamado")) return "kamado";
  if (lower.includes("kettle")) return "kettle";
  if (lower.includes("drum") || lower.includes("uds")) return "drum";
  if (lower.includes("cabinet") || lower.includes("vertical")) return "cabinet";
  if (lower.includes("electric")) return "electric";
  return pitType;
}