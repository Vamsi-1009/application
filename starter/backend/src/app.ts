import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { corsAllowedOrigins } from "./config/secrets";
import { logger } from "./config/logger";
import { errorHandler, notFoundHandler, HttpError } from "./middleware/errorHandler";
import { authRouter } from "./modules/auth/auth.routes";
import { linksRouter, redirectRouter } from "./modules/links/links.routes";

export function createApp(): Express {
  const app = express();

  // Security headers on every response - see Stage 08's checklist.
  app.use(helmet());

  // Explicit origin allow-list, never "*" - see Stage 18's CORS walkthrough.
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || corsAllowedOrigins.includes(origin)) return callback(null, true);
        callback(new HttpError(403, "Origin not allowed by CORS policy", "cors_forbidden"));
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: "50kb" }));
  app.use(cookieParser());
  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === "/health" } }));

  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

  app.use("/api/auth", authRouter);
  app.use("/api", linksRouter);
  // Public short-link redirects live at the root, e.g. GET /ab12cd3
  app.use("/", redirectRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
