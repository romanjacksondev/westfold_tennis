import { logger } from '@/lib/logger';
import { withApiLogging } from '@/lib/api-logging';
import { getServerSession } from 'next-auth';
import { connection, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getPlayerLevelInfo } from '@/lib/player-level';
import { prisma } from '@/utils/prisma';

const STAGE_LABELS: Record<string, string> = {
  GROUP: 'Fase de grupos',
  ROUND_OF_32: '16avos',
  ROUND_OF_16: 'Octavos',
  QUARTERFINAL: 'Cuartos',
  SEMIFINAL: 'Semifinal',
  FINAL: 'Final',
};

async function handleGet() {
  await connection();

  try {
    const finished = { status: 'FINISHED' as const, deletedAt: null };
    const [players, tournaments, matches, lastTournament] = await Promise.all([
      prisma.player.count({ where: { deletedAt: null } }),
      prisma.tournament.count({ where: finished }),
      prisma.match.count({ where: { deletedAt: null, tournament: finished } }),
      prisma.tournament.findFirst({
        where: finished,
        orderBy: { date: 'desc' },
        select: {
          id: true,
          name: true,
          date: true,
          champion: { select: { name: true, gender: true } },
          tournamentType: { select: { name: true } },
          tournamentCategory: { select: { name: true } },
        },
      }),
    ]);

    const session = await getServerSession(authOptions);
    const playerId = session?.user?.playerId ?? null;
    let me = null;

    if (playerId) {
      const player = await prisma.player.findUnique({
        where: { id: playerId },
        select: { name: true, nickname: true, gender: true },
      });
      const mine = { tournament: finished, deletedAt: null, OR: [{ player1Id: playerId }, { player2Id: playerId }] };
      const [wins, total, titles, lastMatch] = await Promise.all([
        prisma.match.count({ where: { ...mine, winnerId: playerId } }),
        prisma.match.count({ where: mine }),
        prisma.tournament.count({ where: { ...finished, championId: playerId } }),
        prisma.match.findFirst({
          where: mine,
          orderBy: { tournament: { date: 'desc' } },
          include: {
            tournament: { select: { id: true, name: true } },
            player1: { select: { name: true } },
            player2: { select: { name: true } },
            sets: { include: { games: { select: { winnerId: true } } } },
          },
        }),
      ]);

      if (player) {
        const levelInfo = await getPlayerLevelInfo(playerId);
        const iAmP1 = lastMatch?.player1Id === playerId;
        me = {
          name: player.name,
          nickname: player.nickname,
          gender: player.gender,
          wins,
          losses: total - wins,
          titles,
          level: { current: levelInfo.current?.name ?? null, suggested: levelInfo.suggestion?.level.name ?? null, direction: levelInfo.suggestion?.direction ?? null },
          lastMatch: lastMatch && {
            tournamentId: lastMatch.tournament?.id ?? null,
            tournamentName: lastMatch.tournament?.name ?? null,
            stage: lastMatch.stage ? STAGE_LABELS[lastMatch.stage] : null,
            opponent: (iAmP1 ? lastMatch.player2 : lastMatch.player1).name,
            won: lastMatch.winnerId === playerId,
            score: lastMatch.sets
              .map((set) => {
                const mineGames = set.games.filter((game) => game.winnerId === playerId).length;
                const tb = set.hasTiebreak
                  ? (iAmP1 ? set.tiebreakPlayer1Points : set.tiebreakPlayer2Points)
                  : null;
                const otherTb = set.hasTiebreak
                  ? (iAmP1 ? set.tiebreakPlayer2Points : set.tiebreakPlayer1Points)
                  : null;
                const otherGames = set.games.length - mineGames;
                return `${mineGames}${tb != null ? `(${tb})` : ''}-${otherGames}${otherTb != null ? `(${otherTb})` : ''}`;
              })
              .join('  '),
          },
        };
      }
    }

    return NextResponse.json({
      counts: { players, tournaments, matches },
      lastTournament: lastTournament && {
        id: lastTournament.id,
        name: lastTournament.name,
        date: lastTournament.date,
        type: lastTournament.tournamentType?.name ?? null,
        category: lastTournament.tournamentCategory?.name ?? null,
        champion: lastTournament.champion?.name ?? null,
        championGender: lastTournament.champion?.gender ?? null,
      },
      me,
    });
  } catch (error) {
    logger.error('home.failed', { err: error });
    return NextResponse.json({ message: 'No se pudo cargar el inicio' }, { status: 500 });
  }
}

export const GET = withApiLogging('/api/home', handleGet, { quiet: true });
