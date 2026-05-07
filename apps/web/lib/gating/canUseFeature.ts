import { isPremium } from "../billing/isPremium";
import { checkUsage } from "../usage/track";

type FeatureGateResult = {
  allowed: boolean;
  reason: "premium" | "limit_exceeded" | "free_tier";
};

export async function canUseFeature(
  userId: string,
  feature: string
): Promise<FeatureGateResult> {
  const premium = await isPremium(userId);

  if (premium) {
    return { allowed: true, reason: "premium" };
  }

  const usage = await checkUsage(userId, feature);

  if (usage.isOverLimit) {
    return { allowed: false, reason: "limit_exceeded" };
  }

  return { allowed: true, reason: "free_tier" };
}
