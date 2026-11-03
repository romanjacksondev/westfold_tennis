import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  advanceWinner,
  applySlotChanges,
  assignGroupQualifiers,
  buildGroupFixture,
  buildPlayoffBracket,
  computeChampion,
  createRng,
  defaultSeedCount,
  drawKey,
  groupPositionEntrants,
  placeEntrants,
  resolveGroupQualifiers,
  revertAdvance,
  seedPositions,
  shuffleWith,
  stageForRound,
  type DrawNode,
} from './draw-engine.ts';
import type { StandingStat } from './scoring.ts';

const ids = (n: number) => Array.from({ length: n }, (_, i) => `p${i + 1}`);
const entrantsFor = (n: number) => ids(n).map((playerId, i) => ({ playerId, seed: i + 1 }));
const firstRound = (nodes: DrawNode[]) => nodes.filter((node) => node.round === 1);
const roundMatchup = (nodes: DrawNode[], round: number, position: number) =>
  nodes.find((node) => node.round === round && node.position === position)!;

describe('createRng / shuffleWith', () => {
  it('is deterministic per seed and varies across seeds', () => {
    const a = createRng('abc');
    const b = createRng('abc');
    const sequenceA = [a(), a(), a()];
    assert.deepEqual(sequenceA, [b(), b(), b()]);
    assert.ok(sequenceA.every((value) => value >= 0 && value < 1));
    assert.notDeepEqual(sequenceA, [createRng('abd')(), createRng('abd')(), createRng('abd')()]);
  });

  it('shuffles without losing items or mutating the input', () => {
    const input = ids(10);
    const result = shuffleWith(input, createRng('seed'));
    assert.deepEqual([...result].sort(), [...input].sort());
    assert.deepEqual(input, ids(10));
    assert.deepEqual(result, shuffleWith(input, createRng('seed')));
  });
});

describe('seedPositions', () => {
  it('uses the standard placement', () => {
    assert.deepEqual(seedPositions(2), [1, 2]);
    assert.deepEqual(seedPositions(4), [1, 4, 2, 3]);
    assert.deepEqual(seedPositions(8), [1, 8, 4, 5, 2, 7, 3, 6]);
    assert.deepEqual(seedPositions(16).slice(0, 8), [1, 16, 8, 9, 4, 13, 5, 12]);
  });

  it('puts seeds 1 and 2 in opposite halves and 3 and 4 in different quarters', () => {
    for (const size of [4, 8, 16, 32]) {
      const positions = seedPositions(size);
      const slotOf = (seed: number) => positions.indexOf(seed);
      assert.ok(slotOf(1) < size / 2 && slotOf(2) >= size / 2, `size ${size}`);
      if (size >= 8) {
        const quarter = (seed: number) => Math.floor(slotOf(seed) / (size / 4));
        assert.equal(new Set([quarter(1), quarter(2), quarter(3), quarter(4)]).size, 4, `size ${size}`);
      }
    }
  });

  it('rejects sizes that are not a power of two', () => {
    assert.throws(() => seedPositions(6));
    assert.throws(() => seedPositions(1));
  });
});

describe('stageForRound', () => {
  it('maps rounds counting back from the final', () => {
    assert.equal(stageForRound(1, 1), 'FINAL');
    assert.equal(stageForRound(1, 2), 'SEMIFINAL');
    assert.equal(stageForRound(1, 3), 'QUARTERFINAL');
    assert.equal(stageForRound(1, 4), 'ROUND_OF_16');
    assert.equal(stageForRound(1, 5), 'ROUND_OF_32');
    assert.throws(() => stageForRound(1, 6));
  });
});

