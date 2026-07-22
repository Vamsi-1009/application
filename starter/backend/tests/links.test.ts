import { describe, it, expect, vi } from "vitest";

// This is a lightweight unit test that doesn't require a real database -
// it exercises the ownership-check guard directly, since that's the
// single highest-value test in this codebase (the BOLA/IDOR check from
// Stage 03/18). A full integration suite would also spin up a real
// Postgres instance and test the HTTP layer end-to-end via supertest.

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    link: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { prisma } from "../src/lib/prisma";
import { deleteLink } from "../src/modules/links/links.service";
import { HttpError } from "../src/middleware/errorHandler";

describe("deleteLink", () => {
  it("refuses to delete a link owned by a different user", async () => {
    (prisma.link.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "link-1",
      userId: "owner-a",
      targetUrl: "https://example.com",
    });

    await expect(deleteLink("owner-b", "link-1")).rejects.toMatchObject({
      status: 403,
    } satisfies Partial<HttpError>);

    expect(prisma.link.delete).not.toHaveBeenCalled();
  });

  it("allows the owner to delete their own link", async () => {
    (prisma.link.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "link-1",
      userId: "owner-a",
      targetUrl: "https://example.com",
    });
    (prisma.link.delete as ReturnType<typeof vi.fn>).mockResolvedValue({});

    await expect(deleteLink("owner-a", "link-1")).resolves.toBeUndefined();
    expect(prisma.link.delete).toHaveBeenCalledWith({ where: { id: "link-1" } });
  });
});
