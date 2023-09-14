import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  console.log( typeof req.body)
  if (req.method === "POST") {
    const body = JSON.parse(req.body);
    console.log(typeof body)
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
