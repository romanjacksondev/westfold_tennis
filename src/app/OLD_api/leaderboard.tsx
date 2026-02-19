import prisma from "lib/prisma";

export default async function handler(req, res) {

    try {
        const now = new Date();
        const currentYear = now.getFullYear();
        let initialDate = new Date();

        if (req.query.rankingMode == 'calendar') {
            initialDate = new Date(currentYear, 0, 1);
        } else {
            initialDate.setMonth(now.getMonth() - 12);
        }
        // console.log("initialDate: ", initialDate)
        const players = await prisma.tournament.findMany({
            orderBy: [
                {
                    date: 'desc',
                }],
            where: {
                date: {
                    gte: initialDate, // Mayor o igual a hace 12 meses
                    lte: now // Menor o igual a la fecha actual
                }
            },
            include: {
                tournamentCategory: {
                    select: {
                        name: true,
                        tournamentCategoryPoints: {
                            select: {
                                initial_position: true,
                                final_position: true,
                                points: true
                            }
                        }
                    }
                },
                matches: {
                    include: {
                        player1: {
                            select: {
                                name: true
                            }
                        },
                        player2: {
                            select: {
                                name: true
                            }
                        },
                        sets: {
                            include: {
                                games: true
                            }
                        }
                    }
                }
            }
        });

        console.log("leaderboard: ", players)

        res.status(200).json(players);
    } catch (e) {
        console.log(e);
        res.status(500).json(e);
    }
}