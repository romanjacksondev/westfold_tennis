'use client';
import { useEffect, useState } from 'react';
import VenuesTemplate from './Venues.template';

const Venues = () => {
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    fetch('/api/venues')
      .then((res) => res.json())
      .then((data) => setVenues(data))
      .catch((err) => console.error(err));
  }, []);

  return <VenuesTemplate venues={venues}></VenuesTemplate>;
};

export default Venues;
