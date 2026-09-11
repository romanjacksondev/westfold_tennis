import { prisma } from '@/utils/prisma';
import { calculatePlayerStats, createMatchSummary } from '@/utils/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const tournamentId = request.nextUrl.searchParams.get('id');

  try {
    const matches = await prisma.match.findMany({
      where: tournamentId ? { tournamentId } : undefined,
      include: {
        tournament: {
          select: {
            name: true,
            champion: { select: { name: true } },
            date: true,
          },
        },
        player1: { select: { name: true } },
        player2: { select: { name: true } },
        winner: { select: { name: true } },
        sets: { include: { games: true } },
      },
    });

    if (matches.length === 0) {
      return NextResponse.json({ matchSummary: [], playerStats: [], tournamentData: null });
    }

    const tournament = matches[0].tournament;
    const tournamentData = tournament
      ? { champion: tournament.champion?.name ?? null, name: tournament.name }
      : null;

    return NextResponse.json({
      matchSummary: createMatchSummary(matches),
      playerStats: calculatePlayerStats(matches),
      tournamentData,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: 'No se pudieron obtener los partidos' }, { status: 500 });
  }
}
