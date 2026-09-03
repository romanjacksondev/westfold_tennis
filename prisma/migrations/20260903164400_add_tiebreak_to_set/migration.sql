-- AlterTable
ALTER TABLE "Set" ADD COLUMN     "hasTiebreak" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tiebreakPlayer1Points" INTEGER,
ADD COLUMN     "tiebreakPlayer2Points" INTEGER;
