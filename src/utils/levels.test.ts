import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  describeLevelGap,
  didPlayerLevelChange,
  levelGap,
  sortPlayerMatches,
  suggestLevel,
  type LevelRef,
  type RatedMatch,
} from './levels.ts';

const levels: LevelRef[] = [
  { id: 'c', name: 'C', order: 1 },
  { id: 'b', name: 'B', order: 2 },
  { id: 'b1', name: 'B1', order: 3 },
  { id: 'a', name: 'A', order: 4 },
  { id: 'a1', name: 'A1', order: 5 },
];
const win = (opponentOrder: number | null): RatedMatch => ({ won: true, opponentOrder });
const loss = (opponentOrder: number | null): RatedMatch => ({ won: false, opponentOrder });

describe('suggestLevel', () => {
  it('suggests the next level up after 5 wins in a row against the same level', () => {
    const result = suggestLevel('b', [win(2), win(2), win(2), win(2), win(2)], levels);
    assert.deepEqual(result, { levelId: 'b1', direction: 'up', streak: 5 });
  });

  it('needs the full streak', () => {
    assert.equal(suggestLevel('b', [win(2), win(2), win(2), win(2)], levels), null);
  });

  it('a loss breaks the winning streak', () => {
    assert.equal(
      suggestLevel('b', [win(2), win(2), win(2), loss(2), win(2), win(2)], levels),
      null,
    );
  });

  it('wins against lower levels and unrated opponents are neutral', () => {
    const matches = [win(2), win(1), win(2), win(null), win(3), win(2), win(2)];
    assert.equal(suggestLevel('b', matches, levels)?.direction, 'up');
    assert.equal(suggestLevel('b', [win(1), win(1), win(1), win(1), win(1)], levels), null);
  });

  it('does not break a streak when an unrated opponent appears between counted matches', () => {
    assert.deepEqual(
      suggestLevel('b', [win(2), win(2), win(null), win(2), win(2), win(2)], levels),
      { levelId: 'b1', direction: 'up', streak: 5 },
    );
  });

  it('does not suggest above the highest level', () => {
    assert.equal(suggestLevel('a1', [win(5), win(5), win(5), win(5), win(5)], levels), null);
  });

  it('suggests the next level down after 5 losses against same-or-lower levels', () => {
    const result = suggestLevel('b', [loss(2), loss(1), loss(2), loss(2), loss(1)], levels);
    assert.deepEqual(result, { levelId: 'c', direction: 'down', streak: 5 });
    assert.equal(suggestLevel('c', [loss(1), loss(1), loss(1), loss(1), loss(1)], levels), null);
  });

  it('losses against higher levels do not justify going down', () => {
    assert.equal(suggestLevel('b', [loss(4), loss(4), loss(4), loss(4), loss(4)], levels), null);
  });

  it('suggests an initial level from the opponents of a player without level', () => {
    const matches = [win(2), loss(3), win(3), win(2), loss(3)];
    assert.deepEqual(suggestLevel(null, matches, levels), {
      levelId: 'b1',
      direction: 'initial',
      streak: 5,
    });
    assert.equal(suggestLevel(null, matches.slice(0, 4), levels), null);
  });

  it('uses the configured order rather than the input order of levels', () => {
    const reordered = [levels[4], levels[2], levels[0], levels[3], levels[1]];
    assert.deepEqual(suggestLevel('b', [win(2), win(2), win(2), win(2), win(2)], reordered), {
      levelId: 'b1',
      direction: 'up',
      streak: 5,
    });
    assert.equal(suggestLevel(null, [], []), null);
  });
});

describe('level gap', () => {
  it('compares the tournament level with the player level', () => {
    assert.equal(levelGap(2, 4), 2);
    assert.equal(levelGap(4, 2), -2);
    assert.equal(levelGap(null, 2), null);
    assert.equal(describeLevelGap(1), 'Juega 1 nivel arriba');
    assert.equal(describeLevelGap(-2), 'Juega 2 niveles abajo');
    assert.equal(describeLevelGap(0), null);
  });
});

describe('player level history rules', () => {
  it('creates level history only when the level actually changes', () => {
    assert.equal(didPlayerLevelChange('b', 'b1'), true);
    assert.equal(didPlayerLevelChange('b', 'b'), false);
    assert.equal(didPlayerLevelChange(undefined, null), false);
    assert.equal(didPlayerLevelChange(null, 'c'), true);
  });
});

describe('player match ordering', () => {
  it('sorts by date, stage, then id without mutating the input', () => {
    const matches = [
      { id: 'b', stage: 'FINAL', tournament: { date: new Date('2026-03-01T00:00:00Z') } },
      { id: 'a', stage: 'GROUP', tournament: { date: new Date('2026-03-01T00:00:00Z') } },
      { id: 'c', stage: 'GROUP', tournament: { date: new Date('2026-02-01T00:00:00Z') } },
      { id: 'a', stage: 'FINAL', tournament: { date: new Date('2026-03-01T00:00:00Z') } },
    ];
    const sorted = sortPlayerMatches(matches);
    assert.deepEqual(
      sorted.map((match) => match.id),
      ['c', 'a', 'a', 'b'],
    );
    assert.equal(matches[0].id, 'b');
  });
});
