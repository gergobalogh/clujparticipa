-- AlterTable
ALTER TABLE "Idea" ADD COLUMN     "notifyOnStatusChange" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "submitterParticipantHash" TEXT,
ADD COLUMN     "unsubscribeToken" TEXT;

-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "notifyOnStatusChange" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unsubscribeToken" TEXT;

-- CreateTable
CREATE TABLE "FeasibilityNote" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "estimatedCostRonMin" INTEGER,
    "estimatedCostRonMax" INTEGER,
    "department" TEXT,
    "responseText" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeasibilityNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VotingConfig" (
    "id" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VotingConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressUpdate" (
    "id" TEXT NOT NULL,
    "ideaId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "imageUrl" TEXT,
    "author" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeasibilityNote_ideaId_key" ON "FeasibilityNote"("ideaId");

-- CreateIndex
CREATE INDEX "ProgressUpdate_ideaId_createdAt_idx" ON "ProgressUpdate"("ideaId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Idea_unsubscribeToken_key" ON "Idea"("unsubscribeToken");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_unsubscribeToken_key" ON "Vote"("unsubscribeToken");

-- AddForeignKey
ALTER TABLE "FeasibilityNote" ADD CONSTRAINT "FeasibilityNote_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressUpdate" ADD CONSTRAINT "ProgressUpdate_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
