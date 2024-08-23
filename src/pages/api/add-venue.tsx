import prisma from "../../lib/prisma";

export default async function handler(req, res) {


// console.log("en el api tournament: " + JSON.stringify(req.body));
const venue = req.body;
try {
    const response = await prisma.venue.create({
      data:{
        name: venue.name,
        phone: venue.phone,
        address: venue.address,
        points: venue.points
      }
    });

    res.status(200).json(response);
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
}