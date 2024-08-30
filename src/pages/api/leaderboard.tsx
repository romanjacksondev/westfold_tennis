import prisma from "../../lib/prisma";

export default async function handler(req, res) {
    try {
        const now = new Date();
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(now.getMonth() - 12);

        const players = await prisma.tournament.findMany({
            orderBy: [
                {
                    date: 'desc',
                }],
            where: {
                date: {
                    gte: twelveMonthsAgo, // Mayor o igual a hace 12 meses
                    lte: now // Menor o igual a la fecha actual
                }
            },
            include: {
                tournamentType: {
                    select: {
                        name: true,
                        tournamentTypePoints: {
                            select: {
                                initial_position: true,
                                final_position: true,
                                points: true
                            }
                        }
                    }
                },
                matches:true
            }
        });

        res.status(200).json(players);
    } catch (e) {
        console.log(e);
        res.status(500).json(e);
    }
}