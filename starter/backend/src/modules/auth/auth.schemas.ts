import { z } from "zod";

export const signupSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(10, "Password must be at least 10 characters"),
  })
  .strict();

export const verifyOtpSchema = z
  .object({
    email: z.string().email(),
    code: z.string().length(6),
  })
  .strict();

export const resendOtpSchema = z.object({ email: z.string().email() }).strict();

export const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
  })
  .strict();

export type SignupInput = z.infer<typeof signupSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
