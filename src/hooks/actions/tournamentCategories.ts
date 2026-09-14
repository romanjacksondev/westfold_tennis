export async function useTournamentCategories() {
  const response = await fetch("/api/tournamentCategories");
  const json = await response.json();
  return json;
}
