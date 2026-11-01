ALTER TABLE "Match" ADD COLUMN "playedAt" TIMESTAMP(3);

UPDATE "Match" SET "playedAt" = (SELECT "date" FROM "Tournament" WHERE "Tournament"."id" = "Match"."tournamentId");
