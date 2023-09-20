import { GetStaticProps } from "next";
import prisma from "../lib/prisma";
import Player from "../components/player/Player";

export const getStaticProps: GetStaticProps = async () => {
  const res = await prisma.player.findMany();
  const playersList = JSON.parse(JSON.stringify(res));
  return {
    props: { playersList },
  };
};

export default function Players({ playersList }) {
  return <Player playersList={playersList} />;
}
