-- Humolabs Grand Prix category is discontinued (no tournaments use it).
DELETE FROM "TournamentCategoryPoints" WHERE "tournamentCategoryId" IN (SELECT "id" FROM "TournamentCategory" WHERE "name" = 'Humolabs Grand Prix');
DELETE FROM "TournamentCategory" WHERE "name" = 'Humolabs Grand Prix' AND NOT EXISTS (SELECT 1 FROM "Tournament" t WHERE t."tournamentCategoryId" = "TournamentCategory"."id");
