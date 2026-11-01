import { logger } from '@/lib/logger';
import { withApiLogging } from '@/lib/api-logging';
import { prisma } from '@/utils/prisma';
import { connection, NextResponse } from 'next/server';

async function handleGet() {
  await connection();

  try {
    const venues = await prisma.venue.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(venues);
  } catch (e) {
    logger.error('venues.failed', { err: e });
    return NextResponse.error();
  }
}

export const GET = withApiLogging('/api/venues', handleGet, { quiet: true });
