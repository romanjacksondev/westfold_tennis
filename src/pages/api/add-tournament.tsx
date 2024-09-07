import { TournamentCreateInput } from "interfaces";
import prisma from "../../lib/prisma";

export default async function handler(req, res) {

const tournament: TournamentCreateInput = req.body;

// console.log(tournament)

try {
    const response = await prisma.tournament.create({
      data:{
        name: tournament.name,
        date: tournament.date,
        champion: {
          connect: { id: tournament.championId }  // Conectar a un campeón existente
        },
        venue: {
          connect: { id: tournament.venueId }  // Conectar a un venue existente
        },
        tournamentCategory: {
          connect: { id: tournament.tournamentCategoryId }  // Conectar a una categoría existente
        },
        players: {
          connect: tournament.players
        },
        surface: {
          connect: { id: tournament.surfaceId }  // Conectar a un venue existente
        },
      }
    });

    res.status(200).json(response);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
}

