import prisma from "prisma";

export default async function getMatchesById(id) {
   const res = await prisma.match.findMany({
     where: {
       tournamentId: String(id),
     },
   });
   const matchesList = JSON.parse(JSON.stringify(res));

   return {
     props: { matchesList },
   };

  //  return itemsData[id];
}