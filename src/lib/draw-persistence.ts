// Draw persistence shared by the API services and the seeds. Relative imports only, so `tsx` can run it.
import { Prisma, type PrismaClient } from '../../prisma/generated/client';
import {
  advanceWinner,
  applySlotChanges,
  assignGroupQualifiers,
  buildGroupFixture,
  buildPlayoffBracket,
  computeChampion,
  createRng,
  drawKey,
  groupPositionEntrants,
  placeEntrants,
  resolveGroupQualifiers,
  shuffleWith,
  type DrawNode,
  type SlotChange,
} from '../utils/draw-engine.ts';
import { getTournamentKind, type TournamentKind } from '../utils/scoring.ts';
import { calculatePlayerStats } from '../utils/utils.ts';

export type Db = Prisma.TransactionClient | PrismaClient;

export class DrawError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

type DrawRow = Prisma.DrawMatchGetPayload<{ include: { match: { select: { winnerId: true } } } }>;

export interface LoadedDraw {
  rows: DrawRow[];
  nodes: DrawNode[];
  idByKey: Map<string, string>;
}

const rowKey = (row: Pick<DrawRow, 'phase' | 'round' | 'position'>) => drawKey(row.phase, row.round, row.position);

export const rowsToNodes = (rows: DrawRow[]): DrawNode[] => {
  const keyById = new Map(rows.map((row) => [row.id, rowKey(row)]));
  return rows.map((row) => ({
    phase: row.phase,
    round: row.round,
    position: row.position,
    stage: row.stage,
    player1Id: row.player1Id,
    player2Id: row.player2Id,
    seed1: row.seed1,
    seed2: row.seed2,
    source1: (row.source1 as DrawNode['source1']) ?? null,
    source2: (row.source2 as DrawNode['source2']) ?? null,
    isBye: row.isBye,
    next: row.nextDrawMatchId && row.nextSlot ? { key: keyById.get(row.nextDrawMatchId)!, slot: row.nextSlot as 1 | 2 } : null,
    winnerId: row.match?.winnerId ?? null,
  }));
};

export async function loadDraw(db: Db, tournamentId: string): Promise<LoadedDraw> {
  const rows = await db.drawMatch.findMany({
    where: { tournamentId },
    include: { match: { select: { winnerId: true } } },
    orderBy: [{ phase: 'asc' }, { round: 'asc' }, { position: 'asc' }],
  });
  return { rows, nodes: rowsToNodes(rows), idByKey: new Map(rows.map((row) => [rowKey(row), row.id])) };
}

const sourceValue = (source: unknown) => (source ? (source as Prisma.InputJsonValue) : Prisma.DbNull);

// Replaces every draw row of the tournament. Rows are created final-first so `next` ids already exist.
export async function persistNodes(db: Db, tournamentId: string, nodes: DrawNode[]) {
  await db.drawMatch.deleteMany({ where: { tournamentId } });
  const ids = new Map(nodes.map((node) => [drawKey(node.phase, node.round, node.position), crypto.randomUUID()]));
  const ordered = [...nodes].sort((a, b) => (a.phase === b.phase ? b.round - a.round : a.phase === 'PLAYOFF' ? -1 : 1));
  await db.drawMatch.createMany({
    data: ordered.map((node) => ({
      id: ids.get(drawKey(node.phase, node.round, node.position))!,
      tournamentId,
      phase: node.phase,
      round: node.round,
      position: node.position,
      stage: node.stage,
      player1Id: node.player1Id,
      player2Id: node.player2Id,
      seed1: node.seed1,
      seed2: node.seed2,
      source1: sourceValue(node.source1),
      source2: sourceValue(node.source2),
      isBye: node.isBye,
      nextDrawMatchId: node.next ? ids.get(node.next.key)! : null,
      nextSlot: node.next?.slot ?? null,
    })),
  });
}

export async function persistSlotChanges(db: Db, tournamentId: string, idByKey: Map<string, string>, changes: SlotChange[]) {
  for (const change of changes) {
    const id = idByKey.get(change.key);
    if (!id) throw new DrawError(`Partido del cuadro inexistente: ${change.key}`, 500);
    await db.drawMatch.update({
      where: { id },
      data:
        change.slot === 1
          ? { player1Id: change.playerId, source1: sourceValue(change.source) }
          : { player2Id: change.playerId, source2: sourceValue(change.source) },
    });
  }
}

