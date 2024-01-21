import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  const match = JSON.parse(req.body);
  if (req.method === "POST") {
    const gamesList: any = [];
    for (let index = 0; index < match.pointsPlayer1; index++) {
      gamesList.push({ winnerId: match.idPlayer1 });
    }
    for (let index = 0; index < match.pointsPlayer2; index++) {
      gamesList.push({ winnerId: match.idPlayer2 });
    }

    try {
      const response = await prisma.match.create({
        data: {
          tournamentId: match.tournamentId,
          player1Id: match.idPlayer1,
          player2Id: match.idPlayer2,
          winnerId: match.winnerId,
          sets: {
            create: {
              winnerId: match.winnerId,
              games: {
                create: gamesList,
              },
            },
          },
        },
      });
      res.status(200).json({ response });
    } catch (e) {
      console.log(e);
      res.status(500).json(e);
    }
  }
}
