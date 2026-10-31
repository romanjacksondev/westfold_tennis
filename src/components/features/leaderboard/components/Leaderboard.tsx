'use client';
import { useEffect, useState } from 'react';
import LeaderboardTemplate, { type LeaderboardData, type RankingMode } from './Leaderboard.template';

const Leaderboard = () => {
  const [rankingMode, setRankingMode] = useState<RankingMode>('year');
  const [level, setLevel] = useState('all');
  const [cache, setCache] = useState<Record<string, LeaderboardData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const cacheKey = `${rankingMode}|${level}`;

    if (cache[cacheKey]) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    fetch(`/api/leaderboard?rankingMode=${rankingMode}&level=${encodeURIComponent(level)}`)
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo cargar el leaderboard');
        return res.json();
      })
      .then((data) => {
        if (!isCancelled) {
          setCache((prev) => ({
            ...prev,
            [cacheKey]: {
              male: Array.isArray(data?.male) ? data.male : [],
              female: Array.isArray(data?.female) ? data.female : [],
              levels: Array.isArray(data?.levels) ? data.levels : [],
              hasTournamentsWithoutLevel: Boolean(data?.hasTournamentsWithoutLevel),
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
  }, [rankingMode, level]);

  const empty: LeaderboardData = { male: [], female: [], levels: [], hasTournamentsWithoutLevel: false };
  const currentLeaderboard = cache[`${rankingMode}|${level}`] ?? empty;
  // Keep the level options visible while another selection is loading.
  const levelSource = Object.values(cache)[0] ?? empty;

  return (
    <LeaderboardTemplate
      leaderboard={currentLeaderboard}
      rankingMode={rankingMode}
      level={level}
      setLevel={setLevel}
      levels={levelSource.levels}
      hasTournamentsWithoutLevel={levelSource.hasTournamentsWithoutLevel}
      loading={loading}
      error={error}
      setRankingMode={setRankingMode}
    />
  );
};

export default Leaderboard;
