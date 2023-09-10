import Link from "next/link";
import Layout from "../components/Layout";
import FormatDate from "../components/date";
import utilStyles from "../styles/utils.module.css";
import { GetStaticProps } from "next";
import prisma from "../lib/prisma";

export const getStaticProps: GetStaticProps = async () => {
  const res = await prisma.tournament.findMany();
  const tournamentsList = JSON.parse(JSON.stringify(res));
  return {
    props: { tournamentsList },
    revalidate: 10,
  };
};

export default function Tournaments({ tournamentsList }) {
  return (
    <Layout>
      <h1>Los Torneos pa</h1>
      <div className="w-96">
        <ul className={utilStyles.list}>
          {tournamentsList
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            .map((tournament) => (
              <li className={utilStyles.listItem} key={tournament.id}>
                <Link href={`/tournaments/${tournament.id}`}>
                  {tournament.name}
                </Link>
                <br />
                <small className={utilStyles.lightText}>
                  <FormatDate dateString={tournament.date} />
                </small>
              </li>
            ))}
        </ul>
      </div>

      <h2>
        <Link href="/">Volver al inicio</Link>
      </h2>
    </Layout>
  );
}
