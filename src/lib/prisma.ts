import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const rawDatabaseUrl = process.env.DATABASE_URL;
if (!rawDatabaseUrl) {
  throw new Error("DATABASE_URL is missing. Add it to your environment.");
}

const databaseUrl = (() => {
  try {
    const url = new URL(rawDatabaseUrl);
    const isLocalHost =
      url.hostname === "localhost" || url.hostname === "127.0.0.1";

    if (!isLocalHost && !url.searchParams.has("sslmode")) {
      url.searchParams.set("sslmode", "require");
    }
    return url.toString();
  } catch {
    return rawDatabaseUrl;
  }
})();

const databaseHost = (() => {
  try {
    return new URL(databaseUrl).hostname;
  } catch {
    return "";
  }
})();

const shouldUseInsecureSsl =
  databaseHost.length > 0 &&
  databaseHost !== "localhost" &&
  databaseHost !== "127.0.0.1";

const adapter = new PrismaPg({
  connectionString: databaseUrl,
  ssl: shouldUseInsecureSsl ? { rejectUnauthorized: false } : undefined,
});

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
