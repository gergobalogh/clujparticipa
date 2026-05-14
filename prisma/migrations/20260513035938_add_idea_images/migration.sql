-- CreateTable
CREATE TABLE "IdeaImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "ideaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdeaImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IdeaImage_ideaId_order_idx" ON "IdeaImage"("ideaId", "order");

-- AddForeignKey
ALTER TABLE "IdeaImage" ADD CONSTRAINT "IdeaImage_ideaId_fkey" FOREIGN KEY ("ideaId") REFERENCES "Idea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
