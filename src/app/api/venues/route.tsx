import { prisma } from '@/utils/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const venues = await prisma.venue.findMany({
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(venues);
  // return Response.json([
  //   {
  //     name: 'Venues API',
  //     phone: '123-456-7890',
  //     address: '123 Main St, Anytown, USA',
  //   },
  // ]);
}
