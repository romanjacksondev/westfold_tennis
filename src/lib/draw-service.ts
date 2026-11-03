import { prisma } from '@/utils/prisma';
import { audit, type AuditActor } from '@/lib/audit';
import { logger } from '@/lib/logger';
import { calculatePlayerPoints } from '@/utils/utils';
import { defaultSeedCount, MAX_BRACKET_SIZE, MAX_SEEDS, type SeedMode } from '@/utils/draw-engine';
import {
  buildDrawNodes,
  championFromNodes,
  DrawError,
  loadDraw,
  persistNodes,
  tournamentKind,
  type Db,
} from '@/lib/draw-persistence';

export { DrawError };

export const SEED_MODES: SeedMode[] = ['NONE', 'RANKING', 'LEVEL', 'MANUAL'];

async function loadTournament(db: Db, id: string) {
  const tournament = await db.tournament.findFirst({
    where: { id, deletedAt: null },
    include: {
      tournamentType: { select: { name: true } },
      players: { select: { id: true, name: true, levelId: true, level: { select: { order: true } } } },
    },
  });
  if (!tournament) throw new DrawError('Torneo no encontrado', 404);
  return tournament;
}

// Same window as the leaderboard default: rolling 12 months of finished tournaments.
async function rankingOrder(playerIds: string[]): Promise<string[]> {
  const now = new Date();
  const from = new Date(now);
  from.setFullYear(now.getFullYear() - 1);
  const tournaments = await prisma.tournament.findMany({
    where: { status: 'FINISHED', deletedAt: null, date: { gte: from, lte: now } },
    include: {
      tournamentType: { select: { name: true } },
      tournamentCategory: {
        select: {
          name: true,
          pointsPerMatchWin: true,
          tournamentCategoryPoints: { select: { initial_position: true, final_position: true, points: true } },
        },
      },
      matches: { include: { player1: { select: { name: true } }, player2: { select: { name: true } } } },
    },
  });
  const points = calculatePlayerPoints(tournaments);
  return playerIds
    .filter((id) => (points[id]?.points ?? 0) > 0)
    .sort((a, b) => points[b].points - points[a].points);
}

async function seededOrder(
  tournament: Awaited<ReturnType<typeof loadTournament>>,
  mode: SeedMode,
  manualIds: string[],
): Promise<string[]> {
  const playerIds = tournament.players.map((player) => player.id);
  if (mode === 'NONE') return [];
  if (mode === 'MANUAL') {
    const valid = manualIds.filter((id, index) => playerIds.includes(id) && manualIds.indexOf(id) === index);
    if (valid.length !== manualIds.length) throw new DrawError('La siembra manual incluye jugadores que no participan o repetidos');
    return valid;
  }
  if (mode === 'RANKING') return rankingOrder(playerIds);
  return tournament.players
    .filter((player) => player.level)
    .sort((a, b) => b.level!.order - a.level!.order)
    .map((player) => player.id);
}

function assertEditable(tournament: Awaited<ReturnType<typeof loadTournament>>) {
  if (tournament.status !== 'PREPARATION') throw new DrawError('Solo se puede sortear un torneo en preparación', 409);
  if (tournament.drawStatus === 'CONFIRMED') throw new DrawError('El sorteo ya está confirmado. Anulalo para volver a sortear', 409);
}

export interface GenerateOptions {
  seedMode?: SeedMode;
  manualSeedIds?: string[];
  seedCount?: number;
}

