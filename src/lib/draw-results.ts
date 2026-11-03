import { logger } from '@/lib/logger';
import { calculatePlayerStats, formatSetScore } from '@/utils/utils';
import { advanceWinner, drawKey, revertAdvance } from '@/utils/draw-engine';
import {
  affectedPlayedNodes,
  championFromNodes,
  DrawError,
  groupOrder,
  loadDraw,
  persistSlotChanges,
  qualifierChanges,
  tournamentKind,
  type Db,
} from '@/lib/draw-persistence';

const tournamentWithMatches = (db: Db, id: string) =>
  db.tournament.findUniqueOrThrow({
    where: { id },
    include: {
      tournamentType: { select: { name: true } },
      matches: { where: { deletedAt: null }, include: { sets: { include: { games: true } } } },
    },
  });

// Fills (or clears) the playoff slots that come from the group table. Fails if a played match would change.
export async function syncGroupQualifiers(db: Db, tournamentId: string) {
  const tournament = await tournamentWithMatches(db, tournamentId);
  if (tournamentKind(tournament) !== 'ROUND_ROBIN_PLAYOFFS') return { tiedGroups: [] as string[][] };
  const { nodes, idByKey } = await loadDraw(db, tournamentId);
  const { order, tiedGroups } = groupOrder(nodes, tournament.matches, tournament.qualifiers ?? 0, tournament.drawGroupOrder);
  const changes = qualifierChanges(nodes, order);
  if (affectedPlayedNodes(nodes, changes).length > 0) {
    throw new DrawError('Hay partidos de playoffs ya jugados que dependen de la tabla. Corregí primero esos resultados', 409);
  }
  await persistSlotChanges(db, tournamentId, idByKey, changes);
  return { tiedGroups };
}

export async function getDrawSlot(db: Db, drawMatchId: string) {
  const slot = await db.drawMatch.findUnique({ where: { id: drawMatchId }, include: { tournament: { select: { status: true, drawStatus: true } } } });
  if (!slot) throw new DrawError('El partido del cuadro no existe', 404);
  return slot;
}

// Links a freshly created match to its slot and moves the winner forward.
export async function linkResultToDraw(db: Db, drawMatchId: string, matchId: string, winnerId: string) {
  const slot = await getDrawSlot(db, drawMatchId);
  const claimed = await db.drawMatch.updateMany({ where: { id: drawMatchId, matchId: null }, data: { matchId } });
  if (claimed.count === 0) throw new DrawError('Ese partido del cuadro ya tiene un resultado', 409);
  const { nodes, idByKey } = await loadDraw(db, slot.tournamentId);
  const key = drawKey(slot.phase, slot.round, slot.position);
  const changes = advanceWinner(nodes, key, winnerId);
  await persistSlotChanges(db, slot.tournamentId, idByKey, changes);
  if (slot.phase === 'GROUP') await syncGroupQualifiers(db, slot.tournamentId);
  logger.info('draw.advance', { tournamentId: slot.tournamentId, drawMatchId, winnerId, next: changes[0]?.key ?? null });
}

// Removes the winner from the next match. The caller has already updated or archived the match.
async function revertSlot(db: Db, tournamentId: string, key: string) {
  const { nodes, idByKey } = await loadDraw(db, tournamentId);
  const { changes, conflictKey } = revertAdvance(nodes, key);
  if (conflictKey) throw new DrawError('El siguiente partido ya tiene resultado. Corregilo primero', 409);
  await persistSlotChanges(db, tournamentId, idByKey, changes);
}

export async function changeDrawWinner(db: Db, drawMatchId: string, newWinnerId: string) {
  const slot = await getDrawSlot(db, drawMatchId);
  const key = drawKey(slot.phase, slot.round, slot.position);
  await revertSlot(db, slot.tournamentId, key);
  const { nodes, idByKey } = await loadDraw(db, slot.tournamentId);
  const changes = advanceWinner(nodes, key, newWinnerId);
  await persistSlotChanges(db, slot.tournamentId, idByKey, changes);
  if (slot.phase === 'GROUP') await syncGroupQualifiers(db, slot.tournamentId);
  logger.info('draw.revert', { tournamentId: slot.tournamentId, drawMatchId, newWinnerId });
}

export async function unlinkDrawResult(db: Db, drawMatchId: string) {
  const slot = await getDrawSlot(db, drawMatchId);
  const key = drawKey(slot.phase, slot.round, slot.position);
  await revertSlot(db, slot.tournamentId, key);
  await db.drawMatch.update({ where: { id: drawMatchId }, data: { matchId: null } });
  if (slot.phase === 'GROUP') await syncGroupQualifiers(db, slot.tournamentId);
  logger.info('draw.revert', { tournamentId: slot.tournamentId, drawMatchId, unlinked: true });
}

// Matches that can be played now: both players known, no result yet.
export async function pendingDrawMatches(db: Db, tournamentId: string) {
  const rows = await db.drawMatch.findMany({
    where: { tournamentId, matchId: null, isBye: false, player1Id: { not: null }, player2Id: { not: null } },
    include: { player1: { select: { id: true, name: true } }, player2: { select: { id: true, name: true } } },
    orderBy: [{ phase: 'asc' }, { round: 'asc' }, { position: 'asc' }],
  });
  return rows.map((row) => ({
    drawMatchId: row.id,
    phase: row.phase,
    round: row.round,
    position: row.position,
    stage: row.stage,
    player1: row.player1,
    player2: row.player2,
  }));
}

export async function computeTournamentChampion(db: Db, tournamentId: string) {
  const tournament = await tournamentWithMatches(db, tournamentId);
  return championFromNodes({ kind: tournamentKind(tournament), matches: tournament.matches, manualOrder: tournament.drawGroupOrder });
}

