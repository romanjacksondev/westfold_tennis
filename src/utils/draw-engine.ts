// Pure draw logic (seeded draws, brackets, advancement). No Prisma imports so it can run under `node --test`.
import { generateDraw } from './utils.ts';
import {
  compareStandings,
  type MatchStage,
  type ScoringMatch,
  type StandingStat,
  type TournamentKind,
  createHeadToHead,
} from './scoring.ts';

export type DrawPhase = 'GROUP' | 'PLAYOFF';
export type SeedMode = 'NONE' | 'RANKING' | 'LEVEL' | 'MANUAL';
export type GroupPositionSource = { type: 'GROUP_POSITION'; position: number };

export interface DrawNode {
  phase: DrawPhase;
  round: number; // 1-based round (or matchday)
  position: number; // 0-based index inside the round
  stage: MatchStage;
  player1Id: string | null;
  player2Id: string | null;
  seed1: number | null;
  seed2: number | null;
  source1: GroupPositionSource | null;
  source2: GroupPositionSource | null;
  isBye: boolean;
  next: { key: string; slot: 1 | 2 } | null;
  winnerId?: string | null; // set once the real match has a result
}

export interface Entrant {
  playerId: string | null; // null while it depends on a group position
  seed: number | null; // real seed (only the seeded players)
  source?: GroupPositionSource | null;
}

export interface SlotChange {
  key: string;
  slot: 1 | 2;
  playerId: string | null;
  source: GroupPositionSource | null;
}

export const MAX_BRACKET_SIZE = 32;
export const MAX_SEEDS = 8;

export const drawKey = (phase: DrawPhase, round: number, position: number) => `${phase}:${round}:${position}`;

// ─── Randomness ────────────────────────────────────────────────────────────

const hashSeed = (seed: string): number => {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
};

