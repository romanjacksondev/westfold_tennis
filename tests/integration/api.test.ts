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

describe('health, audit trail and logging', () => {
  const auditFor = (entityId: string) => prisma.auditLog.findMany({ where: { entityId }, orderBy: { createdAt: 'asc' } });

  it('exposes a public health check that verifies the database', async () => {
    const response = await request('/api/health');
    assert.equal(response.status, 200);
    assert.equal((await json(response)).db, 'ok');
  });

  it('adds a request id header to API responses', async () => {
    const response = await request('/api/admin/levels', { role: 'ADMIN' });
    assert.match(response.headers.get('x-request-id') ?? '', /^[0-9a-f-]{36}$/);
  });

  it('audits admin create, update and archive with actor and field-level diff', async () => {
    const created = await request('/api/admin/venues', { role: 'ADMIN', method: 'POST', body: { name: 'Audit Venue', address: 'Calle 1', phone: '123' } });
    assert.equal(created.status, 201);
    const id = (await json(created)).data.id as string;

    assert.equal((await request(`/api/admin/venues/${id}`, { role: 'ADMIN', method: 'PATCH', body: { name: 'Audit Venue 2' } })).status, 200);
    assert.equal((await request(`/api/admin/venues/${id}`, { role: 'ADMIN', method: 'DELETE' })).status, 200);

    const entries = await auditFor(id);
    assert.deepEqual(entries.map((entry) => entry.action), ['CREATE', 'UPDATE', 'DELETE']);
    assert.ok(entries.every((entry) => entry.entity === 'Venue' && entry.actorId === 'it-admin-user' && entry.actorRole === 'ADMIN'));
    assert.deepEqual(entries[1].before, { name: 'Audit Venue' });
    assert.deepEqual(entries[1].after, { name: 'Audit Venue 2' });
    assert.ok((entries[0].metadata as { requestId?: string }).requestId);
  });

  it('never stores passwords in the audit trail when creating or updating users', async () => {
    const email = `audit-${Date.now()}@example.com`;
    const created = await request('/api/admin/users', { role: 'ADMIN', method: 'POST', body: { email, password: 'super-secret-password', role: 'USER' } });
    assert.equal(created.status, 201);
    const id = (await json(created)).data.id as string;
    assert.equal((await request(`/api/admin/users/${id}`, { role: 'ADMIN', method: 'PATCH', body: { password: 'another-secret-password' } })).status, 200);

    const entries = await auditFor(id);
    assert.equal(JSON.stringify(entries).includes('secret-password'), false);
    assert.deepEqual(entries[1].metadata && (entries[1].metadata as { pwChanged?: boolean }).pwChanged, true);
  });

  it('records denied admin access and restricts the audit API to admins', async () => {
    assert.equal((await request('/api/admin/levels', { role: 'USER' })).status, 403);
    assert.equal((await request('/api/admin/audit-logs', { role: 'USER' })).status, 403);
    assert.equal((await request('/api/admin/audit-logs')).status, 401);
    assert.ok((await prisma.auditLog.count({ where: { action: 'ACCESS_DENIED', actorId: 'it-regular-user' } })) >= 1);

    const response = await request('/api/admin/audit-logs?action=CREATE&entity=Venue&pageSize=5', { role: 'ADMIN' });
    assert.equal(response.status, 200);
    const page = await json(response);
    assert.ok(page.total >= 1);
    assert.ok(page.items.every((item: { action: string; entity: string }) => item.action === 'CREATE' && item.entity === 'Venue'));
  });

  it('records failed logins without keeping the password', async () => {
    const csrfResponse = await fetch(new URL('/api/auth/csrf', baseUrl));
    const { csrfToken } = await csrfResponse.json();
    const cookie = (csrfResponse.headers.getSetCookie?.() ?? []).map((value) => value.split(';')[0]).join('; ');
    const email = `nobody-${Date.now()}@example.com`;
    await fetch(new URL('/api/auth/callback/credentials', baseUrl), {
      method: 'POST',
      redirect: 'manual',
      headers: { 'content-type': 'application/x-www-form-urlencoded', cookie },
      body: new URLSearchParams({ csrfToken, email, password: 'wrong-password-123', json: 'true' }),
    });

    const entries = await prisma.auditLog.findMany({ where: { action: 'LOGIN_FAILURE', actorEmail: { startsWith: 'n***@' } } });
    assert.ok(entries.length >= 1);
    assert.equal(JSON.stringify(entries).includes('wrong-password-123'), false);
    assert.equal((entries[0].metadata as { reason?: string }).reason, 'unknown_user');
  });
});

