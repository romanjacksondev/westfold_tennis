import prisma from "lib/prisma";

export default async function handler(req, res) {
    try {
        const categories = await prisma.tournamentCategory.findMany({

            include: {
                tournamentCategoryPoints: true
            }

        });
        // console.log("categories",categories)
        res.status(200).json(categories);
    } catch (e) {
        console.log(e);
        res.status(500).json(e);
    }
}