export async function useLeaderboard(rankingMode: string) {
  const response = await fetch(`/api/leaderboard?rankingMode=${rankingMode}`);
  const json = await response.json();
  return json;
}
