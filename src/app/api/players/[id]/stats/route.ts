import { prisma } from '@/utils/prisma';
import { formatSetScore } from '@/utils/utils';
import { NextResponse } from 'next/server';

type RouteContext = { params: Promise<{ id: string }> };
type Counter = { played: number; won: number; lost: number };

const percentage = (won: number, played: number) => played ? Math.round((won / played) * 100) : 0;

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const player = await prisma.player.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, name: true, lastname: true, nickname: true, mail: true, phone: true },
    });
    if (!player) return NextResponse.json({ message: 'Jugador no encontrado' }, { status: 404 });

    const matches = await prisma.match.findMany({
      where: { deletedAt: null, OR: [{ player1Id: id }, { player2Id: id }] },
      orderBy: { id: 'desc' },
      select: {
        id: true, winnerId: true,
        player1: { select: { id: true, name: true, lastname: true } },
        player2: { select: { id: true, name: true, lastname: true } },
        sets: { select: { winnerId: true, hasTiebreak: true, tiebreakPlayer1Points: true, tiebreakPlayer2Points: true, games: { select: { winnerId: true } } } },
        tournament: { select: { name: true, date: true, surface: { select: { name: true } } } },
      },
    });

    const matchStats: Counter = { played: matches.length, won: 0, lost: 0 };
    const setStats: Counter = { played: 0, won: 0, lost: 0 };
    const gameStats: Counter = { played: 0, won: 0, lost: 0 };
    const opponents = new Map<string, Counter & { name: string }>();
    const surfaces = new Map<string, Counter & { name: string }>();
    const recentMatches = matches.slice(0, 10).map((match) => {
      const won = match.winnerId === id;
      const isPlayer1 = match.player1.id === id;
      const opponent = isPlayer1 ? match.player2 : match.player1;
      const opponentName = `${opponent.name} ${opponent.lastname ?? ''}`.trim();
      const opponentStats = opponents.get(opponent.id) ?? { name: opponentName, played: 0, won: 0, lost: 0 };
      opponentStats.played += 1;
      won ? opponentStats.won += 1 : opponentStats.lost += 1;
      opponents.set(opponent.id, opponentStats);
      if (match.tournament?.surface) {
        const surfaceStats = surfaces.get(match.tournament.surface.name) ?? { name: match.tournament.surface.name, played: 0, won: 0, lost: 0 };
        surfaceStats.played += 1;
        won ? surfaceStats.won += 1 : surfaceStats.lost += 1;
        surfaces.set(surfaceStats.name, surfaceStats);
      }
      match.sets.forEach((set) => {
        setStats.played += 1;
        set.winnerId === id ? setStats.won += 1 : setStats.lost += 1;
        set.games.forEach((game) => {
          gameStats.played += 1;
          game.winnerId === id ? gameStats.won += 1 : gameStats.lost += 1;
        });
      });
      if (won) matchStats.won += 1; else matchStats.lost += 1;
      return {
        id: match.id,
        opponent: opponentName,
        result: won ? 'Victoria' : 'Derrota',
        tournament: match.tournament?.name ?? 'Partido sin torneo',
        surface: match.tournament?.surface?.name ?? null,
        date: match.tournament?.date?.toISOString() ?? null,
        sets: match.sets.map((set) => {
          const ownGames = set.games.filter((game) => game.winnerId === id).length;
          const opponentGames = set.games.length - ownGames;
          const ownTiebreak = isPlayer1 ? set.tiebreakPlayer1Points : set.tiebreakPlayer2Points;
          const opponentTiebreak = isPlayer1 ? set.tiebreakPlayer2Points : set.tiebreakPlayer1Points;
          return formatSetScore(ownGames, opponentGames, set.hasTiebreak, ownTiebreak, opponentTiebreak);
        }),
      };
    });

    const titles = await prisma.tournament.count({ where: { deletedAt: null, championId: id } });
    const surfaceStats = [...surfaces.values()].map((item) => ({ ...item, percentage: percentage(item.won, item.played) })).sort((a, b) => b.percentage - a.percentage || b.won - a.won);
    const opponentStats = [...opponents.values()].map((item) => ({ ...item, percentage: percentage(item.won, item.played) })).sort((a, b) => b.won - a.won || b.played - a.played);
    const lossesAgainst = [...opponentStats].sort((a, b) => b.lost - a.lost || b.played - a.played);

    return NextResponse.json({
      player,
      summary: { matches: { ...matchStats, percentage: percentage(matchStats.won, matchStats.played) }, sets: { ...setStats, percentage: percentage(setStats.won, setStats.played) }, games: { ...gameStats, difference: gameStats.won - gameStats.lost, percentage: percentage(gameStats.won, gameStats.played) }, titles },
      surfaces: { all: surfaceStats, bestByPercentage: surfaceStats[0] ?? null, bestByWins: [...surfaceStats].sort((a, b) => b.won - a.won || b.percentage - a.percentage)[0] ?? null },
      opponents: { mostWins: opponentStats.slice(0, 5), mostLosses: lossesAgainst.slice(0, 5) },
      recentMatches,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'No se pudieron obtener las estadísticas' }, { status: 500 });
  }
}