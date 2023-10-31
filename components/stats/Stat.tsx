import { useEffect, useState } from "react";
import PageTitle from "../PageTitle";
import Table from "./StatTable";

export default function Stat({ playersList }) {
  const [ranking, setRanking] = useState([]);

  const fetchRankingData = () => {
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
  };
  useEffect(() => {
    fetchRankingData();
  }, []);

  return (
    <>
      <PageTitle
        title="Ranking y Estadísticas Generales"
        description=""
        button={""}
      />
      {/* <ul>
        {ranking.map((player) => (
          <li key={player.name}>
            {player.name} - {player.points}
          </li>
        ))}
      </ul> */}

      <Table records={playersList} ranking={ranking}></Table>
    </>
  );
}
