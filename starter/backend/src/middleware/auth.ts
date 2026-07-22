import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/jwt";
import { HttpError } from "./errorHandler";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new HttpError(401, "Missing bearer token", "unauthorized"));
  }
  try {
    const payload = verifyAccessToken(header.slice("Bearer ".length));
    req.userId = payload.sub;
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token", "unauthorized"));
  }
}
