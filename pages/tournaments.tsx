import Link from "next/link";
//useSWR allows the use of SWR inside function components
import useSWR from "swr";
import Layout from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import FormatDate from "../components/date";
import { fetcher } from "../utils/fetcher";

export default function Tournaments() {
  //Set up SWR to run the fetcher function when calling "/api/staticdata"
  //There are 3 possible states: (1) loading when data is null (2) ready when the data is returned (3) error when there was an error fetching the data
  const { data, error } = useSWR("/api/tournaments", fetcher);

  //Handle the error state
  if (error) return <div>Failed to load</div>;
  //Handle the loading state
  if (!data) return <div>Loading...</div>;
  //Handle the ready state and display the result contained in the data object mapped to the structure of the json file
  return (
    <Layout>
      <h1>Los Torneos pa</h1>
      <div className="w-96">
        <ul className={utilStyles.list}>
          {data.tournaments
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            .map((e) => (
              <li className={utilStyles.listItem} key={e.id}>
                <Link href={`/tournaments/${e.id}`}>{e.name}</Link>
                <br />
                <small className={utilStyles.lightText}>
                  <FormatDate dateString={e.date} />
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
