import nodemailer from "nodemailer";
import { secrets } from "../config/secrets";
import { logger } from "../config/logger";

// If SMTP isn't configured, fall back to logging the OTP to the console -
// keeps local dev working with zero external accounts. Never do this in
// production; see Stage 06 for a real SPF/DKIM/DMARC-configured setup.
const hasSmtp = Boolean(secrets.SMTP_HOST && secrets.SMTP_USER && secrets.SMTP_PASSWORD);

const transport = hasSmtp
  ? nodemailer.createTransport({
      host: secrets.SMTP_HOST,
      port: secrets.SMTP_PORT ?? 587,
      auth: { user: secrets.SMTP_USER, pass: secrets.SMTP_PASSWORD },
    })
  : null;

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  if (!transport) {
    logger.info({ to }, `[dev-mode] OTP for ${to} is: ${code} (no SMTP configured, not actually emailed)`);
    return;
  }
  await transport.sendMail({
    from: "TinyLink <no-reply@example.com>",
    to,
    subject: "Your TinyLink verification code",
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
  });
}
