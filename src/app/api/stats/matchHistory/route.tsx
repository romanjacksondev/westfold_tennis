import { logger } from '@/lib/logger';
import { withApiLogging } from '@/lib/api-logging';
import { prisma } from '@/utils/prisma';
import { createMatchSummary } from '@/utils/utils';
import { NextRequest, NextResponse } from 'next/server';

async function handleGet(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const player1Id = searchParams.get('player1Id');
  const player2Id = searchParams.get('player2Id');

  let whereCondition: any = {
    deletedAt: null,
  };

  if (player1Id && player2Id) {
    whereCondition = {
      ...whereCondition,
      OR: [
        { AND: [{ player1Id }, { player2Id }] },
        { AND: [{ player1Id: player2Id }, { player2Id: player1Id }] },
      ],
    };
  } else if (player1Id) {
    whereCondition = {
      ...whereCondition,
      OR: [{ player1Id }, { player2Id: player1Id }],
    };
  } else if (player2Id) {
    whereCondition = {
      ...whereCondition,
      OR: [{ player1Id: player2Id }, { player2Id }],
    };
  }

  try {
    const matches = await prisma.match.findMany({
      where: whereCondition,
      include: {
        tournament: {
          select: {
            name: true,
            champion: {
              select: { name: true },
            },
            date: true,
          },
        },
        player1: {
          select: { name: true },
        },
        player2: {
          select: { name: true },
        },
        winner: {
          select: { name: true },
        },
        sets: {
          include: {
            games: true,
          },
        },
      },
      orderBy: {
        tournament: {
          date: 'desc', // Replace 'someField' with the field to order by
        },
      },
    });

    const parsedMatches = createMatchSummary(matches);
    return NextResponse.json(parsedMatches);
  } catch (e) {
    logger.error('match_history.failed', { err: e });
    return NextResponse.json(e, { status: 500 });
  }
}

export const GET = withApiLogging('/api/stats/matchHistory', handleGet, { quiet: true });
