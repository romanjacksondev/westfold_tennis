import prisma from "lib/prisma";
import { parseMatches } from "lib/helpers";

export default async function handler(req, res) {

    const whereCondition = {
        OR: [
            {
                AND: [
                    { player1Id: req.query.player1Id },
                    { player2Id: req.query.player2Id }
                ]
            },
            {
                AND: [
                    { player1Id: req.query.player2Id },
                    { player2Id: req.query.player1Id }
                ]
            }
        ]
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

        const parsedMatches = parseMatches(matches)
        res.status(200).json(parsedMatches);
    } catch (e) {
        console.log(e);
        res.status(500).json(e);
    }
}
