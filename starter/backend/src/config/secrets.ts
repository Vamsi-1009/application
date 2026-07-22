import { z } from "zod";

// Fail fast at boot if anything required is missing/malformed - see
// Stage 05 of the Field Manual for why this matters. In production
// these env vars would be injected by the platform from a real secrets
// manager, never read from a committed file.
const SecretsSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SIGNING_KEY: z.string().min(16, "JWT_SIGNING_KEY should be at least 16 chars"),
  JWT_ACCESS_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().default(30),
  PORT: z.coerce.number().default(8000),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  PUBLIC_BASE_URL: z.string().default("http://localhost:8000"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
});

export const secrets = SecretsSchema.parse(process.env);
export const corsAllowedOrigins = secrets.CORS_ORIGIN.split(",").map((s) => s.trim());
