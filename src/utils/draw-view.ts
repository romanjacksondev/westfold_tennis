export type DrawViewSet = {
  gamesJugador1: number;
  gamesJugador2: number;
  hasTiebreak?: boolean | null;
  tiebreakPlayer1Points?: number | null;
  tiebreakPlayer2Points?: number | null;
};

export type DrawViewMatch = {
  stage?: string | null;
  player1Id: string;
  player2Id: string;
  winnerId: string;
  sets?: DrawViewSet[];
};

export type DrawViewPlayer = { id: string; name: string };

export type GroupCell =
  { kind: 'self' } | { kind: 'empty' } | { kind: 'match'; won: boolean; sets: DrawViewSet[] };

export const DRAW_STAGE_ORDER = ['GROUP', 'ROUND_OF_16', 'QUARTERFINAL', 'SEMIFINAL', 'FINAL'];

export function getDrawStageRank(stage?: string | null): number {
  const index = stage ? DRAW_STAGE_ORDER.indexOf(stage) : -1;
  return index < 0 ? 0 : index;
}

export function sortDrawMatches<T extends { stage?: string | null }>(matches: T[]): T[] {
  return [...matches].sort((a, b) => getDrawStageRank(a.stage) - getDrawStageRank(b.stage));
}

export function buildGroupMatrix(
  players: DrawViewPlayer[],
  matches: DrawViewMatch[],
): { player: DrawViewPlayer; cells: GroupCell[] }[] {
  return players.map((player) => ({
    player,
    cells: players.map((opponent): GroupCell => {
      if (player.id === opponent.id) return { kind: 'self' };
      const match = matches.find(
        (item) =>
          (item.player1Id === player.id && item.player2Id === opponent.id) ||
          (item.player1Id === opponent.id && item.player2Id === player.id),
      );
      if (!match) return { kind: 'empty' };

      const isPlayer1 = match.player1Id === player.id;
      return {
        kind: 'match',
        won: match.winnerId === player.id,
        sets: (match.sets ?? []).map((set) =>
          isPlayer1
            ? { ...set }
            : {
                ...set,
                gamesJugador1: set.gamesJugador2,
                gamesJugador2: set.gamesJugador1,
                tiebreakPlayer1Points: set.tiebreakPlayer2Points,
                tiebreakPlayer2Points: set.tiebreakPlayer1Points,
              },
        ),
      };
    }),
  }));
}

export function buildPlayoffRounds<T extends { stage?: string | null }>(matches: T[]) {
  return DRAW_STAGE_ORDER.filter(
    (stage) => stage !== 'GROUP' && matches.some((match) => match.stage === stage),
  ).map((stage) => ({ stage, matches: matches.filter((match) => match.stage === stage) }));
}

export function getSideSetScores(
  set: DrawViewSet,
  side: 1 | 2,
): {
  games: number;
  opponentGames: number;
  tiebreakPoints: number | null | undefined;
  hasTiebreak?: boolean | null;
} {
  return side === 1
    ? {
        games: set.gamesJugador1,
        opponentGames: set.gamesJugador2,
        tiebreakPoints: set.tiebreakPlayer1Points,
        hasTiebreak: set.hasTiebreak,
      }
    : {
        games: set.gamesJugador2,
        opponentGames: set.gamesJugador1,
        tiebreakPoints: set.tiebreakPlayer2Points,
        hasTiebreak: set.hasTiebreak,
      };
}
