-- AlterTable: add mergedIntoIdeaId column
ALTER TABLE "Idea" ADD COLUMN "mergedIntoIdeaId" TEXT;

-- Enum: add 4 new Status values (additive, zero downtime)
ALTER TYPE "Status" ADD VALUE IF NOT EXISTS 'ACCEPTED';
ALTER TYPE "Status" ADD VALUE IF NOT EXISTS 'NEEDS_REVISION';
ALTER TYPE "Status" ADD VALUE IF NOT EXISTS 'MERGED';
ALTER TYPE "Status" ADD VALUE IF NOT EXISTS 'WITHDRAWN';
