import prisma from 'lib/prisma';
import { getServerSession } from 'next-auth/next';
import NextAuth from '../api/auth/[...nextauth]/route';

interface Set {
  winnerId: string;
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, NextAuth);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const match = req.body;
  const gamesList: Set[] = getGamesList(match);
  try {
    const response = await prisma.match.create({
      data: {
        tournament: {
          connect: { id: match.tournamentId },
        },

        player1: {
          connect: { id: match.idPlayer1 },
        },
        player2: {
          connect: { id: match.idPlayer2 },
        },
        winner: {
          connect: { id: match.winner },
        },
        sets: {
          create: {
            winnerId: match.winner,
            games: {
              create: gamesList,
            },
          },
        },
      },
    });

    res.status(200).json(response);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
}

function getGamesList(match) {
  const gamesList: Set[] = [];

  match.sets.forEach((set) => {
    for (let index = 0; index < set.gamesPlayer1; index++) {
      gamesList.push({ winnerId: match.idPlayer1 });
    }
    for (let index = 0; index < set.gamesPlayer2; index++) {
      gamesList.push({ winnerId: match.idPlayer2 });
    }
  });
  return gamesList;
}
