import { prisma } from '@/utils/prisma';
import { countTournamentsByPlayer, createH2H } from '@/utils/utils';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [matches, tournaments] = await Promise.all([
      prisma.match.findMany({
        include: {
          player1: {
            select: { name: true },
          },
          player2: {
            select: { name: true },
          },
          winner: {
            select: { name: true },
          },
        },
      }),
      prisma.tournament.findMany({
        where: {
          championId: { not: null },
          deletedAt: null,
        },
        include: {
          champion: {
            select: { id: true, name: true },
          },
          tournamentCategory: {
            select: { id: true, name: true },
          },
        },
        orderBy: {
          date: 'desc',
        },
      }),
    ]);

    const h2h = createH2H(matches);
    const championships = countTournamentsByPlayer(tournaments);

    return NextResponse.json({ h2h, championships });
  } catch (e) {
    console.log(e);
    return NextResponse.json(e, { status: 500 });
  }
}
