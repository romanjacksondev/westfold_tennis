import prisma from "../../lib/prisma";

export default async function handler(req, res) {

// console.log("en el api tournament: " + JSON.stringify(req.body));
const player = req.body;
try {
    const response = await prisma.player.create({
      data:{
        name: player.name
      }
    });

    res.status(200).json(response);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
}