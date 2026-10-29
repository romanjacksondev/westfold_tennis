import { prisma } from '@/utils/prisma';
import { connection, NextResponse } from 'next/server';

export async function GET() {
  await connection();

  try {
    const venues = await prisma.venue.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(venues);
  } catch (e) {
    console.log(e);
    return NextResponse.error();
  }
}
