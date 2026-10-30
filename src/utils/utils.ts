import { format } from 'date-fns';
import { Tournament, Stat, PointsBreakdown } from '@/types';
import { calculateTournamentPoints, compareStandings, createHeadToHead } from '@/utils/scoring';

// Formats a set's real score, e.g. "6-4" or "7(7)-6(5)" when it was decided by tiebreak.
export const formatSetScore = (
  gamesFirst: number,
  gamesSecond: number,
  hasTiebreak?: boolean | null,
  tiebreakFirst?: number | null,
  tiebreakSecond?: number | null,
) => {
  const first = hasTiebreak && tiebreakFirst != null ? `${gamesFirst}(${tiebreakFirst})` : `${gamesFirst}`;
  const second = hasTiebreak && tiebreakSecond != null ? `${gamesSecond}(${tiebreakSecond})` : `${gamesSecond}`;
  return `${first}-${second}`;
};

export interface MatchSetGame {
  winnerId: string;
}

export interface MatchSet {
  winnerId?: string | null;
  games: MatchSetGame[];
}

export interface MatchPlayerInfo {
  name?: string | null;
}

export interface MatchWithDetails {
  winnerId?: string | null;
  player1Id: string;
  player2Id: string;
  player1?: MatchPlayerInfo | null;
  player2?: MatchPlayerInfo | null;
  sets?: MatchSet[];
}

export const calculatePlayerStats = (matches: MatchWithDetails[] | any[]): Stat[] => {
  const playerStats: Record<string, Stat> = {};

  (matches || []).forEach((match) => {
    const { winnerId, player1Id, player2Id, sets } = match;
    if (!player1Id || !player2Id) return;

    // Inicializa los jugadores en el objeto playerStats si no existen
    if (!playerStats[player1Id]) {
      playerStats[player1Id] = {
        id: player1Id,
        name: match.player1?.name || 'Unknown',
        matchesWon: 0,
        matchesLost: 0,
        gamesWon: 0,
        setsWon: 0,
        setsLost: 0,
        gamesLost: 0,
      };
    }

    if (!playerStats[player2Id]) {
      playerStats[player2Id] = {
        id: player2Id,
        name: match.player2?.name || 'Unknown',
        matchesWon: 0,
        matchesLost: 0,
        gamesWon: 0,
        setsWon: 0,
        setsLost: 0,
        gamesLost: 0,
      };
    }

    // Determina el resultado del partido solo si hay un ganador definido
    if (winnerId) {
      if (winnerId === player1Id) {
        playerStats[player1Id].matchesWon += 1;
        playerStats[player2Id].matchesLost += 1;
      } else if (winnerId === player2Id) {
        playerStats[player2Id].matchesWon += 1;
        playerStats[player1Id].matchesLost += 1;
      }
    }

    (sets || []).forEach((set: MatchSet) => {
      const setWinnerId = set.winnerId;
      if (setWinnerId && (setWinnerId === player1Id || setWinnerId === player2Id)) {
        const setLoserId = setWinnerId === player1Id ? player2Id : player1Id;
        playerStats[setWinnerId].setsWon += 1;
        playerStats[setLoserId].setsLost += 1;
      }
      (set.games || []).forEach((game: MatchSetGame) => {
        const { winnerId: gameWinnerId } = game;
        if (!gameWinnerId) return;

        if (!playerStats[gameWinnerId]) {
          playerStats[gameWinnerId] = {
            id: gameWinnerId,
            name:
              gameWinnerId === player1Id
                ? match.player1?.name || 'Unknown'
                : match.player2?.name || 'Unknown',
            matchesWon: 0,
            matchesLost: 0,
            gamesWon: 0,
            setsWon: 0,
            setsLost: 0,
            gamesLost: 0,
          };
        }
        playerStats[gameWinnerId].gamesWon += 1;

        const gameLoserId = gameWinnerId === player1Id ? player2Id : player1Id;
        if (!playerStats[gameLoserId]) {
          playerStats[gameLoserId] = {
            id: gameLoserId,
            name:
              gameLoserId === player1Id
                ? match.player1?.name || 'Unknown'
                : match.player2?.name || 'Unknown',
            matchesWon: 0,
            matchesLost: 0,
            gamesWon: 0,
            setsWon: 0,
            setsLost: 0,
            gamesLost: 0,
          };
        }
        playerStats[gameLoserId].gamesLost += 1;
      });
    });
  });

  // Convierte el objeto playerStats en un array
  const statsArray: Stat[] = Object.values(playerStats);

  // Ordena por partidos ganados, sets, games y, si sigue el empate, el resultado entre ambos
  const headToHead = createHeadToHead(matches || []);
  statsArray.sort((a, b) => compareStandings(a, b, headToHead));

  return statsArray;
};

