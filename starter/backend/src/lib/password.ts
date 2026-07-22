import argon2 from "argon2";

// Argon2id: memory-hard, resistant to GPU cracking - OWASP's current
// recommendation over bcrypt/scrypt. See Stage 05.
export function hashSecret(plain: string): Promise<string> {
  return argon2.hash(plain, { type: argon2.argon2id });
}

export function verifySecret(hash: string, attempt: string): Promise<boolean> {
  return argon2.verify(hash, attempt);
}
