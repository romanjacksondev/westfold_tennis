export type MatchSetInput = {
  gamesPlayer1: number | string;
  gamesPlayer2: number | string;
  winner: string;
  hasTiebreak?: boolean;
  tiebreakPlayer1Points?: number | string | null;
  tiebreakPlayer2Points?: number | string | null;
};

function toScore(value: number | string | null | undefined) {
  const score = Number(value);
  return Number.isInteger(score) && score >= 0 ? score : null;
}

// Nested-create data for the sets of a match; gamesPlayer1/2 belong to player1Id/player2Id.
export function buildSetData(sets: MatchSetInput[], player1Id: string, player2Id: string) {
  return sets.map((set) => {
    const hasTiebreak = Boolean(set.hasTiebreak);
    const tiebreakPlayer1Points = hasTiebreak ? toScore(set.tiebreakPlayer1Points) : null;
    const tiebreakPlayer2Points = hasTiebreak ? toScore(set.tiebreakPlayer2Points) : null;
    if (hasTiebreak && (tiebreakPlayer1Points === null || tiebreakPlayer2Points === null)) {
      throw new Error('El resultado del tiebreak es inválido');
    }
    const gamesPlayer1 = Number(set.gamesPlayer1);
    const gamesPlayer2 = Number(set.gamesPlayer2);
    if (!Number.isInteger(gamesPlayer1) || !Number.isInteger(gamesPlayer2) || gamesPlayer1 < 0 || gamesPlayer2 < 0) {
      throw new Error('El resultado del set es inválido');
    }
    return {
      winnerId: set.winner,
      hasTiebreak,
      tiebreakPlayer1Points,
      tiebreakPlayer2Points,
      games: {
        create: [
          ...Array.from({ length: gamesPlayer1 }, () => ({ winnerId: player1Id })),
          ...Array.from({ length: gamesPlayer2 }, () => ({ winnerId: player2Id })),
        ],
      },
    };
  });
}