// ─── Tournament Points ─────────────────────────────────────────────────────

// Suma los puntos de cada jugador según el tipo de torneo (solo torneos finalizados)
export const calculatePlayerPoints = (
  tournaments: (Tournament | any)[],
): Record<string, PointsBreakdown> => {
  const playerPoints: Record<string, PointsBreakdown> = {};
  for (const tournament of tournaments || []) {
    if (!tournament) continue;

    for (const { name, points } of calculateTournamentPoints(tournament)) {
      if (!playerPoints[name]) {
        playerPoints[name] = { points: 0, breakdown: [] };
      }
      playerPoints[name].points += points;
      playerPoints[name].breakdown.push({ points, tournament: tournament.name });
    }
  }
  return playerPoints;
};

// ─── Head to Head (H2H) ────────────────────────────────────────────────────

export interface H2HRecord {
  won: Record<string, number>;
  lost: Record<string, number>;
}

export const createH2H = (matches: any[]): Record<string, H2HRecord> => {
  const results: Record<string, H2HRecord> = {};

  (matches || []).forEach((match) => {
    const jugador1 = match.player1?.name;
    const jugador2 = match.player2?.name;
    const ganador = match.winner?.name;

    if (!jugador1 || !jugador2 || !ganador) return;

    if (!results[jugador1]) {
      results[jugador1] = { won: {}, lost: {} };
    }
    if (!results[jugador2]) {
      results[jugador2] = { won: {}, lost: {} };
    }

    if (ganador === jugador1) {
      results[jugador1].won[jugador2] = (results[jugador1].won[jugador2] || 0) + 1;
      results[jugador2].lost[jugador1] = (results[jugador2].lost[jugador1] || 0) + 1;
    } else if (ganador === jugador2) {
      results[jugador2].won[jugador1] = (results[jugador2].won[jugador1] || 0) + 1;
      results[jugador1].lost[jugador2] = (results[jugador1].lost[jugador2] || 0) + 1;
    }
  });

  return results;
};

// ─── Round Robin Draw Generator ────────────────────────────────────────────

export const generateDraw = <T = any>(n: number, ps?: T[] | null): [T, T][][] => {
  const DUMMY = -1 as unknown as T;
  let playersList: T[];

  if (!ps || ps.length === 0) {
    playersList = [] as T[];
    for (let k = 1; k <= n; k += 1) {
      playersList.push(k as unknown as T);
    }
  } else {
    playersList = ps.slice();
  }

  let total = n;
  if (total % 2 === 1) {
    playersList.push(DUMMY);
    total += 1;
  }

  const rounds: [T, T][][] = [];
  for (let j = 0; j < total - 1; j += 1) {
    rounds[j] = [];
    for (let i = 0; i < total / 2; i += 1) {
      const o = total - 1 - i;
      if (playersList[i] !== DUMMY && playersList[o] !== DUMMY) {
        const isHome = i === 0 && j % 2 === 1;
        rounds[j].push([
          isHome ? playersList[o] : playersList[i],
          isHome ? playersList[i] : playersList[o],
        ]);
      }
    }
    const last = playersList.pop();
    if (last !== undefined) {
      playersList.splice(1, 0, last);
    }
  }
  return rounds;
};

// ─── Elimination Bracket ───────────────────────────────────────────────────

export type DrawSlot = { id: string | null; label: string };

export type BracketMatch = { top: DrawSlot; bottom: DrawSlot };

export type BracketRound = { roundName: string; matches: BracketMatch[] };

/** Returns a human-readable name for a bracket round given the number of matches in it. */
function bracketRoundName(matchCount: number): string {
  const totalPlayers = matchCount * 2;
  if (totalPlayers === 2) return 'Final';
  if (totalPlayers === 4) return 'Semifinales';
  if (totalPlayers === 8) return 'Cuartos de Final';
  if (totalPlayers === 16) return 'Octavos de Final';
  if (totalPlayers === 32) return 'Ronda de 32';
  if (totalPlayers === 64) return 'Ronda de 64';
  return `Ronda de ${totalPlayers}`;
}

/**
 * Builds a single-elimination bracket from an ordered slot list.
 * Slots should arrive pre-shuffled (random seeding). If `slots.length` is
 * not a power of 2, it is padded with vacancy slots up to the next power of 2.
 */
