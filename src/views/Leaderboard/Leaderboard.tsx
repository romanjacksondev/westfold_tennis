import { useState, useEffect } from "react";
import { useActions } from "store/actions";
import LeaderboardTemplate from "./Leaderboard.template";
import { calculatePlayerPoints } from "../../lib/helpers";
import { useSelectors } from "store/selectors";
import { TennisPlayerProps } from "views/Jugadores/Jugadores.template";

const LeaderboardView = () => {
  const { players } = useSelectors();
  const { getLeaderboard } = useActions();
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const getLeaderboardData = async () => {
      const data = await getLeaderboard();
       console.log("data: ", data)
      const playerPoints = calculatePlayerPoints(data);

      // console.log(playerPoints)
      const entries = Object.entries(playerPoints);
      entries.sort((a, b) => b[1] - a[1]);
      const sortedArray = entries.map(([key, value]) => ({ key, value }));
      setLeaderboard(sortedArray);
    };
    getLeaderboardData();
  }, []);

  const orderedPlayers:TennisPlayerProps[] = leaderboard.map((player) => {
    const playerData = players.find((pl) => pl.name === player.key);
    return { points: player.value, ...playerData };
  });

  return (
    <LeaderboardTemplate leaderboard={orderedPlayers} />
  );
};

export default LeaderboardView;
