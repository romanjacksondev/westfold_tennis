'use client';
import { useEffect, useState } from 'react';
import LeaderboardTemplate, { type LeaderboardData, type RankingMode } from './Leaderboard.template';

const Leaderboard = () => {
  const [rankingMode, setRankingMode] = useState<RankingMode>('year');
  const [cache, setCache] = useState<Partial<Record<RankingMode, LeaderboardData>>>({});
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
            [rankingMode]: {
              male: Array.isArray(data?.male) ? data.male : [],
              female: Array.isArray(data?.female) ? data.female : [],
            },
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

  const currentLeaderboard = cache[rankingMode] ?? { male: [], female: [] };

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
