import { logger } from '@/lib/logger';
import { withApiLogging } from '@/lib/api-logging';
import { prisma } from '@/utils/prisma';
import { connection, NextResponse } from 'next/server';

async function handleGet() {
  await connection();

  try {
    const tournaments = await prisma.tournament.findMany({
      orderBy: [
        {
          date: 'desc',
        },
      ],
      include: {
        champion: {
          select: { name: true },
        },
        level: { select: { name: true } },
        surface: {
          select: { name: true },
        },
        venue: {
          select: { name: true },
        },
        tournamentCategory: {
          include: {
            tournamentCategoryPoints: {
              where: {
                initial_position: 1,
                final_position: 1,
              },
              select: {
                points: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(tournaments);
  } catch (e) {
    logger.error('tournaments.failed', { err: e });
    return NextResponse.error();
  }
}

export const GET = withApiLogging('/api/tournaments', handleGet, { quiet: true });
