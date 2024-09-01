import prisma from "../../lib/prisma";

export default async function handler(req, res) {
    try {
        const tournamentTypes = await prisma.tournamentType.findMany({});
        res.status(200).json(tournamentTypes);
    } catch (e) {
        console.log(e);
        res.status(500).json(e);
    }
}