import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  const venue = JSON.parse(req.body);
  if (req.method === "POST") {
    try {
      const response = await prisma.venue.create({
        data: {
          name: venue.name,
          phone: venue.phone,
          address: venue.address,
          points: venue.points,
        },
      });
      res.status(200).json({ response });
    } catch (e) {
      console.log(e);
      res.status(500).json(e);
    }
  }
}
