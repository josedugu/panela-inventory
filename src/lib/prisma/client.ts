import { PrismaClient } from "@prisma/client";

// Singleton pattern para Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};
const databaseUrl = `${process.env.DIRECT_URL as string}?schema=dev`;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: { db: { url: process.env.DATABASE_URL } },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
