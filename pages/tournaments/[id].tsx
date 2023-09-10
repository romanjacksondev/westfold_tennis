import Layout from "../../components/layout";
import { useRouter } from "next/router";
import { fetcher } from "../../utils/fetcher";
import useSWR from "swr";
import Link from "next/link";
import utilStyles from "../../styles/utils.module.css";

export default function Tournament() {
  const router = useRouter();
  const { id } = router.query;

  // Fetch item details by 'id' from the JSON file
  const { data, error } = useSWR(`/api/matches/${id}`, fetcher);
  //Handle the error state
  if (error) return <div>Failed to load</div>;
  //Handle the loading state
  if (!data) return <div>Loading...</div>;
  console.log(data)
  return (
    <Layout>
      <h1>{data.tournamentName}</h1>
      <h2>Partidos</h2>
      {data.matches.map((e) => (
        <li className={utilStyles.listItem} key={e.id}>
          {data.players.players.find(f => f.id === e.players[0]).name} vs {data.players.players.find(f => f.id === e.players[1]).name}
          <br />
        </li>
      ))}
      <h2>
        <Link href={`/tournaments`}>Volver a lista de torneos</Link>
      </h2>
    </Layout>
  );
}
