import { calculatePlayerStats, createMatchSummary } from "lib/helpers";
import prisma from "lib/prisma";

export default async function handler(req, res) {

    let whereCondition = {}
    if (req.query.id) {
        whereCondition = {
            tournamentId: req.query.id
        }
    }

    try {
        const matches = await prisma.match.findMany({
            where: whereCondition,
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

        const matchSummary = createMatchSummary(matches);
        const playerStats = calculatePlayerStats(matches)
        const data = {
            matchSummary, playerStats
        }
        res.status(200).json(data);
    } catch (e) {
        console.log(e);
        res.status(500).json(e);
    }
}

