import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "POST") {
    // const { name, location, winner, points } =
    //   typeof req.body == "string" ? JSON.parse(req.body) : req.body;
    //   console.log(req.body.data)
      const body = req.body.data;
    try {
      const response = await prisma.tournament.create({
        // data: {
        //   name,
        //   location,
        //   winner,
        //   points,
        // },
        data: body
      });
      res.status(200).json({ response });
    } catch (e) {
      console.log(e);
      res.status(500).json(e);
    }
  }
}
