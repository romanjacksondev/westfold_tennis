import prisma from "../../lib/prisma";

interface Set {
  winnerId: string
}

export default async function handler(req, res) {

  const match = req.body;
  const gamesList: Set[] = getGamesList(match)

  try {
    const response = await prisma.match.create({
      data: {
        tournamentId: match.tournamentId,
        player1Id: match.idPlayer1,
        player2Id: match.idPlayer2,
        winnerId: match.winner,
        sets: {
          create: {
            winnerId: match.winner,
            games: {
              create: gamesList
            }
          }
        }
      }
    });

    res.status(200).json(response);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
}

function getGamesList(match) {
  const gamesList: Set[] = []
  for (let index = 0; index < match.gamesPlayer1; index++) {
    gamesList.push({ winnerId: match.idPlayer1 })
  }
  for (let index = 0; index < match.gamesPlayer2; index++) {
    gamesList.push({ winnerId: match.idPlayer2 })
  }
  return gamesList
}