describe('placeEntrants', () => {
  it('keeps seeds first and shuffles the rest deterministically', () => {
    const players = ids(8);
    const first = placeEntrants({ playerIds: players, seededIds: ['p5', 'p2'], rng: createRng('x'), seedCount: 4 });
    const second = placeEntrants({ playerIds: players, seededIds: ['p5', 'p2'], rng: createRng('x'), seedCount: 4 });
    assert.deepEqual(first, second);
    assert.deepEqual(first.slice(0, 2), [
      { playerId: 'p5', seed: 1 },
      { playerId: 'p2', seed: 2 },
    ]);
    assert.equal(first.length, 8);
    assert.ok(first.slice(2).every((entrant) => entrant.seed === null));
    assert.equal(new Set(first.map((entrant) => entrant.playerId)).size, 8);
  });

  it('limits the number of seeds and ignores unknown ids', () => {
    const result = placeEntrants({ playerIds: ids(8), seededIds: ['p1', 'p2', 'p3', 'zz'], rng: createRng('x'), seedCount: 2 });
    assert.deepEqual(result.filter((entrant) => entrant.seed).map((entrant) => entrant.playerId), ['p1', 'p2']);
  });

  it('works without seeds and rejects duplicates', () => {
    const result = placeEntrants({ playerIds: ids(4), rng: createRng('x') });
    assert.ok(result.every((entrant) => entrant.seed === null));
    assert.throws(() => placeEntrants({ playerIds: ['a', 'a'], rng: createRng('x') }));
  });

  it('defaults the seed count to half the bracket, up to 8', () => {
    assert.equal(defaultSeedCount(4), 2);
    assert.equal(defaultSeedCount(5), 4);
    assert.equal(defaultSeedCount(16), 8);
    assert.equal(defaultSeedCount(32), 8);
  });
});

describe('buildPlayoffBracket', () => {
  it('builds a full 8-player bracket where seeds 1 and 2 only meet in the final', () => {
    const nodes = buildPlayoffBracket(entrantsFor(8));
    assert.equal(nodes.length, 7);
    assert.equal(firstRound(nodes).length, 4);
    assert.deepEqual(
      firstRound(nodes).map((node) => [node.player1Id, node.player2Id]),
      [['p1', 'p8'], ['p4', 'p5'], ['p2', 'p7'], ['p3', 'p6']],
    );
    assert.equal(roundMatchup(nodes, 3, 0).stage, 'FINAL');
    assert.equal(roundMatchup(nodes, 2, 1).stage, 'SEMIFINAL');
    assert.equal(roundMatchup(nodes, 1, 0).stage, 'QUARTERFINAL');
    assert.equal(roundMatchup(nodes, 3, 0).next, null);
    assert.deepEqual(roundMatchup(nodes, 1, 2).next, { key: drawKey('PLAYOFF', 2, 1), slot: 1 });
    assert.deepEqual(roundMatchup(nodes, 1, 3).next, { key: drawKey('PLAYOFF', 2, 1), slot: 2 });
  });

  it('gives the BYEs to the best seeds and advances them', () => {
    const nodes = buildPlayoffBracket(entrantsFor(5));
    const byes = nodes.filter((node) => node.isBye);
    assert.equal(byes.length, 3);
    assert.deepEqual(
      byes.map((node) => node.player1Id ?? node.player2Id).sort(),
      ['p1', 'p2', 'p3'],
    );
    const semifinalPlayers = nodes.filter((node) => node.round === 2).flatMap((node) => [node.player1Id, node.player2Id]);
    assert.ok(semifinalPlayers.includes('p1') && semifinalPlayers.includes('p2') && semifinalPlayers.includes('p3'));
    assert.equal(nodes.filter((node) => node.round === 1 && !node.isBye).length, 1);
  });

  it('supports 2, 3 and 32 players and rejects out-of-range sizes', () => {
    assert.equal(buildPlayoffBracket(entrantsFor(2)).length, 1);
    assert.equal(buildPlayoffBracket(entrantsFor(3)).length, 3);
    const big = buildPlayoffBracket(entrantsFor(32));
    assert.equal(big.length, 31);
    assert.equal(roundMatchup(big, 1, 0).stage, 'ROUND_OF_32');
    assert.throws(() => buildPlayoffBracket(entrantsFor(33)));
    assert.throws(() => buildPlayoffBracket(entrantsFor(1)));
  });

  it('never creates a match with two BYEs for any size', () => {
    for (let n = 2; n <= 32; n += 1) {
      const nodes = buildPlayoffBracket(entrantsFor(n));
      for (const node of firstRound(nodes)) {
        assert.ok(node.player1Id || node.player2Id, `n=${n} has an empty first-round match`);
      }
      assert.equal(nodes.filter((node) => node.isBye).length, 2 ** Math.ceil(Math.log2(n)) - n, `n=${n}`);
    }
  });

  it('keeps group-position sources and carries them through BYEs', () => {
    const nodes = buildPlayoffBracket(groupPositionEntrants(3));
    const bye = nodes.find((node) => node.isBye)!;
    assert.ok(bye.source1 || bye.source2);
    const final = nodes.find((node) => node.stage === 'FINAL')!;
    assert.deepEqual(final.source1 ?? final.source2, { type: 'GROUP_POSITION', position: 1 });
    assert.equal(final.player1Id, null);
  });
});

