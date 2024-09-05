import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  try {
    const tournaments = await prisma.tournament.findMany({
      orderBy: [
        {
          date: 'desc',
        }],
      include: {
        winner: {
          select: { name: true },
        },
        venue: {
          select: { points: true }}
      },
    });

    res.status(200).json(tournaments);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
}