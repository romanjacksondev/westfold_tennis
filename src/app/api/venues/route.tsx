import { prisma } from '@/utils/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
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
