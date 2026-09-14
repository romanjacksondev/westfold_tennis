'use client';

import { useEffect, useState } from 'react';
import { MatchSummaryItem, PlayerChampionships } from '@/utils/utils';
import { H2HRecord } from './H2H';
import StatsTemplate from './Stats.template';

const Stats = () => {
  const [h2h, setH2h] = useState<Record<string, H2HRecord>>({});
  const [championships, setChampionships] = useState<PlayerChampionships[]>([]);
  const [matches, setMatches] = useState<MatchSummaryItem[]>([]);
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        setLoading(true);
        setError(false);

        const [h2hRes, matchesRes, playersRes] = await Promise.all([
          fetch('/api/stats/h2h'),
          fetch('/api/stats/matchHistory'),
          fetch('/api/players'),
        ]);

        if (!h2hRes.ok && !matchesRes.ok) {
          throw new Error('Failed to fetch statistics');
        }

        const h2hData = h2hRes.ok ? await h2hRes.json() : {};
        const matchesData = matchesRes.ok ? await matchesRes.json() : [];
        const playersData = playersRes.ok ? await playersRes.json() : [];

        if (isMounted) {
          setH2h(h2hData.h2h || {});
          setChampionships(h2hData.championships || []);
          setMatches(Array.isArray(matchesData) ? matchesData : []);
          setPlayers(Array.isArray(playersData) ? playersData : []);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading stats:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <StatsTemplate
      h2h={h2h}
      championships={championships}
      matches={matches}
      players={players}
      loading={loading}
      error={error}
    />
  );
};

export default Stats;
