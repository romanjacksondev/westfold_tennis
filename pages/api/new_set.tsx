import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  const set = JSON.parse(req.body);
  // console.log(set);
  if (req.method === "POST") {
    try {
      const gamesList = [];
      let response;

      for (let index = 0; index < set.pointsPlayer1; index++) {
        gamesList.push({winnerId: set.player1Id})
      }
      for (let index = 0; index < set.pointsPlayer2; index++) {
        gamesList.push({winnerId: set.player2Id})
      }

      const u = await prisma.set.create({
        include: {
          games: true,
        },
        data: {
          winnerId: set.winnerId,
          matchId: set.matchId,
          games: {
            // create: [
            //   { winnerId: set.player1Id },
            //   { winnerId: set.player1Id },
            //   { winnerId: set.player2Id },
            // ],
            create: gamesList
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
