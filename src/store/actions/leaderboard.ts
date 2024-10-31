const getLeaderboard = async (rankingMode) => {
  const response = await fetch(`/api/leaderboard?rankingMode=${rankingMode}`)
  const json = await response.json();
  return json
}

export { getLeaderboard }