after(async () => {
  await prisma.$disconnect();
});

type DrawViewMatch = {
  id: string;
  phase: 'GROUP' | 'PLAYOFF';
  round: number;
  position: number;
  isBye: boolean;
  walkover?: boolean;
  seed1: number | null;
  seed2: number | null;
  player1: { id: string } | null;
  player2: { id: string } | null;
  matchId: string | null;
  winnerId: string | null;
};

const drawView = async (tournamentId: string) =>
  json(await request(`/api/admin/draws/${tournamentId}`, { role: 'ADMIN' })) as Promise<{
    drawStatus: string;
    matches: DrawViewMatch[];
    groupOrder: string[];
  }>;

const drawAction = (tournamentId: string, body: Record<string, unknown>, role: 'ADMIN' | 'USER' = 'ADMIN') =>
  request(`/api/admin/draws/${tournamentId}`, { role, method: 'POST', body });

const slotOf = async (tournamentId: string, phase: 'GROUP' | 'PLAYOFF', round: number, position: number) => {
  const found = (await drawView(tournamentId)).matches.find(
    (match) => match.phase === phase && match.round === round && match.position === position,
  );
  assert.ok(found, `missing draw match ${phase}:${round}:${position}`);
  return found;
};

const playSlot = (slot: DrawViewMatch, winnerId: string, role: 'ADMIN' | 'USER' = 'ADMIN') => {
  const [first, second] = [slot.player1!.id, slot.player2!.id];
  const winsFirst = winnerId === first;
  return request('/api/add-match', {
    role,
    method: 'POST',
    body: {
      drawMatchId: slot.id,
      idPlayer1: first,
      idPlayer2: second,
      winner: winnerId,
      sets: [1, 2].map(() => ({
        gamesPlayer1: winsFirst ? 6 : 3,
        gamesPlayer2: winsFirst ? 3 : 6,
        winner: winnerId,
      })),
    },
  });
};

