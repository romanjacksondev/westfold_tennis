import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  calculateTournamentPoints,
  compareStandings,
  createHeadToHead,
  getPointsForPosition,
  getTournamentKind,
  type MatchStage,
  type ScoringMatch,
  type ScoringTournament,
} from './scoring.ts';

const category = {
  pointsPerMatchWin: 200,
  tournamentCategoryPoints: [
    { initial_position: 1, final_position: 1, points: 2000 },
    { initial_position: 2, final_position: 2, points: 1300 },
    { initial_position: 3, final_position: 4, points: 800 },
    { initial_position: 5, final_position: 8, points: 400 },
  ],
};

const match = (winner: string, loser: string, stage?: MatchStage | null): ScoringMatch => ({
  player1Id: winner,
  player2Id: loser,
  winnerId: winner,
  stage,
  player1: { name: winner.toUpperCase() },
  player2: { name: loser.toUpperCase() },
});

const tournament = (
  type: string | null,
  matches: ScoringMatch[],
  status = 'FINISHED',
): ScoringTournament => ({
  name: 'Test',
  status,
  tournamentType: type ? { name: type } : null,
  tournamentCategory: category,
  matches,
});

const pointsById = (t: ScoringTournament) =>
  Object.fromEntries(calculateTournamentPoints(t).map((entry) => [entry.playerId, entry.points]));

// 4 players, everybody plays everybody: a beats all, b beats c and d, c beats d.
const roundRobinMatches = () => [
  match('a', 'b'),
  match('a', 'c'),
  match('a', 'd'),
  match('b', 'c'),
  match('b', 'd'),
  match('c', 'd'),
];

// 8-player bracket: a champion, b finalist, c and d lost semis, e..h lost quarters.
const bracketMatches = (): ScoringMatch[] => [
  match('a', 'e', 'QUARTERFINAL'),
  match('b', 'f', 'QUARTERFINAL'),
  match('c', 'g', 'QUARTERFINAL'),
  match('d', 'h', 'QUARTERFINAL'),
  match('a', 'c', 'SEMIFINAL'),
  match('b', 'd', 'SEMIFINAL'),
  match('a', 'b', 'FINAL'),
];

describe('getTournamentKind', () => {
  it('maps the type names', () => {
    assert.equal(getTournamentKind('Round Robin'), 'ROUND_ROBIN');
    assert.equal(getTournamentKind('Round Robin + Playoffs'), 'ROUND_ROBIN_PLAYOFFS');
    assert.equal(getTournamentKind('Playoffs'), 'PLAYOFFS');
  });

  it('treats a missing type as round robin', () => {
    assert.equal(getTournamentKind(null), 'ROUND_ROBIN');
    assert.equal(getTournamentKind(undefined), 'ROUND_ROBIN');
  });
});

describe('getPointsForPosition', () => {
  it('uses the position ranges and returns 0 outside of them', () => {
    assert.equal(getPointsForPosition(category, 1), 2000);
    assert.equal(getPointsForPosition(category, 4), 800);
    assert.equal(getPointsForPosition(category, 8), 400);
    assert.equal(getPointsForPosition(category, 9), 0);
    assert.equal(getPointsForPosition(null, 1), 0);
  });
});

describe('Round Robin', () => {
  it('awards points for every match won, not for the final position', () => {
    assert.deepEqual(pointsById(tournament('Round Robin', roundRobinMatches())), {
      a: 600,
      b: 400,
      c: 200,
      d: 0,
    });
  });

  it('still lists players without wins', () => {
    const result = calculateTournamentPoints(tournament('Round Robin', roundRobinMatches()));
    assert.equal(result.length, 4);
    assert.equal(result.find((entry) => entry.playerId === 'd')?.points, 0);
  });

  it('is the default when the tournament has no type', () => {
    assert.deepEqual(pointsById(tournament(null, roundRobinMatches())), {
      a: 600,
      b: 400,
      c: 200,
      d: 0,
    });
  });

  it('counts a player who wins more matches than a rival even with worse game difference', () => {
    const matches = [match('x', 'y'), match('x', 'z'), match('y', 'z')];
    assert.deepEqual(pointsById(tournament('Round Robin', matches)), { x: 400, y: 200, z: 0 });
  });

  it('ignores matches without a winner', () => {
    const open: ScoringMatch = { ...match('a', 'b'), winnerId: null };
    assert.deepEqual(pointsById(tournament('Round Robin', [open, match('a', 'c')])), {
      a: 200,
      b: 0,
      c: 0,
    });
  });

  it('uses the points per win of the category', () => {
    const t = tournament('Round Robin', [match('a', 'b')]);
    t.tournamentCategory = { ...category, pointsPerMatchWin: 25 };
    assert.deepEqual(pointsById(t), { a: 25, b: 0 });
  });
});

