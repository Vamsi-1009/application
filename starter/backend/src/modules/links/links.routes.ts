import { Router } from "express";
import { asyncHandler } from "../../middleware/errorHandler";
import { validate } from "../../middleware/validate";
import { requireAuth } from "../../middleware/auth";
import { redirectRateLimiter } from "../../middleware/rateLimit";
import { createLinkSchema, idParamSchema, codeParamSchema, paginationQuerySchema } from "./links.schemas";
import * as ctrl from "./links.controller";

export const linksRouter = Router();

linksRouter.post("/links", requireAuth, validate(createLinkSchema), asyncHandler(ctrl.createLinkHandler));
linksRouter.get("/links", requireAuth, validate(paginationQuerySchema, "query"), asyncHandler(ctrl.listLinksHandler));
linksRouter.delete("/links/:id", requireAuth, validate(idParamSchema, "params"), asyncHandler(ctrl.deleteLinkHandler));

// Public redirect route - deliberately separate from the /api/links router
// above since it has no auth and lives at the site root (/:code), not /api.
export const redirectRouter = Router();
redirectRouter.get("/:code", redirectRateLimiter, validate(codeParamSchema, "params"), asyncHandler(ctrl.redirectHandler));
