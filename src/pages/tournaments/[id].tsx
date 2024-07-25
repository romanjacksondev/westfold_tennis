import prisma from "../../lib/prisma";
import { GetStaticPaths, GetStaticProps } from "next";
import Match from "../../../components/match/Match";
import { useRouter } from "next/router";

export default function Tournament({ matchesList, tournamentData }) {
  const router = useRouter();
  const { id } = router.query;
  return (
    <Match
      matchesList={matchesList}
      tournamentId={id}
      tournamentName={tournamentData.name}
    ></Match>
  );
}

export const getStaticPaths: GetStaticPaths<{ id: string }> = async () => {
  let tournaments = await prisma.tournament.findMany();
  const paths = tournaments.map((tournament) => ({
    params: { id: tournament.id },
  }));
  return {
    paths: paths,
    fallback: false, // can also be true or 'blocking'
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { params } = context;
  if (!params) {
    return { notFound: true };
  }
  const id = params.id;
  let matches = await prisma.match.findMany({
    where: {
      tournamentId: String(id),
    },
    include: {
      tournament: {
        select: { name: true },
      },
      winner: {
        select: { name: true },
      },
      player1: {
        select: { name: true },
      },
      player2: {
        select: { name: true },
      },
      sets: {
        include: {
          games: true,
        },
      },
    },
  });
  const matchesList = JSON.parse(JSON.stringify(matches));

  const tournament = await prisma.tournament.findUnique({
    where: {
      id: String(id),
    },
  });
  const tournamentData = JSON.parse(JSON.stringify(tournament));
  return {
    props: { matchesList, tournamentData },
  };
};