async function writeDraft(
  tournament: Awaited<ReturnType<typeof loadTournament>>,
  { seedMode = 'NONE', manualSeedIds = [], seedCount }: GenerateOptions,
) {
  if (!SEED_MODES.includes(seedMode)) throw new DrawError('Modo de siembra inválido');
  if (tournament.players.length < 2) throw new DrawError('El torneo necesita al menos 2 jugadores para sortear');
  if (tournament.drawSize && tournament.players.length > tournament.drawSize) {
    throw new DrawError('Los jugadores superan el tamaño del cuadro');
  }
  const kind = tournamentKind(tournament);
  if (kind !== 'ROUND_ROBIN' && kind !== 'PLAYOFFS' && !tournament.qualifiers) {
    throw new DrawError('Definí cuántos jugadores clasifican a los playoffs');
  }
  if (kind === 'PLAYOFFS' && tournament.players.length > MAX_BRACKET_SIZE) {
    throw new DrawError(`Los cuadros de eliminación admiten hasta ${MAX_BRACKET_SIZE} jugadores`);
  }
  const seededIds = await seededOrder(tournament, seedMode, manualSeedIds);
  const seed = crypto.randomUUID();
  const nodes = buildDrawNodes({
    kind,
    playerIds: tournament.players.map((player) => player.id),
    seededIds,
    seedCount: Math.min(seedCount ?? defaultSeedCount(tournament.players.length), MAX_SEEDS, seededIds.length),
    qualifiers: tournament.qualifiers,
    seed,
  });
  await prisma.$transaction(async (tx) => {
    await persistNodes(tx, tournament.id, nodes);
    await tx.tournament.update({
      where: { id: tournament.id },
      data: { drawStatus: 'DRAFT', drawSeed: seed, drawSeedMode: seedMode, drawConfirmedAt: null, drawGroupOrder: [] },
    });
  });
  return { seed, seededIds, matches: nodes.length };
}

export async function generateDraw(tournamentId: string, options: GenerateOptions, actor: AuditActor) {
  const tournament = await loadTournament(prisma, tournamentId);
  assertEditable(tournament);
  const result = await writeDraft(tournament, options);
  await audit({
    action: 'DRAW_GENERATE',
    entity: 'Tournament',
    entityId: tournamentId,
    actor,
    after: { seedMode: options.seedMode ?? 'NONE', seeded: result.seededIds.length, players: tournament.players.length },
  });
  logger.info('draw.generated', { tournamentId, seedMode: options.seedMode ?? 'NONE', matches: result.matches });
  return result;
}

// Shuffles again keeping the seeded players (same seeding mode and order).
export async function reshuffleDraw(tournamentId: string, actor: AuditActor) {
  const tournament = await loadTournament(prisma, tournamentId);
  assertEditable(tournament);
  if (tournament.drawStatus !== 'DRAFT') throw new DrawError('Primero generá el sorteo', 409);
  const { nodes } = await loadDraw(prisma, tournamentId);
  const seeded = new Map<number, string>();
  for (const node of nodes) {
    if (node.phase !== 'PLAYOFF' || node.round !== 1) continue;
    if (node.seed1 && node.player1Id) seeded.set(node.seed1, node.player1Id);
    if (node.seed2 && node.player2Id) seeded.set(node.seed2, node.player2Id);
  }
  const manualSeedIds = [...seeded.entries()].sort((a, b) => a[0] - b[0]).map(([, id]) => id);
  const seedMode = (tournament.drawSeedMode as SeedMode | null) ?? 'NONE';
  await writeDraft(tournament, { seedMode: manualSeedIds.length > 0 ? 'MANUAL' : 'NONE', manualSeedIds, seedCount: manualSeedIds.length });
  await prisma.tournament.update({ where: { id: tournamentId }, data: { drawSeedMode: seedMode } });
  await audit({ action: 'DRAW_RESHUFFLE', entity: 'Tournament', entityId: tournamentId, actor, metadata: { seeded: manualSeedIds.length } });
}

export interface SlotRef {
  drawMatchId: string;
  slot: 1 | 2;
}

