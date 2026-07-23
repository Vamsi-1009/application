import { z } from "zod";

// Blocks obvious SSRF/open-redirect targets: non-http(s) schemes, loopback,
// private/link-local ranges, and the cloud-metadata IP. Not exhaustive DNS
// rebinding protection - see Stage 04/19's security checklists for that.
const BLOCKED_HOSTNAMES = new Set(["localhost", "169.254.169.254", "metadata.google.internal"]);

function isPrivateOrLoopbackIp(hostname: string): boolean {
  const ipv4 = hostname.match(/^(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
  if (ipv4) {
    const a = Number(ipv4[1]);
    const b = Number(ipv4[2]);
    if (a === 127 || a === 10 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }
  if (hostname === "::1" || hostname.startsWith("fc") || hostname.startsWith("fd")) return true;
  return false;
}

export function isAllowedTargetUrl(value: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
  const hostname = parsed.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(hostname)) return false;
  if (isPrivateOrLoopbackIp(hostname)) return false;
  return true;
}

export const createLinkSchema = z
  .object({
    targetUrl: z
      .string()
      .url()
      .refine(isAllowedTargetUrl, { message: "targetUrl must be a public http(s) URL" }),
  })
  .strict();

export const idParamSchema = z.object({ id: z.string().uuid() }).strict();
export const codeParamSchema = z.object({ code: z.string().min(1).max(20) }).strict();
export const paginationQuerySchema = z
  .object({
    cursor: z.string().optional(),
  })
  .strict();
