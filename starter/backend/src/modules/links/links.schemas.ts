import { z } from "zod";

export const createLinkSchema = z
  .object({
    targetUrl: z.string().url(),
  })
  .strict();

export const idParamSchema = z.object({ id: z.string().uuid() }).strict();
export const codeParamSchema = z.object({ code: z.string().min(1).max(20) }).strict();
export const paginationQuerySchema = z
  .object({
    cursor: z.string().optional(),
  })
  .strict();
