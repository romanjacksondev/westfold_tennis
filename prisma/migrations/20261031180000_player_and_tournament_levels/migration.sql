CREATE TABLE "Level" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Level_name_key" ON "Level"("name");

CREATE TABLE "PlayerLevelHistory" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "levelId" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerLevelHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PlayerLevelHistory_playerId_createdAt_idx" ON "PlayerLevelHistory"("playerId", "createdAt");

ALTER TABLE "Player" ADD COLUMN "levelId" TEXT;
ALTER TABLE "Tournament" ADD COLUMN "levelId" TEXT;

ALTER TABLE "Player" ADD CONSTRAINT "Player_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PlayerLevelHistory" ADD CONSTRAINT "PlayerLevelHistory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerLevelHistory" ADD CONSTRAINT "PlayerLevelHistory_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Default scale, lowest to highest.
INSERT INTO "Level" ("id", "name", "order") VALUES
  ('level-c', 'C', 1),
  ('level-b', 'B', 2),
  ('level-b1', 'B1', 3),
  ('level-a', 'A', 4),
  ('level-a1', 'A1', 5);
