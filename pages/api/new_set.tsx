import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  const set = JSON.parse(req.body);
  if (req.method === "POST") {
    try {
      // winnerId String
      // winner   Player  @relation(fields: [winnerId], references: [id])
      // matchId  String
      // match   Match? @relation(fields: [matchId], references: [id])


      const response = await prisma.set.create({
        data: {
          winnerId: set.winnerId,
          matchId: set.matchId
        },
      });
      res.status(200).json({ response });
    } catch (e) {
      console.log(e);
      res.status(500).json(e);
    }
  }
}
