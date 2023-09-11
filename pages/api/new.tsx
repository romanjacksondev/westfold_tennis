// pages/api/create-new.js
import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, location, winner, points } =
      typeof req.body == "string" ? JSON.parse(req.body) : req.body;
    try {
      // we can access db records with prisma functions
      const tournament = await prisma.tournament.create({
        data: {
          name,
          location,
          winner,
          points,
        },
      });
      res.status(200).json({ tournament });
    } catch (e) {
      console.log(e);
      res.status(500).json(e);
    }
  }
}
