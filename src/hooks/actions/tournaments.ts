export async function useTournaments(dispatch) {
  const response = await fetch("api/tournaments");
  const json = await response.json();
  return json;
}

export function useSetTournamentData(data) {}

export async function useAddTournament(payload) {
  const response = await fetch("/api/add-tournament", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const json = await response.json();
  payload.id = json.id;
  return json;
}
