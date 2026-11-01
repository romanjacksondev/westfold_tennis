import { logger } from '@/lib/logger';
import { withApiLogging } from '@/lib/api-logging';
import { prisma } from '@/utils/prisma';
import { countTournamentsByPlayer, createH2H } from '@/utils/utils';
import { connection, NextResponse } from 'next/server';

async function handleGet() {
  await connection();

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
    logger.error('h2h.failed', { err: e });
    return NextResponse.json(e, { status: 500 });
  }
}

export const GET = withApiLogging('/api/stats/h2h', handleGet, { quiet: true });
