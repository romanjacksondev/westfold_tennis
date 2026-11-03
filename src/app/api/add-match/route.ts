import { logger } from '@/lib/logger';
import { withApiLogging } from '@/lib/api-logging';
import { prisma } from '@/utils/prisma';
import { requireAdmin } from '@/lib/require-session';
import { DrawError } from '@/lib/draw-persistence';
import { linkResultToDraw } from '@/lib/draw-results';
import { actorFromSession, audit } from '@/lib/audit';
import { NextRequest, NextResponse } from 'next/server';

type MatchSet = {
  gamesPlayer1: number | string;
  gamesPlayer2: number | string;
  winner: string;
  hasTiebreak?: boolean;
  tiebreakPlayer1Points?: number | string | null;
  tiebreakPlayer2Points?: number | string | null;
};

function toScore(value: number | string | null | undefined) {
  const score = Number(value);
  return Number.isInteger(score) && score >= 0 ? score : null;
}

async function handlePost(request: NextRequest) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  try {
    const body = await request.json();
    const sets = body.sets as MatchSet[];

    if (!body.drawMatchId) {
      return NextResponse.json({ message: 'Los partidos se cargan desde el cuadro del torneo: elegí un partido pendiente' }, { status: 400 });
    }
    if (!body.idPlayer1 || !body.idPlayer2 || !body.winner || !Array.isArray(sets) || sets.length === 0) {
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
    if (setsWon * 2 <= sets.length) {
      return NextResponse.json({ message: 'El ganador del partido debe haber ganado más sets que su rival' }, { status: 400 });
    }

    const stage = slot.stage;
    const playedAt = body.playedAt ? new Date(body.playedAt) : null;
    if (playedAt && Number.isNaN(playedAt.getTime())) {
      return NextResponse.json({ message: 'La fecha del partido es inválida' }, { status: 400 });
    }

    const setData = sets.map((set) => {
      const hasTiebreak = Boolean(set.hasTiebreak);
      const tiebreakPlayer1Points = hasTiebreak ? toScore(set.tiebreakPlayer1Points) : null;
      const tiebreakPlayer2Points = hasTiebreak ? toScore(set.tiebreakPlayer2Points) : null;

      if (hasTiebreak && (tiebreakPlayer1Points === null || tiebreakPlayer2Points === null)) {
        throw new Error('El resultado del tiebreak es inválido');
      }

      const gamesPlayer1 = Number(set.gamesPlayer1);
      const gamesPlayer2 = Number(set.gamesPlayer2);
      if (!Number.isInteger(gamesPlayer1) || !Number.isInteger(gamesPlayer2) || gamesPlayer1 < 0 || gamesPlayer2 < 0) {
        throw new Error('El resultado del set es inválido');
      }

      return {
        winnerId: set.winner,
        hasTiebreak,
        tiebreakPlayer1Points,
        tiebreakPlayer2Points,
        games: {
          create: [
            ...Array.from({ length: gamesPlayer1 }, () => ({ winnerId: body.idPlayer1 })),
            ...Array.from({ length: gamesPlayer2 }, () => ({ winnerId: body.idPlayer2 })),
          ],
        },
      };
    });

    const match = await prisma.$transaction(async (tx) => {
      const created = await tx.match.create({
        data: {
          tournament: { connect: { id: slot.tournamentId } },
          player1: { connect: { id: body.idPlayer1 } },
          player2: { connect: { id: body.idPlayer2 } },
          winner: { connect: { id: body.winner } },
          stage,
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
      after: { drawMatchId: slot.id, tournamentId: match.tournamentId, player1Id: match.player1Id, player2Id: match.player2Id, winnerId: match.winnerId, stage: match.stage, playedAt: match.playedAt, sets: setData.length },
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
