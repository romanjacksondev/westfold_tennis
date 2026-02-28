import prisma from 'lib/prisma';
import { getServerSession } from 'next-auth/next';
import NextAuth from '../api/auth/[...nextauth]/route';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, NextAuth);
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const venue = req.body;
  try {
    const response = await prisma.venue.create({
      data: {
        name: venue.name,
        phone: venue.phone,
        address: venue.address,
      },
    });

    res.status(200).json(response);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
}