describe('buildGroupFixture', () => {
  it('plays every pair exactly once with an even number of players', () => {
    const nodes = buildGroupFixture(ids(4));
    assert.equal(nodes.length, 6);
    assert.equal(Math.max(...nodes.map((node) => node.round)), 3);
    const pairs = new Set(nodes.map((node) => [node.player1Id, node.player2Id].sort().join('-')));
    assert.equal(pairs.size, 6);
    assert.ok(nodes.every((node) => node.phase === 'GROUP' && node.stage === 'GROUP'));
  });

  it('rests one player per matchday with an odd number of players', () => {
    const nodes = buildGroupFixture(ids(5));
    assert.equal(nodes.length, 10);
    assert.equal(Math.max(...nodes.map((node) => node.round)), 5);
    for (let round = 1; round <= 5; round += 1) {
      assert.equal(nodes.filter((node) => node.round === round).length, 2);
    }
    const allIds = nodes.flatMap((node) => [node.player1Id, node.player2Id]);
    assert.ok(allIds.every((id) => id !== null && id !== (-1 as unknown)));
  });

  it('rejects a single player', () => {
    assert.throws(() => buildGroupFixture(['a']));
  });
});

describe('advanceWinner / revertAdvance', () => {
  const key = (round: number, position: number) => drawKey('PLAYOFF', round, position);

  it('moves the winner to the next slot', () => {
    const nodes = buildPlayoffBracket(entrantsFor(4));
    const changes = advanceWinner(nodes, key(1, 0), 'p1');
    assert.deepEqual(changes, [{ key: key(2, 0), slot: 1, playerId: 'p1', source: null }]);
    const updated = applySlotChanges(nodes, changes);
    assert.equal(roundMatchup(updated, 2, 0).player1Id, 'p1');
  });

  it('rejects a winner that is not in the match and returns nothing for the final', () => {
    const nodes = buildPlayoffBracket(entrantsFor(4));
    assert.throws(() => advanceWinner(nodes, key(1, 0), 'p3'));
    assert.deepEqual(advanceWinner(buildPlayoffBracket(entrantsFor(2)), key(1, 0), 'p1'), []);
  });

  it('reverts the advance when the next match is still unplayed', () => {
    const initial = buildPlayoffBracket(entrantsFor(4));
    const nodes = applySlotChanges(initial, advanceWinner(initial, key(1, 0), 'p1'));
    const result = revertAdvance(nodes, key(1, 0));
    assert.equal(result.conflictKey, null);
    assert.deepEqual(result.changes, [{ key: key(2, 0), slot: 1, playerId: null, source: null }]);
  });

  it('reports a conflict when the next match already has a result', () => {
    const base = buildPlayoffBracket(entrantsFor(4)).map((node) =>
      node.stage === 'FINAL' ? { ...node, winnerId: 'p1' } : node,
    );
    const result = revertAdvance(base, key(1, 0));
    assert.equal(result.conflictKey, key(2, 0));
    assert.deepEqual(result.changes, []);
  });
});

