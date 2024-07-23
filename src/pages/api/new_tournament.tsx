import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const tournament = JSON.parse(req.body);
    try {
      const response = await prisma.tournament.create({
        data: {
          name: tournament.name,
          venueId: tournament.venue,
          winnerId: tournament.player_id,
        },
      });

      res.status(200).json({ response });
    } catch (e) {
      console.log(e);
      res.status(500).json(e);
    }
  }
}
