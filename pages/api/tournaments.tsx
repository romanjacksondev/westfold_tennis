import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const feed = await prisma.tournament.findMany();
console.log("feed " + feed)
  //Return the content of the data file in json format
  res.status(200).json(feed);
}