export interface DrawTournament {
  id: string;
  tournamentType?: { name: string } | null;
  qualifiers: number | null;
  drawGroupOrder: string[];
}

export const tournamentKind = (tournament: Pick<DrawTournament, 'tournamentType'>): TournamentKind =>
  getTournamentKind(tournament.tournamentType?.name);

export interface BuildDrawInput {
  kind: TournamentKind;
  playerIds: string[];
  seededIds: string[];
  seedCount?: number;
  qualifiers: number | null;
  seed: string;
}

export const buildDrawNodes = ({ kind, playerIds, seededIds, seedCount, qualifiers, seed }: BuildDrawInput): DrawNode[] => {
  const rng = createRng(seed);
  if (kind === 'ROUND_ROBIN') return buildGroupFixture(shuffleWith(playerIds, rng));
  if (kind === 'PLAYOFFS') return buildPlayoffBracket(placeEntrants({ playerIds, seededIds, rng, seedCount }));
  const qualifying = qualifiers ?? 0;
  if (qualifying < 2 || qualifying > playerIds.length) {
    throw new DrawError('Definí cuántos jugadores clasifican (mínimo 2, máximo la cantidad de participantes)');
  }
  return [...buildGroupFixture(shuffleWith(playerIds, rng)), ...buildPlayoffBracket(groupPositionEntrants(qualifying))];
};

interface ResultMatch {
  id: string;
  stage?: string | null;
  player1Id: string;
  player2Id: string;
  winnerId?: string | null;
  sets?: { winnerId?: string | null; games: { winnerId: string }[] }[];
}

const samePair = (match: ResultMatch, a: string | null, b: string | null) =>
  Boolean(a && b) && ((match.player1Id === a && match.player2Id === b) || (match.player1Id === b && match.player2Id === a));

const isCompleteOrder = (order: string[], size: number) => order.length > 0 && order.length === size;

// Order of the table once every group match is played; null while incomplete or tied without a manual order.
export function groupOrder(nodes: DrawNode[], matches: ResultMatch[], qualifiers: number, manualOrder: string[]) {
  const groupNodes = nodes.filter((node) => node.phase === 'GROUP');
  if (groupNodes.length === 0 || groupNodes.some((node) => !node.winnerId)) return { order: null, tiedGroups: [] as string[][] };
  const groupMatches = matches.filter((match) => !match.stage || match.stage === 'GROUP');
  const standings = calculatePlayerStats(groupMatches);
  let resolution = resolveGroupQualifiers(standings, groupMatches, qualifiers);
  // The manual order only applies while there is a tie; it is ignored if a corrected result removes it.
  if (resolution.tiedGroups.length > 0 && isCompleteOrder(manualOrder, standings.length)) {
    resolution = resolveGroupQualifiers(standings, groupMatches, qualifiers, manualOrder);
  }
  return { order: resolution.tiedGroups.length > 0 ? null : resolution.order, tiedGroups: resolution.tiedGroups };
}

// Recomputes the playoff slots that come from the group table: clears them and fills them again.
export function qualifierChanges(nodes: DrawNode[], order: string[] | null): SlotChange[] {
  const clears: SlotChange[] = [];
  for (const node of nodes) {
    if (node.phase !== 'PLAYOFF') continue;
    const key = drawKey(node.phase, node.round, node.position);
    if (node.source1) clears.push({ key, slot: 1, playerId: null, source: node.source1 });
    if (node.source2) clears.push({ key, slot: 2, playerId: null, source: node.source2 });
  }
  const cleared = applySlotChanges(nodes, clears);
  return [...clears, ...(order ? assignGroupQualifiers(cleared, order) : [])];
}

// Compares the current slots with the ones a qualifier change would leave; used to detect playoff matches already played.
export function affectedPlayedNodes(nodes: DrawNode[], changes: SlotChange[]): string[] {
  const after = applySlotChanges(nodes, changes);
  return after
    .filter((node) => {
      const before = nodes.find((candidate) => candidate.phase === node.phase && candidate.round === node.round && candidate.position === node.position)!;
      return Boolean(before.winnerId) && (before.player1Id !== node.player1Id || before.player2Id !== node.player2Id);
    })
    .map((node) => drawKey(node.phase, node.round, node.position));
}

