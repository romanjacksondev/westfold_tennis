const getLeaderboard = async () => {
  const response = await fetch('/api/leaderboard')
  const json = await response.json();
  return json
}

export { getLeaderboard }
