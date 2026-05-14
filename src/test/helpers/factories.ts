import type { Category, District, Status } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

interface IdeaOverrides {
  id?: string;
  title?: string;
  description?: string;
  category?: Category;
  district?: District;
  latitude?: number;
  longitude?: number;
  status?: Status;
}

const DEFAULT_IDEA = {
  title: "Test Idea",
  description: "A test idea description that is at least 10 chars",
  category: "INFRASTRUCTURE" as const,
  district: "MANASTUR" as const,
  latitude: 46.77,
  longitude: 23.6,
  status: "SUBMITTED" as const,
};

export async function createIdea(
  prisma: PrismaClient,
  overrides: IdeaOverrides = {}
) {
  return prisma.idea.create({
    data: {
      ...DEFAULT_IDEA,
      ...overrides,
    },
  });
}
