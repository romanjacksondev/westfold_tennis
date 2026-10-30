import { connection } from 'next/server';
import { prisma } from '@/utils/prisma';
import InformationTemplate, { type PointsExample, type PointsRange, type PointsRow } from './Information.template';

const STAGE_LABELS: Record<string, string> = {
  '1-1': 'Campeón',
  '2-2': 'Finalista',
  '3-4': 'Semifinal',
  '5-8': 'Cuartos de final',
};

const rangeLabel = (from: number, to: number) =>
  STAGE_LABELS[`${from}-${to}`] ?? (from === to ? `${from}.º` : `${from}.º–${to}.º`);

const Information = async () => {
  await connection();

  const categories = await prisma.tournamentCategory.findMany({
    where: { deletedAt: null },
    include: { tournamentCategoryPoints: true },
  });

  const rangeMap = new Map<string, PointsRange>();
  for (const category of categories) {
    for (const entry of category.tournamentCategoryPoints) {
      const key = `${entry.initial_position}-${entry.final_position}`;
      rangeMap.set(key, { key, label: rangeLabel(entry.initial_position, entry.final_position), from: entry.initial_position });
    }
  }
  const ranges = [...rangeMap.values()].sort((a, b) => a.from - b.from);

  const rows: PointsRow[] = categories
    .map((category) => ({
      name: category.name,
      perWin: category.pointsPerMatchWin,
      points: Object.fromEntries(
        category.tournamentCategoryPoints.map((entry) => [`${entry.initial_position}-${entry.final_position}`, entry.points]),
      ),
      top: Math.max(0, ...category.tournamentCategoryPoints.map((entry) => entry.points)),
    }))
    .sort((a, b) => b.top - a.top);

  // The examples use Grand Slam values when available so they match the table above them.
  const exampleCategory = categories.find((category) => category.name === 'Grand Slam') ?? categories[0];
  const pointsAt = (position: number) =>
    exampleCategory?.tournamentCategoryPoints.find(
      (entry) => position >= entry.initial_position && position <= entry.final_position,
    )?.points ?? 0;
  const example: PointsExample | null = exampleCategory
    ? {
        category: exampleCategory.name,
        perWin: exampleCategory.pointsPerMatchWin,
        champion: pointsAt(1),
        finalist: pointsAt(2),
        semifinal: pointsAt(3),
        quarterfinal: pointsAt(5),
      }
    : null;

  return <InformationTemplate ranges={ranges} rows={rows} example={example} />;
};

export default Information;
