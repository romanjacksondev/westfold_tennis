'use client';

import { useEffect, useState } from 'react';
import DrawGeneratorTemplate from './DrawGenerator.template';

export interface RegisteredPlayer {
  id: string;
  name: string;
  lastname?: string;
  nickname?: string;
}

const DrawGeneratorView = () => {
  const [players, setPlayers] = useState<RegisteredPlayer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/players')
      .then((res) => {
        if (!res.ok) throw new Error('Error al obtener jugadores');
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setPlayers(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching players:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return <DrawGeneratorTemplate players={players} loading={loading} />;
};

export default DrawGeneratorView;

