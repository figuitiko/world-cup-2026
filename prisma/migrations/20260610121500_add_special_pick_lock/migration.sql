-- CreateTable
CREATE TABLE "SpecialPickLock" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "championLockedAt" TIMESTAMP(3),
    "topScorerLockedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecialPickLock_pkey" PRIMARY KEY ("id")
);
