import { logger } from '@/lib/logger';
import { withApiLogging } from '@/lib/api-logging';
import { prisma } from '@/utils/prisma';
import { requireAdmin } from '@/lib/require-session';
import { DrawError } from '@/lib/draw-persistence';
import { linkResultToDraw } from '@/lib/draw-results';
import { actorFromSession, audit } from '@/lib/audit';
import { buildSetData, type MatchSetInput } from '@/lib/match-sets';
import { NextRequest, NextResponse } from 'next/server';

async function handlePost(request: NextRequest) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  try {
    const body = await request.json();
    const walkover = body.walkover === true;
    const sets = (Array.isArray(body.sets) ? body.sets : []) as MatchSetInput[];

    if (!body.drawMatchId) {
      return NextResponse.json({ message: 'Los partidos se cargan desde el cuadro del torneo: elegí un partido pendiente' }, { status: 400 });
    }
    if (!body.idPlayer1 || !body.idPlayer2 || !body.winner || (!walkover && sets.length === 0)) {
      return NextResponse.json({ message: 'Datos incompletos' }, { status: 400 });
    }

    const slot = await prisma.drawMatch.findUnique({
      where: { id: String(body.drawMatchId) },
      include: { tournament: { select: { id: true, status: true, drawStatus: true, date: true } } },
    });
    if (!slot) return NextResponse.json({ message: 'El partido del cuadro no existe' }, { status: 404 });
    if (slot.tournament.status !== 'IN_PROGRESS' || slot.tournament.drawStatus !== 'CONFIRMED') {
      return NextResponse.json({ message: 'Solo se pueden cargar resultados en torneos en curso con sorteo confirmado' }, { status: 409 });
    }
    if (slot.matchId) return NextResponse.json({ message: 'Ese partido del cuadro ya tiene un resultado' }, { status: 409 });
    if (slot.isBye || !slot.player1Id || !slot.player2Id) {
      return NextResponse.json({ message: 'Ese partido todavía no tiene los dos jugadores definidos' }, { status: 409 });
    }
    const samePlayers =
      (body.idPlayer1 === slot.player1Id && body.idPlayer2 === slot.player2Id) ||
      (body.idPlayer1 === slot.player2Id && body.idPlayer2 === slot.player1Id);
    if (!samePlayers) {
      return NextResponse.json({ message: 'Los jugadores no coinciden con los del cuadro' }, { status: 400 });
    }
    if (body.winner !== slot.player1Id && body.winner !== slot.player2Id) {
      return NextResponse.json({ message: 'El ganador debe ser uno de los dos jugadores' }, { status: 400 });
    }
    if (sets.some((set) => set.winner !== body.idPlayer1 && set.winner !== body.idPlayer2)) {
      return NextResponse.json({ message: 'El ganador de cada set debe ser uno de los dos jugadores' }, { status: 400 });
    }
    const setsWon = sets.filter((set) => set.winner === body.winner).length;
    // On a walkover (no-show or retirement) the partial score is kept but does not decide the winner.
    if (!walkover && setsWon * 2 <= sets.length) {
      return NextResponse.json({ message: 'El ganador del partido debe haber ganado más sets que su rival' }, { status: 400 });
    }

    const stage = slot.stage;
    const playedAt = body.playedAt ? new Date(body.playedAt) : null;
    if (playedAt && Number.isNaN(playedAt.getTime())) {
      return NextResponse.json({ message: 'La fecha del partido es inválida' }, { status: 400 });
    }

    const setData = buildSetData(sets, body.idPlayer1, body.idPlayer2);

    const match = await prisma.$transaction(async (tx) => {
      const created = await tx.match.create({
        data: {
          tournament: { connect: { id: slot.tournamentId } },
          player1: { connect: { id: body.idPlayer1 } },
          player2: { connect: { id: body.idPlayer2 } },
          winner: { connect: { id: body.winner } },
          stage,
          walkover,
          playedAt: playedAt ?? slot.tournament.date,
          sets: { create: setData },
        },
      });
      await linkResultToDraw(tx, slot.id, created.id, body.winner);
      return created;
    });

    await audit({
      action: 'CREATE',
      entity: 'Match',
      entityId: match.id,
      actor: actorFromSession(session),
      after: { drawMatchId: slot.id, tournamentId: match.tournamentId, player1Id: match.player1Id, player2Id: match.player2Id, winnerId: match.winnerId, stage: match.stage, playedAt: match.playedAt, sets: setData.length, walkover },
    });
    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    if (error instanceof DrawError) return NextResponse.json({ message: error.message }, { status: error.status });
    logger.warn('add_match.failed', { err: error });
    const message = error instanceof Error ? error.message : 'No se pudo crear el partido';
    return NextResponse.json({ message }, { status: 400 });
  }
}

export const POST = withApiLogging('/api/add-match', handlePost);
