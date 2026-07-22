import jwt from "jsonwebtoken";
import { secrets } from "../config/secrets";

export interface AccessTokenPayload {
  sub: string; // user id
}

// Explicit algorithm allow-list - prevents "alg: none" / attacker-chosen
// algorithm confusion attacks. See Stage 03's security checklist.
const ALGORITHM = "HS256" as const;

export function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId } satisfies AccessTokenPayload, secrets.JWT_SIGNING_KEY, {
    algorithm: ALGORITHM,
    // JWT_ACCESS_TTL is validated as a string like "15m" by zod at boot,
    // but @types/jsonwebtoken wants its own branded string literal type -
    // this cast is safe because secrets.ts already guarantees the shape.
    expiresIn: secrets.JWT_ACCESS_TTL as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, secrets.JWT_SIGNING_KEY, { algorithms: [ALGORITHM] }) as AccessTokenPayload;
}
