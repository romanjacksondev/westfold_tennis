// Pure scoring rules. Keep this file free of imports so it can be unit tested with `node --test`.

export type MatchStage = 'GROUP' | 'ROUND_OF_16' | 'QUARTERFINAL' | 'SEMIFINAL' | 'FINAL';
export type TournamentKind = 'ROUND_ROBIN' | 'ROUND_ROBIN_PLAYOFFS' | 'PLAYOFFS';

export interface PositionPoints {
  initial_position: number;
  final_position: number;
  points: number;
}

export interface ScoringMatch {
  winnerId?: string | null;
  player1Id: string;
  player2Id: string;
  stage?: MatchStage | null;
  player1?: { name?: string | null } | null;
  player2?: { name?: string | null } | null;
}

export interface ScoringTournament {
  name: string;
  status?: string | null;
  tournamentType?: { name: string } | null;
  tournamentCategory?: {
    pointsPerMatchWin?: number | null;
    tournamentCategoryPoints?: PositionPoints[] | null;
  } | null;
  matches?: ScoringMatch[] | null;
}

export interface PlayerTournamentPoints {
  playerId: string;
  name: string;
  points: number;
  matchPoints: number;
  stagePoints: number;
}

// Stages ordered from the earliest to the latest playoff round.
const PLAYOFF_STAGE_RANK: Record<Exclude<MatchStage, 'GROUP'>, number> = {
  ROUND_OF_16: 1,
  QUARTERFINAL: 2,
  SEMIFINAL: 3,
  FINAL: 4,
};

// Final position used to look up the points of a player eliminated in each stage.
const ELIMINATED_POSITION: Record<Exclude<MatchStage, 'GROUP'>, number> = {
  ROUND_OF_16: 9,
  QUARTERFINAL: 5,
  SEMIFINAL: 3,
  FINAL: 2,
};

const CHAMPION_POSITION = 1;

export const getPointsForPosition = (
  category: ScoringTournament['tournamentCategory'],
  position: number,
): number => {
  const entry = category?.tournamentCategoryPoints?.find(
    (item) => position >= item.initial_position && position <= item.final_position,
  );
  return entry ? entry.points : 0;
};

// Tournaments without a type are round robins (the original format of the club).
export const getTournamentKind = (typeName?: string | null): TournamentKind => {
  const name = (typeName ?? '').toLowerCase();
  const hasPlayoffs = name.includes('playoff');
  const hasRoundRobin = name.includes('round robin');
  if (hasPlayoffs && hasRoundRobin) return 'ROUND_ROBIN_PLAYOFFS';
  if (hasPlayoffs) return 'PLAYOFFS';
  return 'ROUND_ROBIN';
};

const isPlayoffStage = (stage?: MatchStage | null): stage is Exclude<MatchStage, 'GROUP'> =>
  Boolean(stage) && stage !== 'GROUP';

const playerNames = (matches: ScoringMatch[]) => {
  const names = new Map<string, string>();
  for (const match of matches) {
    names.set(match.player1Id, match.player1?.name || 'Unknown');
    names.set(match.player2Id, match.player2?.name || 'Unknown');
  }
  return names;
};

const winsPerPlayer = (matches: ScoringMatch[]) => {
  const wins = new Map<string, number>();
  for (const match of matches) {
    if (match.winnerId === match.player1Id || match.winnerId === match.player2Id) {
      wins.set(match.winnerId, (wins.get(match.winnerId) ?? 0) + 1);
    }
  }
  return wins;
};

