export async function useMatchHistory(payload) {
  const params = new URLSearchParams({
    player1Id: payload.player1Id,
    player2Id: payload.player2Id,
  });
  const response = await fetch(`/api/matchHistory?${params}`);
  const json = await response.json();
  return json;
}
