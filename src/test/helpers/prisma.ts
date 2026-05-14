import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString =
  process.env.TEST_DATABASE_URL ??
  "postgresql://clujparticipa:clujparticipa@localhost:55432/clujparticipa_test";

export const testPrisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});
