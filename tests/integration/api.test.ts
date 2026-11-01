import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { PrismaPg } from '@prisma/adapter-pg';
import { encode } from 'next-auth/jwt';
import { PrismaClient } from '../../prisma/generated/client';

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing integration environment variable: ${name}`);
  return value;
}

const baseUrl = requiredEnv('INTEGRATION_BASE_URL');
const secret = requiredEnv('NEXTAUTH_SECRET');
const databaseUrl = requiredEnv('TEST_DATABASE_URL');
const databaseSchema = requiredEnv('TEST_DATABASE_SCHEMA');
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }, { schema: databaseSchema }),
});

async function sessionCookie(role: 'ADMIN' | 'USER') {
  const token = await encode({
    token: {
      sub: role === 'ADMIN' ? 'it-admin-user' : 'it-regular-user',
      id: role === 'ADMIN' ? 'it-admin-user' : 'it-regular-user',
      role,
      playerId: role === 'USER' ? 'it-alex-one' : null,
      playerNickname: null,
    },
    secret,
    maxAge: 60 * 60,
  });
  return `next-auth.session-token=${token}`;
}

async function request(
  path: string,
  options: { role?: 'ADMIN' | 'USER'; method?: string; body?: Record<string, unknown> } = {},
) {
  const headers = new Headers();
  if (options.body) headers.set('content-type', 'application/json');
  if (options.role) headers.set('cookie', await sessionCookie(options.role));
  return fetch(new URL(path, baseUrl), {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
}

async function json(response: Response) {
  return response.json();
}

describe('public API and visitor routes', () => {
  it('serves the home data, leaderboard and public information page without a session', async () => {
    const [home, leaderboard, information] = await Promise.all([
      request('/api/home'),
      request('/api/leaderboard?rankingMode=year&level=all'),
      request('/information'),
    ]);
    const [homePage, leaderboardPage] = await Promise.all([request('/'), request('/leaderboard')]);

    assert.equal(home.status, 200);
    assert.equal((await json(home)).me, null);
    assert.equal(leaderboard.status, 200);
    assert.equal(information.status, 200);
    assert.equal(homePage.status, 200);
    assert.equal(leaderboardPage.status, 200);
  });

  it('filters leaderboard points by level and by tournaments without a level', async () => {
    const levels = await json(await request('/api/leaderboard?rankingMode=year&level=all'));
    const levelB = await json(await request('/api/leaderboard?rankingMode=year&level=level-b'));
    const levelA = await json(await request('/api/leaderboard?rankingMode=year&level=level-a'));
    const unlevelled = await json(await request('/api/leaderboard?rankingMode=year&level=none'));

    assert.equal(levels.hasTournamentsWithoutLevel, true);
    assert.equal(levelB.hasTournamentsWithoutLevel, true);
    assert.equal(
      levelB.male.find((entry: { id: string }) => entry.id === 'it-alex-one').value.points,
      200,
    );
    assert.equal(
      levelB.male.some((entry: { id: string }) => entry.id === 'it-alex-two'),
      false,
    );
    assert.equal(
      levelA.male.find((entry: { id: string }) => entry.id === 'it-alex-two').value.points,
      100,
    );
    assert.equal(
      levels.male.find((entry: { id: string }) => entry.id === 'it-alex-one').value.points,
      levelB.male.find((entry: { id: string }) => entry.id === 'it-alex-one').value.points,
    );
    assert.equal(
      levels.male.find((entry: { id: string }) => entry.id === 'it-alex-two').value.points,
      levelA.male.find((entry: { id: string }) => entry.id === 'it-alex-two').value.points,
    );
    assert.equal(
      levels.male.filter((entry: { key: string }) => entry.key === 'Alex Same').length,
      2,
    );
    assert.equal(
      unlevelled.female.find((entry: { id: string }) => entry.id === 'it-women').value.points,
      100,
    );
  });

  it('supports rolling twelve-month and calendar-year windows and excludes unfinished tournaments', async () => {
    const rolling = await json(await request('/api/leaderboard?rankingMode=year&level=level-b'));
    const calendar = await json(
      await request('/api/leaderboard?rankingMode=calendar&level=level-b'),
    );
    assert.equal(
      rolling.male.find((entry: { id: string }) => entry.id === 'it-alex-one').value.points,
      200,
    );
    assert.equal(
      calendar.male.find((entry: { id: string }) => entry.id === 'it-alex-one').value.points,
      100,
    );
    assert.equal(
      rolling.male.some((entry: { key: string }) => entry.key === 'Unfinished'),
      false,
    );
  });
});

describe('authorization', () => {
  it('rejects anonymous private API access and non-admin access to admin APIs', async () => {
    assert.equal((await request('/api/matches')).status, 401);
    assert.equal((await request('/api/admin/levels')).status, 401);
    assert.equal((await request('/api/admin/levels', { role: 'USER' })).status, 403);
  });
});

describe('admin level and tournament APIs', () => {
  let createdLevelId: string;

  before(async () => {
    const levelsResponse = await request('/api/admin/levels', { role: 'ADMIN' });
    assert.equal(levelsResponse.status, 200);
    const levels = await json(levelsResponse);
    assert.deepEqual(
      levels.map((level: { name: string }) => level.name),
      ['A1', 'A', 'B1', 'B', 'C'],
    );
  });

  it('persists draw size and playoff qualifiers when creating a tournament', async () => {
    const response = await request('/api/admin/tournaments', {
      role: 'ADMIN',
      method: 'POST',
      body: {
        name: 'Integration Draw Configuration',
        date: '2026-10-31',
        venueId: 'it-venue',
        surfaceId: 'it-surface',
        tournamentCategoryId: 'it-category',
        tournamentTypeId: 'it-playoffs',
        drawSize: 3,
        qualifiers: 2,
      },
    });

    assert.equal(response.status, 201);
    const { data } = await json(response);
    assert.equal(data.drawSize, 3);
    assert.equal(data.qualifiers, 2);
  });

  it('supports level CRUD and records player level history only when changed', async () => {
    const created = await request('/api/admin/levels', {
      role: 'ADMIN',
      method: 'POST',
      body: { name: 'Integration Level', order: 6 },
    });
    assert.equal(created.status, 201);
    createdLevelId = (await json(created)).data.id;

    const unchanged = await request('/api/admin/players/it-women', {
      role: 'ADMIN',
      method: 'PATCH',
      body: { levelId: 'level-b', levelReason: 'Same level' },
    });
    assert.equal(unchanged.status, 200);
    assert.equal(await prisma.playerLevelHistory.count({ where: { playerId: 'it-women' } }), 0);

    const changed = await request('/api/admin/players/it-women', {
      role: 'ADMIN',
      method: 'PATCH',
      body: { levelId: 'level-a', levelReason: 'Integration promotion' },
    });
    assert.equal(changed.status, 200);
    const history = await prisma.playerLevelHistory.findMany({
      where: { playerId: 'it-women' },
      select: { levelId: true, reason: true },
    });
    assert.deepEqual(history, [{ levelId: 'level-a', reason: 'Integration promotion' }]);

    const updated = await request(`/api/admin/levels/${createdLevelId}`, {
      role: 'ADMIN',
      method: 'PATCH',
      body: { order: 7 },
    });
    assert.equal(updated.status, 200);

    const deleted = await request(`/api/admin/levels/${createdLevelId}`, {
      role: 'ADMIN',
      method: 'DELETE',
    });
    assert.equal(deleted.status, 200);
  });

  it('can change only a finished tournament level without clearing its champion', async () => {
    const response = await request('/api/admin/tournaments/it-tournament-b', {
      role: 'ADMIN',
      method: 'PATCH',
      body: { levelId: 'level-a' },
    });
    assert.equal(response.status, 200);

    const read = await request('/api/admin/tournaments', { role: 'ADMIN' });
    const tournaments = await json(read);
    const updated = tournaments.find(
      (tournament: { id: string }) => tournament.id === 'it-tournament-b',
    );
    assert.equal(updated.champion?.name, 'Alex Same');
    assert.equal(updated.level?.id, 'level-a');

    const forbidden = await request('/api/admin/tournaments/it-tournament-b', {
      role: 'ADMIN',
      method: 'PATCH',
      body: { name: 'Should not change' },
    });
    assert.equal(forbidden.status, 400);
  });

  it('validates minimum players and configured draw capacity when starting', async () => {
    const tooFew = await request('/api/admin/tournaments/it-tournament-prep-few', {
      role: 'ADMIN',
      method: 'PATCH',
      body: { action: 'start' },
    });
    const tooMany = await request('/api/admin/tournaments/it-tournament-prep-over', {
      role: 'ADMIN',
      method: 'PATCH',
      body: { action: 'start' },
    });
    assert.equal(tooFew.status, 400);
    assert.match((await json(tooFew)).message, /al menos 2 jugadores/);
    assert.equal(tooMany.status, 400);
    assert.match((await json(tooMany)).message, /superan el tamaño del cuadro/);
  });
});

describe('player-level API data', () => {
  it('returns a per-player level note in matches and level details in player stats', async () => {
    const matches = await json(await request('/api/matches?id=it-tournament-a', { role: 'USER' }));
    const rival = matches.playerStats.find((player: { id: string }) => player.id === 'it-rival');
    assert.equal(rival.levelNote, 'Juega 2 niveles arriba');
    assert.deepEqual(matches.matchSummary[0].sets[0], {
      gamesJugador1: 7,
      gamesJugador2: 6,
      hasTiebreak: true,
      tiebreakPlayer1Points: 7,
      tiebreakPlayer2Points: 5,
    });

    const stats = await json(await request('/api/players/it-alex-one/stats', { role: 'USER' }));
    assert.equal(stats.level.current.name, 'B');
    assert.equal(stats.level.suggestion, null);
    assert.equal(Array.isArray(stats.level.history), true);
  });
});

after(async () => {
  await prisma.$disconnect();
});
