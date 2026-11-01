import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildEliminationBracket,
  calculatePlayerPoints,
  calculatePlayerStats,
  countTournamentsByPlayer,
  createH2H,
  createMatchSummary,
  formatSetScore,
  generateDraw,
} from './utils.ts';
import {
  buildGroupMatrix,
  buildPlayoffRounds,
  getSideSetScores,
  sortDrawMatches,
} from './draw-view.ts';
import { buildTournamentDrawPreview, getDrawRoundTitle } from './tournament-draw-preview.ts';

describe('formatSetScore', () => {
  it('formats regular and tiebreak sets from the supplied player perspective', () => {
    assert.equal(formatSetScore(6, 4), '6-4');
    assert.equal(formatSetScore(7, 6, true, 7, 5), '7(7)-6(5)');
    assert.equal(formatSetScore(7, 5), '7-5');
    assert.equal(formatSetScore(6, 7, true, 5, 7), '6(5)-7(7)');
  });

  it('omits tiebreak points when they are null', () => {
    assert.equal(formatSetScore(7, 6, true, null, null), '7-6');
    assert.equal(formatSetScore(7, 6, true, 7, null), '7(7)-6');
  });
});

describe('calculatePlayerStats', () => {
  it('counts wins, losses, sets and games independently for each player', () => {
    const matches = [
      {
        player1Id: 'a',
        player2Id: 'b',
        winnerId: 'a',
        player1: { name: 'Ada' },
        player2: { name: 'Bea' },
        sets: [
          {
            winnerId: 'a',
            games: [...Array(6).fill({ winnerId: 'a' }), ...Array(4).fill({ winnerId: 'b' })],
          },
          {
            winnerId: 'b',
            games: [...Array(6).fill({ winnerId: 'b' }), ...Array(3).fill({ winnerId: 'a' })],
          },
        ],
      },
    ];

    assert.deepEqual(calculatePlayerStats(matches), [
      {
        id: 'a',
        name: 'Ada',
        matchesWon: 1,
        matchesLost: 0,
        setsWon: 1,
        setsLost: 1,
        gamesWon: 9,
        gamesLost: 10,
      },
      {
        id: 'b',
        name: 'Bea',
        matchesWon: 0,
        matchesLost: 1,
        setsWon: 1,
        setsLost: 1,
        gamesWon: 10,
        gamesLost: 9,
      },
    ]);
  });

  it('returns no players when there are no matches', () => {
    assert.deepEqual(calculatePlayerStats([]), []);
  });

  it('uses the head-to-head result after match, set and game totals tie', () => {
    const makeMatch = (winnerId: string, loserId: string) => ({
      player1Id: winnerId,
      player2Id: loserId,
      winnerId,
      player1: { name: winnerId.toUpperCase() },
      player2: { name: loserId.toUpperCase() },
      sets: [{ winnerId, games: [...Array(6).fill({ winnerId })] }],
    });
    const stats = calculatePlayerStats([
      makeMatch('a', 'b'),
      makeMatch('b', 'c'),
      makeMatch('c', 'a'),
    ]);
    assert.ok(
      stats.findIndex((player) => player.id === 'a') <
        stats.findIndex((player) => player.id === 'b'),
    );
    assert.equal(stats[0].matchesWon, stats[1].matchesWon);
    assert.equal(stats[0].setsWon - stats[0].setsLost, stats[1].setsWon - stats[1].setsLost);
    assert.equal(stats[0].gamesWon - stats[0].gamesLost, stats[1].gamesWon - stats[1].gamesLost);
  });
});

describe('calculatePlayerPoints', () => {
  const category = { pointsPerMatchWin: 10, tournamentCategoryPoints: [] };
  const tournament = (id: string, playerId: string, status = 'FINISHED') => ({
    id,
    name: id,
    status,
    tournamentType: { name: 'Round Robin' },
    tournamentCategory: category,
    matches: [
      {
        player1Id: playerId,
        player2Id: `rival-${id}`,
        winnerId: playerId,
        player1: { name: 'Alex' },
        player2: { name: 'Rival' },
      },
    ],
  });

  it('keeps same-name players separate and includes a per-tournament breakdown', () => {
    assert.deepEqual(
      calculatePlayerPoints([tournament('one', 'alex-1'), tournament('two', 'alex-2')]),
      {
        'alex-1': { name: 'Alex', points: 10, breakdown: [{ points: 10, tournament: 'one' }] },
        'rival-one': { name: 'Rival', points: 0, breakdown: [{ points: 0, tournament: 'one' }] },
        'alex-2': { name: 'Alex', points: 10, breakdown: [{ points: 10, tournament: 'two' }] },
        'rival-two': { name: 'Rival', points: 0, breakdown: [{ points: 0, tournament: 'two' }] },
      },
    );
  });

  it('does not include tournaments that are not finished', () => {
    assert.deepEqual(calculatePlayerPoints([tournament('pending', 'alex', 'IN_PROGRESS')]), {});
  });
});

