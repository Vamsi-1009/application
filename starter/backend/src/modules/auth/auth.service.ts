import { prisma } from "../../lib/prisma";
import { hashSecret, verifySecret } from "../../lib/password";
import { sha256, randomToken } from "../../lib/hash";
import { signAccessToken } from "../../lib/jwt";
import { issueOtp, verifyOtp } from "../otp/otp.service";
import { HttpError } from "../../middleware/errorHandler";
import { secrets } from "../../config/secrets";
import type { LoginInput, SignupInput } from "./auth.schemas";

const REFRESH_TTL_MS = secrets.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

export async function signup(input: SignupInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (!existing) {
    const passwordHash = await hashSecret(input.password);
    const user = await prisma.user.create({ data: { email: input.email, passwordHash } });
    await issueOtp(user.id, user.email);
  }
  // Same response whether or not the account already existed - avoids
  // leaking account existence. See Stage 06's security checklist.
  return { message: "If that email can sign up, a verification code has been sent." };
}

export async function verifySignupOtp(email: string, code: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new HttpError(400, "Invalid email or code", "otp_invalid");
  await verifyOtp(user.id, code);
  return { message: "Account verified - you can now log in." };
}

export async function resendOtp(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && !user.isVerified) {
    await issueOtp(user.id, user.email);
  }
  // Same response either way - avoids leaking account existence.
  return { message: "If that account needs verification, a new code has been sent." };
}

async function issueRefreshToken(userId: string) {
  const token = randomToken();
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: sha256(token),
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    },
  });
  return token;
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw new HttpError(401, "Invalid email or password", "invalid_credentials");
  if (!user.isVerified) throw new HttpError(403, "Account not verified", "not_verified");

  const valid = await verifySecret(user.passwordHash, input.password);
  if (!valid) throw new HttpError(401, "Invalid email or password", "invalid_credentials");

  const accessToken = signAccessToken(user.id);
  const refreshToken = await issueRefreshToken(user.id);
  return { accessToken, refreshToken, user: { id: user.id, email: user.email } };
}

export async function refresh(refreshToken: string) {
  const tokenHash = sha256(refreshToken);
  const record = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!record || record.revoked || record.expiresAt < new Date()) {
    throw new HttpError(401, "Invalid refresh token", "unauthorized");
  }

  // Rotate on every use; reuse of an already-rotated token is a strong
  // signal of theft, so revoke the whole chain. See Stage 05.
  await prisma.refreshToken.update({ where: { id: record.id }, data: { revoked: true } });
  const newRefreshToken = await issueRefreshToken(record.userId);
  const accessToken = signAccessToken(record.userId);
  return { accessToken, refreshToken: newRefreshToken };
}

export async function logout(refreshToken: string) {
  const tokenHash = sha256(refreshToken);
  await prisma.refreshToken.updateMany({ where: { tokenHash }, data: { revoked: true } });
}
