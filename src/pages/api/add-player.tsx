import prisma from "lib/prisma";
import { getServerSession } from "next-auth/next"
import NextAuth from "./auth/[...nextauth]"

export default async function handler(req, res) {

  const session = await getServerSession(req, res, NextAuth)
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
const player = req.body;
try {
    const response = await prisma.player.create({
      data:{
        name: player.name,
        nickname: player.nickname, 
        lastname: player.lastname, 
        mail: player.mail, 
        phone: player.phone
      }
    });

    res.status(200).json(response);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
}