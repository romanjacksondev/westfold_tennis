-- CreateEnum
CREATE TYPE "MatchStage" AS ENUM ('GROUP', 'ROUND_OF_16', 'QUARTERFINAL', 'SEMIFINAL', 'FINAL');

-- AlterTable
ALTER TABLE "Match" ADD COLUMN "stage" "MatchStage";

-- AlterTable
ALTER TABLE "TournamentCategory" ADD COLUMN "pointsPerMatchWin" INTEGER NOT NULL DEFAULT 0;

-- Initial value: 10% of the points awarded to the champion of the category.
UPDATE "TournamentCategory" c
SET "pointsPerMatchWin" = COALESCE(
  (SELECT MAX(p."points") / 10 FROM "TournamentCategoryPoints" p WHERE p."tournamentCategoryId" = c."id"),
  0
);

-- Every existing tournament was played as a round robin.
UPDATE "Tournament"
SET "tournamentTypeId" = (SELECT "id" FROM "TournamentType" WHERE "name" = 'Round Robin' LIMIT 1)
WHERE "tournamentTypeId" IS NULL;
