import prisma from "../../lib/prisma";
import { GetStaticPaths, GetStaticProps } from "next";
import MatchesList from "../../components/match/MatchesList";
import { useRouter } from "next/router";

export default function Tournament({ matchesList }) {
  const router = useRouter();
  const { id } = router.query;
  const tournamentName =
    matchesList?.length > 0 ? matchesList[0].tournament.name : "";

  return (
    <MatchesList matchesList={matchesList} tournamentId={id}></MatchesList>
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
  return {
    props: { matchesList },
  };
};
