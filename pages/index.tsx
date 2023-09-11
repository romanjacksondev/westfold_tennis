// import Layout from "../components/Layout";
// import utilStyles from "../styles/utils.module.css";
import Link from "next/link";

export default function Home() {
  return (
    // <Layout>
    <>
      <section >
        <h1 className="text-3xl font-bold">Zona Oeste ATP Tour</h1>
      </section>
      <section>
        <p>
          <Link href={`/tournaments`}>Torneos</Link>
        </p>
        <p>
          <Link href={`/players`}>Jugadores</Link>
        </p>
      </section>
      </>
    // </Layout>
  );
}
