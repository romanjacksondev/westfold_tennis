import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  const match = JSON.parse(req.body);
  if (req.method === "POST") {
    try {
      const response = await prisma.match.create({
        data: {
          tournamentId: match.tournamentId,
          player1Id: match.idPlayer1,
          player2Id: match.idPlayer2,
          winnerId: match.winnerId
        },
      });
      res.status(200).json({ response });
    } catch (e) {
      console.log(e);
      res.status(500).json(e);
    }
  }
}
