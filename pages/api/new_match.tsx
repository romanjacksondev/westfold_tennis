import prisma from "../../lib/prisma";

export default async function handler(req, res) {

    // winner: winner,
    // tournamentId: id,
    // player1: player1,
    // player2: player2
    const match = JSON.parse(req.body)
    console.log(match)


    if (req.method === "POST") {
    try {
      const response = await prisma.match.create({
        data: {
            winner: match.winner,
            tournamentId: match.tournamentId,
            players: {
                connect: [
                    {
                        id: match.player1
                    },
                    {
                        id: match.player2
                    }
                ]
            }

        }
      });
      res.status(200).json({ response });
    } catch (e) {
      console.log(e);
      res.status(500).json(e);
    }
  }
}
