import "server-only";

import { z } from "zod";

const schema = z.object({
  GLIDE_API_URL: z.string().url().optional(),
  GLIDE_APP_URL: z.string().url().optional(),
  GLIDE_REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1_000).max(30_000).default(10_000),
  GLIDE_SESSION_COOKIE: z
    .string()
    .regex(/^[A-Za-z0-9_-]+$/)
    .default("glide_refresh"),
  GLIDE_SESSION_MAX_AGE_SECONDS: z.coerce
    .number()
    .int()
    .min(3_600)
    .max(60 * 60 * 24 * 90)
    .default(60 * 60 * 24 * 30),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `Invalid frontend environment: ${parsed.error.issues.map((issue) => issue.path.join(".")).join(", ")}`,
  );
}

if (
  parsed.data.NODE_ENV === "production" &&
  (!parsed.data.GLIDE_API_URL || !parsed.data.GLIDE_APP_URL)
) {
  throw new Error("GLIDE_API_URL and GLIDE_APP_URL are required in production");
}

export const serverEnv = {
  ...parsed.data,
  GLIDE_API_URL: parsed.data.GLIDE_API_URL ?? "http://127.0.0.1:5000/api/v1",
} as const;
