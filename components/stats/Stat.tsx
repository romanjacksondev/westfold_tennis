import { useEffect, useState } from "react";
import PageTitle from "../PageTitle";
import RankingTable from "./RankingTable";
import H2HTable from "./H2HTable";

export default function Stat({ playersList }) {
  const [ranking, setRanking] = useState([]);
  const [h2h, setH2h] = useState([]);

  const fetchStatsData = () => {
    fetch("/api/getRanking")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        const array = [];
        playersList.map((player) => {
          array.push({
            name: player.name,
            points: !data[player.name] ? 0 : data[player.name],
          });
        });
        const ordered = array.sort((a, b) => b.points - a.points);
        setRanking(ordered);
      });

    fetch("/api/getMatches")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        setH2h(data);
      });
  };
  useEffect(() => {
    fetchStatsData();
  }, []);

  return (
    <>
      <PageTitle title="Ranking" description="" button={""} />
      <RankingTable records={playersList} ranking={ranking}></RankingTable>
      <PageTitle title="H2H" description="" button={""} />
      <H2HTable records={playersList} h2h={h2h}></H2HTable>
    </>
  );
}
