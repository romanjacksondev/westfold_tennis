import prisma from "../../../lib/prisma";
import { GetStaticPaths, GetStaticProps } from "next";
import PlayerDetails from "../../../components/player/PlayerDetails";

export default function Player({ playersList }) {
  return (
    <PlayerDetails playersList={playersList} />
  );
}

export const getStaticPaths: GetStaticPaths<{ id: string }> = async () => {
  let players = await prisma.player.findMany();
  const paths = players.map((player) => ({
    params: { id: player.id },
  }));
  return {
    paths: paths,
    fallback: false, // can also be true or 'blocking'
  };
};

export const getStaticProps: GetStaticProps = async (context) => {
  const res = await prisma.player.findMany();
  const playersList = JSON.parse(JSON.stringify(res));
  return {
    props: { playersList }
  };
};