const stat = (id: string, matchesWon: number, setsWon = 0, setsLost = 0): StandingStat => ({
  id,
  matchesWon,
  setsWon,
  setsLost,
  gamesWon: 0,
  gamesLost: 0,
});

describe('resolveGroupQualifiers / assignGroupQualifiers', () => {
  it('orders the table and reports no ties when it is clear', () => {
    const resolution = resolveGroupQualifiers([stat('a', 1), stat('b', 3), stat('c', 2)], [], 2);
    assert.deepEqual(resolution.order, ['b', 'c', 'a']);
    assert.deepEqual(resolution.tiedGroups, []);
  });

  it('reports a full tie that affects the qualifiers and ignores ties below the cutoff', () => {
    const tiedTop = resolveGroupQualifiers([stat('a', 2), stat('b', 2), stat('c', 0)], [], 1);
    assert.deepEqual(tiedTop.tiedGroups, [['a', 'b']]);
    const tiedBottom = resolveGroupQualifiers([stat('a', 3), stat('b', 0), stat('c', 0)], [], 1);
    assert.deepEqual(tiedBottom.tiedGroups, []);
  });

  it('resolves a tie with the head-to-head result', () => {
    const resolution = resolveGroupQualifiers(
      [stat('a', 1), stat('b', 1)],
      [{ player1Id: 'a', player2Id: 'b', winnerId: 'b' }],
      1,
    );
    assert.deepEqual(resolution.order, ['b', 'a']);
    assert.deepEqual(resolution.tiedGroups, []);
  });

  it('accepts a valid manual order and rejects an invalid one', () => {
    const standings = [stat('a', 2), stat('b', 2)];
    assert.deepEqual(resolveGroupQualifiers(standings, [], 1, ['b', 'a']).order, ['b', 'a']);
    assert.throws(() => resolveGroupQualifiers(standings, [], 1, ['b', 'b']));
    assert.throws(() => resolveGroupQualifiers(standings, [], 1, ['b']));
  });

  it('fills playoff slots from the group order', () => {
    const nodes = buildPlayoffBracket(groupPositionEntrants(4));
    const changes = assignGroupQualifiers(nodes, ['x', 'y', 'z', 'w']);
    const updated = applySlotChanges(nodes, changes);
    assert.deepEqual(
      firstRound(updated).map((node) => [node.player1Id, node.player2Id]),
      [['x', 'w'], ['y', 'z']],
    );
  });
});

describe('computeChampion', () => {
  it('uses the winner of the final in playoff tournaments', () => {
    const matches = [
      { player1Id: 'a', player2Id: 'b', winnerId: 'a', stage: 'SEMIFINAL' as const },
      { player1Id: 'a', player2Id: 'c', winnerId: 'c', stage: 'FINAL' as const },
    ];
    assert.equal(computeChampion({ kind: 'PLAYOFFS', matches }), 'c');
    assert.equal(computeChampion({ kind: 'ROUND_ROBIN_PLAYOFFS', matches }), 'c');
    assert.equal(computeChampion({ kind: 'PLAYOFFS', matches: matches.slice(0, 1) }), null);
  });

  it('uses the first place of the table in round robin and returns null on a tie', () => {
    assert.equal(computeChampion({ kind: 'ROUND_ROBIN', matches: [], standings: [stat('a', 1), stat('b', 2)] }), 'b');
    assert.equal(computeChampion({ kind: 'ROUND_ROBIN', matches: [], standings: [stat('a', 2), stat('b', 2)] }), null);
    assert.equal(computeChampion({ kind: 'ROUND_ROBIN', matches: [] }), null);
  });
});
