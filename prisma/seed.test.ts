import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client';
import { hash } from 'bcryptjs';

const databaseUrl = process.env.TEST_DATABASE_URL;
const schema = process.env.TEST_DATABASE_SCHEMA;
if (
  !databaseUrl ||
  !schema?.startsWith('westfold_test_') ||
  new URL(databaseUrl).searchParams.get('schema') !== schema
) {
  throw new Error(
    'The integration seed only accepts the isolated test schema from TEST_DATABASE_URL.',
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    {
      connectionString: databaseUrl,
    },
    { schema: new URL(databaseUrl).searchParams.get('schema') ?? undefined },
  ),
});
const now = new Date();
const dateMonthsAgo = (months: number) => {
  const date = new Date(now);
  date.setMonth(date.getMonth() - months);
  return date;
};

async function main() {
  const testPassword = await hash('westfold-e2e-password', 4);
  const levels = await prisma.level.findMany({ select: { id: true, name: true } });
  const levelIds = Object.fromEntries(levels.map((level) => [level.name, level.id]));

  await prisma.venue.create({
    data: { id: 'it-venue', name: 'Integration Court', phone: '', address: '' },
  });
  await prisma.surface.create({ data: { id: 'it-surface', name: 'Integration Surface' } });
  await prisma.tournamentCategory.create({
    data: {
      id: 'it-category',
      name: 'Integration Category',
      pointsPerMatchWin: 100,
      tournamentCategoryPoints: {
        create: [
          { initial_position: 1, final_position: 1, points: 1000 },
          { initial_position: 2, final_position: 2, points: 600 },
          { initial_position: 3, final_position: 4, points: 300 },
          { initial_position: 5, final_position: 8, points: 100 },
        ],
      },
    },
  });
  await prisma.tournamentType.createMany({
    data: [
      { id: 'it-round-robin', name: 'Round Robin' },
      { id: 'it-playoffs', name: 'Playoffs' },
    ],
  });

  await prisma.player.createMany({
    data: [
      { id: 'it-alex-one', name: 'Alex Same', gender: 'MALE', levelId: levelIds.B },
      { id: 'it-alex-two', name: 'Alex Same', gender: 'MALE', levelId: levelIds.A },
      { id: 'it-rival', name: 'Rival', gender: 'MALE', levelId: levelIds.B },
      { id: 'it-women', name: 'Woman Player', gender: 'FEMALE', levelId: levelIds.B },
      { id: 'it-e2e-player-one', name: 'E2E Player One', gender: 'MALE', levelId: levelIds.B },
      { id: 'it-e2e-player-two', name: 'E2E Player Two', gender: 'MALE', levelId: levelIds.B },
      { id: 'it-e2e-player-three', name: 'E2E Player Three', gender: 'MALE', levelId: levelIds.B },
    ],
  });
  await prisma.user.createMany({
    data: [
      {
        id: 'it-admin-user',
        name: 'Integration Admin',
        email: 'integration-admin@example.test',
        password: testPassword,
        role: 'ADMIN',
      },
      {
        id: 'it-regular-user',
        name: 'Integration User',
        email: 'integration-user@example.test',
        password: testPassword,
        role: 'USER',
      },
    ],
  });

  await prisma.tournament.createMany({
    data: [
      {
        id: 'it-tournament-b',
        name: 'Level B Finished',
        venueId: 'it-venue',
        surfaceId: 'it-surface',
        tournamentCategoryId: 'it-category',
        tournamentTypeId: 'it-round-robin',
        championId: 'it-alex-one',
        levelId: levelIds.B,
        status: 'FINISHED',
        date: dateMonthsAgo(2),
      },
      {
        id: 'it-tournament-b-old',
        name: 'Older Level B Finished',
        venueId: 'it-venue',
        surfaceId: 'it-surface',
        tournamentCategoryId: 'it-category',
        tournamentTypeId: 'it-round-robin',
        championId: 'it-alex-one',
        levelId: levelIds.B,
        status: 'FINISHED',
        date: dateMonthsAgo(11),
      },
      {
        id: 'it-tournament-a',
        name: 'Level A Finished',
        venueId: 'it-venue',
        surfaceId: 'it-surface',
        tournamentCategoryId: 'it-category',
        tournamentTypeId: 'it-round-robin',
        championId: 'it-alex-two',
        levelId: levelIds.A,
        status: 'FINISHED',
        date: dateMonthsAgo(1),
      },
      {
        id: 'it-tournament-none',
        name: 'Unlevelled Finished',
        venueId: 'it-venue',
        surfaceId: 'it-surface',
        tournamentCategoryId: 'it-category',
        tournamentTypeId: 'it-round-robin',
        championId: 'it-women',
        status: 'FINISHED',
        date: dateMonthsAgo(1),
      },
      {
        id: 'it-tournament-open',
        name: 'Unfinished',
        venueId: 'it-venue',
        surfaceId: 'it-surface',
        tournamentCategoryId: 'it-category',
        tournamentTypeId: 'it-round-robin',
        status: 'IN_PROGRESS',
        date: dateMonthsAgo(1),
      },
      {
        id: 'it-tournament-prep-few',
        name: 'Preparation with too few players',
        venueId: 'it-venue',
        surfaceId: 'it-surface',
        tournamentCategoryId: 'it-category',
        tournamentTypeId: 'it-round-robin',
        drawSize: 4,
        status: 'PREPARATION',
      },
      {
        id: 'it-tournament-prep-over',
        name: 'Preparation with too many players',
        venueId: 'it-venue',
        surfaceId: 'it-surface',
        tournamentCategoryId: 'it-category',
        tournamentTypeId: 'it-round-robin',
        drawSize: 2,
        status: 'PREPARATION',
      },
    ],
  });

  await prisma.tournament.update({
    where: { id: 'it-tournament-prep-few' },
    data: { players: { connect: [{ id: 'it-alex-one' }] } },
  });
  await prisma.tournament.update({
    where: { id: 'it-tournament-prep-over' },
    data: {
      players: { connect: [{ id: 'it-alex-one' }, { id: 'it-alex-two' }, { id: 'it-rival' }] },
    },
  });

  await prisma.match.createMany({
    data: [
      {
        id: 'it-match-b',
        tournamentId: 'it-tournament-b',
        player1Id: 'it-alex-one',
        player2Id: 'it-rival',
        winnerId: 'it-alex-one',
        stage: 'GROUP',
      },
      {
        id: 'it-match-b-old',
        tournamentId: 'it-tournament-b-old',
        player1Id: 'it-alex-one',
        player2Id: 'it-rival',
        winnerId: 'it-alex-one',
        stage: 'GROUP',
      },
      {
        id: 'it-match-a',
        tournamentId: 'it-tournament-a',
        player1Id: 'it-alex-two',
        player2Id: 'it-rival',
        winnerId: 'it-alex-two',
        stage: 'GROUP',
      },
      {
        id: 'it-match-none',
        tournamentId: 'it-tournament-none',
        player1Id: 'it-women',
        player2Id: 'it-rival',
        winnerId: 'it-women',
        stage: 'GROUP',
      },
      {
        id: 'it-match-open',
        tournamentId: 'it-tournament-open',
        player1Id: 'it-alex-one',
        player2Id: 'it-rival',
        winnerId: 'it-alex-one',
        stage: 'GROUP',
      },
    ],
  });
  await prisma.set.create({
    data: {
      id: 'it-set-a',
      matchId: 'it-match-a',
      winnerId: 'it-alex-two',
      hasTiebreak: true,
      tiebreakPlayer1Points: 7,
      tiebreakPlayer2Points: 5,
      games: {
        create: Array.from({ length: 13 }, (_, index) => ({
          winnerId: index < 7 ? 'it-alex-two' : 'it-rival',
        })),
      },
    },
  });
  await prisma.set.create({
    data: {
      id: 'it-set-none',
      matchId: 'it-match-none',
      winnerId: 'it-women',
      hasTiebreak: true,
      tiebreakPlayer1Points: 7,
      tiebreakPlayer2Points: 4,
      games: {
        create: Array.from({ length: 13 }, (_, index) => ({
          winnerId: index < 7 ? 'it-women' : 'it-rival',
        })),
      },
    },
  });
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
