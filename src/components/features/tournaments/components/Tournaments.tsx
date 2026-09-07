'use client';
import { useEffect, useState } from 'react';
import TournamentsTemplate from './Tournaments.template';

const TournamentsView = () => {
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    fetch('/api/tournaments')
      .then((res) => res.json())
      .then((data) => setTournaments(data))
      .catch((err) => console.error(err));
  }, []);

  return <TournamentsTemplate tournaments={tournaments} />;
};

export default TournamentsView;