describe('createH2H', () => {
  it('updates both players symmetrically for wins and losses', () => {
    const matches = [
      { player1: { name: 'Ada' }, player2: { name: 'Bea' }, winner: { name: 'Ada' } },
      { player1: { name: 'Bea' }, player2: { name: 'Ada' }, winner: { name: 'Bea' } },
      { player1: { name: 'Ada' }, player2: { name: 'Bea' }, winner: { name: 'Bea' } },
    ];
    assert.deepEqual(createH2H(matches), {
      Ada: { won: { Bea: 1 }, lost: { Bea: 2 } },
      Bea: { won: { Ada: 2 }, lost: { Ada: 1 } },
    });
  });
});

describe('createMatchSummary', () => {
  it('preserves match and set order, stage and oriented game totals', () => {
    const date = new Date(2026, 2, 5);
    const result = createMatchSummary([
      {
        id: 'm1',
        stage: 'SEMIFINAL',
        player1Id: 'a',
        player2Id: 'b',
        player1: { id: 'a', name: 'Ada' },
        player2: { id: 'b', name: 'Bea' },
        tournament: { name: 'Spring', date },
        sets: [
          {
            hasTiebreak: true,
            tiebreakPlayer1Points: 7,
            tiebreakPlayer2Points: 5,
            games: [...Array(7).fill({ winnerId: 'a' }), ...Array(6).fill({ winnerId: 'b' })],
          },
        ],
      },
    ]);
    assert.equal(result[0].stage, 'SEMIFINAL');
    assert.equal(result[0].date, '05/03/2026');
    assert.deepEqual(result[0].sets[0], {
      gamesJugador1: 7,
      gamesJugador2: 6,
      hasTiebreak: true,
      tiebreakPlayer1Points: 7,
      tiebreakPlayer2Points: 5,
    });
  });
});

describe('countTournamentsByPlayer', () => {
  it('counts titles by player identity and category', () => {
    const result = countTournamentsByPlayer([
      {
        id: 't1',
        name: 'Cup 1',
        date: new Date(2026, 0, 3),
        champion: { id: 'p1', name: 'Alex' },
        tournamentCategory: { name: 'A' },
      },
      {
        id: 't2',
        name: 'Cup 2',
        date: new Date(2026, 0, 4),
        champion: { id: 'p2', name: 'Alex' },
        tournamentCategory: { name: 'B' },
      },
      {
        id: 't3',
        name: 'Cup 3',
        date: new Date(2026, 0, 5),
        champion: { id: 'p1', name: 'Alex' },
        tournamentCategory: { name: 'A' },
      },
    ]);
    assert.equal(result.length, 2);
    assert.deepEqual(
      result.find((player) => player.id === 'p1'),
      {
        id: 'p1',
        name: 'Alex',
        total: 2,
        points: { A: 2 },
        tournaments: [
          { id: 't1', name: 'Cup 1', category: 'A', date: '03/01/2026' },
          { id: 't3', name: 'Cup 3', category: 'A', date: '05/01/2026' },
        ],
      },
    );
    assert.equal(result.find((player) => player.id === 'p2')?.total, 1);
  });
});

describe('draw generators', () => {
  it('generates one round-robin fixture for every unique pair', () => {
    const rounds = generateDraw(3, ['Ada', 'Bea', 'Cami']);
    const pairs = rounds
      .flat()
      .map((pair) => [...pair].sort().join(':'))
      .sort();
    assert.equal(pairs.length, 3);
    assert.deepEqual(pairs, ['Ada:Bea', 'Ada:Cami', 'Bea:Cami']);
  });

  it('pads non-power-of-two elimination fields with BYEs and mirrors seed pairing', () => {
    const rounds = buildEliminationBracket(
      ['1', '2', '3', '4', '5', '6'].map((id) => ({ id, label: id })),
    );
    assert.deepEqual(
      rounds.map((round) => round.matches.length),
      [4, 2, 1],
    );
    assert.deepEqual(
      rounds.map((round) => round.roundName),
      ['Cuartos de Final', 'Semifinales', 'Final'],
    );
    assert.equal(rounds[0].matches[0].top.id, '1');
    assert.equal(rounds[0].matches[0].bottom.label, 'BYE');
    assert.equal(rounds[0].matches[2].top.id, '3');
    assert.equal(rounds[0].matches[2].bottom.id, '6');
    assert.deepEqual(buildEliminationBracket([]), []);
    assert.deepEqual(buildEliminationBracket([{ id: '1', label: '1' }]), []);
  });
});