describe('Playoffs', () => {
  it('awards points for the furthest stage reached', () => {
    assert.deepEqual(pointsById(tournament('Playoffs', bracketMatches())), {
      a: 2000,
      b: 1300,
      c: 800,
      d: 800,
      e: 400,
      f: 400,
      g: 400,
      h: 400,
    });
  });

  it('does not award points per match won', () => {
    const points = pointsById(tournament('Playoffs', bracketMatches()));
    assert.notEqual(points.a, 2000 + 3 * 200);
  });

  it('scores a 4 player bracket starting in the semifinals', () => {
    const matches = [
      match('a', 'c', 'SEMIFINAL'),
      match('b', 'd', 'SEMIFINAL'),
      match('b', 'a', 'FINAL'),
    ];
    assert.deepEqual(pointsById(tournament('Playoffs', matches)), {
      a: 1300,
      b: 2000,
      c: 800,
      d: 800,
    });
  });

  it('scores players who enter the bracket after a BYE', () => {
    const matches = [
      match('a', 'c', 'SEMIFINAL'),
      match('b', 'd', 'SEMIFINAL'),
      match('a', 'b', 'FINAL'),
    ];
    assert.deepEqual(pointsById(tournament('Playoffs', matches)), {
      a: 2000,
      b: 1300,
      c: 800,
      d: 800,
    });
  });

  it('gives 0 points to players eliminated before the quarterfinals', () => {
    const matches = [match('a', 'z', 'ROUND_OF_16'), match('a', 'b', 'QUARTERFINAL')];
    assert.equal(pointsById(tournament('Playoffs', matches)).z, 0);
    assert.equal(pointsById(tournament('Playoffs', matches)).b, 400);
  });

  it('ignores group stage matches', () => {
    const matches = [match('a', 'b', 'GROUP'), match('c', 'd')];
    assert.deepEqual(pointsById(tournament('Playoffs', matches)), { a: 0, b: 0, c: 0, d: 0 });
  });
});

describe('Round Robin + Playoffs', () => {
  const group = () => roundRobinMatches().map((m) => ({ ...m, stage: 'GROUP' as const }));

  it('adds match points of the group stage and the stage reached in the playoffs', () => {
    // Semifinals a-d and b-c, final a-b.
    const playoffs = [
      match('a', 'd', 'SEMIFINAL'),
      match('b', 'c', 'SEMIFINAL'),
      match('a', 'b', 'FINAL'),
    ];
    // a: 3 group wins + champion. b: 2 group wins + finalist. c, d lose their first playoff round.
    assert.deepEqual(pointsById(tournament('Round Robin + Playoffs', [...group(), ...playoffs])), {
      a: 3 * 200 + 2000,
      b: 2 * 200 + 1300,
      c: 1 * 200,
      d: 0,
    });
  });

  it('does not award stage points for losing the first playoff round', () => {
    const playoffs = [
      match('a', 'd', 'SEMIFINAL'),
      match('b', 'c', 'SEMIFINAL'),
      match('a', 'b', 'FINAL'),
    ];
    const result = calculateTournamentPoints(
      tournament('Round Robin + Playoffs', [...group(), ...playoffs]),
    );
    assert.equal(result.find((entry) => entry.playerId === 'c')?.stagePoints, 0);
    assert.equal(result.find((entry) => entry.playerId === 'd')?.stagePoints, 0);
  });

  it('does not count playoff wins as match wins', () => {
    const playoffs = [
      match('d', 'a', 'SEMIFINAL'),
      match('c', 'b', 'SEMIFINAL'),
      match('d', 'c', 'FINAL'),
    ];
    const points = pointsById(tournament('Round Robin + Playoffs', [...group(), ...playoffs]));
    assert.equal(points.d, 0 * 200 + 2000);
    assert.equal(points.a, 3 * 200);
  });

  it('gives points to the semifinal losers when the playoffs start in the quarterfinals', () => {
    const matches = [
      match('a', 'h', 'QUARTERFINAL'),
      match('b', 'g', 'QUARTERFINAL'),
      match('c', 'f', 'QUARTERFINAL'),
      match('d', 'e', 'QUARTERFINAL'),
      match('a', 'd', 'SEMIFINAL'),
      match('b', 'c', 'SEMIFINAL'),
      match('a', 'b', 'FINAL'),
    ];
    const points = pointsById(tournament('Round Robin + Playoffs', matches));
    assert.equal(points.a, 2000);
    assert.equal(points.b, 1300);
    assert.equal(points.c, 800);
    assert.equal(points.d, 800);
    for (const id of ['e', 'f', 'g', 'h']) assert.equal(points[id], 0);
  });

  it('treats matches without stage as group matches', () => {
    const playoffs = [
      match('a', 'd', 'SEMIFINAL'),
      match('b', 'c', 'SEMIFINAL'),
      match('a', 'b', 'FINAL'),
    ];
    const points = pointsById(
      tournament('Round Robin + Playoffs', [...roundRobinMatches(), ...playoffs]),
    );
    assert.equal(points.a, 3 * 200 + 2000);
  });
});