// Swaps two players (with their seed) of the first playoff round while the draw is still a draft.
export async function swapDrawPlayers(tournamentId: string, a: SlotRef, b: SlotRef, actor: AuditActor) {
  const tournament = await loadTournament(prisma, tournamentId);
  if (tournament.drawStatus !== 'DRAFT') throw new DrawError('Solo se puede intercambiar en un sorteo en borrador', 409);
  const { rows } = await loadDraw(prisma, tournamentId);
  const find = (ref: SlotRef) => {
    const row = rows.find((candidate) => candidate.id === ref.drawMatchId);
    if (!row) throw new DrawError('Partido del cuadro inexistente', 404);
    if (row.phase !== 'PLAYOFF' || row.round !== 1) throw new DrawError('Solo se pueden intercambiar jugadores de la primera ronda');
    if (row.isBye) throw new DrawError('El jugador con BYE no se puede intercambiar');
    const playerId = ref.slot === 1 ? row.player1Id : row.player2Id;
    const seed = ref.slot === 1 ? row.seed1 : row.seed2;
    if (!playerId) throw new DrawError('El casillero está vacío');
    return { row, playerId, seed };
  };
  const first = find(a);
  const second = find(b);
  if (first.playerId === second.playerId) throw new DrawError('Elegí dos jugadores distintos');
  const data = (ref: SlotRef, playerId: string, seed: number | null) =>
    ref.slot === 1 ? { player1Id: playerId, seed1: seed } : { player2Id: playerId, seed2: seed };
  await prisma.$transaction([
    prisma.drawMatch.update({ where: { id: first.row.id }, data: data(a, second.playerId, second.seed) }),
    prisma.drawMatch.update({ where: { id: second.row.id }, data: data(b, first.playerId, first.seed) }),
  ]);
  await audit({
    action: 'DRAW_SWAP',
    entity: 'Tournament',
    entityId: tournamentId,
    actor,
    metadata: { playerA: first.playerId, playerB: second.playerId },
  });
}

export async function confirmDraw(tournamentId: string, actor: AuditActor) {
  const tournament = await loadTournament(prisma, tournamentId);
  if (tournament.status !== 'PREPARATION') throw new DrawError('Solo se puede confirmar un torneo en preparación', 409);
  if (tournament.drawStatus !== 'DRAFT') throw new DrawError('No hay un sorteo en borrador para confirmar', 409);
  const { rows } = await loadDraw(prisma, tournamentId);
  const inDraw = new Set(rows.flatMap((row) => [row.player1Id, row.player2Id]).filter(Boolean));
  const missing = tournament.players.filter((player) => !inDraw.has(player.id));
  if (missing.length > 0) throw new DrawError('Los participantes cambiaron: generá el sorteo de nuevo', 409);
  const confirmedAt = new Date();
  await prisma.tournament.update({ where: { id: tournamentId }, data: { drawStatus: 'CONFIRMED', drawConfirmedAt: confirmedAt } });
  await audit({
    action: 'DRAW_CONFIRM',
    entity: 'Tournament',
    entityId: tournamentId,
    actor,
    metadata: { seed: tournament.drawSeed, seedMode: tournament.drawSeedMode, players: tournament.players.length },
  });
}

export async function discardDraw(tournamentId: string, actor: AuditActor) {
  const tournament = await loadTournament(prisma, tournamentId);
  if (tournament.status !== 'PREPARATION') throw new DrawError('Solo se puede anular el sorteo de un torneo en preparación', 409);
  if (tournament.drawStatus === 'NONE') throw new DrawError('El torneo no tiene sorteo', 409);
  await prisma.$transaction([
    prisma.drawMatch.deleteMany({ where: { tournamentId } }),
    prisma.tournament.update({
      where: { id: tournamentId },
      data: { drawStatus: 'NONE', drawSeed: null, drawSeedMode: null, drawConfirmedAt: null, drawGroupOrder: [] },
    }),
  ]);
  await audit({ action: 'DRAW_DISCARD', entity: 'Tournament', entityId: tournamentId, actor, metadata: { previous: tournament.drawStatus } });
}

export async function getTournamentChampion(db: Db, tournamentId: string) {
  const tournament = await db.tournament.findUniqueOrThrow({
    where: { id: tournamentId },
    include: {
      tournamentType: { select: { name: true } },
      matches: { where: { deletedAt: null }, include: { sets: { include: { games: true } } } },
    },
  });
  return championFromNodes({
    kind: tournamentKind(tournament),
    matches: tournament.matches,
    manualOrder: tournament.drawGroupOrder,
  });
}
