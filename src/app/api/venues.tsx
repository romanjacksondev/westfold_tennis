import prisma from "lib/prisma";

export default async function handler(req, res) {
  try {
    const venues = await prisma.venue.findMany({});

    res.status(200).json(venues);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
}