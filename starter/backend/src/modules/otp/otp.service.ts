import crypto from "crypto";
import { prisma } from "../../lib/prisma";
import { hashSecret, verifySecret } from "../../lib/password";
import { HttpError } from "../../middleware/errorHandler";
import { sendOtpEmail } from "../../lib/mailer";

const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;

export async function issueOtp(userId: string, email: string): Promise<void> {
  const code = crypto.randomInt(100000, 999999).toString(); // not Math.random()
  const codeHash = await hashSecret(code);
  await prisma.otpCode.create({
    data: { userId, codeHash, expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60_000) },
  });
  await sendOtpEmail(email, code);
}

export async function verifyOtp(userId: string, submittedCode: string): Promise<void> {
  const otp = await prisma.otpCode.findFirst({
    where: { userId, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) throw new HttpError(400, "No valid OTP found - request a new one", "otp_invalid");
  if (otp.attempts >= MAX_ATTEMPTS) throw new HttpError(429, "Too many attempts - request a new OTP", "otp_locked");

  const ok = await verifySecret(otp.codeHash, submittedCode);
  if (!ok) {
    await prisma.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    throw new HttpError(400, "Incorrect code", "otp_invalid");
  }

  await prisma.$transaction([
    prisma.otpCode.deleteMany({ where: { userId } }),
    prisma.user.update({ where: { id: userId }, data: { isVerified: true } }),
  ]);
}
