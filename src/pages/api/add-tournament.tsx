import { TournamentCreateInput } from "interfaces";
import prisma from "../../lib/prisma";

export default async function handler(req, res) {


// console.log("en el api tournament: " + JSON.stringify(req.body));
const tournament: TournamentCreateInput = req.body;
try {
    const response = await prisma.tournament.create({
      data:{
        name: tournament.name,
        venueId: tournament.venueId,
        winnerId: tournament.winnerId,
        date: tournament.date,
        tournamentTypeId: tournament.tournamentTypeId
      }
    });

    res.status(200).json(response);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
}

