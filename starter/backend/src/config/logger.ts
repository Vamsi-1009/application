import pino from "pino";

// Redact anything that should never end up in a log line - see Stage 12.
export const logger = pino({
  level: process.env.NODE_ENV === "test" ? "silent" : "info",
  redact: ["req.headers.authorization", "req.headers.cookie", "*.password", "*.codeHash", "*.tokenHash"],
});
