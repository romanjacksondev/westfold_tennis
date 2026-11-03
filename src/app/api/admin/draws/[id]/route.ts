import { withApiLogging } from '@/lib/api-logging';
import { requireAdmin } from '@/lib/require-session';
import { actorFromSession } from '@/lib/audit';
import { logger } from '@/lib/logger';
import {
  confirmDraw,
  discardDraw,
  DrawError,
  generateDraw,
  reshuffleDraw,
  swapDrawPlayers,
  type SlotRef,
} from '@/lib/draw-service';
import { prisma } from '@/utils/prisma';
import { audit } from '@/lib/audit';
import { getDrawView, syncGroupQualifiers } from '@/lib/draw-results';
import { NextRequest, NextResponse } from 'next/server';
import type { SeedMode } from '@/utils/draw-engine';

type Context = { params: Promise<{ id: string }> };

const isSlotRef = (value: unknown): value is SlotRef =>
  typeof value === 'object' && value !== null && typeof (value as SlotRef).drawMatchId === 'string' && ((value as SlotRef).slot === 1 || (value as SlotRef).slot === 2);

async function setGroupOrder(tournamentId: string, order: unknown, actor: ReturnType<typeof actorFromSession>) {
  const ids = Array.isArray(order) ? order.map(String) : [];
  const tournament = await prisma.tournament.findFirst({
    where: { id: tournamentId, deletedAt: null },
    include: { matches: { where: { deletedAt: null }, select: { player1Id: true, player2Id: true, stage: true } } },
  });
  if (!tournament) throw new DrawError('Torneo no encontrado', 404);
  if (tournament.drawStatus !== 'CONFIRMED' || tournament.status !== 'IN_PROGRESS') {
    throw new DrawError('Solo se puede definir el orden de la tabla en un torneo en curso con sorteo confirmado', 409);
  }
  const players = new Set(tournament.matches.filter((m) => !m.stage || m.stage === 'GROUP').flatMap((m) => [m.player1Id, m.player2Id]));
  if (ids.length > 0 && (ids.length !== players.size || ids.some((id) => !players.has(id)) || new Set(ids).size !== ids.length)) {
    throw new DrawError('El orden debe incluir a cada jugador de la tabla exactamente una vez');
  }
  await prisma.$transaction(async (tx) => {
    await tx.tournament.update({ where: { id: tournamentId }, data: { drawGroupOrder: ids } });
    await syncGroupQualifiers(tx, tournamentId);
  });
  await audit({ action: 'DRAW_GROUP_ORDER', entity: 'Tournament', entityId: tournamentId, actor, after: { order: ids } });
}

async function handlePost(request: NextRequest, context: Context) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  const { id } = await context.params;
  const actor = actorFromSession(session);

  try {
    const body = await request.json().catch(() => ({}));
    switch (body.action) {
      case 'generate': {
        const manualSeedIds = Array.isArray(body.manualSeedIds) ? body.manualSeedIds.map(String) : [];
        await generateDraw(id, { seedMode: (body.seedMode ?? 'NONE') as SeedMode, manualSeedIds, seedCount: body.seedCount ? Number(body.seedCount) : undefined }, actor);
        break;
      }
      case 'reshuffle':
        await reshuffleDraw(id, actor);
        break;
      case 'swap':
        if (!isSlotRef(body.a) || !isSlotRef(body.b)) throw new DrawError('Indicá los dos casilleros a intercambiar');
        await swapDrawPlayers(id, body.a, body.b, actor);
        break;
      case 'confirm':
        await confirmDraw(id, actor);
        break;
      case 'discard':
        await discardDraw(id, actor);
        break;
      case 'set-group-order':
        await setGroupOrder(id, body.order, actor);
        break;
      default:
        return NextResponse.json({ message: 'Acción inválida' }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof DrawError) return NextResponse.json({ message: error.message }, { status: error.status });
    logger.error('draw.action_failed', { err: error, tournamentId: id });
    return NextResponse.json({ message: 'No se pudo completar la acción del sorteo' }, { status: 500 });
  }
}

async function handleGet(_request: NextRequest, context: Context) {
  const { response } = await requireAdmin();
  if (response) return response;
  const { id } = await context.params;
  try {
    return NextResponse.json(await getDrawView(prisma, id));
  } catch (error) {
    if (error instanceof DrawError) return NextResponse.json({ message: error.message }, { status: error.status });
    throw error;
  }
}

export const GET = withApiLogging('/api/admin/draws/[id]', handleGet, { quiet: true });
export const POST = withApiLogging('/api/admin/draws/[id]', handlePost);
