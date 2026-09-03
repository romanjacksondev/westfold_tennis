-- Allow tournaments to exist before a champion is known.
ALTER TABLE "Tournament" ALTER COLUMN "championId" DROP NOT NULL;
