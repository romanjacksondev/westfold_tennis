import { prisma } from '@/utils/prisma';
import { calculatePlayerPoints } from '@/utils/utils';
import { NextRequest, NextResponse } from 'next/server';

async function getPlayers(initialDate: Date, now: Date) {
  return prisma.tournament.findMany({
    orderBy: [
      {
        date: 'desc',
      },
    ],
    where: {
      date: {
        gte: initialDate, // Mayor o igual a hace 12 meses
        lte: now, // Menor o igual a la fecha actual
      },
    },
    include: {
      tournamentCategory: {
        select: {
          name: true,
          tournamentCategoryPoints: {
            select: {
              initial_position: true,
              final_position: true,
              points: true,
            },
          },
        },
      },
      matches: {
        include: {
          player1: {
            select: {
              name: true,
            },
          },
          player2: {
            select: {
              name: true,
            },
          },
          sets: {
            include: {
              games: true,
            },
          },
        },
      },
    },
  });
}

function getInitialDate(rankingMode: string | null, now: Date): Date {
  const currentYear = now.getFullYear();
  let initialDate = new Date(now);
  if (rankingMode === 'calendar') {
    initialDate = new Date(currentYear, 0, 1);
  } else {
    initialDate.setMonth(now.getMonth() - 12);
  }
  return initialDate;
}

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const now = new Date();
    const rankingMode = req.nextUrl.searchParams.get('rankingMode');
    const initialDate = getInitialDate(rankingMode, now);

    const players = await getPlayers(initialDate, now);

    console.log('leaderboard: ', players);

    const playerPoints = calculatePlayerPoints(players);
    // console.log(playerPoints)
    const entries = Object.entries(playerPoints);
    entries.sort((a, b) => b[1].points - a[1].points);
    const sortedArray = entries.map(([key, value]) => ({ key, value }));

    return NextResponse.json(sortedArray, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json(e, { status: 500 });
  }
}
