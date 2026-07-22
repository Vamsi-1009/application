import { customAlphabet } from "nanoid";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../middleware/errorHandler";
import { secrets } from "../../config/secrets";

// Unambiguous alphabet (no 0/O/1/l confusion) for a code people might read aloud.
const nanoid = customAlphabet("23456789abcdefghijkmnpqrstuvwxyz", 7);

export async function createLink(userId: string, targetUrl: string) {
  // Retry on the (very rare) collision rather than trusting a single
  // random draw - the @unique constraint on `code` is the real guarantee.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = nanoid();
    try {
      const link = await prisma.link.create({ data: { userId, targetUrl, code } });
      return { ...link, shortUrl: `${secrets.PUBLIC_BASE_URL}/${link.code}` };
    } catch (err: unknown) {
      const isUniqueViolation = (err as { code?: string })?.code === "P2002";
      if (!isUniqueViolation) throw err;
    }
  }
  throw new HttpError(500, "Could not generate a unique code, try again", "code_generation_failed");
}

export async function listLinks(userId: string, cursor?: string) {
  const links = await prisma.link.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });
  return links.map((l) => ({ ...l, shortUrl: `${secrets.PUBLIC_BASE_URL}/${l.code}` }));
}

export async function deleteLink(userId: string, id: string) {
  const link = await prisma.link.findUnique({ where: { id } });
  if (!link) throw new HttpError(404, "Link not found", "not_found");
  // Ownership check - this is the BOLA/IDOR guard from Stage 03/18.
  if (link.userId !== userId) throw new HttpError(403, "Not your link", "forbidden");
  await prisma.link.delete({ where: { id } });
}

export async function resolveAndCount(code: string): Promise<string> {
  const link = await prisma.link.update({
    where: { code },
    data: { clickCount: { increment: 1 } },
  }).catch(() => null);
  if (!link) throw new HttpError(404, "Short link not found", "not_found");
  return link.targetUrl;
}
