import { connection, NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';
import { logger } from '@/lib/logger';

export async function GET() {
  await connection();
  const startedAt = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', db: 'ok', dbLatencyMs: Date.now() - startedAt });
  } catch (err) {
    logger.error('health.db_failed', { err });
    return NextResponse.json({ status: 'error', db: 'down' }, { status: 503 });
  }
}
