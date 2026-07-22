import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { validate } from "../../middleware/validate";
import { authRateLimiter, otpResendRateLimiter } from "../../middleware/rateLimit";
import { signupSchema, verifyOtpSchema, resendOtpSchema, loginSchema } from "./auth.schemas";
import * as ctrl from "./auth.controller";

export const authRouter = Router();

authRouter.post("/signup", authRateLimiter, validate(signupSchema), asyncHandler(ctrl.signupHandler));
authRouter.post("/verify-otp", authRateLimiter, validate(verifyOtpSchema), asyncHandler(ctrl.verifyOtpHandler));
authRouter.post("/resend-otp", otpResendRateLimiter, validate(resendOtpSchema), asyncHandler(ctrl.resendOtpHandler));
authRouter.post("/login", authRateLimiter, validate(loginSchema), asyncHandler(ctrl.loginHandler));
authRouter.post("/refresh", asyncHandler(ctrl.refreshHandler));
authRouter.post("/logout", asyncHandler(ctrl.logoutHandler));
