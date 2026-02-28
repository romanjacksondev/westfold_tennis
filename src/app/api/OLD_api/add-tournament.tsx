import { TournamentCreateInput } from 'interfaces';
import prisma from 'lib/prisma';
import { getServerSession } from 'next-auth/next';
import NextAuth from '../api/auth/[...nextauth]/route';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, NextAuth);

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const tournament: TournamentCreateInput = req.body;

  try {
    const response = await prisma.tournament.create({
      data: {
        name: tournament.name,
        date: tournament.date,
        champion: {
          connect: { id: tournament.championId },
        },
        venue: {
          connect: { id: tournament.venueId },
        },
        tournamentCategory: {
          connect: { id: tournament.tournamentCategoryId },
        },
        players: {
          connect: tournament.players,
        },
        surface: {
          connect: { id: tournament.surfaceId },
        },
      },
    });

    res.status(200).json(response);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
}
