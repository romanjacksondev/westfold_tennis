'use client';
import { useEffect, useState } from 'react';
import DrawGeneratorTemplate from './DrawGenerator.template';

const DrawGeneratorView = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    fetch('/api/players')
      .then((res) => res.json())
      .then((data) => setPlayers(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <DrawGeneratorTemplate players={players} />
    </>
  );
};

export default DrawGeneratorView;
