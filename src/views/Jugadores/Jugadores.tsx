import { useSelectors } from "store/selectors";
import JugadoresTemplate, { TennisPlayerProps } from "./Jugadores.template";
import { useActions } from "store/actions";
import { useEffect, useState } from "react";
import { calculatePlayerPoints } from "lib/helpers";

const JugadoresView = () => {
  const { players } = useSelectors();
  const { getLeaderboard } = useActions();
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const getLeaderboardData = async () => {
      const data = await getLeaderboard();
      // console.log("data: ", data)
      const playerPoints = calculatePlayerPoints(data);

      // console.log(playerPoints)
      const entries = Object.entries(playerPoints);
      entries.sort((a, b) => b[1] - a[1]);
      const sortedArray = entries.map(([key, value]) => ({ key, value }));
      setLeaderboard(sortedArray);
    };
    getLeaderboardData();
  }, []);

  const orderedPlayers = leaderboard.map((player) => {
    const playerData = players.find((pl) => pl.name === player.key);
    return { points: player.value, ...playerData };
  });

  if (!orderedPlayers) {
    return <p>Loading</p>;
  }

  return <JugadoresTemplate players={orderedPlayers as TennisPlayerProps[]} />;
};

export default JugadoresView;