// Deterministic PRNG (mulberry32): same seed => same sequence in [0, 1).
export const createRng = (seed: string): (() => number) => {
  let state = hashSeed(seed);
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const shuffleWith = <T>(items: readonly T[], rng: () => number): T[] => {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

// ─── Sizes and seeds ───────────────────────────────────────────────────────

export const nextPowerOfTwo = (n: number): number => {
  let size = 1;
  while (size < n) size *= 2;
  return size;
};

export const defaultSeedCount = (playerCount: number): number =>
  Math.min(nextPowerOfTwo(Math.max(playerCount, 2)) / 2, MAX_SEEDS);

// Seed number for each bracket slot (slots 2p and 2p+1 form first-round match p).
// Seeds 1 and 2 land in opposite halves, 3 and 4 in opposite quarters, and so on.
export const seedPositions = (size: number): number[] => {
  if (size < 2 || (size & (size - 1)) !== 0) throw new Error(`Invalid bracket size: ${size}`);
  let order = [1, 2];
  for (let current = 2; current < size; current *= 2) {
    const total = current * 2;
    order = order.flatMap((seed) => [seed, total + 1 - seed]);
  }
  return order;
};

const STAGES_FROM_FINAL: MatchStage[] = ['FINAL', 'SEMIFINAL', 'QUARTERFINAL', 'ROUND_OF_16', 'ROUND_OF_32'];

export const stageForRound = (round: number, totalRounds: number): MatchStage => {
  const stage = STAGES_FROM_FINAL[totalRounds - round];
  if (!stage || round < 1) throw new Error(`No stage for round ${round} of ${totalRounds}`);
  return stage;
};

// ─── Entrants ──────────────────────────────────────────────────────────────

// Best seed first. `seededIds` is already ordered by the chosen criterion (ranking, level or manual).
// The rest of the players are shuffled; the draw takes the rank order as the seed number.
export const placeEntrants = ({
  playerIds,
  seededIds = [],
  rng,
  seedCount = defaultSeedCount(playerIds.length),
}: {
  playerIds: string[];
  seededIds?: string[];
  rng: () => number;
  seedCount?: number;
}): Entrant[] => {
  const unique = new Set(playerIds);
  if (unique.size !== playerIds.length) throw new Error('Duplicate players in draw');
  const seeded = seededIds.filter((id) => unique.has(id)).slice(0, Math.max(seedCount, 0));
  const seededSet = new Set(seeded);
  const rest = shuffleWith(
    playerIds.filter((id) => !seededSet.has(id)),
    rng,
  );
  return [
    ...seeded.map((playerId, index) => ({ playerId, seed: index + 1 })),
    ...rest.map((playerId) => ({ playerId, seed: null })),
  ];
};

export const groupPositionEntrants = (qualifiers: number): Entrant[] =>
  Array.from({ length: qualifiers }, (_, index) => ({
    playerId: null,
    seed: index + 1,
    source: { type: 'GROUP_POSITION' as const, position: index + 1 },
  }));

// ─── Playoff bracket ───────────────────────────────────────────────────────

// Entrant i takes seed number i + 1. Numbers above the entrant count are BYEs, so the best
// seeds receive them. BYE winners are advanced to the next round at build time.
export const buildPlayoffBracket = (entrants: Entrant[]): DrawNode[] => {
  const n = entrants.length;
  if (n < 2) throw new Error('A bracket needs at least 2 entrants');
  const size = nextPowerOfTwo(n);
  if (size > MAX_BRACKET_SIZE) throw new Error(`Brackets above ${MAX_BRACKET_SIZE} players are not supported`);
  const totalRounds = Math.log2(size);
  const positions = seedPositions(size);

  const nodes = new Map<string, DrawNode>();
  for (let round = 1; round <= totalRounds; round += 1) {
    const matchesInRound = size / 2 ** round;
    for (let position = 0; position < matchesInRound; position += 1) {
      const isFinal = round === totalRounds;
      nodes.set(drawKey('PLAYOFF', round, position), {
        phase: 'PLAYOFF',
        round,
        position,
        stage: stageForRound(round, totalRounds),
        player1Id: null,
        player2Id: null,
        seed1: null,
        seed2: null,
        source1: null,
        source2: null,
        isBye: false,
        next: isFinal ? null : { key: drawKey('PLAYOFF', round + 1, Math.floor(position / 2)), slot: position % 2 === 0 ? 1 : 2 },
        winnerId: null,
      });
    }
  }

  const fill = (node: DrawNode, slot: 1 | 2, entrant: Entrant | undefined) => {
    if (!entrant) return;
    if (slot === 1) {
      node.player1Id = entrant.playerId;
      node.seed1 = entrant.seed;
      node.source1 = entrant.source ?? null;
    } else {
      node.player2Id = entrant.playerId;
      node.seed2 = entrant.seed;
      node.source2 = entrant.source ?? null;
    }
  };

  for (let position = 0; position < size / 2; position += 1) {
    const node = nodes.get(drawKey('PLAYOFF', 1, position))!;
    const first = entrants[positions[position * 2] - 1];
    const second = entrants[positions[position * 2 + 1] - 1];
    fill(node, 1, first);
    fill(node, 2, second);
    if (!first || !second) {
      node.isBye = true;
      const advanced = first ?? second;
      if (advanced && node.next) fill(nodes.get(node.next.key)!, node.next.slot, advanced);
    }
  }

  return [...nodes.values()];
};

// ─── Round robin fixture ───────────────────────────────────────────────────

// Circle method. With an odd number of players one of them rests each matchday.
export const buildGroupFixture = (playerIds: string[]): DrawNode[] => {
  if (playerIds.length < 2) throw new Error('A group needs at least 2 players');
  return generateDraw<string>(playerIds.length, playerIds).flatMap((matchday, roundIndex) =>
    matchday.map(([player1Id, player2Id], position) => ({
      phase: 'GROUP' as const,
      round: roundIndex + 1,
      position,
      stage: 'GROUP' as const,
      player1Id,
      player2Id,
      seed1: null,
      seed2: null,
      source1: null,
      source2: null,
      isBye: false,
      next: null,
      winnerId: null,
    })),
  );
};

// ─── Advancing and reverting results ───────────────────────────────────────

const findNode = (nodes: DrawNode[], key: string) => {
  const node = nodes.find((candidate) => drawKey(candidate.phase, candidate.round, candidate.position) === key);
  if (!node) throw new Error(`Unknown draw match: ${key}`);
  return node;
};

export const advanceWinner = (nodes: DrawNode[], key: string, winnerId: string): SlotChange[] => {
  const node = findNode(nodes, key);
  if (winnerId !== node.player1Id && winnerId !== node.player2Id) {
    throw new Error('The winner must be one of the match players');
  }
  if (!node.next) return [];
  return [{ key: node.next.key, slot: node.next.slot, playerId: winnerId, source: null }];
};

export type RevertResult = { changes: SlotChange[]; conflictKey: string | null };

// Removes the winner from the next match. If that match was already played the edit is blocked.
export const revertAdvance = (nodes: DrawNode[], key: string): RevertResult => {
  const node = findNode(nodes, key);
  if (!node.next) return { changes: [], conflictKey: null };
  const next = findNode(nodes, node.next.key);
  if (next.winnerId) return { changes: [], conflictKey: node.next.key };
  return { changes: [{ key: node.next.key, slot: node.next.slot, playerId: null, source: null }], conflictKey: null };
};

export const applySlotChanges = (nodes: DrawNode[], changes: SlotChange[]): DrawNode[] =>
  nodes.map((node) => {
    const key = drawKey(node.phase, node.round, node.position);
    return changes
      .filter((change) => change.key === key)
      .reduce<DrawNode>(
        (current, change) =>
          change.slot === 1
            ? { ...current, player1Id: change.playerId, source1: change.source }
            : { ...current, player2Id: change.playerId, source2: change.source },
        node,
      );
  });

// ─── Group standings → playoff ─────────────────────────────────────────────

export interface QualifierResolution {
  order: string[]; // player ids, best first
  tiedGroups: string[][]; // groups of fully tied players that the admin must order
}

// A tie only needs manual resolution when it affects who qualifies or the seed order.
export const resolveGroupQualifiers = (
  standings: StandingStat[],
  matches: Pick<ScoringMatch, 'winnerId' | 'player1Id' | 'player2Id'>[],
  qualifiers: number,
  manualOrder?: string[],
): QualifierResolution => {
  const headToHead = createHeadToHead(matches);
  const sorted = [...standings].sort((a, b) => compareStandings(a, b, headToHead));

  if (manualOrder && manualOrder.length > 0) {
    const ids = new Set(sorted.map((stat) => stat.id));
    const valid = manualOrder.length === ids.size && manualOrder.every((id) => ids.has(id)) && new Set(manualOrder).size === ids.size;
    if (!valid) throw new Error('Manual order must contain every player exactly once');
    return { order: manualOrder, tiedGroups: [] };
  }

  const tiedGroups: string[][] = [];
  let start = 0;
  while (start < sorted.length) {
    let end = start + 1;
    while (end < sorted.length && compareStandings(sorted[start], sorted[end], headToHead) === 0) end += 1;
    if (end - start > 1 && start < qualifiers) tiedGroups.push(sorted.slice(start, end).map((stat) => stat.id));
    start = end;
  }
  return { order: sorted.map((stat) => stat.id), tiedGroups };
};

// Fills the playoff slots that depend on a group position once the order is known.
export const assignGroupQualifiers = (nodes: DrawNode[], orderedPlayerIds: string[]): SlotChange[] => {
  const changes: SlotChange[] = [];
  for (const node of nodes) {
    if (node.phase !== 'PLAYOFF') continue;
    const key = drawKey(node.phase, node.round, node.position);
    ([1, 2] as const).forEach((slot) => {
      const source = slot === 1 ? node.source1 : node.source2;
      const playerId = slot === 1 ? node.player1Id : node.player2Id;
      if (source?.type !== 'GROUP_POSITION' || playerId) return;
      const qualifier = orderedPlayerIds[source.position - 1];
      if (qualifier) changes.push({ key, slot, playerId: qualifier, source });
    });
  }
  return changes;
};

// ─── Champion ──────────────────────────────────────────────────────────────

// The champion is derived from the tournament results; `championId` is only a cache of this value.
export const computeChampion = ({
  kind,
  matches,
  standings = [],
  manualOrder,
}: {
  kind: TournamentKind;
  matches: Pick<ScoringMatch, 'winnerId' | 'player1Id' | 'player2Id' | 'stage'>[];
  standings?: StandingStat[];
  manualOrder?: string[];
}): string | null => {
  if (kind === 'ROUND_ROBIN') {
    if (standings.length === 0) return null;
    const { order, tiedGroups } = resolveGroupQualifiers(standings, matches, 1, manualOrder);
    return tiedGroups.length > 0 ? null : (order[0] ?? null);
  }
  return matches.find((match) => match.stage === 'FINAL')?.winnerId ?? null;
};
