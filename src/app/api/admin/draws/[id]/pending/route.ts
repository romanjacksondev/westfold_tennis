import { withApiLogging } from '@/lib/api-logging';
import { requireAdmin } from '@/lib/require-session';
import { pendingDrawMatches } from '@/lib/draw-results';
import { prisma } from '@/utils/prisma';
import { NextRequest, NextResponse } from 'next/server';

type Context = { params: Promise<{ id: string }> };

async function handleGet(_request: NextRequest, context: Context) {
  const { response } = await requireAdmin();
  if (response) return response;
  const { id } = await context.params;
  const tournament = await prisma.tournament.findFirst({ where: { id, deletedAt: null }, select: { status: true, drawStatus: true } });
  if (!tournament) return NextResponse.json({ message: 'Torneo no encontrado' }, { status: 404 });
  const pending = tournament.drawStatus === 'CONFIRMED' ? await pendingDrawMatches(prisma, id) : [];
  return NextResponse.json({ status: tournament.status, drawStatus: tournament.drawStatus, pending });
}

export const GET = withApiLogging('/api/admin/draws/[id]/pending', handleGet, { quiet: true });
