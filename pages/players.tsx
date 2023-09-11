import Link from "next/link";
// import Layout from "../components/Layout";
import { GetStaticProps } from "next";
import prisma from "../lib/prisma";
import AddEntityModal from "../components/modal";
import NewPlayer from "../components/newPlayer";

export const getStaticProps: GetStaticProps = async () => {
  const res = await prisma.player.findMany();
  const playersList = JSON.parse(JSON.stringify(res));
  return {
    props: { playersList },
    revalidate: 10,
  };
};

export default function Tournaments({ playersList }) {
  return (
    <>
      <h1>Jugaaaadoooooresss</h1>
      <div className="w-96">
        <ul >
          {playersList?.map((player) => (
            <li key={player.id}>
              <Link href={`/tournaments/${player.id}`}>{player.name}</Link>
              <br />
            </li>
          ))}
        </ul>
      </div>
      <AddEntityModal>
        <NewPlayer />
      </AddEntityModal>
      <h2>
        <Link href="/">Volver al inicio</Link>
      </h2>
      </>
  );
}
