import { z } from "zod";

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
});

function formatErrors(errors: z.ZodError): string {
  return errors.issues
    .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

export function validateEnv() {
  const serverResult = serverEnvSchema.safeParse(process.env);
  const publicResult = publicEnvSchema.safeParse(process.env);

  const missing: string[] = [];

  if (!serverResult.success) {
    missing.push("Server-side environment variables:\n" + formatErrors(serverResult.error));
  }

  if (!publicResult.success) {
    missing.push("Public environment variables:\n" + formatErrors(publicResult.error));
  }

  if (missing.length > 0) {
    throw new Error(
      "Missing or invalid environment variables:\n\n" + missing.join("\n\n")
    );
  }
}

// Typed accessors so callers don't need to assert non-null
export const env = {
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY!,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL!,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL!,
};
