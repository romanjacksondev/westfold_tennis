import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  try {
    const response = await prisma.tournament.findMany({
      include: {
        winner: {
          select: { name: true },
        },
        venue: true,
      },
    });

    const tournaments = JSON.parse(JSON.stringify(response));
    const ranking = tournaments.reduce((ranking, tournament) => {
       if (!ranking[tournament.winner.name]) {
         ranking[tournament.winner.name] = 0;
       }
       ranking[tournament.winner.name] += parseInt(tournament.venue.points);
       return ranking;
    }, {});

    res.status(200).json(ranking );
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
}
