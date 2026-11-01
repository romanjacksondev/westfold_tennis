import { logger } from '@/lib/logger';
import { withApiLogging } from '@/lib/api-logging';
import { prisma } from '@/utils/prisma';
import { calculatePlayerStats, createMatchSummary } from '@/utils/utils';
import { describeLevelGap, levelGap } from '@/utils/levels';
import { NextRequest, NextResponse } from 'next/server';

async function handleGet(request: NextRequest) {
  const tournamentId = request.nextUrl.searchParams.get('id');

  try {
    const matches = await prisma.match.findMany({
      where: tournamentId ? { tournamentId } : undefined,
      include: {
        tournament: {
          select: {
            name: true,
            champion: { select: { name: true, gender: true } },
            tournamentType: { select: { name: true } },
            tournamentCategory: { select: { name: true } },
            level: { select: { name: true, order: true } },
            date: true,
          },
        },
        player1: { select: { id: true, name: true, level: { select: { order: true } } } },
        player2: { select: { id: true, name: true, level: { select: { order: true } } } },
        winner: { select: { name: true } },
        sets: { include: { games: true } },
      },
    });

    if (matches.length === 0) {
      return NextResponse.json({ matchSummary: [], playerStats: [], tournamentData: null });
    }

    const tournament = matches[0].tournament;
    const tournamentData = tournament
      ? {
          champion: tournament.champion?.name ?? null,
          championGender: tournament.champion?.gender ?? null,
          name: tournament.name,
          type: tournament.tournamentType?.name ?? null,
          category: tournament.tournamentCategory?.name ?? null,
          level: tournament.level?.name ?? null,
        }
      : null;

    // Standings come from the group stage when there is one; playoffs-only tournaments use every match.
    const groupMatches = matches.filter((match) => !match.stage || match.stage === 'GROUP');
    const standingsMatches = groupMatches.length > 0 ? groupMatches : matches;
    const hasPlayoffMatches = groupMatches.length < matches.length;

    return NextResponse.json({
      matchSummary: createMatchSummary(matches),
      playerStats: calculatePlayerStats(standingsMatches).map((stat: { id: string }) => {
        const player = [...matches.map((m) => m.player1), ...matches.map((m) => m.player2)].find((p) => p.id === stat.id);
        return { ...stat, levelNote: describeLevelGap(levelGap(player?.level?.order, tournament?.level?.order)) };
      }),
      standingsFromGroupStage: groupMatches.length > 0 && hasPlayoffMatches,
      tournamentData,
    });
  } catch (error) {
    logger.error('matches.failed', { err: error });
    return NextResponse.json({ message: 'No se pudieron obtener los partidos' }, { status: 500 });
  }
}

export const GET = withApiLogging('/api/matches', handleGet, { quiet: true });
