import prisma from "lib/prisma";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const venue = req.body;
  try {
    const response = await prisma.venue.create({
      data: {
        name: venue.name,
        phone: venue.phone,
        address: venue.address
      }
    });

    res.status(200).json(response);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
}