// Points for the furthest playoff stage each player reached.
// `skipEntryRound`: in mixed tournaments, losing the first playoff round gives no stage points.
const stagePointsPerPlayer = (
  playoffMatches: ScoringMatch[],
  category: ScoringTournament['tournamentCategory'],
  skipEntryRound: boolean,
) => {
  const points = new Map<string, number>();
  if (playoffMatches.length === 0) return points;

  const rankOf = (match: ScoringMatch) => PLAYOFF_STAGE_RANK[match.stage as keyof typeof PLAYOFF_STAGE_RANK];
  const entryRank = Math.min(...playoffMatches.map(rankOf));
  const best = new Map<string, ScoringMatch>();

  for (const match of playoffMatches) {
    for (const playerId of [match.player1Id, match.player2Id]) {
      const current = best.get(playerId);
      if (!current || rankOf(match) > rankOf(current)) best.set(playerId, match);
    }
  }

  for (const [playerId, match] of best) {
    const stage = match.stage as Exclude<MatchStage, 'GROUP'>;
    const isChampion = stage === 'FINAL' && match.winnerId === playerId;
    if (!isChampion && skipEntryRound && rankOf(match) === entryRank) {
      points.set(playerId, 0);
      continue;
    }
    const position = isChampion ? CHAMPION_POSITION : ELIMINATED_POSITION[stage];
    points.set(playerId, getPointsForPosition(category, position));
  }
  return points;
};

// Unfinished tournaments never award points.
export const calculateTournamentPoints = (tournament: ScoringTournament): PlayerTournamentPoints[] => {
  if (tournament.status && tournament.status !== 'FINISHED') return [];

  const matches = tournament.matches ?? [];
  const kind = getTournamentKind(tournament.tournamentType?.name);
  const category = tournament.tournamentCategory;
  const pointsPerWin = category?.pointsPerMatchWin ?? 0;
  const names = playerNames(matches);

  const playoffMatches = matches.filter((match) => isPlayoffStage(match.stage));
  const groupMatches = matches.filter((match) => !isPlayoffStage(match.stage));

  const wins = kind === 'PLAYOFFS' ? new Map<string, number>() : winsPerPlayer(kind === 'ROUND_ROBIN' ? matches : groupMatches);
  const stagePoints =
    kind === 'ROUND_ROBIN'
      ? new Map<string, number>()
      : stagePointsPerPlayer(playoffMatches, category, kind === 'ROUND_ROBIN_PLAYOFFS');

  return [...names].map(([playerId, name]) => {
    const matchPoints = (wins.get(playerId) ?? 0) * pointsPerWin;
    const stage = stagePoints.get(playerId) ?? 0;
    return { playerId, name, points: matchPoints + stage, matchPoints, stagePoints: stage };
  });
};

// ─── Standings tiebreak ────────────────────────────────────────────────────

export interface StandingStat {
  id: string;
  matchesWon: number;
  setsWon: number;
  setsLost: number;
  gamesWon: number;
  gamesLost: number;
}

// headToHead.get(`${winnerId}:${loserId}`) = matches won by the first player against the second.
export const createHeadToHead = (matches: Pick<ScoringMatch, 'winnerId' | 'player1Id' | 'player2Id'>[]) => {
  const wins = new Map<string, number>();
  for (const match of matches) {
    if (!match.winnerId) continue;
    const loserId = match.winnerId === match.player1Id ? match.player2Id : match.player1Id;
    const key = `${match.winnerId}:${loserId}`;
    wins.set(key, (wins.get(key) ?? 0) + 1);
  }
  return wins;
};

// Order: matches won, set difference, game difference, games won, result between both players.
export const compareStandings = (a: StandingStat, b: StandingStat, headToHead: Map<string, number>): number => {
  if (b.matchesWon !== a.matchesWon) return b.matchesWon - a.matchesWon;
  const setDiff = (b.setsWon - b.setsLost) - (a.setsWon - a.setsLost);
  if (setDiff !== 0) return setDiff;
  const gameDiff = (b.gamesWon - b.gamesLost) - (a.gamesWon - a.gamesLost);
  if (gameDiff !== 0) return gameDiff;
  if (b.gamesWon !== a.gamesWon) return b.gamesWon - a.gamesWon;
  return (headToHead.get(`${b.id}:${a.id}`) ?? 0) - (headToHead.get(`${a.id}:${b.id}`) ?? 0);
};
