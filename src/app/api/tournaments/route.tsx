import { prisma } from '@/utils/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
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
    console.log(e);
    return NextResponse.error();
  }
}