// Used by the "finish" action: every slot played and a clear champion.
export async function closeTournament(db: Db, tournamentId: string) {
  const tournament = await tournamentWithMatches(db, tournamentId);
  if (tournament.status !== 'IN_PROGRESS') throw new DrawError('Solo se pueden cerrar torneos en curso', 409);
  if (tournament.drawStatus !== 'CONFIRMED') throw new DrawError('El torneo no tiene un sorteo confirmado', 409);
  const { rows } = await loadDraw(db, tournamentId);
  const open = rows.filter((row) => !row.isBye && !row.matchId);
  if (open.length > 0) throw new DrawError(`Faltan cargar ${open.length} partido(s) del cuadro antes de cerrar el torneo`, 409);
  const { championId, tied } = championFromNodes({ kind: tournamentKind(tournament), matches: tournament.matches, manualOrder: tournament.drawGroupOrder });
  if (!championId) {
    throw new DrawError(tied ? 'Hay un empate en la tabla: definí el orden manualmente antes de cerrar el torneo' : 'No se pudo determinar el campeón', 409);
  }
  return db.tournament.update({ where: { id: tournamentId }, data: { status: 'FINISHED', finishedAt: new Date(), championId } });
}

// Recomputes the champion after a correction on a finished tournament.
export async function refreshChampion(db: Db, tournamentId: string) {
  const { championId, tied } = await computeTournamentChampion(db, tournamentId);
  if (!championId) {
    throw new DrawError(tied ? 'La corrección deja un empate en la tabla: definí el orden manualmente' : 'La corrección deja el torneo sin campeón', 409);
  }
  return championId;
}

// Read model of a draw for the admin wizard and the public bracket.
export async function getDrawView(db: Db, tournamentId: string) {
  const tournament = await db.tournament.findFirst({
    where: { id: tournamentId, deletedAt: null },
    select: {
      status: true,
      drawStatus: true,
      drawSeed: true,
      drawSeedMode: true,
      drawConfirmedAt: true,
      drawGroupOrder: true,
      qualifiers: true,
      championId: true,
      tournamentType: { select: { name: true } },
    },
  });
  if (!tournament) throw new DrawError('Torneo no encontrado', 404);
  const rows = await db.drawMatch.findMany({
    where: { tournamentId },
    include: {
      player1: { select: { id: true, name: true } },
      player2: { select: { id: true, name: true } },
      match: { select: { id: true, winnerId: true, player1Id: true, playedAt: true, walkover: true, sets: { include: { games: true }, orderBy: { id: 'asc' } } } },
    },
    orderBy: [{ phase: 'asc' }, { round: 'asc' }, { position: 'asc' }],
  });
  const matches = rows.map((row) => {
    const score = row.match
      ? row.match.sets.map((set) => {
          const first = set.games.filter((game) => game.winnerId === row.player1Id).length;
          const second = set.games.filter((game) => game.winnerId === row.player2Id).length;
          const sameOrder = row.player1Id === row.match!.player1Id;
          const [tbFirst, tbSecond] = sameOrder
            ? [set.tiebreakPlayer1Points, set.tiebreakPlayer2Points]
            : [set.tiebreakPlayer2Points, set.tiebreakPlayer1Points];
          return formatSetScore(first, second, set.hasTiebreak, tbFirst, tbSecond);
        })
      : [];
    return {
      id: row.id,
      phase: row.phase,
      round: row.round,
      position: row.position,
      stage: row.stage,
      isBye: row.isBye,
      seed1: row.seed1,
      seed2: row.seed2,
      source1: row.source1,
      source2: row.source2,
      player1: row.player1,
      player2: row.player2,
      matchId: row.matchId,
      winnerId: row.match?.winnerId ?? null,
      walkover: row.match?.walkover ?? false,
      score,
    };
  });
  const kind = tournamentKind(tournament);
  let standings: ReturnType<typeof calculatePlayerStats> = [];
  let liveChampionId: string | null = null;
  if (kind !== 'PLAYOFFS') {
    const played = await db.match.findMany({
      where: { tournamentId, deletedAt: null, OR: [{ stage: null }, { stage: 'GROUP' }] },
      include: { player1: { select: { name: true } }, player2: { select: { name: true } }, sets: { include: { games: true } } },
    });
    standings = calculatePlayerStats(played);
    const listed = new Set(standings.map((stat) => stat.id));
    for (const row of rows) {
      if (row.phase !== 'GROUP') continue;
      for (const player of [row.player1, row.player2]) {
        if (player && !listed.has(player.id)) {
          listed.add(player.id);
          standings.push({ id: player.id, name: player.name ?? '', matchesWon: 0, matchesLost: 0, gamesWon: 0, setsWon: 0, setsLost: 0, gamesLost: 0 });
        }
      }
    }
    const groupDone = rows.filter((row) => row.phase === 'GROUP').every((row) => row.isBye || row.matchId);
    if (kind === 'ROUND_ROBIN' && groupDone && played.length > 0) {
      liveChampionId = championFromNodes({ kind, matches: played, manualOrder: tournament.drawGroupOrder }).championId;
    }
  }
  return {
    kind,
    standings,
    liveChampionId,
    status: tournament.status,
    drawStatus: tournament.drawStatus,
    seed: tournament.drawSeed,
    seedMode: tournament.drawSeedMode,
    confirmedAt: tournament.drawConfirmedAt,
    groupOrder: tournament.drawGroupOrder,
    qualifiers: tournament.qualifiers,
    championId: tournament.championId,
    matches,
  };
}
