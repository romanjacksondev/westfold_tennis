import { prisma } from '@/utils/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { buildEliminationBracket, generateDraw, DrawSlot } from '@/utils/utils';

type Context = { params: Promise<{ id: string }> };

/** Fisher-Yates shuffle — returns a new shuffled array, does not mutate input. */
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export async function GET(_request: NextRequest, context: Context) {
  const { id } = await context.params;

  try {
    const tournament = await prisma.tournament.findUnique({
      where: { id },
      select: {
        drawSize: true,
        qualifiers: true,
        players: { select: { id: true, name: true } },
        tournamentType: { select: { name: true } },
      },
    });

    if (!tournament) {
      return NextResponse.json({ message: 'Torneo no encontrado' }, { status: 404 });
    }

    const typeName = tournament.tournamentType?.name ?? null;
    const drawSize = tournament.drawSize ?? null;

    // Missing configuration — return a clear non-error response
    if (!typeName || !drawSize) {
      return NextResponse.json({
        configured: false,
        message: 'El cuadro aún no está configurado. Definí el tipo de torneo y el tamaño del cuadro desde el panel de administración.',
      });
    }

    // Build slot list: confirmed players (shuffled) + vacancy placeholders
    const confirmedSlots: DrawSlot[] = shuffle(
      tournament.players.map((p) => ({ id: p.id, label: p.name }))
    );
    const vacancyCount = Math.max(0, drawSize - confirmedSlots.length);
    const vacancies: DrawSlot[] = Array.from({ length: vacancyCount }, () => ({ id: null, label: 'Vacante' }));
    const slots: DrawSlot[] = [...confirmedSlots, ...vacancies];

    if (typeName === 'Playoffs') {
      const rounds = buildEliminationBracket(slots);
      return NextResponse.json({ configured: true, type: 'playoffs', rounds });
    }

    if (typeName === 'Round Robin') {
      // generateDraw works with slot labels; map slots to their labels
      const playerLabels = slots.map((s) => s.label);
      const rounds = generateDraw(playerLabels.length, playerLabels);
      // Convert to structured round objects with slot-like objects per pair
      const structuredRounds = (rounds as string[][][]).map((round: string[][], roundIndex: number) => ({
        roundName: `Ronda ${roundIndex + 1}`,
        matches: round.map((pair: string[]) => ({
          top: { id: null, label: pair[0] },
          bottom: { id: null, label: pair[1] },
        })),
      }));
      return NextResponse.json({ configured: true, type: 'round-robin', rounds: structuredRounds });
    }

    if (typeName === 'Round Robin + Playoffs') {
      // Group fixture
      const playerLabels = slots.map((s) => s.label);
      const groupRoundsRaw = generateDraw(playerLabels.length, playerLabels);
      const groupRounds = (groupRoundsRaw as string[][][]).map((round: string[][], roundIndex: number) => ({
        roundName: `Jornada ${roundIndex + 1}`,
        matches: round.map((pair: string[]) => ({
          top: { id: null, label: pair[0] },
          bottom: { id: null, label: pair[1] },
        })),
      }));

      // Qualifier bracket: `qualifiers` placeholder slots, e.g. "Puesto 1", "Puesto 2"…
      const qualifierCount = tournament.qualifiers ?? 2;
      const qualifierSlots: DrawSlot[] = Array.from({ length: qualifierCount }, (_, i) => ({
        id: null,
        label: `Puesto ${i + 1}`,
      }));
      const bracketRounds = buildEliminationBracket(qualifierSlots);

      return NextResponse.json({ configured: true, type: 'mixed', groupRounds, bracketRounds });
    }

    // Unknown type — treat as unconfigured
    return NextResponse.json({
      configured: false,
      message: `Tipo de torneo "${typeName}" no reconocido para la generación del cuadro.`,
    });
  } catch (error) {
    console.error('[draw] Error generating draw:', error);
    return NextResponse.json({ message: 'No se pudo generar el cuadro' }, { status: 500 });
  }
}
