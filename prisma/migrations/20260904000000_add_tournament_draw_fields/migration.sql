-- AlterTable: add drawSize and qualifiers to Tournament (both nullable)
ALTER TABLE "Tournament" ADD COLUMN "drawSize" INTEGER;
ALTER TABLE "Tournament" ADD COLUMN "qualifiers" INTEGER;
