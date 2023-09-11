import Layout from "../../components/Layout";
import { useRouter } from "next/router";
import Link from "next/link";
import utilStyles from "../../styles/utils.module.css";
import prisma from "../../lib/prisma";
import { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const res = await prisma.match.findMany({
    where: {
      tournamentId: String(params?.id),
    },
    include: {
      tournament: {
        select: { name: true },
      },
    },
  });
  console.log(res)
  const matchesList = JSON.parse(JSON.stringify(res));

  return {
    props: { matchesList },
  };
};

export default function Tournament({ matchesList }) {
  const router = useRouter();
  const { id } = router.query;

  return (
    <Layout>
      <h1>{matchesList[0].tournament.name}</h1>
      <h2>Partidos</h2>
      {matchesList.map((match) => (
        <li className={utilStyles.listItem} key={match.id}>
          {match.winner}
          {/* {data.players.players.find(f => f.id === e.players[0]).name} vs {data.players.players.find(f => f.id === e.players[1]).name}
          <br /> */}
        </li>
      ))}
      <h2>
        <Link href={`/tournaments`}>Volver a lista de torneos</Link>
      </h2>
    </Layout>
  );
}