describe('draw view helpers', () => {
  const set = {
    gamesJugador1: 7,
    gamesJugador2: 6,
    hasTiebreak: true,
    tiebreakPlayer1Points: 7,
    tiebreakPlayer2Points: 5,
  };

  it('builds a symmetric group matrix with oriented scores', () => {
    const rows = buildGroupMatrix(
      [
        { id: 'a', name: 'Ada' },
        { id: 'b', name: 'Bea' },
      ],
      [{ player1Id: 'a', player2Id: 'b', winnerId: 'a', sets: [set] }],
    );
    assert.deepEqual(rows[0].cells, [{ kind: 'self' }, { kind: 'match', won: true, sets: [set] }]);
    assert.deepEqual(rows[1].cells, [
      {
        kind: 'match',
        won: false,
        sets: [
          {
            ...set,
            gamesJugador1: 6,
            gamesJugador2: 7,
            tiebreakPlayer1Points: 5,
            tiebreakPlayer2Points: 7,
          },
        ],
      },
      { kind: 'self' },
    ]);
    assert.deepEqual(getSideSetScores(set, 2), {
      games: 6,
      opponentGames: 7,
      tiebreakPoints: 5,
      hasTiebreak: true,
    });
  });

  it('sorts matches and groups playoff stages in display order', () => {
    const matches = [
      { id: 'final', stage: 'FINAL' },
      { id: 'group', stage: 'GROUP' },
      { id: 'semi', stage: 'SEMIFINAL' },
    ];
    assert.deepEqual(
      sortDrawMatches(matches).map((match) => match.id),
      ['group', 'semi', 'final'],
    );
    assert.deepEqual(
      buildPlayoffRounds(matches).map((round) => round.stage),
      ['SEMIFINAL', 'FINAL'],
    );
  });
});

describe('tournament draw preview', () => {
  it('counts match fixtures and builds BYE slots for non-power-of-two draws', () => {
    const preview = buildTournamentDrawPreview({
      typeName: 'Playoffs',
      drawSize: 6,
      qualifiers: 2,
      playerNames: ['A', 'B', 'C', 'D', 'E', 'F'],
    });
    assert.equal(preview.kind, 'playoffs');
    if (preview.kind !== 'playoffs') return;
    assert.equal(preview.bracketSize, 8);
    assert.equal(preview.matchCount, 5);
    assert.deepEqual(preview.bracketSlots.slice(-2), [
      { label: 'BYE', filled: false },
      { label: 'BYE', filled: false },
    ]);
  });

  it('shows the configured qualifier count and pads its bracket separately', () => {
    const preview = buildTournamentDrawPreview({
      typeName: 'Round Robin + Playoffs',
      drawSize: 8,
      qualifiers: 3,
      playerNames: [],
    });
    assert.equal(preview.kind, 'mixed');
    if (preview.kind !== 'mixed') return;
    assert.equal(preview.matchCount, 28);
    assert.equal(preview.qualifierCount, 3);
    assert.equal(preview.bracketSize, 4);
    assert.equal(preview.bracketSlots?.[3].label, 'BYE');
  });

  it('names rounds and reports unsupported or invalid configurations', () => {
    assert.equal(getDrawRoundTitle(8), 'Cuartos de final');
    assert.equal(
      buildTournamentDrawPreview({
        typeName: 'Unknown',
        drawSize: 8,
        qualifiers: 2,
        playerNames: [],
      }).kind,
      'unsupported',
    );
    assert.equal(
      buildTournamentDrawPreview({
        typeName: 'Playoffs',
        drawSize: 1,
        qualifiers: 2,
        playerNames: [],
      }).kind,
      'invalid-size',
    );
    assert.deepEqual(
      buildTournamentDrawPreview({
        typeName: 'Playoffs',
        drawSize: 33,
        qualifiers: 2,
        playerNames: [],
      }),
      {
        kind: 'too-large',
        maxSlots: 32,
      },
    );
  });
});
