-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Surface" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "tournamentTypeId" TEXT;

-- AlterTable
ALTER TABLE "TournamentCategory" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Venue" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "TournamentType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TournamentType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TournamentType_name_key" ON "TournamentType"("name");

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_tournamentTypeId_fkey" FOREIGN KEY ("tournamentTypeId") REFERENCES "TournamentType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
