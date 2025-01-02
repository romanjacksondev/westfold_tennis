import prisma from "lib/prisma";

export default async function handler(req, res) {
  try {
    const tournaments = await prisma.tournament.findMany({
      orderBy: [
        {
          date: 'desc',
        }],
      include: {
        champion: {
          select: { name: true },
        },
        surface: {
          select: { name: true }
        },
        venue: {
          select: { name: true }
        },
        tournamentCategory: {
          include: {
            tournamentCategoryPoints: {
              where: {
                initial_position: 1,
                final_position: 1
              },
              select: {
                points: true
              },
            }
          }
        }
      },
    });

    res.status(200).json(tournaments);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
}