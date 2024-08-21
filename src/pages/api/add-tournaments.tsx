import prisma from "../../lib/prisma";

export default async function handler(req, res) {


// console.log("en el api tournament: " + JSON.stringify(req.body));
const tournament = req.body;
try {
    const tournaments = await prisma.tournament.create({
      data:{
        name: tournament.name,
        venueId: tournament.venue.id,
        winnerId: tournament.winner.id,
        date: tournament.date
      }
    });

    res.status(200).json(tournaments);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
}