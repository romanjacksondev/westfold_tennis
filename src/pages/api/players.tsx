import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  try {
    const players = await prisma.player.findMany({
      // orderBy: [
      //   {
      //     date: 'desc',
      //   }],
      // include: {
      //   winner: {
      //     select: { name: true },
      //   },
      //   venue: true
      // },
    });

    res.status(200).json(players);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
}