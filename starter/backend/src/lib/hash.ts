import crypto from "crypto";

// Refresh tokens are already high-entropy random values, so a fast
// SHA-256 hash is fine for at-rest storage (unlike passwords/OTP codes,
// which need a slow hash like Argon2id - see Stage 05).
export function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}
