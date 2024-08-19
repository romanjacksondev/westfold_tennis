import prisma from "prisma";

export default async function getTournamentsById() {
  const res = await prisma.tournament.findMany({
    // where: {
    //   tournamentId: String(id),
    // },
    // include: {
    //   sets: true,
    // },
  });

console.log(res);

  const tournamentList = JSON.parse(JSON.stringify(res));

  return {
    props: { tournamentList },
  };
}