export function championFromNodes({
  kind,
  matches,
  manualOrder,
}: {
  kind: TournamentKind;
  matches: ResultMatch[];
  manualOrder: string[];
}): { championId: string | null; tied: boolean } {
  const standings = kind === 'ROUND_ROBIN' ? calculatePlayerStats(matches) : [];
  const pure = matches.map((m) => ({ ...m, stage: m.stage as never }));
  let championId = computeChampion({ kind, matches: pure, standings });
  if (championId === null && isCompleteOrder(manualOrder, standings.length)) {
    championId = computeChampion({ kind, matches: pure, standings, manualOrder });
  }
  return { championId, tied: kind === 'ROUND_ROBIN' && standings.length > 0 && championId === null };
}

// Seeds: rebuilds a confirmed draw around results that already exist. Throws if a result does not fit.
export async function confirmDrawFromMatches(db: Db, tournamentId: string, options: { seededIds?: string[]; seed?: string } = {}) {
  const tournament = await db.tournament.findUniqueOrThrow({
    where: { id: tournamentId },
    include: {
      tournamentType: { select: { name: true } },
      players: { select: { id: true } },
      matches: { where: { deletedAt: null }, include: { sets: { include: { games: true } } } },
    },
  });
  const kind = tournamentKind(tournament);
  const matches = tournament.matches;
  const playerIds = tournament.players.length > 0 ? tournament.players.map((p) => p.id) : [...new Set(matches.flatMap((m) => [m.player1Id, m.player2Id]))];
  if (tournament.players.length === 0) {
    await db.tournament.update({ where: { id: tournamentId }, data: { players: { connect: playerIds.map((id) => ({ id })) } } });
  }
  const seededIds = options.seededIds ?? [];
  const seed = options.seed ?? `seed-${tournamentId}`;
  let nodes = buildDrawNodes({ kind, playerIds, seededIds, seedCount: seededIds.length, qualifiers: tournament.qualifiers, seed });

  const links = new Map<string, string>();
  const byKey = (key: string) => nodes.find((node) => drawKey(node.phase, node.round, node.position) === key)!;
  const used = new Set<string>();
  const phases: ('GROUP' | 'PLAYOFF')[] = ['GROUP', 'PLAYOFF'];
  for (const phase of phases) {
    const phaseNodes = nodes.filter((node) => node.phase === phase).sort((a, b) => a.round - b.round || a.position - b.position);
    for (const planned of phaseNodes) {
      const key = drawKey(planned.phase, planned.round, planned.position);
      const node = byKey(key);
      if (node.isBye || !node.player1Id || !node.player2Id) continue;
      const stage = phase === 'GROUP' ? 'GROUP' : node.stage;
      const match = matches.find((m) => !used.has(m.id) && (m.stage ?? 'GROUP') === stage && samePair(m, node.player1Id, node.player2Id));
      if (!match || !match.winnerId) continue;
      used.add(match.id);
      links.set(key, match.id);
      node.winnerId = match.winnerId;
      nodes = applySlotChanges(nodes, advanceWinner(nodes, key, match.winnerId));
    }
    if (phase === 'GROUP' && kind === 'ROUND_ROBIN_PLAYOFFS') {
      const { order } = groupOrder(nodes, matches, tournament.qualifiers ?? 0, []);
      nodes = applySlotChanges(nodes, qualifierChanges(nodes, order));
    }
  }
  const unlinked = matches.filter((m) => !used.has(m.id));
  if (unlinked.length > 0) throw new Error(`Torneo ${tournamentId}: partidos que no encajan en el cuadro: ${unlinked.map((m) => m.id).join(', ')}`);

  await persistNodes(db, tournamentId, nodes);
  const { idByKey } = await loadDraw(db, tournamentId);
  for (const [key, matchId] of links) {
    await db.drawMatch.update({ where: { id: idByKey.get(key)! }, data: { matchId } });
  }
  const champion = championFromNodes({ kind, matches, manualOrder: [] }).championId;
  await db.tournament.update({
    where: { id: tournamentId },
    data: {
      drawStatus: 'CONFIRMED',
      drawSeed: seed,
      drawSeedMode: kind === 'PLAYOFFS' && seededIds.length > 0 ? 'MANUAL' : 'NONE',
      drawConfirmedAt: tournament.date,
      ...(tournament.status === 'FINISHED' ? { championId: champion } : {}),
    },
  });
  return { kind, champion };
}
