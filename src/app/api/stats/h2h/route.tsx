import { prisma } from '@/utils/prisma';
import { createH2H } from '@/utils/utils';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
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
    });

    const h2h = createH2H(matches);
    return NextResponse.json({ h2h });
  } catch (e) {
    console.log(e);
    return NextResponse.json(e, { status: 500 });
  }
}