export function buildEliminationBracket(slots: DrawSlot[]): BracketRound[] {
  // Pad to next power of 2
  let size = 1;
  while (size < slots.length) size *= 2;
  const paddedSlots: DrawSlot[] = [...slots];
  while (paddedSlots.length < size) {
    paddedSlots.push({ id: null, label: 'Vacante' });
  }

  const rounds: BracketRound[] = [];

  // Round 1: mirror pairing — slot i vs slot (size - 1 - i)
  const round1Matches: BracketMatch[] = [];
  for (let i = 0; i < size / 2; i++) {
    round1Matches.push({ top: paddedSlots[i], bottom: paddedSlots[size - 1 - i] });
  }
  rounds.push({ roundName: bracketRoundName(round1Matches.length), matches: round1Matches });

  // Subsequent rounds: placeholder winners from the previous round
  let matchCounter = round1Matches.length; // track match numbers across rounds
  let prevMatchCount = round1Matches.length;

  while (prevMatchCount > 1) {
    const nextMatchCount = prevMatchCount / 2;
    const startIndex = matchCounter - prevMatchCount + 1; // first match number of prev round
    const matches: BracketMatch[] = [];
    for (let i = 0; i < nextMatchCount; i++) {
      const topMatchNum = startIndex + i * 2;
      const bottomMatchNum = startIndex + i * 2 + 1;
      matches.push({
        top: { id: null, label: `Ganador Partido ${topMatchNum}` },
        bottom: { id: null, label: `Ganador Partido ${bottomMatchNum}` },
      });
    }
    matchCounter += nextMatchCount;
    rounds.push({ roundName: bracketRoundName(nextMatchCount), matches });
    prevMatchCount = nextMatchCount;
  }

  return rounds;
}

// ─── Match Summary ─────────────────────────────────────────────────────────

export interface MatchSummarySet {
  gamesJugador1: number;
  gamesJugador2: number;
  hasTiebreak?: boolean | null;
  tiebreakPlayer1Points?: number | null;
  tiebreakPlayer2Points?: number | null;
}

export interface MatchSummaryItem {
  id?: string;
  winnerId: string | null;
  tournamentName?: string | null;
  player1Name?: { id?: string; name?: string } | null;
  player2Name?: { id?: string; name?: string } | null;
  player1Id?: string | null;
  player2Id?: string | null;
  date: string;
  sets: MatchSummarySet[];
}

export const createMatchSummary = (matchesList: any[]): MatchSummaryItem[] => {
  const data: MatchSummaryItem[] = [];

  (matchesList || []).forEach((match) => {
    let formattedDate = '';
    if (match.tournament?.date) {
      try {
        formattedDate = format(new Date(match.tournament.date), 'dd/MM/yyyy');
      } catch {
        formattedDate = String(match.tournament.date);
      }
    }

    const matchData: MatchSummaryItem = {
      id: match.id ?? undefined,
      winnerId: match.winnerId ?? null,
      tournamentName: match.tournament?.name ?? '',
      player1Name: match.player1 ?? null,
      player2Name: match.player2 ?? null,
      player1Id: match.player1Id ?? null,
      player2Id: match.player2Id ?? null,
      date: formattedDate,
      sets: [],
    };

    (match.sets || []).forEach((set: any) => {
      const setData: MatchSummarySet = {
        gamesJugador1: 0,
        gamesJugador2: 0,
        hasTiebreak: set.hasTiebreak ?? false,
        tiebreakPlayer1Points: set.tiebreakPlayer1Points ?? null,
        tiebreakPlayer2Points: set.tiebreakPlayer2Points ?? null,
      };

      (set.games || []).forEach((game: any) => {
        if (game.winnerId === matchData.player1Id) {
          setData.gamesJugador1++;
        } else {
          setData.gamesJugador2++;
        }
      });

      matchData.sets.push(setData);
    });

    data.push(matchData);
  });

  return data;
};

// ─── Tournaments by Player (Championships) ─────────────────────────────────

export interface PlayerChampionshipWon {
  id: string;
  name: string;
  category: string;
  date: string;
}

export interface PlayerChampionships {
  name: string;
  total: number;
  points: Record<string, number>;
  tournaments: PlayerChampionshipWon[];
}

export const countTournamentsByPlayer = (tournaments: any[]): PlayerChampionships[] => {
  const stats: Record<string, PlayerChampionships> = {};

  (tournaments || []).forEach((tournament) => {
    if (!tournament.champion?.name) return;
    const winner = tournament.champion.name;
    const category = tournament.tournamentCategory?.name || 'Otro';

    if (!stats[winner]) {
      stats[winner] = {
        name: winner,
        total: 0,
        points: {},
        tournaments: [],
      };
    }

    stats[winner].total += 1;
    stats[winner].points[category] = (stats[winner].points[category] || 0) + 1;

    let formattedDate = '';
    if (tournament.date) {
      try {
        formattedDate = format(new Date(tournament.date), 'dd/MM/yyyy');
      } catch {
        formattedDate = String(tournament.date);
      }
    }

    stats[winner].tournaments.push({
      id: tournament.id,
      name: tournament.name,
      category,
      date: formattedDate,
    });
  });

  const resultArray = Object.values(stats);
  resultArray.sort((a, b) => b.total - a.total);
  return resultArray;
};