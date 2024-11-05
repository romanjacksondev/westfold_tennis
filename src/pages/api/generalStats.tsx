import { countTournamentsByPlayer, createH2H } from "lib/helpers";
import prisma from "lib/prisma";

export default async function handler(req, res) {

    try {
        const matches = await prisma.match.findMany({
            include: {
                tournament: {
                    select: {
                        name: true,
                        champion: {
                            select: { name: true },
                        }
                    }
                },
                player1: {
                    select: { name: true },
                },
                player2: {
                    select: { name: true },
                },
                winner: {
                    select: { name: true },
                },
                sets: {
                    include: {
                        games: true
                    }
                }
            }
        });

        const tournaments = await prisma.tournament.findMany({
            orderBy: [
                {
                    date: 'desc',
                }],
            include: {
                champion: {
                    select: { name: true },
                },
                surface: {
                    select: { name: true }
                },
                venue: {
                    select: { name: true }
                },
                tournamentCategory: {
                    include: {
                        tournamentCategoryPoints: {
                            where: {
                                initial_position: 1,
                                final_position: 1
                            },
                            select: {
                                points: true
                            },
                        }
                    }
                }
            },
        });




        const h2h = createH2H(matches);
        const tournamentsByPlayer = countTournamentsByPlayer(tournaments)

        const data = {
            h2h, tournamentsByPlayer
        }

        res.status(200).json(data);
    } catch (e) {
        console.log(e);
        res.status(500).json(e);
    }
}
