import prisma from "../../lib/prisma";

export default async function handler(req, res) {

    // console.log("buscando en bd: " + req.query.id)
    try {
        const matches = await prisma.match.findMany({
            where: {
                tournamentId: req.query.id
            },
            include: {
                player1: {
                    select: { name: true },
                },
                player2: {
                    select: { name: true },
                },
                sets: {
                    include: {
                        games: true
                    }    
                }
            }
        });
        // console.log(JSON.stringify(matches))
        res.status(200).json(matches);
    } catch (e) {
        console.log(e);
        res.status(500).json(e);
    }
}