import { GetStaticProps } from "next";
import prisma from "../../lib/prisma";
import Stat from "../../components/stats/Stat";

export default function Stats({ playersList }) {
  return <Stat playersList={playersList} />;
}

export const getStaticProps: GetStaticProps = async () => {
  const res = await prisma.player.findMany();
  const playersList = JSON.parse(JSON.stringify(res));
  return {
    props: { playersList }
  };
};

//como armo el ranking

//lista de torneos, sumo puntos de cada jugador ganador, ordeno por puntos
