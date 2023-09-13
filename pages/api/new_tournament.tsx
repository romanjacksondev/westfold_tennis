import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const body = req.body.data;
    try {
      const response = await prisma.tournament.create({
        data: body,
      });
      res.status(200).json({ response });
    } catch (e) {
      console.log(e);
      res.status(500).json(e);
    }
  }
}
