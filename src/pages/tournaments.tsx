import { GetStaticProps } from "next";
import prisma from "../../lib/prisma";
import Tournament from "../../components/tournament/Tournament";

export default function Tournaments({ tournamentsList }) {
  return <Tournament tournamentsList={tournamentsList} />;
}

export const getStaticProps: GetStaticProps = async () => {
  const res = await prisma.tournament.findMany({
    include: {
      winner: {
        select: { name: true },
      },
      venue: true
    },
  });
  const tournamentsList = JSON.parse(JSON.stringify(res));
  return {
    props: { tournamentsList },
    revalidate: 1,
  };
};