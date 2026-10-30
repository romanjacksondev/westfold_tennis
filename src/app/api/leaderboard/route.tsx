import { prisma } from '@/utils/prisma';
import { calculatePlayerPoints } from '@/utils/utils';
import { connection, NextRequest, NextResponse } from 'next/server';

async function getTournaments(initialDate: Date, endDate: Date) {
  const tournaments = await prisma.tournament.findMany({
    orderBy: [
      {
        date: 'desc',
      },
    ],
    where: {
      status: 'FINISHED',
      deletedAt: null,
      date: {
        gte: initialDate,
        lte: endDate,
      },
    },
    include: {
      champion: { select: { name: true } },
      tournamentCategory: {
        select: {
          name: true,
          tournamentCategoryPoints: {
            select: {
              initial_position: true,
              final_position: true,
              points: true,
            },
          },
        },
      },
      matches: {
        include: {
          player1: {
            select: {
              name: true,
              gender: true,
              nickname: true,
            },
          },
          player2: {
            select: {
              name: true,
              gender: true,
              nickname: true,
            },
          },
          sets: {
            include: {
              games: true,
            },
          },
        },
      },
    },
  });
  return tournaments;
}

function getDateRange(rankingMode: string | null, now: Date): { initialDate: Date; endDate: Date } {
  const currentYear = now.getFullYear();
  if (rankingMode === 'calendar') {
    return {
      initialDate: new Date(currentYear, 0, 1, 0, 0, 0, 0),
      endDate: new Date(currentYear, 11, 31, 23, 59, 59, 999),
    };
  }

  // Rolling 12 months (last 365 days / 1 year up to current date)
  const initialDate = new Date(now);
  initialDate.setFullYear(now.getFullYear() - 1);
  return {
    initialDate,
    endDate: now,
  };
}

export async function GET(req: NextRequest) {
  await connection();

  try {
    const now = new Date();
    const rankingMode = req.nextUrl.searchParams.get('rankingMode');
    const { initialDate, endDate } = getDateRange(rankingMode, now);

    const tournaments = await getTournaments(initialDate, endDate);
    const playerPoints = calculatePlayerPoints(tournaments);

    const genderByName = new Map<string, 'MALE' | 'FEMALE'>();
    const nicknameByName = new Map<string, string | null>();
    for (const tournament of tournaments) {
      for (const match of tournament.matches) {
        genderByName.set(match.player1.name, match.player1.gender);
        genderByName.set(match.player2.name, match.player2.gender);
        nicknameByName.set(match.player1.name, match.player1.nickname);
        nicknameByName.set(match.player2.name, match.player2.nickname);
      }
    }

    // Tournaments arrive newest first; walk oldest first so `form` ends with the latest results.
    const stats = new Map<
      string,
      { wins: number; losses: number; titles: number; form: ('W' | 'L')[] }
    >();
    const statsFor = (name: string) => {
      let entry = stats.get(name);
      if (!entry) {
        entry = { wins: 0, losses: 0, titles: 0, form: [] };
        stats.set(name, entry);
      }
      return entry;
    };
    for (const tournament of [...tournaments].reverse()) {
      if (tournament.champion) statsFor(tournament.champion.name).titles += 1;
      for (const match of tournament.matches) {
        const winnerName =
          match.winnerId === match.player1Id ? match.player1.name : match.player2.name;
        const loserName =
          match.winnerId === match.player1Id ? match.player2.name : match.player1.name;
        const winner = statsFor(winnerName);
        const loser = statsFor(loserName);
        winner.wins += 1;
        winner.form.push('W');
        loser.losses += 1;
        loser.form.push('L');
      }
    }

    const toRanking = (gender: 'MALE' | 'FEMALE') =>
      Object.entries(playerPoints)
        .filter(([name]) => genderByName.get(name) === gender)
        .sort((a, b) => b[1].points - a[1].points)
        .map(([key, value]) => {
          const { wins, losses, titles, form } = statsFor(key);
          return {
            key,
            nickname: nicknameByName.get(key) ?? null,
            value,
            record: { wins, losses, titles, form: form.slice(-5) },
          };
        });

    return NextResponse.json(
      { male: toRanking('MALE'), female: toRanking('FEMALE') },
      { status: 200 },
    );
  } catch (e) {
    console.error('Error in /api/leaderboard:', e);
    return NextResponse.json({ error: 'Error calculating leaderboard' }, { status: 500 });
  }
}