describe('Tournament status', () => {
  it('awards no points while the tournament is not finished', () => {
    for (const status of ['PREPARATION', 'IN_PROGRESS', 'CANCELLED']) {
      assert.deepEqual(
        calculateTournamentPoints(tournament('Round Robin', roundRobinMatches(), status)),
        [],
      );
      assert.deepEqual(
        calculateTournamentPoints(tournament('Playoffs', bracketMatches(), status)),
        [],
      );
    }
  });

  it('handles tournaments without matches or category', () => {
    assert.deepEqual(calculateTournamentPoints({ name: 'Empty', status: 'FINISHED' }), []);
    const noCategory = { ...tournament('Playoffs', bracketMatches()), tournamentCategory: null };
    assert.equal(pointsById(noCategory).a, 0);
  });

  it('awards zero when the category does not define the reached position', () => {
    const noChampionPoints = {
      ...tournament('Playoffs', [match('a', 'b', 'FINAL')]),
      tournamentCategory: {
        tournamentCategoryPoints: [{ initial_position: 2, final_position: 2, points: 100 }],
      },
    };
    assert.equal(pointsById(noChampionPoints).a, 0);
  });
});

describe('compareStandings', () => {
  const stat = (id: string, over: Record<string, number> = {}) => ({
    id,
    matchesWon: 1,
    setsWon: 2,
    setsLost: 2,
    gamesWon: 20,
    gamesLost: 20,
    ...over,
  });
  const order = (stats: ReturnType<typeof stat>[], matches: ScoringMatch[] = []) =>
    [...stats].sort((a, b) => compareStandings(a, b, createHeadToHead(matches))).map((s) => s.id);

  it('ranks by matches won first, even with worse sets and games', () => {
    assert.deepEqual(
      order([stat('a', { setsWon: 0, gamesWon: 0 }), stat('b', { matchesWon: 2 })]),
      ['b', 'a'],
    );
  });

  it('uses set difference before game difference', () => {
    const a = stat('a', { setsWon: 3, setsLost: 2, gamesWon: 10, gamesLost: 30 });
    const b = stat('b', { setsWon: 2, setsLost: 2, gamesWon: 30, gamesLost: 10 });
    assert.deepEqual(order([b, a]), ['a', 'b']);
  });

  it('uses game difference, then games won', () => {
    const a = stat('a', { gamesWon: 25, gamesLost: 20 });
    const b = stat('b', { gamesWon: 20, gamesLost: 20 });
    assert.deepEqual(order([b, a]), ['a', 'b']);
    const c = stat('c', { gamesWon: 30, gamesLost: 30 });
    assert.deepEqual(order([b, c]), ['c', 'b']);
  });

  it('breaks a complete tie with the match between both players', () => {
    assert.deepEqual(order([stat('a'), stat('b')], [match('b', 'a')]), ['b', 'a']);
    assert.deepEqual(order([stat('b'), stat('a')], [match('a', 'b')]), ['a', 'b']);
  });
});
