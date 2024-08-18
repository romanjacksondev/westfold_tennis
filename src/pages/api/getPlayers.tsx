import prisma from "../../lib/prisma";

export default async function handler(req, res) {
  try {
    const response = await prisma.player.findMany();
    res.status(200).json({ response });
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
}
