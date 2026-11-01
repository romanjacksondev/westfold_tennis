import { logger } from '@/lib/logger';
import { withApiLogging } from '@/lib/api-logging';
import { prisma } from '@/utils/prisma';
import { connection, NextResponse } from 'next/server';

async function handleGet() {
  await connection();

  try {
    const players = await prisma.player.findMany({});

    return NextResponse.json(players);
  } catch (e) {
    logger.error('players.failed', { err: e });
    return NextResponse.error();
  }
}

export const GET = withApiLogging('/api/players', handleGet, { quiet: true });
