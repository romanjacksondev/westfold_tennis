'use client';
import { useEffect, useState } from 'react';
import PlayersTemplate from './Players.template';

const PlayersView = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    fetch('/api/players')
      .then((res) => res.json())
      .then((data) => setPlayers(data))
      .catch((err) => console.error(err));
  }, []);

  return <PlayersTemplate players={players} />;
};

export default PlayersView;
