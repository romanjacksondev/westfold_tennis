import { connection } from 'next/server';
import { prisma } from '@/utils/prisma';
import InformationTemplate, { type PointsRange, type PointsRow } from './Information.template';

const rangeLabel = (from: number, to: number) => (from === to ? `${from}.º` : `${from}.º–${to}.º`);

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
      points: Object.fromEntries(
        category.tournamentCategoryPoints.map((entry) => [`${entry.initial_position}-${entry.final_position}`, entry.points]),
      ),
      top: Math.max(0, ...category.tournamentCategoryPoints.map((entry) => entry.points)),
    }))
    .sort((a, b) => b.top - a.top);

  return <InformationTemplate ranges={ranges} rows={rows} />;
};

export default Information;
