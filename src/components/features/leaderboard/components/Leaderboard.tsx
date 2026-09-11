'use client';
import { useEffect, useState } from 'react';
import LeaderboardTemplate, { type LeaderboardEntry, type RankingMode } from './Leaderboard.template';

const Leaderboard = () => {
  const [rankingMode, setRankingMode] = useState<RankingMode>('year');
  const [cache, setCache] = useState<Partial<Record<RankingMode, LeaderboardEntry[]>>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    if (cache[rankingMode]) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    fetch(`/api/leaderboard?rankingMode=${rankingMode}`)
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo cargar el leaderboard');
        return res.json();
      })
      .then((data) => {
        if (!isCancelled) {
          setCache((prev) => ({
            ...prev,
            [rankingMode]: Array.isArray(data) ? (data as LeaderboardEntry[]) : [],
          }));
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (!isCancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [rankingMode]);

  const currentLeaderboard = cache[rankingMode] ?? [];

  return (
    <LeaderboardTemplate
      leaderboard={currentLeaderboard}
      rankingMode={rankingMode}
      loading={loading}
      error={error}
      setRankingMode={setRankingMode}
    />
  );
};

export default Leaderboard;
