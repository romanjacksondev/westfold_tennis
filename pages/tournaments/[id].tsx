import Link from "next/link";
// import utilStyles from "../../styles/utils.module.css";
import prisma from "../../lib/prisma";
import { GetServerSideProps } from "next";
// import AddEntityModal from "../../components/modal";
// import NewMatch from "../../components/newMatch";
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
      players: true,
    },
  });
  const matchesList = JSON.parse(JSON.stringify(matches));
  const players = await prisma.player.findMany();
  const playersList = JSON.parse(JSON.stringify(players));

  return {
    props: { matchesList, playersList },
  };
};

export default function Tournament({ matchesList, playersList }) {
  const router = useRouter();
  const { id } = router.query;
  const tournamentName =
    matchesList.length > 0 ? matchesList[0].tournament.name : "";

  return (
    <>
      <div className="container mx-auto">
        <section className="bg-white py-[70px]">
          <div className="mx-auto px-4 sm:container">
            <div className="border-stroke border-b">
              <h2 className="mb-2 text-2xl font-semibold text-black">
                {tournamentName}
              </h2>
            </div>
          </div>
          <div className="w-full">
            <ul>
              {matchesList.map((match) => (
                <li key={match.id}>
                  {match.players[0].name} vs {match.players[1].name}
                </li>
              ))}
            </ul>
          </div>
          {/* <AddEntityModal>
            <NewMatch id={id} playersList={playersList} />
          </AddEntityModal> */}
        </section>
      </div>

      {/* <h1></h1>
      <h2>Partidos</h2> */}

      <h2>
        <Link href={`/tournaments`}>Volver a lista de torneos</Link>
      </h2>
    </>
  );
}
