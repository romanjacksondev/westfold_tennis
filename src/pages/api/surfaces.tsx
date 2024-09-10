import prisma from "lib/prisma";

export default async function handler(req, res) {
  try {
    const surfaces = await prisma.surface.findMany({});

    res.status(200).json(surfaces);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
}