import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { HttpError } from "./errorHandler";

type Source = "body" | "params" | "query";

// Rejects unknown fields (schemas below use .strict()) - see Stage 03.
export function validate(schema: ZodSchema, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(new HttpError(400, result.error.errors.map((e) => e.message).join(", "), "validation_error"));
    }
    req[source] = result.data;
    next();
  };
}
