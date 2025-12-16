import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

const createPrismaClient = () =>
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["query", "error", "warn"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

export const db = global.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = db;
}
