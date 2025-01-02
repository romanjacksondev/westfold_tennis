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
  const [hasTournaments, setHasTournaments] = useState(false);
  //year: last 12 months
  //calendar: from 01/01
  const [rankingMode, setRankingMode] = useState('year');

  useEffect(() => {
    const getLeaderboardData = async () => {
      const data = await getLeaderboard(rankingMode);
      //  console.log("data: ", data)

      if(data.length > 0 ) {
        const playerPoints = calculatePlayerPoints(data);

        // console.log(playerPoints)
        const entries = Object.entries(playerPoints);
        entries.sort((a, b) => b[1].points - a[1].points);
        const sortedArray = entries.map(([key, value]) => ({ key, value }));
        setLeaderboard(sortedArray);
      } else {
        setLeaderboard([]);
        
      }
      setHasTournaments(true);


    };
    // console.log("ranking")
    getLeaderboardData();
  }, [rankingMode]);

  const orderedPlayers:TennisPlayerProps[] = leaderboard.map((player) => {
    const playerData = players.find((pl) => pl.name === player.key);
    return { points: player.value, ...playerData };
  });

  return (
    <LeaderboardTemplate leaderboard={orderedPlayers} rankingMode={rankingMode} setRankingMode={setRankingMode} hasTournaments={hasTournaments}/>
  );
};

export default LeaderboardView;
