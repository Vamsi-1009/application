import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";

export class HttpError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

export function asyncHandler<T extends (req: Request, res: Response, next: NextFunction) => Promise<unknown>>(
  fn: T
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: "not_found" });
}

// Last middleware in the chain - never leak stack traces / SQL errors
// to the client in production. See Stage 03/18's security checklists.
// (4-arg signature required so Express recognizes this as an error handler.)
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.code ?? "error", message: err.message });
  }
  logger.error({ err }, "unhandled error");
  // Redact by default - only show the real error when NODE_ENV is explicitly
  // "development", not just when it isn't exactly "production" (fail closed
  // if the env var is ever unset or misconfigured in a real deployment).
  const isDev = process.env.NODE_ENV === "development";
  res.status(500).json({ error: "internal_error", message: isDev ? String(err) : "Something went wrong." });
}
