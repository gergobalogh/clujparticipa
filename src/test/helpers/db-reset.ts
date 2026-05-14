import type { PrismaClient } from "@prisma/client";

export async function truncateAll(prisma: PrismaClient): Promise<void> {
  const tablenames = await prisma.$queryRaw<
    { tablename: string }[]
  >`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`;

  const tables = tablenames
    .map((t) => t.tablename)
    .filter((t) => t !== "_prisma_migrations");

  for (const table of tables) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "${table}" CASCADE;`
    );
  }
}
