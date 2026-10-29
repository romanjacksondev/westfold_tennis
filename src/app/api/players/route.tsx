import { prisma } from '@/utils/prisma';
import { connection, NextResponse } from 'next/server';

export async function GET() {
  await connection();

  try {
    const players = await prisma.player.findMany({});

    return NextResponse.json(players);
  } catch (e) {
    console.log(e);
    return NextResponse.error();
  }
}
