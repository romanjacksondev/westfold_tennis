'use client';
import { useEffect, useState } from 'react';
import PlayersTemplate from './Players.template';
import type { TennisPlayerProps } from '../types/Players';

const PlayersView = () => {
  const [players, setPlayers] = useState<TennisPlayerProps[]>([]);

  useEffect(() => {
    Promise.all([fetch('/api/players'), fetch('/api/matches')])
      .then(async ([playersResponse, matchesResponse]) => {
        const playersData = await playersResponse.json();
        const matchesData = matchesResponse.ok ? await matchesResponse.json() : {};
        const statsById = new Map(
          (Array.isArray(matchesData.playerStats) ? matchesData.playerStats : []).map((stat) => [stat.id, stat]),
        );
        setPlayers(playersData.map((player: TennisPlayerProps) => ({ ...player, stats: statsById.get(player.id) })));
      })
      .catch((err) => console.error(err));
  }, []);

  return <PlayersTemplate players={players} />;
};

export default PlayersView;
