import Layout from "../../components/Layout";
import Link from "next/link";
// import utilStyles from "../../styles/utils.module.css";
import prisma from "../../lib/prisma";
import { GetServerSideProps } from "next";
import AddEntityModal from "../../components/modal";
import NewMatch from "../../components/newMatch";
import { useRouter } from "next/router";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  let matches = await prisma.match.findMany({
    where: {
      tournamentId: String(params?.id),
    },
    include: {
      tournament: {
        select: { name: true },
      },
    },
  });
  const matchesList = JSON.parse(JSON.stringify(matches));

  const players = await prisma.player.findMany();
  const playersList = JSON.parse(JSON.stringify(players));

  return {
    props: { matchesList, playersList},
  };
};

export default function Tournament({ matchesList, playersList }) {
  const router = useRouter();
  const { id } = router.query;
  const tournamentName =
    matchesList.length > 0 ? matchesList[0].tournament.name : "";

  return (
    <Layout>
      <h1>{tournamentName}</h1>
      <h2>Partidos</h2>

      <AddEntityModal>
        <NewMatch id={id} playersList={playersList}/>
      </AddEntityModal>

      {matchesList.map((match) => (
        <li key={match.id}>
          {match.winner}
        </li>
      ))}
      <h2>
        <Link href={`/tournaments`}>Volver a lista de torneos</Link>
      </h2>
    </Layout>
  );
}
