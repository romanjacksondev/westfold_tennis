-- CreateEnum
CREATE TYPE "DrawStatus" AS ENUM ('NONE', 'DRAFT', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "DrawPhase" AS ENUM ('GROUP', 'PLAYOFF');

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "drawConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "drawGroupOrder" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "drawSeed" TEXT,
ADD COLUMN     "drawSeedMode" TEXT,
ADD COLUMN     "drawStatus" "DrawStatus" NOT NULL DEFAULT 'NONE';

-- CreateTable
CREATE TABLE "DrawMatch" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "phase" "DrawPhase" NOT NULL,
    "round" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "stage" "MatchStage" NOT NULL,
    "player1Id" TEXT,
    "player2Id" TEXT,
    "seed1" INTEGER,
    "seed2" INTEGER,
    "source1" JSONB,
    "source2" JSONB,
    "isBye" BOOLEAN NOT NULL DEFAULT false,
    "nextDrawMatchId" TEXT,
    "nextSlot" INTEGER,
    "matchId" TEXT,

    CONSTRAINT "DrawMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DrawMatch_matchId_key" ON "DrawMatch"("matchId");

-- CreateIndex
CREATE INDEX "DrawMatch_tournamentId_idx" ON "DrawMatch"("tournamentId");

-- CreateIndex
CREATE UNIQUE INDEX "DrawMatch_tournamentId_phase_round_position_key" ON "DrawMatch"("tournamentId", "phase", "round", "position");

-- AddForeignKey
ALTER TABLE "DrawMatch" ADD CONSTRAINT "DrawMatch_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawMatch" ADD CONSTRAINT "DrawMatch_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawMatch" ADD CONSTRAINT "DrawMatch_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawMatch" ADD CONSTRAINT "DrawMatch_nextDrawMatchId_fkey" FOREIGN KEY ("nextDrawMatchId") REFERENCES "DrawMatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawMatch" ADD CONSTRAINT "DrawMatch_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;
