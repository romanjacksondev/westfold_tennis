import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const body = JSON.parse(req.body);
    try {
      const response = await prisma.tournament.create({
        data: {
          name: body.name,
          location: body.location,
          points: body.points,
          winnerId: body.player_id,
        },
      });

      res.status(200).json({ response });
    } catch (e) {
      console.log(e);
      res.status(500).json(e);
    }
  }
}
