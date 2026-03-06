'use client';
import { useEffect, useState } from 'react';
import StatsTemplate from './Stats.template';

const Stats = () => {
  const [h2h, setH2h] = useState();
  const [championships, setChampionships] = useState([]);

  useEffect(() => {
    fetch('/api/stats/h2h')
      .then((res) => res.json())
      .then((data) => {
        console.log('h2h data:', data);
        setH2h(data);
      })
      .catch((err) => console.error(err));
  }, []);

  // useEffect(() => {
  //   const getData = async () => {
  //     // console.log("data:", data )

  //     setH2h(data.h2h);
  //     setChampionships(data.tournamentsByPlayer);
  //   };
  //   getData();
  // }, []);

  return <StatsTemplate h2h={h2h} championships={championships} />;
};

export default Stats;