describe('official draw', () => {
  it('only lets admins draw, and does not start without a draw', async () => {
    assert.equal((await drawAction('it-draw-playoffs', { action: 'generate' }, 'USER')).status, 403);
    const start = await request('/api/admin/tournaments/it-draw-playoffs', {
      role: 'ADMIN',
      method: 'PATCH',
      body: { action: 'start' },
    });
    assert.equal(start.status, 400);
    assert.match((await json(start)).message, /sorteo/);
  });

  it('generates a seeded draft, reshuffles, swaps and confirms it', async () => {
    const generated = await drawAction('it-draw-playoffs', { action: 'generate', seedMode: 'LEVEL' });
    assert.equal(generated.status, 200);
    let view = await drawView('it-draw-playoffs');
    assert.equal(view.drawStatus, 'DRAFT');
    assert.equal(view.matches.length, 3);
    const seeds = view.matches.filter((m) => m.round === 1).flatMap((m) => [m.seed1, m.seed2]);
    assert.ok(seeds.includes(1), 'the strongest player is seed 1');
    const seedOne = view.matches.find((m) => m.seed1 === 1 || m.seed2 === 1)!;
    assert.equal(seedOne.seed1 === 1 ? seedOne.player1!.id : seedOne.player2!.id, 'it-draw-p1');

    assert.equal((await drawAction('it-draw-playoffs', { action: 'reshuffle' })).status, 200);
    view = await drawView('it-draw-playoffs');
    const [first, second] = view.matches.filter((m) => m.round === 1);
    const swapped = await drawAction('it-draw-playoffs', {
      action: 'swap',
      a: { drawMatchId: first.id, slot: 1 },
      b: { drawMatchId: second.id, slot: 2 },
    });
    assert.equal(swapped.status, 200);
    const after = await drawView('it-draw-playoffs');
    assert.equal(after.matches.find((m) => m.id === first.id)!.player1!.id, second.player2!.id);
    assert.equal(after.matches.find((m) => m.id === second.id)!.player2!.id, first.player1!.id);

    assert.equal((await drawAction('it-draw-playoffs', { action: 'confirm' })).status, 200);
    assert.equal((await drawView('it-draw-playoffs')).drawStatus, 'CONFIRMED');
    assert.equal((await drawAction('it-draw-playoffs', { action: 'reshuffle' })).status, 409);

    const audits = await prisma.auditLog.findMany({
      where: { entityId: 'it-draw-playoffs', action: { in: ['DRAW_GENERATE', 'DRAW_RESHUFFLE', 'DRAW_SWAP', 'DRAW_CONFIRM'] } },
    });
    assert.equal(new Set(audits.map((entry) => entry.action)).size, 4);
  });

  it('locks participants, format and qualifiers once the draw exists', async () => {
    const locked = await request('/api/admin/tournaments/it-draw-playoffs', {
      role: 'ADMIN',
      method: 'PATCH',
      body: { playerIds: ['it-draw-p1', 'it-draw-p2'] },
    });
    assert.equal(locked.status, 409);
    const sameParticipants = await request('/api/admin/tournaments/it-draw-playoffs', {
      role: 'ADMIN',
      method: 'PATCH',
      body: { playerIds: ['it-draw-p4', 'it-draw-p3', 'it-draw-p2', 'it-draw-p1'], drawSize: 8 },
    });
    assert.equal(sameParticipants.status, 200);
  });

  it('only accepts results through a pending draw match and advances the winner', async () => {
    const started = await request('/api/admin/tournaments/it-draw-playoffs', {
      role: 'ADMIN',
      method: 'PATCH',
      body: { action: 'start' },
    });
    assert.equal(started.status, 200);

    const semifinalOne = await slotOf('it-draw-playoffs', 'PLAYOFF', 1, 0);
    const semifinalTwo = await slotOf('it-draw-playoffs', 'PLAYOFF', 1, 1);
    const free = await request('/api/add-match', {
      role: 'ADMIN',
      method: 'POST',
      body: { idPlayer1: 'it-draw-p1', idPlayer2: 'it-draw-p2', winner: 'it-draw-p1', sets: [{ gamesPlayer1: 6, gamesPlayer2: 1, winner: 'it-draw-p1' }] },
    });
    assert.equal(free.status, 400);
    assert.equal((await playSlot(semifinalOne, semifinalOne.player1!.id, 'USER')).status, 403);

    const wrongPlayers = await request('/api/add-match', {
      role: 'ADMIN',
      method: 'POST',
      body: {
        drawMatchId: semifinalOne.id,
        idPlayer1: semifinalOne.player1!.id,
        idPlayer2: semifinalTwo.player1!.id,
        winner: semifinalOne.player1!.id,
        sets: [{ gamesPlayer1: 6, gamesPlayer2: 1, winner: semifinalOne.player1!.id }],
      },
    });
    assert.equal(wrongPlayers.status, 400);
    const finalSlot = await slotOf('it-draw-playoffs', 'PLAYOFF', 2, 0);
    assert.equal((await playSlot({ ...finalSlot, player1: semifinalOne.player1, player2: semifinalOne.player2 }, semifinalOne.player1!.id)).status, 409);

    assert.equal((await playSlot(semifinalOne, semifinalOne.player1!.id)).status, 201);
    assert.equal((await playSlot(semifinalOne, semifinalOne.player1!.id)).status, 409);
    assert.equal((await slotOf('it-draw-playoffs', 'PLAYOFF', 2, 0)).player1?.id, semifinalOne.player1!.id);

    const pending = await json(await request('/api/admin/draws/it-draw-playoffs/pending', { role: 'ADMIN' }));
    assert.equal(pending.pending.length, 1);

    const woWinner = semifinalTwo.player2!.id;
    const woNoWinner = await request('/api/add-match', {
      role: 'ADMIN',
      method: 'POST',
      body: { drawMatchId: semifinalTwo.id, idPlayer1: semifinalTwo.player1!.id, idPlayer2: woWinner, winner: 'it-draw-outsider', sets: [], walkover: true },
    });
    assert.equal(woNoWinner.status, 400);
    const wo = await request('/api/add-match', {
      role: 'ADMIN',
      method: 'POST',
      body: { drawMatchId: semifinalTwo.id, idPlayer1: semifinalTwo.player1!.id, idPlayer2: woWinner, winner: woWinner, sets: [], walkover: true },
    });
    assert.equal(wo.status, 201);
    const afterWo = await drawView('it-draw-playoffs');
    assert.equal(afterWo.matches.find((m) => m.id === semifinalTwo.id)!.walkover, true);
    assert.equal(afterWo.matches.find((m) => m.phase === 'PLAYOFF' && m.round === 2)!.player2?.id, woWinner);

    const finish = await request('/api/admin/tournaments/it-draw-playoffs', {
      role: 'ADMIN',
      method: 'PATCH',
      body: { action: 'finish' },
    });
    assert.equal(finish.status, 409);
  });

  it('corrects a result while the next match is pending and blocks it once the next match is played', async () => {
    const semifinalOne = await slotOf('it-draw-playoffs', 'PLAYOFF', 1, 0);
    const matchId = semifinalOne.matchId!;
    const otherPlayer = semifinalOne.player2!.id;

    const corrected = await request(`/api/admin/matches/${matchId}`, { role: 'ADMIN', method: 'PATCH', body: { winnerId: otherPlayer } });
    assert.equal(corrected.status, 200);
    assert.equal((await slotOf('it-draw-playoffs', 'PLAYOFF', 2, 0)).player1?.id, otherPlayer);

    const changedPlayers = await request(`/api/admin/matches/${matchId}`, { role: 'ADMIN', method: 'PATCH', body: { player1Id: 'it-rival' } });
    assert.equal(changedPlayers.status, 400);

    const finalSlot = await slotOf('it-draw-playoffs', 'PLAYOFF', 2, 0);
    assert.equal((await playSlot(finalSlot, finalSlot.player1!.id)).status, 201);

    const blocked = await request(`/api/admin/matches/${matchId}`, { role: 'ADMIN', method: 'PATCH', body: { winnerId: semifinalOne.player1!.id } });
    assert.equal(blocked.status, 409);
    const archiveBlocked = await request(`/api/admin/matches/${matchId}`, { role: 'ADMIN', method: 'DELETE' });
    assert.equal(archiveBlocked.status, 409);
  });

  it('closes the tournament with the computed champion and audits corrections after it finished', async () => {
    const finalSlot = await slotOf('it-draw-playoffs', 'PLAYOFF', 2, 0);
    const finish = await request('/api/admin/tournaments/it-draw-playoffs', {
      role: 'ADMIN',
      method: 'PATCH',
      body: { action: 'finish' },
    });
    assert.equal(finish.status, 200);
    const tournament = await prisma.tournament.findUniqueOrThrow({ where: { id: 'it-draw-playoffs' } });
    assert.equal(tournament.status, 'FINISHED');
    assert.equal(tournament.championId, finalSlot.winnerId);

    const ignored = await request('/api/admin/tournaments/it-draw-playoffs', {
      role: 'ADMIN',
      method: 'PATCH',
      body: { championId: 'it-rival' },
    });
    assert.equal(ignored.status, 400);
    assert.equal((await prisma.tournament.findUniqueOrThrow({ where: { id: 'it-draw-playoffs' } })).championId, finalSlot.winnerId);

    const loser = finalSlot.player1!.id === finalSlot.winnerId ? finalSlot.player2!.id : finalSlot.player1!.id;
    const withoutReason = await request(`/api/admin/matches/${finalSlot.matchId}`, { role: 'ADMIN', method: 'PATCH', body: { winnerId: loser } });
    assert.equal(withoutReason.status, 400);
    const corrected = await request(`/api/admin/matches/${finalSlot.matchId}`, {
      role: 'ADMIN',
      method: 'PATCH',
      body: { winnerId: loser, reason: 'Error de carga' },
    });
    assert.equal(corrected.status, 200);
    assert.equal((await json(corrected)).championChanged, true);
    assert.equal((await prisma.tournament.findUniqueOrThrow({ where: { id: 'it-draw-playoffs' } })).championId, loser);

    const entry = await prisma.auditLog.findFirst({ where: { action: 'TOURNAMENT_CORRECTION', entityId: 'it-draw-playoffs' } });
    assert.ok(entry);
    assert.equal((entry.metadata as { reason: string }).reason, 'Error de carga');
  });

  it('fills the playoff from the group table in a round robin with playoffs', async () => {
    assert.equal((await drawAction('it-draw-mixed', { action: 'generate' })).status, 200);
    assert.equal(
      (await request('/api/admin/tournaments/it-draw-mixed', { role: 'ADMIN', method: 'PATCH', body: { action: 'start' } })).status,
      200,
    );
    assert.equal((await drawView('it-draw-mixed')).drawStatus, 'CONFIRMED');

    const groupMatches = (await drawView('it-draw-mixed')).matches.filter((m) => m.phase === 'GROUP');
    assert.equal(groupMatches.length, 3);
    const ranking = ['it-draw-p1', 'it-draw-p2', 'it-draw-p3'];
    for (const slot of groupMatches) {
      const winner = ranking.find((id) => id === slot.player1!.id || id === slot.player2!.id)!;
      assert.equal((await playSlot(slot, winner)).status, 201);
    }
    const finalSlot = await slotOf('it-draw-mixed', 'PLAYOFF', 1, 0);
    assert.deepEqual([finalSlot.player1?.id, finalSlot.player2?.id].sort(), ['it-draw-p1', 'it-draw-p2']);

    assert.equal((await playSlot(finalSlot, 'it-draw-p1')).status, 201);
    assert.equal(
      (await request('/api/admin/tournaments/it-draw-mixed', { role: 'ADMIN', method: 'PATCH', body: { action: 'finish' } })).status,
      200,
    );
    assert.equal((await prisma.tournament.findUniqueOrThrow({ where: { id: 'it-draw-mixed' } })).championId, 'it-draw-p1');
  });

  it('exposes the official draw to signed-in users and keeps seeded data consistent', async () => {
    const publicResponse = await request('/api/tournaments/it-draw-mixed/draw', { role: 'USER' });
    const publicDraw = await json(publicResponse);
    assert.equal(publicResponse.status, 200, JSON.stringify(publicDraw));
    assert.equal(publicDraw.official, true);
    assert.ok(publicDraw.matches.length >= 4);

    const finished = await prisma.tournament.findMany({ where: { status: { in: ['FINISHED', 'IN_PROGRESS'] } } });
    for (const tournament of finished) {
      assert.equal(tournament.drawStatus, 'CONFIRMED', tournament.id);
      const matches = await prisma.match.findMany({ where: { tournamentId: tournament.id, deletedAt: null }, include: { drawMatch: true } });
      assert.ok(matches.every((match) => match.drawMatch), `${tournament.id} has matches outside the draw`);
    }
  });
});
