import { PrismaClient } from "@prisma/client";

// One shared client - see Stage 18's file-by-file walkthrough for why.
export const prisma = new PrismaClient();
