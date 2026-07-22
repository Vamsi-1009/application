import { Request, Response } from "express";
import * as authService from "./auth.service";
import { HttpError } from "../../middleware/errorHandler";

const REFRESH_COOKIE = "refresh_token";
const isProd = process.env.NODE_ENV === "production";

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    path: "/api/auth",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

export async function signupHandler(req: Request, res: Response) {
  const result = await authService.signup(req.body);
  res.status(201).json(result);
}

export async function verifyOtpHandler(req: Request, res: Response) {
  const { email, code } = req.body;
  const result = await authService.verifySignupOtp(email, code);
  res.json(result);
}

export async function resendOtpHandler(req: Request, res: Response) {
  const result = await authService.resendOtp(req.body.email);
  res.json(result);
}

export async function loginHandler(req: Request, res: Response) {
  const { accessToken, refreshToken, user } = await authService.login(req.body);
  setRefreshCookie(res, refreshToken);
  res.json({ accessToken, user });
}

export async function refreshHandler(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw new HttpError(401, "No refresh token", "unauthorized");
  const { accessToken, refreshToken } = await authService.refresh(token);
  setRefreshCookie(res, refreshToken);
  res.json({ accessToken });
}

export async function logoutHandler(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) await authService.logout(token);
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
  res.status(204).end();
}
