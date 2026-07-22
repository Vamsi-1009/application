import rateLimit from "express-rate-limit";

// Tighter on auth/OTP than on general reads - see Stage 03/06/19.
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpResendRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
});

// The public redirect endpoint has no auth at all, so it's the one most
// exposed to abuse/scraping - rate-limit it per IP too.
export const redirectRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
});
