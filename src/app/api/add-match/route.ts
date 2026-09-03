import { prisma } from '@/utils/prisma';
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sets = body.sets as MatchSet[];

    if (!body.idPlayer1 || !body.idPlayer2 || !body.tournamentId || !body.winner || !Array.isArray(sets) || sets.length === 0) {
      return NextResponse.json({ message: 'Datos incompletos' }, { status: 400 });
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

    const match = await prisma.match.create({
      data: {
        tournament: { connect: { id: body.tournamentId } },
        player1: { connect: { id: body.idPlayer1 } },
        player2: { connect: { id: body.idPlayer2 } },
        winner: { connect: { id: body.winner } },
        sets: { create: setData },
      },
    });

    return NextResponse.json(match, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo crear el partido';
    return NextResponse.json({ message }, { status: 400 });
  }
}
