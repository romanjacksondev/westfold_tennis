import Link from "next/link";
import prisma from "../../lib/prisma";
import { GetServerSideProps } from "next";
import MatchesTable from "../../components/match/MatchesTable";

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
          <MatchesTable records={matchesList}></MatchesTable>
        </section>
      </div>
      <h2>
        <Link href={`/tournaments`}>Volver a lista de torneos</Link>
      </h2>
    </>
  );
}
