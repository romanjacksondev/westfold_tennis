import Layout from "../components/Layout";
import utilStyles from "../styles/utils.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <Layout>
      <section className={utilStyles.headingMd}>
        <p>Zona Oeste ATP Tour</p>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <p>
          <Link href={`/tournaments`}>Torneos</Link>
        </p>
        <p>
          <Link href={`/players`}>Jugadores</Link>
        </p>
      </section>
    </Layout>
  );
}
