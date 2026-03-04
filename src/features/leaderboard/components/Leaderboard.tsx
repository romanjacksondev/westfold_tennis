'use client';
import { useEffect, useState } from 'react';
import LeaderboardTemplate from './Leaderboard.template';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  // const [hasTournaments, setHasTournaments] = useState(false);
  //year: last 12 months
  //calendar: from 01/01
  const [rankingMode, setRankingMode] = useState('year');

  useEffect(() => {
    const getLeaderboardData = async () => {
      fetch('/api/leaderboard?rankingMode=' + rankingMode)
        .then((res) => res.json())
        .then((data) => setLeaderboard(data))
        .catch((err) => console.error(err));

      // const data = await getLeaderboard(rankingMode);
      //  console.log("data: ", data)

      // if (data.length > 0) {
      //   const playerPoints = calculatePlayerPoints(data);

      //   // console.log(playerPoints)
      //   const entries = Object.entries(playerPoints);
      //   entries.sort((a, b) => b[1].points - a[1].points);
      //   const sortedArray = entries.map(([key, value]) => ({ key, value }));
      //   setLeaderboard(sortedArray);
      // } else {
      //   setLeaderboard([]);
      // }
      // setHasTournaments(true);
    };
    // console.log("ranking")
    getLeaderboardData();
  }, [rankingMode]);

  // const orderedPlayers: TennisPlayerProps[] = leaderboard.map((player) => {
  //   const playerData = players.find((pl) => pl.name === player.key);
  //   return { points: player.value, ...playerData };
  // });

  return (
    <LeaderboardTemplate
      leaderboard={leaderboard}
      rankingMode={rankingMode}
      setRankingMode={setRankingMode}
      // hasTournaments={hasTournaments}
    />
  );
};

export default Leaderboard;
