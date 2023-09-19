import { GetStaticProps } from "next";
import prisma from "../lib/prisma";
import Tournament from "../components/tournament/Tournament";

export const getStaticProps: GetStaticProps = async () => {
  const res = await prisma.tournament.findMany({
    include: {
      winner: {
        select: { name: true },
      },
    },
  });
  const tournamentsList = JSON.parse(JSON.stringify(res));
console.log(tournamentsList)
  return {
    props: { tournamentsList },
    revalidate: 10,
  };
};

export default function Tournaments({ tournamentsList }) {
  return <Tournament tournamentsList={tournamentsList} />;
}
